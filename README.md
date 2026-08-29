# ControlPlane.ai 🛡️

> **Real-time AI Risk Detection & Governance Gateway for Enterprise Multi-Use-Case Deployments**

[![Tests](https://img.shields.io/badge/tests-15%20passed-brightgreen)](./backend/tests) [![Python](https://img.shields.io/badge/python-3.11-blue)](https://python.org) [![FastAPI](https://img.shields.io/badge/FastAPI-0.115-green)](https://fastapi.tiangolo.com) [![React](https://img.shields.io/badge/React-18-61DAFB)](https://react.dev) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow)](./LICENSE)

---

## The Problem

Enterprise AI systems are making high-stakes decisions — and failing in ways that cost real money:

- **Air Canada's chatbot hallucinated a bereavement discount policy** that didn't exist. A customer sued and won. The AI confidently promised a retroactive refund that Air Canada had to honour.
- **Zillow's AI valuation model** compounded errors across sequential pricing decisions, resulting in a **\$304M write-down** and 25% workforce layoff. Each individual price looked plausible; the drift went undetected until it was catastrophic.
- **Healthcare and financial AI copilots** routinely leak PII, respond to prompt injection attacks, and generate responses that contradict their own policy documents.

**The root cause is the same in every case:** there is no control plane between the AI model and the end user. Responses go out unchecked. Errors compound. Liability accumulates.

---

## The Solution

ControlPlane.ai is a **real-time, multi-tier AI governance gateway** that intercepts every AI response before it reaches a user — in under 2ms.

```
User Prompt → [LLM Model] → Candidate Response
                                      ↓
                          ┌──────────────────────┐
                          │  ControlPlane.ai     │
                          │  ┌────────────────┐  │
                          │  │ TIER 1 (Parallel│  │
                          │  │ · PII Scanner  │  │
                          │  │ · Injection    │  │
                          │  │ · Drift Detect │  │
                          │  └────────┬───────┘  │
                          │           ↓           │
                          │  ┌────────────────┐  │
                          │  │ TIER 2 (Cond.) │  │
                          │  │ · NLI Grounding│  │
                          │  │   Verifier     │  │
                          │  └────────┬───────┘  │
                          │           ↓           │
                          │  Priority Router      │
                          │  ALLOW / EDIT /       │
                          │  QUARANTINE / BLOCK   │
                          └──────────────────────┘
                                      ↓
                          Safe, Verified Response → User
```

---

## Key Features

| Feature | Description |
|---|---|
| ⚡ **Sub-2ms Tier 1 Latency** | Concurrent async PII, injection, and drift scanners — no blocking calls |
| 🔒 **PII Redaction** | Regex + Luhn-validated credit card detection with automatic sanitization |
| 🛑 **Prompt Injection Blocking** | Heuristic pattern matching for jailbreaks and system prompt extraction |
| 📈 **Stateful EMA Drift Detection** | Per-asset Exponential Moving Average tracking catches compounding valuation errors across multiple turns |
| 🎯 **Hallucination Grounding** | Unit-aware atomic claim decomposition checked against RAG context documents |
| 🔀 **Use-Case Policy Router** | Separate risk thresholds for `customer_support`, `internal_copilot`, `decision_agent` |
| 🔍 **Explainable Decisions** | Every action returns `reasons[]`, `severity`, `confidence`, and `latency_breakdown` |

---

## Architecture

```
backend/
├── app/
│   ├── main.py            # FastAPI gateway — /v1/chat/guard endpoint
│   ├── models.py          # Pydantic v2 request/response schemas
│   ├── router.py          # Priority action router (8 precedence levels)
│   └── scanners/
│       ├── pii_scanner.py        # Tier 1: PII detection & redaction
│       ├── injection_scanner.py  # Tier 1: Prompt injection & jailbreak
│       ├── cost_scanner.py       # Tier 1: Token volume anomaly (Z-score)
│       ├── drift_sentinel.py     # Tier 1: Stateful EMA valuation drift
│       └── tier2_grounding.py    # Tier 2: NLI atomic claim entailment
└── tests/
    ├── test_step1.py      # 7 Tier 1 unit tests
    └── test_scenarios.py  # 8 end-to-end scenario tests (SC-01, SC-04)

frontend/
├── src/
│   ├── App.tsx            # Main dashboard container
│   ├── pages/
│   │   ├── Landing.tsx    # Hero landing page
│   │   └── Dashboard.tsx  # Application dashboard
│   ├── components/        # All UI components
│   ├── presets.ts         # Benchmark scenario presets
│   └── types.ts           # TypeScript contracts (mirrors Pydantic models)
```

---

## Demo Scenarios

### SC-01 — Air Canada Style Hallucination Block
The AI claims customers can get a **retroactive 50% bereavement refund within 90 days**. The policy document says the opposite. ControlPlane.ai detects the contradiction and **blocks the response** before it reaches the customer.

### SC-04 — Zillow Compounding Valuation Drift
Across 5 sequential pricing turns on the same asset, the AI's valuations drift from \$410k to \$500k (+25% over baseline of \$400k). The EMA drift tracker watches each turn:

| Turn | Price | Drift Score (D_t) | Action |
|---|---|---|---|
| 1 | \$410,000 | 0.20σ | ✅ ALLOW |
| 2 | \$425,000 | 0.62σ | ✅ ALLOW |
| 3 | \$445,000 | 1.27σ | ✅ ALLOW |
| 4 | \$470,000 | 2.16σ | ⚠️ INLINE_EDIT (flagged) |
| 5 | \$500,000 | 3.30σ | 🚨 QUARANTINE (HITL escalation) |

---

## Quickstart

### Prerequisites
- Python 3.11+
- Node.js 18+

### 1. Clone the repository
```bash
git clone https://github.com/karthik1647/controlplane-ai.git
cd controlplane-ai
```

### 2. Install all dependencies
```bash
pip install -r requirements.txt
cd frontend && npm install && cd ..
```

### 3. Run the backend
```bash
python -m uvicorn backend.app.main:app --port 8000 --host 127.0.0.1 --reload
```

### 4. Run the frontend (new terminal)
```bash
cd frontend && npm run dev
```

### 5. Open the app
```
http://localhost:3000
```

API Documentation: `http://localhost:8000/docs`

---

## Test Suite

```bash
python -m pytest -v backend/tests -o pythonpath=.
```

```
======================== 15 passed in 0.45s ========================
test_sc01_air_canada_unauthorized_policy_claim       PASSED
test_sc01_grounded_compliant_response_allowed        PASSED
test_sc01_unit_mismatch_flagged_as_unsupported       PASSED
test_tier2_skipped_when_no_context_documents         PASSED
test_sc04_zillow_valuation_drift_sequence            PASSED
test_drift_boundary_at_exactly_three_sigma           PASSED
test_drift_baseline_immutable_on_subsequent_calls    PASSED
test_drift_tracker_multi_asset_isolation             PASSED
test_high_confidence_pii_redacted_not_blocked        PASSED
test_injection_hard_block_fallback_content           PASSED
test_quarantine_high_severity_low_confidence_boundary PASSED
test_moderate_injection_high_confidence_internal_copilot PASSED
test_mixed_pii_and_weak_injection                    PASSED
test_use_case_threshold_differences                  PASSED
test_clean_traffic_allow_unmodified_content_and_latency PASSED
```

---

## API Reference

### `POST /v1/chat/guard`

Inspects a candidate AI response and returns a governed action.

**Request:**
```json
{
  "use_case": "customer_support",
  "prompt": "Can I get a bereavement refund retroactively?",
  "candidate_response": "Yes, submit within 90 days for a 50% refund.",
  "context_documents": ["Bereavement fares are only available prior to travel."],
  "token_count": 45,
  "request_metadata": {}
}
```

**Response:**
```json
{
  "action": "block",
  "final_response": "This response cannot be provided as it contains claims unverified by official policy.",
  "decision": {
    "severity": 0.88,
    "confidence": 0.92,
    "primary_risk_category": "performance",
    "reasons": ["Factual claims unverified by grounding context"]
  },
  "tier2_triggered": true,
  "latency_breakdown": {
    "tier1_total_ms": 0.13,
    "tier2_total_ms": 0.29,
    "total_gateway_overhead_ms": 0.45
  }
}
```

---

## Team

**High Performance Athletes** — Accenture Innovation Challenge 2026, Track 1: Responsible AI

- Karthik ([@karthik1647](https://github.com/karthik1647))
- Premnadh Reddy ([@Premnadhreddy](https://github.com/Premnadhreddy))

---

## License

MIT © 2026 Team High Performance Athletes
