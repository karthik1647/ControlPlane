"""Stateful Rolling Drift Sentinel for Compounding Valuation/Cost Drift (Zillow-Style)."""

import time
from typing import Optional
from backend.app.models import CostScanResult


class RollingDriftTracker:
    """Tracks Exponential Moving Average (EMA) and cumulative drift across requests per asset."""

    def __init__(self, alpha: float = 0.40):
        self.alpha = alpha
        # Map: asset_id -> {"ema": float, "mean": float, "std": float, "count": int}
        self.assets: dict[str, dict[str, float]] = {}

    def record_valuation(
        self,
        asset_id: str,
        valuation: float,
        token_count: int = 0,
        baseline_mean: float = 400_000.0,
        baseline_std: float = 20_000.0,
    ) -> CostScanResult:
        start_time = time.perf_counter()

        # Design Invariant: baseline_mean & baseline_std establish the fixed anchor on the first
        # call for an asset_id. Subsequent calls for an existing asset_id preserve this anchor
        # to ensure cumulative drift is consistently measured against the original baseline.
        if asset_id not in self.assets:
            self.assets[asset_id] = {
                "ema": baseline_mean,
                "mean": baseline_mean,
                "std": baseline_std,
                "count": 0,
            }

        state = self.assets[asset_id]
        mean = state["mean"]
        std = state["std"]

        # Update EMA with smoothing factor alpha (0.40)
        new_ema = (self.alpha * valuation) + ((1.0 - self.alpha) * state["ema"])
        state["ema"] = new_ema
        state["count"] += 1

        # Calculate cumulative drift score D_t = |EMA_t - mean| / std
        drift_score = abs(new_ema - mean) / std

        detected = False
        severity = 0.0
        confidence = 0.85

        # Severity scaling formula:
        # At drift_score == 3.0, severity = 0.70 (meeting quarantine_severity = 0.65 on decision_agent).
        # Above 3.0, severity increases linearly by +0.08 per unit of drift (e.g. D_t = 3.30 -> severity = 0.724).
        # At drift_score >= 2.0, severity = 0.45 (triggers inline_edit warning flag).
        if drift_score >= 3.0:
            detected = True
            severity = min(1.0, 0.70 + (drift_score - 3.0) * 0.08)
        elif drift_score >= 2.0:
            detected = True
            severity = 0.45

        elapsed_ms = (time.perf_counter() - start_time) * 1000.0

        return CostScanResult(
            detected=detected,
            severity=round(severity, 2),
            confidence=confidence if detected else 1.0,
            metric_type="valuation",
            observed_value=valuation,
            baseline_value=round(mean, 2),
            token_count=token_count,   # actual request token_count; NOT the dollar valuation
            baseline_mean=round(mean, 2),
            z_score=round(drift_score, 2),
            latency_ms=round(elapsed_ms, 2),
        )

    def reset(self, asset_id: Optional[str] = None) -> None:
        """Resets tracker state for test isolation."""
        if asset_id:
            self.assets.pop(asset_id, None)
        else:
            self.assets.clear()


# Global drift tracker instance
drift_tracker = RollingDriftTracker(alpha=0.40)
