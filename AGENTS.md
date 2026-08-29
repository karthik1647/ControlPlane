# AGENTS.md — ControlPlane.ai Prototype

## Project
A real-time risk-detection gateway for enterprise AI responses. Built for a 
hackathon Round 2 prototype (limited time, 2-person team) — prioritize a 
working vertical slice over broad but shallow coverage.

## Hard constraints
- Tier 1 checks must respond in under 80ms — no blocking network calls, no 
  heavy model inference in this path. Use regex/lightweight classifiers only.
- Tier 2 checks (deep grounding) only run when Tier 1 flags something — 
  never run Tier 2 on every request.
- Do not use full PKI/certificate infrastructure for trust tokens — a signed 
  HMAC JSON payload (score, timestamp, source, use-case) is sufficient.
- Do not build a full policy-as-code YAML engine — a single Python dict/config 
  per use case is enough for the demo.

## Scope for this build (in priority order — stop and confirm before going past step 3)
1. FastAPI backend: `/v1/chat/guard` endpoint. Tier 1 fast scanners 
   (PII regex, basic prompt-injection/toxicity check, token-anomaly baseline 
   check) running in parallel. Severity × confidence risk matrix. Action 
   router (allow / inline-edit / quarantine-for-review / block).
2. Two demo scenarios wired end-to-end, driven by test fixtures:
   - SC-01: unauthorized policy claim (Air Canada-style) — Tier 2 grounding 
     check against a fake policy doc, fails entailment, gets blocked with a 
     fallback response.
   - SC-04: valuation/pricing drift (Zillow-style) — cost-anomaly sentinel 
     flags deviation from a rolling baseline, escalates to HITL queue.
3. Minimal frontend: a single-page simulator — paste/select a test input, 
   see it go through the pipeline, see the tier scores, severity/confidence, 
   and final action, with visible latency per tier.
4. (Only if time remains) Trust token attached to responses (signed HMAC JSON, 
   not full crypto infra). Simple HITL override → one mock threshold 
   recalibration to prove the feedback-loop concept.

## Explicitly NOT building for this prototype (describe as future work only)
- Full policy-as-code YAML editor / PolicyEditor UI
- Multi-region/geography policy variation UI (mention in docs, don't build UI)
- Production-grade cryptographic signing
- MetricsRadar dashboard — instead, write a short markdown doc defining how 
  false positive/negative rates and trust would be measured in production

## Tech stack
Backend: Python, FastAPI. Frontend: React + TypeScript, minimal styling 
(Tailwind is fine). Testing: pytest with the two scenario fixtures as the 
core test suite — every change must keep these two passing.

## Working style
- Before writing code for step 1, produce an implementation plan artifact 
  and stop for my review. Do not proceed to code until I approve.
- After each numbered step above is working, stop and report status before 
  moving to the next step — do not build steps 1-4 in one continuous run.
