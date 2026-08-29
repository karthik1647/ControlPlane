"""Human-in-the-Loop (HITL) Feedback & Dynamic Threshold Recalibration Engine."""

from typing import Optional
from backend.app.scanners.drift_sentinel import drift_tracker
from backend.app.models import FeedbackOverrideRequest, FeedbackOverrideResponse

# In-memory store for quarantined items awaiting human review
QUARANTINE_QUEUE: list[dict] = []
AUDIT_LOG: list[dict] = []


def enqueue_for_review(item: dict) -> None:
    """Enqueues an ambiguous quarantine payload for human supervisor review."""
    # Prevent duplicate request IDs
    if not any(q.get("request_id") == item.get("request_id") for q in QUARANTINE_QUEUE):
        QUARANTINE_QUEUE.insert(0, item)


def get_quarantine_queue() -> list[dict]:
    """Retrieves all pending human review items."""
    return QUARANTINE_QUEUE


def process_supervisor_override(req: FeedbackOverrideRequest) -> FeedbackOverrideResponse:
    """Processes a human supervisor decision and dynamically recalibrates thresholds if approved."""
    # Remove from quarantine queue
    global QUARANTINE_QUEUE
    QUARANTINE_QUEUE = [q for q in QUARANTINE_QUEUE if q.get("request_id") != req.request_id]

    recalibrated = False
    new_mean = None

    if req.supervisor_action == "approve_override" and req.asset_id:
        # Dynamic baseline recalibration:
        # If the supervisor approves an overvalued property as legitimate market shift,
        # recalibrate that asset's baseline mean anchor to prevent future alert fatigue.
        if req.asset_id in drift_tracker.assets:
            asset_state = drift_tracker.assets[req.asset_id]
            if req.new_anchor_value:
                asset_state["mean"] = req.new_anchor_value
                asset_state["ema"] = req.new_anchor_value
            else:
                # Set mean to current EMA
                asset_state["mean"] = asset_state["ema"]
            new_mean = asset_state["mean"]
            recalibrated = True

    AUDIT_LOG.append({
        "request_id": req.request_id,
        "action": req.supervisor_action,
        "asset_id": req.asset_id,
        "recalibrated": recalibrated,
        "new_baseline_mean": new_mean,
        "notes": req.supervisor_notes,
    })

    return FeedbackOverrideResponse(
        status="success",
        request_id=req.request_id,
        recalibrated=recalibrated,
        new_baseline_mean=new_mean,
        message=f"Supervisor action '{req.supervisor_action}' recorded. " +
                (f"Baseline recalibrated to ${new_mean:,.2f}" if recalibrated else "No recalibration applied.")
    )
