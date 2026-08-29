# ControlPlane.ai

**Real-Time Risk Detection and Governance Gateway for Enterprise Multi-Use-Case AI Deployments**

Accenture Innovation Challenge 2026 — Track: AI Oversight

---

## Executive Summary

Enterprise AI deployments in high-stakes operational environments introduce systemic compliance, liability, and financial risk when outputs are returned directly to clients without deterministic governance:

- **Air Canada (2024):** A customer support model hallucinated a retroactive bereavement discount policy. The Canadian Civil Resolution Tribunal ruled that the company was liable for promises made by its ungrounded AI agent.
- **Zillow iBuying (2021):** An automated valuation model experienced undetected compounding pricing drift across sequential decisions, overvaluing inventory and resulting in a $304M asset write-down.
- **Enterprise Copilots:** Internal support models risk echoing unredacted PII (credit card numbers, SSNs) or responding to prompt injection attacks.

ControlPlane.ai addresses these failure modes by inserting a low-latency, multi-tier control plane between LLM models and end-user applications.

---

## Architecture Overview

ControlPlane.ai implements a two-tier evaluation architecture coupled with a deterministic categorical priority router.

```
User Prompt -> [ LLM Model ] -> Candidate Response
                                        |
                          +----------------------------+
                          |   ControlPlane.ai Gateway  |
                          |   +--------------------+   |
                          |   | TIER 1 (Parallel)  |   |
                          |   | - PII Redactor     |   |
                          |   | - Injection Scan   |   |
                          |   | - Drift Sentinel   |   |
                          |   +---------+----------+   |
                          |             |              |
                          |   +---------v----------+   |
                          |   | TIER 2 (Cond.)     |   |
                          |   | - NLI Grounding    |   |
                          |   +---------+----------+   |
                          |             |              |
                          |   Categorical Router       |
                          |   ALLOW | EDIT | HOLD | BLOCK
                          +-------------+--------------+
                                        |
                          Governed Payload -> User
```

### Core Components

1. **Tier 1 Parallel Fast Scanners (<2ms Overhead):**
   - **PII Redaction Engine:** Regex pattern matcher with Luhn algorithm validation for credit card numbers, SSNs, and credentials.
   - **Prompt Injection Sentinel:** Heuristic scanner detecting jailbreak attempts and system instruction extraction.
   - **Valuation & Cost Drift Tracker:** Stateful Exponential Moving Average (EMA, alpha=0.40) tracker monitoring cumulative multi-turn pricing drift against established baselines.

2. **Tier 2 Conditional Grounding Verifier:**
   - **Atomic Claim Entailment Check:** Decomposes candidate text into factual statements and validates unit-aware quantities against RAG context documents. Triggered only when context is present and Tier 1 passes.

3. **Categorical Priority Router:**
   - Evaluates scanner outputs against use-case specific risk thresholds (`customer_support`, `internal_copilot`, `decision_agent`), enforcing deterministic action routing (`ALLOW`, `INLINE_EDIT`, `QUARANTINE`, `BLOCK`).

---

## Technical Specifications

| Parameter | Specification |
|---|---|
| Tier 1 Target Latency | < 2.0 ms (Concurrent Execution) |
| Tier 2 Target Latency | < 150.0 ms (Conditional Grounding) |
| Supported Use Cases | Customer Support, Internal Copilot, Decision Agent |
| Action Matrix | ALLOW, INLINE_EDIT, QUARANTINE, BLOCK |
| Backend Framework | FastAPI / Asyncio (Python 3.11) |
| Frontend Stack | React 18 / Vite / Tailwind CSS (v4) |
| Test Coverage | 15 Integration & Unit Tests (100% Pass) |

---

## Directory Structure

```
backend/
├── app/
│   ├── main.py            # FastAPI gateway — /v1/chat/guard API
│   ├── models.py          # Pydantic v2 data contracts
│   ├── router.py          # Priority action router & policy engine
│   └── scanners/
│       ├── pii_scanner.py        # PII detection & redaction
│       ├── injection_scanner.py  # Prompt injection sentinel
│       ├── cost_scanner.py       # Token volume anomaly detection
│       ├── drift_sentinel.py     # Stateful EMA valuation drift tracker
│       └── tier2_grounding.py    # Unit-aware NLI grounding verifier
└── tests/
    ├── test_step1.py      # Tier 1 unit scanner tests
    └── test_scenarios.py  # End-to-end benchmark scenario tests

frontend/
├── src/
│   ├── main.tsx           # React router entrypoint
│   ├── pages/
│   │   ├── Landing.tsx    # Marketing overview & pipeline architecture
│   │   └── Dashboard.tsx  # Production SaaS governance console
│   ├── presets.ts         # Benchmark scenarios & asset ID generators
│   └── types.ts           # TypeScript interfaces
```

---

## Getting Started

### Prerequisites
- Python 3.11 or higher
- Node.js 18 or higher

### Local Development Setup

1. **Clone the repository:**
   ```bash
   git clone https://github.com/karthik1647/ControlPlane.git
   cd ControlPlane
   ```

2. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   cd frontend && npm install && cd ..
   ```

3. **Start the backend server:**
   ```bash
   python -m uvicorn backend.app.main:app --port 8000 --host 127.0.0.1 --reload
   ```

4. **Start the frontend application (in a new terminal):**
   ```bash
   cd frontend && npm run dev
   ```

5. **Access the application:**
   - Landing Page: `http://localhost:3000`
   - Governance Dashboard: `http://localhost:3000/app`
   - API Documentation: `http://localhost:8000/docs`

---

## Automated Test Suite

Run the full integration test suite via pytest:

```bash
python -m pytest -v backend/tests -o pythonpath=.
```

Sample Output:
```text
======================== 15 passed in 0.45s ========================
backend/tests/test_scenarios.py::test_sc01_air_canada_unauthorized_policy_claim PASSED
backend/tests/test_scenarios.py::test_sc01_grounded_compliant_response_allowed PASSED
backend/tests/test_scenarios.py::test_sc01_unit_mismatch_flagged_as_unsupported PASSED
backend/tests/test_scenarios.py::test_tier2_skipped_when_no_context_documents PASSED
backend/tests/test_scenarios.py::test_sc04_zillow_valuation_drift_sequence PASSED
backend/tests/test_scenarios.py::test_drift_boundary_at_exactly_three_sigma PASSED
backend/tests/test_scenarios.py::test_drift_baseline_immutable_on_subsequent_calls PASSED
backend/tests/test_scenarios.py::test_drift_tracker_multi_asset_isolation PASSED
backend/tests/test_step1.py::test_high_confidence_pii_redacted_not_blocked PASSED
backend/tests/test_step1.py::test_injection_hard_block_fallback_content PASSED
backend/tests/test_step1.py::test_quarantine_high_severity_low_confidence_boundary PASSED
backend/tests/test_step1.py::test_moderate_injection_high_confidence_internal_copilot PASSED
backend/tests/test_step1.py::test_mixed_pii_and_weak_injection PASSED
backend/tests/test_step1.py::test_use_case_threshold_differences PASSED
backend/tests/test_step1.py::test_clean_traffic_allow_unmodified_content_and_latency PASSED
```

---

## Team

**Team High Performance Athletes** — Accenture Innovation Challenge 2026

- Karthik ([@karthik1647](https://github.com/karthik1647))
- Premnadh Reddy ([@Premnadhreddy](https://github.com/Premnadhreddy))

---

## License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
