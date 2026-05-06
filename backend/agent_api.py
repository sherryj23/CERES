from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import sys
import os

sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'agent'))
from agent import run_agent

router_app = FastAPI()

class QueryRequest(BaseModel):
    message: str
    ticker: str = None

@router_app.post("/ask")
async def ask_agent(request: QueryRequest):
    if request.ticker:
        full_message = f"Ticker: {request.ticker}. {request.message}"
    else:
        full_message = request.message
    
    response = run_agent(full_message)
    
    return {
        "response": response,
        "ticker": request.ticker
    }