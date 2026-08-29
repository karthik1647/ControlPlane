"""ControlPlane.ai FastAPI Gateway Application (Tier 1 & Tier 2)."""

import asyncio
import time
import uuid
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.models import (
    DecisionDetails,
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

    # Determine whether to use stateful drift tracker (valuation) or token baseline
    if "valuation_amount" in req.request_metadata:
        # Known simplification: defaults to "default_asset" if caller omits asset_id
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
    # Invariant: Tier 2 ONLY runs if context_documents are present and Tier 1 did not hard-block
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
