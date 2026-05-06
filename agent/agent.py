import os
from dotenv import load_dotenv
from langchain_anthropic import ChatAnthropic
from langgraph.graph import StateGraph, MessagesState
from langgraph.prebuilt import ToolNode
from langsmith import traceable
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

import os
os.environ["LANGCHAIN_TRACING_V2"] = "true"
os.environ["LANGCHAIN_PROJECT"] = "ceres"
os.environ["LANGCHAIN_API_KEY"] = os.getenv("LANGSMITH_API_KEY")

# initialize Claude
llm = ChatAnthropic(
    model="claude-sonnet-4-6",
    api_key=os.getenv("ANTHROPIC_API_KEY")
)

SYSTEM_PROMPT = """
You are Ceres, an AI-powered options analysis agent.

You have access to real live market data through your tools. You NEVER guess or make up numbers. 
You ALWAYS use your tools to fetch real data before answering any question about a stock or options contract.

When analyzing a ticker:
1. Always fetch the options analysis first
2. Always fetch the IV analysis to understand if options are cheap or expensive
3. Always fetch volatility data for market sentiment
4. Present findings clearly — what the data shows, not what you think

You are helping traders understand the options market better. You do not tell them what to do.
You present verified, data-backed analysis so they can make their own informed decisions.

Always be clear about what the data shows vs what is interpretation.
"""

# bind tools to claude
llm_with_tools = llm.bind_tools(TOOLS)

def agent_node(state: MessagesState):
    messages = [{"role": "system", "content": SYSTEM_PROMPT}] + state["messages"]
    response = llm_with_tools.invoke(messages)
    return {"messages": [response]}

def should_continue(state: MessagesState):
    last_message = state["messages"][-1]
    if last_message.tool_calls:
        return "tools"
    return "end"

tool_node = ToolNode(TOOLS)

graph = StateGraph(MessagesState)
graph.add_node("agent", agent_node)
graph.add_node("tools", tool_node)
graph.set_entry_point("agent")
graph.add_conditional_edges("agent", should_continue)
graph.add_edge("tools", "agent")

agent = graph.compile()
import time 
@traceable(name="ceres_agent")
def run_agent(user_message: str) -> str:
    result = agent.invoke({
        "messages": [{"role": "user", "content": user_message}]
    })
    return result["messages"][-1].content

if __name__ == "__main__":
    response = run_agent("Analyze AAPL options and tell me what you find")
    print(response)

    import time

@traceable(name="ceres_agent")
def run_agent(user_message: str) -> str:
    max_retries = 3
    retry_delay = 5
    
    for attempt in range(max_retries):
        try:
            result = agent.invoke({
                "messages": [{"role": "user", "content": user_message}]
            })
            return result["messages"][-1].content
        except Exception as e:
            if "overloaded" in str(e).lower() and attempt < max_retries - 1:
                print(f"API overloaded, retrying in {retry_delay}s... (attempt {attempt + 1}/{max_retries})")
                time.sleep(retry_delay)
                retry_delay *= 2  # exponential backoff
            else:
                raise e
    
    return "Unable to process request after multiple attempts. Please try again."