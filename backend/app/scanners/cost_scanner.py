"""Tier 1 Scanner: Token-to-Value Cost Anomaly Sentinel."""

import time
from backend.app.models import CostScanResult

# Mock statistical baselines per enterprise use case (mean tokens, std dev)
# In production, this would be computed from rolling historical telemetry
USE_CASE_BASELINES = {
    "customer_support": {"mean": 120.0, "std": 35.0},
    "internal_copilot": {"mean": 450.0, "std": 120.0},
    "decision_agent": {"mean": 280.0, "std": 60.0},
}


async def scan_cost_anomaly(token_count: int, use_case: str) -> CostScanResult:
    """Detects runaway token inflation or valuation/pricing drift anomalies."""
    start_time = time.perf_counter()

    baseline = USE_CASE_BASELINES.get(use_case, {"mean": 150.0, "std": 40.0})
    mean = baseline["mean"]
    std = baseline["std"]

    if token_count <= 0:
        return CostScanResult(
            detected=False,
            severity=0.0,
            confidence=1.0,
            metric_type="token_count",
            observed_value=float(token_count),
            baseline_value=mean,
            token_count=token_count,
            baseline_mean=mean,
            z_score=0.0,
            latency_ms=0.0,
        )

    z_score = (token_count - mean) / std
    detected = False
    severity = 0.0
    confidence = 0.85

    # Z-score thresholds
    if z_score > 3.0:  # > 3 standard deviations (severe runaway)
        detected = True
        severity = min(1.0, 0.70 + (z_score - 3.0) * 0.08)
    elif z_score > 2.0:  # Moderate anomaly
        detected = True
        severity = 0.45

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0

    return CostScanResult(
        detected=detected,
        severity=round(severity, 2),
        confidence=confidence if detected else 1.0,
        metric_type="token_count",
        observed_value=float(token_count),
        baseline_value=mean,
        token_count=token_count,
        baseline_mean=mean,
        z_score=round(z_score, 2),
        latency_ms=round(elapsed_ms, 2),
    )
