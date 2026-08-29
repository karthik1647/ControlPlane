import httpx
import json

payload = {
    "use_case": "decision_agent",
    "prompt": "Estimate market acquisition offer for Parcel ID #parcel_proxy_smoke_1.",
    "candidate_response": "Recommended cash acquisition offer is $500,000 based on automated valuation model.",
    "context_documents": [],
    "token_count": 280,
    "request_metadata": {
        "asset_id": "parcel_proxy_smoke_1",
        "valuation_amount": 500000.0,
        "baseline_mean": 400000.0,
        "baseline_std": 20000.0,
    }
}

res = httpx.post("http://127.0.0.1:3000/v1/chat/guard", json=payload)
print(f"STATUS_CODE: {res.status_code}")
print("RAW_JSON_RESPONSE:")
print(json.dumps(res.json(), indent=2))
