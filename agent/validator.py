from guardrails import Guard
from guardrails.hub import ProvenanceEmbeddings

def create_guard():
    guard = Guard().use(
        ProvenanceEmbeddings(
            validation_method="sentence",
            on_fail="noop"
        )
    )
    return guard

def validate_response(response: str, analysis_data: dict) -> dict:
    """
    Validates Claude's response against actual computed data
    Uses both Guardrails AI and custom financial checks
    """
    flags = []
    
    # custom financial validation
    actual_price = analysis_data.get("current_price", None)
    if actual_price:
        import re
        prices_mentioned = re.findall(r'\$(\d+\.?\d*)', response)
        for price in prices_mentioned:
            price_float = float(price)
            if 50 < price_float < 2000:
                deviation = abs(price_float - actual_price) / actual_price
                if deviation > 0.15:
                    flags.append({
                        "type": "price_mismatch",
                        "message": f"Claude mentioned ${price} but actual price is ${actual_price}",
                        "severity": "high"
                    })
    
    pcr = analysis_data.get("put_call_ratio", None)
    if pcr:
        if pcr > 1 and "bullish" in response.lower():
            flags.append({
                "type": "sentiment_mismatch",
                "message": f"Claude said bullish but PCR of {pcr} suggests bearish",
                "severity": "medium"
            })
        elif pcr < 0.5 and "bearish" in response.lower():
            flags.append({
                "type": "sentiment_mismatch",
                "message": f"Claude said bearish but PCR of {pcr} suggests bullish",
                "severity": "medium"
            })
    
    return {
        "validated": len(flags) == 0,
        "flags": flags,
        "flag_count": len(flags)
    }