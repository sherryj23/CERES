import os
import time
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph
from langgraph.prebuilt import ToolNode
from langsmith import traceable
from typing import TypedDict, Annotated
import operator
from langchain_core.messages import BaseMessage, HumanMessage, SystemMessage
from tools import (
    get_stock_price,
    get_options_analysis,
    get_iv_analysis,
    get_volatility,
    get_contract_quality,
    get_scanner,
    get_multi_ticker,
    TOOLS
)

load_dotenv()

os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "ceres"
os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGSMITH_API_KEY")

llm = ChatAnthropic(
    model="claude-sonnet-4-6",
    api_key=os.getenv("ANTHROPIC_API_KEY")
)

llm_fallback = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    google_api_key=os.getenv("GOOGLE_API_KEY")
)

llm_with_tools = llm.bind_tools(TOOLS)
llm_fallback_with_tools = llm_fallback.bind_tools(TOOLS)

class CeresState(TypedDict):
    messages: Annotated[list[BaseMessage], operator.add]
    ticker: str
    quant_analysis: str
    patterns: str
    context: str
    final_response: str

def data_agent(state: CeresState):
    system = """You are the Data Agent for Ceres. Your ONLY job is to fetch raw market data.
    Use your tools to fetch options analysis, IV analysis, and volatility data.
    Do not analyze or interpret. Just fetch the data."""
    messages = [SystemMessage(content=system)] + state["messages"]
    try:
        response = llm_with_tools.invoke(messages)
    except Exception:
        print("Claude overloaded in data agent, falling back to Gemini...")
        response = llm_fallback_with_tools.invoke(messages)
    return {"messages": [response]}

def quant_agent(state: CeresState):
    system = """You are the Quant Agent for Ceres. Perform quantitative analysis on the fetched data.
    Focus on significant mispricings, IV vs HV comparison, Greeks for key contracts, and put/call ratio.
    Be precise and data-driven."""
    messages = [SystemMessage(content=system)] + state["messages"] + [HumanMessage(content="Perform quantitative analysis on the data fetched above.")]
    try:
        response = llm.invoke(messages)
    except Exception:
        response = llm_fallback.invoke(messages)
    return {"messages": [response], "quant_analysis": response.content}

def pattern_agent(state: CeresState):
    system = """You are the Pattern Agent for Ceres. Identify patterns across all options contracts.
    Look for systematic mispricing, unusual IV clustering, anomalies in Greeks, and put/call imbalances."""
    messages = [SystemMessage(content=system)] + state["messages"] + [HumanMessage(content="Identify patterns in the analysis above.")]
    try:
        response = llm.invoke(messages)
    except Exception:
        response = llm_fallback.invoke(messages)
    return {"messages": [response], "patterns": response.content}

def context_agent(state: CeresState):
    system = """You are the Context Agent for Ceres. Add market context to the analysis.
    Explain why IV might be elevated, what put/call ratio indicates, and what mispricing patterns suggest."""
    messages = [SystemMessage(content=system)] + state["messages"] + [HumanMessage(content="Add market context to the analysis above.")]
    try:
        response = llm.invoke(messages)
    except Exception:
        response = llm_fallback.invoke(messages)
    return {"messages": [response], "context": response.content}

def explainer_agent(state: CeresState):
    system = """You are the Explainer Agent for Ceres. Synthesize everything into a clear final response.
    Include: key metrics, important mispricing opportunities, patterns found, market context.
    End with a disclaimer that this is data-driven analysis only."""
    messages = [SystemMessage(content=system)] + state["messages"] + [HumanMessage(content="Synthesize everything into a final clear response.")]
    try:
        response = llm.invoke(messages)
    except Exception:
        response = llm_fallback.invoke(messages)
    return {"messages": [response], "final_response": response.content}

def should_continue(state: CeresState):
    last_message = state["messages"][-1]
    if hasattr(last_message, 'tool_calls') and last_message.tool_calls:
        return "tools"
    return "quant"

tool_node = ToolNode(TOOLS)

graph = StateGraph(CeresState)
graph.add_node("data", data_agent)
graph.add_node("tools", tool_node)
graph.add_node("quant", quant_agent)
graph.add_node("pattern", pattern_agent)
graph.add_node("context", context_agent)
graph.add_node("explainer", explainer_agent)

graph.set_entry_point("data")
graph.add_conditional_edges("data", should_continue)
graph.add_edge("tools", "quant")
graph.add_edge("quant", "pattern")
graph.add_edge("pattern", "context")
graph.add_edge("context", "explainer")
graph.add_edge("explainer", "__end__")

agent = graph.compile()

@traceable(name="ceres_multi_agent")
def run_agent(user_message: str, ticker: str = None) -> dict:
    try:
        result = agent.invoke({
            "messages": [HumanMessage(content=user_message)],
            "ticker": ticker or "",
            "quant_analysis": "",
            "patterns": "",
            "context": "",
            "final_response": ""
        })
        response = result["final_response"]

    except Exception as e:
        if "overloaded" in str(e).lower():
            print("Claude overloaded, falling back to Gemini...")
            fallback_response = llm_fallback.invoke([HumanMessage(content=user_message)])
            response = fallback_response.content
        else:
            raise e

    validation = {"validated": True, "flags": [], "flag_count": 0}
    if ticker:
        try:
            import requests as req
            import sys
            sys.path.append(os.path.join(os.path.dirname(__file__)))
            from validator import validate_response
            analysis = req.get(f"http://127.0.0.1:8000/analyze/{ticker}").json()
            validation = validate_response(response, analysis)
        except Exception as e:
            validation = {"validated": True, "flags": [], "flag_count": 0, "error": str(e)}

    return {
        "response": response,
        "validation": validation,
        "agents_used": ["data", "quant", "pattern", "context", "explainer"]
    }

if __name__ == "__main__":
    response = run_agent("Analyze AAPL options", ticker="AAPL")
    print(response)