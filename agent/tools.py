import requests

BASE_URL = "http://127.0.0.1:8000"

def get_stock_price(ticker: str) -> dict:
    """Get the current stock price for a ticker"""
    response = requests.get(f"{BASE_URL}/price/{ticker}")
    return response.json()

def get_options_analysis(ticker: str) -> dict:
    """Get full options analysis including Black-Scholes pricing, Greeks, and mispricing for all contracts"""
    response = requests.get(f"{BASE_URL}/analyze/{ticker}")
    return response.json()

def get_iv_analysis(ticker: str) -> dict:
    """Get implied volatility analysis including IV vs HV ratio and IV percentile"""
    response = requests.get(f"{BASE_URL}/iv-analysis/{ticker}")
    return response.json()

def get_volatility(ticker: str) -> dict:
    """Get historical volatility and put/call ratio for a ticker"""
    response = requests.get(f"{BASE_URL}/volatility/{ticker}")
    return response.json()

def get_contract_quality(ticker: str) -> dict:
    """Get liquidity scoring for all options contracts"""
    response = requests.get(f"{BASE_URL}/contract-quality/{ticker}")
    return response.json()

def get_scanner() -> dict:
    """Scan top 20 tickers and return the most mispriced options contracts"""
    response = requests.get(f"{BASE_URL}/scanner")
    return response.json()

def get_multi_ticker(tickers: str) -> dict:
    """Get analysis for multiple tickers at once, comma separated"""
    response = requests.get(f"{BASE_URL}/multi/{tickers}")
    return response.json()

# list of all tools for LangGraph to use
TOOLS = [
    get_stock_price,
    get_options_analysis,
    get_iv_analysis,
    get_volatility,
    get_contract_quality,
    get_scanner,
    get_multi_ticker
]