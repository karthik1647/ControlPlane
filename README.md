# ControlPlane.ai

**Real-Time Risk Detection and Governance Gateway for Enterprise AI Deployments**

*Accenture Innovation Challenge 2026 — Track: AI Oversight & Governance*  
*Team: High Performance Athletes (Sativada Karthik & Akkala Premnadh Reddy, IIT Kharagpur)*

---

## The Problem: Ungoverned Enterprise AI

When enterprises connect foundation models directly to clients or operational workflows, errors translate into financial liability, regulatory penalties, and reputational damage:

* **Air Canada (2024):** A customer-facing support chatbot promised a retroactive bereavement discount that contradicted official tariff policies. The Canadian Civil Resolution Tribunal ruled that Air Canada was liable for promises made by its conversational agent.
* **Zillow iBuying (2021):** An automated valuation model experienced subtle, compounding pricing drift across sequential decisions, systematically overvaluing properties until it forced a $304M write-down and the closure of its iBuying unit.
* **Internal Enterprise Copilots:** Code assistants and internal productivity tools risk leaking sensitive customer PII (credit cards, SSNs, access tokens) or executing jailbreak payloads passed through untrusted inputs.

ControlPlane.ai is a low-latency governance reverse proxy placed between LLM services and consuming applications. It inspects outgoing candidate responses in flight, redacts sensitive data, flags multi-turn valuation drift, verifies grounding against retrieval-augmented generation (RAG) context, and routes decisions through a deterministic categorical policy engine.

---

## Architecture Overview

The gateway operates as an inline reverse proxy (`/v1/chat/guard`). Requests pass through a two-tier evaluation pipeline before reaching an action router.

```
User Prompt -> [ LLM Service ] -> Candidate Response
                                         |
                           +----------------------------+
                           |   ControlPlane.ai Gateway  |
                           |                            |
                           |   TIER 1 (Parallel Fast)   |
                           |   ├── PII Redaction        |
                           |   ├── Prompt Injection     |
                           |   └── Rolling Drift (EMA)  |
                           |             │              |
                           |             ▼              |
                           |   TIER 2 (Conditional)     |
                           |   └── NLI Grounding Check  |
                           |             │              |
                           |             ▼              |
                           |   Categorical Router       |
                           |   ALLOW | EDIT | HOLD | BLOCK
                           +-------------+--------------+
                                         |
                           Governed Response -> End User
```

### Tier 1: Parallel Fast Scanners

Tier 1 executes concurrently via Python's `asyncio.gather`. All three checks run entirely in local memory, completing in under 0.5ms:

1. **PII Redactor:** Scans for payment card numbers (validated against the mod-10 Luhn algorithm), Social Security Numbers, Bearer tokens, Stripe API keys, and webhook signing secrets. Detected entities are masked in place (e.g. `[REDACTED_VISA_CARD]`).
2. **Prompt Injection Sentinel:** Heuristic scanner that inspects both the user prompt and model response for jailbreak signatures, system prompt extraction, and roleplay bypass patterns.
3. **Valuation and Cost Drift Tracker:** Evaluates response token volume or asset valuation figures against configured use-case baselines. The tracker flags anomalous token spikes and tracks valuation variance.

### Tier 2: Conditional Grounding Verifier

Tier 2 activates when retrieval context documents accompany the request and Tier 1 clears the payload. The verifier decomposes candidate statements into atomic factual claims, extracts numeric quantities and units (currency, percentages, days, weight), and verifies entailment against the source documents. Claims contradicting the reference context trigger an immediate grounding block.

### Categorical Priority Router

The router maps findings to four operational actions based on configurable severity and confidence thresholds:

* **`ALLOW`:** Safe, compliant response delivered directly.
* **`INLINE_EDIT`:** PII masked, response safely delivered.
* **`QUARANTINE`:** High-uncertainty drift or ambiguous anomaly held for supervisor review.
* **`BLOCK`:** Critical safety violation, injection attempt, or factual contradiction halted with a safe fallback response.

---

## Design Decisions: Why We Built It This Way

### 1. Stateful Streaming EMA vs. Vector Database History
To detect multi-turn valuation drift (such as the Zillow scenario), storing full conversation histories in a vector database introduces 20–80ms of network overhead per query and requires managing unbounded conversational windows. We chose an in-memory streaming Exponential Moving Average ($\alpha=0.40$) keyed by asset ID:

$$\text{EMA}_t = \alpha \cdot x_t + (1 - \alpha) \cdot \text{EMA}_{t-1}$$

This approach yields $O(1)$ constant-time updates ($< 0.02\text{ms}$) while remaining sensitive to compounding deviations. By tracking both the raw deviation and the smoothed momentum, the system distinguishes a single transient valuation jump from sustained directional drift across turns.

### 2. Deterministic Scanners vs. An LLM Evaluator Judge
Using a secondary LLM to inspect outgoing responses introduces 500ms–2000ms of latency, multiplies inference costs, and creates a secondary layer of non-deterministic hallucinations. We built Tier 1 with compiled regular expressions, Luhn checksum validation, and local statistical counters. Tier 2 uses algorithmic proposition decomposition and contradiction matching. The entire pipeline executes locally with zero external API dependencies.

---

## Technical Specifications & Real Benchmarks

Latency figures were measured using our standalone benchmark runner (`backend/scripts/benchmark.py`) over 500 iterations on Python 3.11 (Windows dev workstation, single process).

| Component | Target SLA | Measured p50 | Measured p95 | Measured p99 | Status |
|---|---|---|---|---|---|
| **Tier 1 Scanners** (PII + Injection + Drift) | $< 2.0\text{ ms}$ | **$0.10\text{ ms}$** | **$0.31\text{ ms}$** | **$0.53\text{ ms}$** | Surpasses target |
| **Tier 2 Grounding Verifier** (NLI Check) | $< 150.0\text{ ms}$ | **$0.04\text{ ms}$** | **$0.05\text{ ms}$** | **$0.08\text{ ms}$** | Surpasses target |
| **Full Gateway Pipeline (Clean Path)** | $< 5.0\text{ ms}$ | **$0.07\text{ ms}$** | **$0.08\text{ ms}$** | **$0.10\text{ ms}$** | Surpasses target |
| **Full Gateway Pipeline (Grounded Path)** | $< 150.0\text{ ms}$ | **$0.12\text{ ms}$** | **$0.17\text{ ms}$** | **$0.32\text{ ms}$** | Surpasses target |
| **50-Case Enterprise Benchmark Suite** | $< 80.0\text{ ms avg}$ | **$0.20\text{ ms avg}$** | — | — | 100% Pass |

### Enterprise AI Governance Metrics (50-Case Benchmark)

The platform includes a curated 50-case benchmark dataset (`backend/app/benchmarks/dataset.py`) covering Air Canada grounding cases, Zillow multi-turn drift, OWASP security injections, payment card disclosures, and normal operational queries.

* **False Positive Rate (FPR):** $0.0\%$ (Target: $< 5.0\%$)
* **False Negative Rate (FNR):** $0.0\%$ (Target: $< 1.0\%$)
* **Precision:** $100.0\%$ (Target: $> 95.0\%$)
* **Recall:** $100.0\%$ (Target: $> 95.0\%$)
* **Enterprise Trust Score:** $100.0\%$
* **Confusion Matrix:** $\text{TP}=30, \text{FP}=0, \text{TN}=20, \text{FN}=0$

---

## Visual Walkthrough & Screenshots

The web interface (`http://localhost:3000`) provides five dedicated views for testing scenarios, monitoring latency, reviewing quarantined items, and inspecting governance metrics.

### 1. Clean Traffic Passthrough (`ALLOW`)
Routine queries pass Tier 1 checks and return unmodified responses to the caller in sub-millisecond time.

![Clean Allow Case](docs/screenshots/dashboard-allow.png)
*Figure 1: Standard coding and support query passing through Tier 1 with 0.1ms overhead (Action: `ALLOW`).*

### 2. Multi-Turn Valuation Drift (`QUARANTINE`)
Simulating sequential asset bids demonstrates cumulative drift tracking. In the Zillow scenario, Turns 1–3 maintain acceptable bounds (`ALLOW`), Turn 4 triggers an advisory warning (`INLINE_EDIT`), and Turn 5 crosses the $+3.0\sigma$ boundary, routing the proposal into the Human-in-the-Loop review queue.

![Quarantine Case](docs/screenshots/dashboard-quarantine.png)
*Figure 2: SC-04 Zillow valuation drift sequence escalating to Human-in-the-Loop review at Turn 5.*

### 3. Policy Hallucination Interception (`BLOCK`)
When an AI agent invents an unauthorized policy promise contradicting reference tariff documents, Tier 2 detects the factual conflict and halts delivery, replacing the output with an enterprise fallback message.

![Block Case](docs/screenshots/dashboard-block.png)
*Figure 3: SC-01 Air Canada retroactive refund hallucination blocked by Tier 2 grounding verification.*

### 4. Human-in-the-Loop (HITL) Review Queue
Supervisors review quarantined decisions, inspect the diagnostic $Z$-score calculations, and either confirm the block or approve the valuation. Approving recalibrates the baseline moving average in memory to prevent recurring false alarms.

![HITL Review Queue](docs/screenshots/dashboard-hitl.png)
*Figure 4: Supervisor review queue with one-click baseline recalibration.*

### 5. 50-Case Enterprise Benchmark Runner
An interactive matrix evaluating all 50 enterprise scenarios in batch, providing live precision, recall, and false-positive telemetry.

![Benchmark Suite](docs/screenshots/dashboard-benchmark.png)
*Figure 5: Live 50-case benchmark evaluation matrix with domain filters and latency distributions.*

---

## Repository Structure

```
ControlPlane/
├── README.md                 # Project documentation and specifications
├── LICENSE                   # MIT open source license
├── Makefile                  # Developer workflow targets (dev, test, verify)
├── requirements.txt          # Python dependencies
├── .gitignore                # Git exclusions
├── docs/
│   └── screenshots/          # Embedded UI walkthrough screenshots
├── backend/
│   ├── app/
│   │   ├── main.py           # FastAPI gateway API routes
│   │   ├── models.py         # Pydantic v2 data models
│   │   ├── router.py         # Priority action router & policy engine
│   │   ├── benchmarks/       # 50-case enterprise evaluation dataset
│   │   ├── feedback/         # HITL quarantine queue & baseline recalibration
│   │   └── scanners/         # PII, injection, drift, and grounding modules
│   ├── tests/
│   │   ├── test_step1.py     # Unit test suite for scanners and router
│   │   └── test_scenarios.py # End-to-end Air Canada & Zillow test cases
│   └── scripts/
│       ├── benchmark.py      # Latency percentile profiler (p50, p95, p99)
│       ├── verify.py         # Test runner + 50-case benchmark verifier
│       ├── test_matrix.py    # Standalone positive/negative control matrix
│       └── smoke_e2e.py      # Live HTTP smoke test against running gateway
└── frontend/
    ├── src/
    │   ├── main.tsx          # React Router entrypoint
    │   ├── pages/
    │   │   ├── Landing.tsx   # Product landing page & architecture overview
    │   │   └── Dashboard.tsx # 5-tab enterprise governance console
    │   ├── presets.ts        # Scenario payloads & mock asset generator
    │   └── types.ts          # TypeScript interfaces
    ├── package.json
    └── vite.config.ts
```

---

## Quickstart Guide

### Prerequisites
* Python 3.11 or later
* Node.js 18 or later
* Git

### 1. Installation

```bash
git clone https://github.com/karthik1647/ControlPlane.git
cd ControlPlane

# Install backend dependencies
pip install -r requirements.txt

# Install frontend dependencies
cd frontend && npm install && cd ..
```

### 2. Running Locally

You can launch both servers simultaneously or run them in separate terminals:

```bash
# Option A: Single command via Makefile (Windows cmd/PowerShell)
make dev

# Option B: Run services individually
# Terminal 1: FastAPI Backend
python -m uvicorn backend.app.main:app --port 8000 --host 127.0.0.1 --reload

# Terminal 2: React Vite Frontend
cd frontend && npm run dev
```

* **Landing Page:** `http://localhost:3000`
* **Dashboard Console:** `http://localhost:3000/app`
* **API Documentation (Swagger):** `http://localhost:8000/docs`

---

## Verification & Testing

The repository provides automated tools to verify correctness and measure performance.

### 1. Pytest Unit & Integration Suite (15 Tests)
Executes all scanner invariants, priority routing tiers, and end-to-end failure scenarios:

```bash
make test
# or: python -m pytest -v backend/tests -o pythonpath=.
```

### 2. Comprehensive System Verifier & 50-Case Benchmark
Runs both the pytest suite and the 50-case enterprise evaluation matrix, printing the confusion matrix:

```bash
make verify
# or: python backend/scripts/verify.py
```

### 3. Micro-Benchmark Suite
Measures actual p50, p90, p95, and p99 execution latencies across 500 iterations:

```bash
make benchmark
# or: python backend/scripts/benchmark.py
```

### 4. Live Gateway Smoke Test
Verifies end-to-end HTTP communication against a running backend instance:

```bash
python backend/scripts/smoke_e2e.py
```

---

## Authors & Acknowledgments

* **Sativada Karthik** ([@karthik1647](https://github.com/karthik1647)) — IIT Kharagpur
* **Akkala Premnadh Reddy** ([@Premnadhreddy](https://github.com/Premnadhreddy)) — IIT Kharagpur

Developed for the **Accenture Innovation Challenge 2026** (Track: AI Oversight & Governance).

---

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE) for details.
