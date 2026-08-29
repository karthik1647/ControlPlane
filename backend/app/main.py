"""ControlPlane.ai FastAPI Gateway Application (Tier 1, Tier 2, Batch Benchmark, and HITL Feedback)."""

import asyncio
import time
import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.models import (
    BenchmarkCaseResult,
    BenchmarkMetrics,
    DecisionDetails,
    FeedbackOverrideRequest,
    FeedbackOverrideResponse,
    GuardRequest,
    GuardResponse,
    LatencyBreakdown,
    Tier1Results,
)
from backend.app.router import route_action
from backend.app.scanners.cost_scanner import scan_cost_anomaly
from backend.app.scanners.drift_sentinel import drift_tracker
from backend.app.scanners.injection_scanner import scan_injection_toxicity
from backend.app.scanners.pii_scanner import scan_pii
from backend.app.scanners.tier2_grounding import verify_grounding
from backend.app.benchmarks.dataset import BENCHMARK_DATASET
from backend.app.feedback.recalibration import (
    enqueue_for_review,
    get_quarantine_queue,
    process_supervisor_override,
)

app = FastAPI(
    title="ControlPlane.ai Gateway",
    description="Real-Time Risk Detection & Governance Gateway for Enterprise AI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "ControlPlane.ai Gateway", "version": "1.0.0"}


@app.post("/v1/chat/guard", response_model=GuardResponse)
async def guard_chat_response(req: GuardRequest) -> GuardResponse:
    """Core Guard Endpoint: Executes parallel Tier 1 and conditional Tier 2 inspection."""
    t_start = time.perf_counter()
    request_id = req.request_metadata.get("request_id") or f"req_{uuid.uuid4().hex[:12]}"

    # 1. Tier 1 Scanners: PII, Injection, and Cost/Drift
    t1_start = time.perf_counter()

    if "valuation_amount" in req.request_metadata:
        asset_id = str(req.request_metadata.get("asset_id", "default_asset"))
        val_amount = float(req.request_metadata["valuation_amount"])
        base_mean = float(req.request_metadata.get("baseline_mean", 400_000.0))
        base_std = float(req.request_metadata.get("baseline_std", 20_000.0))

        cost_task = asyncio.to_thread(
            drift_tracker.record_valuation,
            asset_id=asset_id,
            valuation=val_amount,
            token_count=req.token_count,
            baseline_mean=base_mean,
            baseline_std=base_std,
        )
    else:
        cost_task = scan_cost_anomaly(req.token_count, req.use_case)

    pii_res, injection_res, cost_res = await asyncio.gather(
        scan_pii(req.candidate_response),
        scan_injection_toxicity(req.prompt, req.candidate_response),
        cost_task,
    )
    t1_elapsed = (time.perf_counter() - t1_start) * 1000.0

    # 2. Conditional Tier 2 Grounding Verifier
    t2_elapsed = 0.0
    grounding_res = None
    tier2_triggered = False

    is_tier1_hard_block = injection_res.detected and injection_res.severity >= 0.70 and injection_res.confidence >= 0.75

    if req.context_documents and not is_tier1_hard_block:
        tier2_triggered = True
        t2_start = time.perf_counter()
        grounding_res = await verify_grounding(req.candidate_response, req.context_documents)
        t2_elapsed = (time.perf_counter() - t2_start) * 1000.0

    # 3. Action Routing
    r_start = time.perf_counter()
    action, final_text, sev, conf, category, reasons = route_action(
        pii_res=pii_res,
        injection_res=injection_res,
        cost_res=cost_res,
        grounding_res=grounding_res,
        candidate_response=req.candidate_response,
        use_case=req.use_case,
        request_id=request_id,
    )
    r_elapsed = (time.perf_counter() - r_start) * 1000.0
    total_elapsed = (time.perf_counter() - t_start) * 1000.0

    # If action is quarantine, enqueue to Human Review Queue (HITL)
    if action == "quarantine":
        enqueue_for_review({
            "request_id": request_id,
            "timestamp": time.time(),
            "use_case": req.use_case,
            "prompt": req.prompt,
            "candidate_response": req.candidate_response,
            "asset_id": req.request_metadata.get("asset_id"),
            "valuation_amount": req.request_metadata.get("valuation_amount"),
            "severity": round(sev, 2),
            "confidence": round(conf, 2),
            "reasons": reasons,
            "z_score": cost_res.z_score,
            "observed_value": cost_res.observed_value,
            "baseline_value": cost_res.baseline_value,
        })

    return GuardResponse(
        action=action,
        final_response=final_text,
        decision=DecisionDetails(
            severity=round(sev, 2),
            confidence=round(conf, 2),
            primary_risk_category=category,
            applied_use_case=req.use_case,
            reasons=reasons,
            request_id=request_id,
        ),
        tier1_results=Tier1Results(
            pii=pii_res,
            injection_toxicity=injection_res,
            cost_anomaly=cost_res,
        ),
        tier2_results=grounding_res,
        tier2_triggered=tier2_triggered,
        latency_breakdown=LatencyBreakdown(
            tier1_total_ms=round(t1_elapsed, 2),
            tier2_total_ms=round(t2_elapsed, 2),
            routing_ms=round(r_elapsed, 2),
            total_gateway_overhead_ms=round(total_elapsed, 2),
        ),
    )


# ─────────────────────────────────────────────────────────────
# Human-in-the-Loop (HITL) & Recalibration Endpoints
# ─────────────────────────────────────────────────────────────
@app.get("/v1/feedback/quarantine-queue")
async def get_quarantine_items():
    """Retrieves all pending human supervisor review items."""
    return {"queue": get_quarantine_queue(), "count": len(get_quarantine_queue())}


@app.post("/v1/feedback/override", response_model=FeedbackOverrideResponse)
async def submit_supervisor_override(req: FeedbackOverrideRequest):
    """Processes supervisor approval/rejection and recalibrates baseline if approved."""
    return process_supervisor_override(req)


# ─────────────────────────────────────────────────────────────
# 50-Case Enterprise Benchmark Evaluation Endpoint
# ─────────────────────────────────────────────────────────────
@app.post("/v1/chat/evaluate-batch", response_model=BenchmarkMetrics)
async def evaluate_benchmark_batch():
    """Executes the full 50-case enterprise benchmark suite and computes ROC / Trust metrics."""
    results: list[BenchmarkCaseResult] = []
    tp, fp, tn, fn = 0, 0, 0, 0
    t1_latencies = []

    for item in BENCHMARK_DATASET:
        t0 = time.perf_counter()
        meta = item.get("metadata", {})

        if "valuation_amount" in meta:
            cost_res = drift_tracker.record_valuation(
                asset_id=meta["asset_id"],
                valuation=meta["valuation_amount"],
                token_count=item.get("token_count", 0),
                baseline_mean=meta.get("baseline_mean", 400000.0),
                baseline_std=meta.get("baseline_std", 20000.0),
            )
        else:
            cost_res = await scan_cost_anomaly(item.get("token_count", 0), item["use_case"])

        pii_res, injection_res = await asyncio.gather(
            scan_pii(item["candidate_response"]),
            scan_injection_toxicity(item["prompt"], item["candidate_response"]),
        )

        grounding_res = None
        if item.get("context_documents") and not (injection_res.detected and injection_res.severity >= 0.70):
            grounding_res = await verify_grounding(item["candidate_response"], item["context_documents"])

        action, final_text, sev, conf, cat, reasons = route_action(
            pii_res=pii_res,
            injection_res=injection_res,
            cost_res=cost_res,
            grounding_res=grounding_res,
            candidate_response=item["candidate_response"],
            use_case=item["use_case"],
            request_id=f"bench_{item['id']}",
        )
        elapsed_ms = (time.perf_counter() - t0) * 1000.0
        t1_latencies.append(elapsed_ms)

        passed = (action == item["expected_action"])

        # Confusion Matrix classification:
        # Negative cases are actual threats; positive cases are clean traffic.
        is_threat = (item["type"] == "NEGATIVE")
        flagged = (action != "allow")

        if is_threat and flagged:
            tp += 1
        elif not is_threat and flagged:
            fp += 1
        elif not is_threat and not flagged:
            tn += 1
        elif is_threat and not flagged:
            fn += 1

        results.append(BenchmarkCaseResult(
            id=item["id"],
            domain=item["domain"],
            case_type=item["type"],
            expected_action=item["expected_action"],
            actual_action=action,
            passed=passed,
            latency_ms=round(elapsed_ms, 2),
            severity=round(sev, 2),
            confidence=round(conf, 2),
            primary_risk=cat,
            prompt=item["prompt"],
            findings=reasons,
        ))

    total = len(results)
    passed_count = sum(1 for r in results if r.passed)
    accuracy = (passed_count / total) * 100.0

    # Rate calculations
    fpr = (fp / (fp + tn) * 100.0) if (fp + tn) > 0 else 0.0
    fnr = (fn / (fn + tp) * 100.0) if (fn + tp) > 0 else 0.0
    precision = (tp / (tp + fp) * 100.0) if (tp + fp) > 0 else 100.0
    recall = (tp / (tp + fn) * 100.0) if (tp + fn) > 0 else 100.0

    trust_score = (2 * precision * recall) / (precision + recall) if (precision + recall) > 0 else 100.0
    avg_latency = sum(t1_latencies) / len(t1_latencies) if t1_latencies else 0.5

    return BenchmarkMetrics(
        total_cases=total,
        passed_cases=passed_count,
        accuracy_pct=round(accuracy, 1),
        false_positive_rate=round(fpr, 2),
        false_negative_rate=round(fnr, 2),
        precision_pct=round(precision, 1),
        recall_pct=round(recall, 1),
        trust_score_pct=round(trust_score, 1),
        avg_tier1_latency_ms=round(avg_latency, 2),
        results=results,
    )
