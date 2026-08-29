"""Data contracts for ControlPlane.ai Gateway (/v1/chat/guard)."""

from typing import Any, Literal, Optional
from pydantic import BaseModel, Field


class GuardRequest(BaseModel):
    use_case: Literal["customer_support", "internal_copilot", "decision_agent"] = "customer_support"
    prompt: str = Field(..., description="Original user prompt")
    candidate_response: str = Field(..., description="Raw upstream AI response to be inspected")
    context_documents: list[str] = Field(default_factory=list, description="Optional RAG context docs")
    token_count: int = Field(default=0, description="Token consumption for this inference turn")
    request_metadata: dict[str, Any] = Field(default_factory=dict, description="Caller metadata & IDs")


class PIIScanResult(BaseModel):
    detected: bool = False
    severity: float = 0.0
    confidence: float = 1.0
    entities_found: list[str] = Field(default_factory=list)
    sanitized_text: str = ""
    latency_ms: float = 0.0


class InjectionScanResult(BaseModel):
    detected: bool = False
    severity: float = 0.0
    confidence: float = 1.0
    matched_patterns: list[str] = Field(default_factory=list)
    latency_ms: float = 0.0


class CostScanResult(BaseModel):
    detected: bool = False
    severity: float = 0.0
    confidence: float = 1.0
    # metric_type distinguishes which anomaly scanner populated this result:
    # "token_count" → scan_cost_anomaly (token-volume baseline)
    # "valuation"   → drift_sentinel.record_valuation (dollar-value EMA drift)
    metric_type: Literal["token_count", "valuation"] = "token_count"
    observed_value: float = 0.0   # tokens (token_count path) or dollars (valuation path)
    baseline_value: float = 0.0   # per-use-case token baseline or asset-specific μ₀
    token_count: int = 0          # kept for token-anomaly path; 0 on valuation path
    baseline_mean: float = 0.0    # alias of baseline_value (retained for router compat)
    z_score: float = 0.0
    latency_ms: float = 0.0


class GroundingScanResult(BaseModel):
    detected: bool = False
    severity: float = 0.0
    confidence: float = 1.0
    unsupported_claims: list[str] = Field(default_factory=list)
    grounding_score: float = 1.0  # 1.0 = fully grounded, 0.0 = completely contradicted
    latency_ms: float = 0.0


class Tier1Results(BaseModel):
    pii: PIIScanResult
    injection_toxicity: InjectionScanResult
    cost_anomaly: CostScanResult


class DecisionDetails(BaseModel):
    severity: float
    confidence: float
    primary_risk_category: str
    applied_use_case: str
    reasons: list[str] = Field(default_factory=list)
    request_id: str


class LatencyBreakdown(BaseModel):
    tier1_total_ms: float
    tier2_total_ms: float = 0.0
    routing_ms: float
    total_gateway_overhead_ms: float


class GuardResponse(BaseModel):
    action: Literal["allow", "inline_edit", "quarantine", "block"]
    final_response: str
    decision: DecisionDetails
    tier1_results: Tier1Results
    tier2_results: Optional[GroundingScanResult] = None
    tier2_triggered: bool = False
    latency_breakdown: LatencyBreakdown
