"""Data contracts for ControlPlane.ai Gateway (/v1/chat/guard, /v1/chat/evaluate-batch, /v1/feedback/override)."""

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
    metric_type: Literal["token_count", "valuation"] = "token_count"
    observed_value: float = 0.0
    baseline_value: float = 0.0
    token_count: int = 0
    baseline_mean: float = 0.0
    z_score: float = 0.0
    latency_ms: float = 0.0


class GroundingScanResult(BaseModel):
    detected: bool = False
    severity: float = 0.0
    confidence: float = 1.0
    unsupported_claims: list[str] = Field(default_factory=list)
    grounding_score: float = 1.0
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


# ─────────────────────────────────────────────────────────────
# Benchmark & Evaluation Metrics Schemas
# ─────────────────────────────────────────────────────────────
class BenchmarkCaseResult(BaseModel):
    id: str
    domain: str
    case_type: Literal["POSITIVE", "NEGATIVE"]
    expected_action: str
    actual_action: str
    passed: bool
    latency_ms: float
    severity: float
    confidence: float
    primary_risk: str
    prompt: str
    findings: list[str] = Field(default_factory=list)


class BenchmarkMetrics(BaseModel):
    total_cases: int
    passed_cases: int
    accuracy_pct: float
    false_positive_rate: float
    false_negative_rate: float
    precision_pct: float
    recall_pct: float
    trust_score_pct: float
    avg_tier1_latency_ms: float
    results: list[BenchmarkCaseResult]


# ─────────────────────────────────────────────────────────────
# Human-in-the-Loop Feedback & Recalibration Schemas
# ─────────────────────────────────────────────────────────────
class FeedbackOverrideRequest(BaseModel):
    request_id: str
    asset_id: Optional[str] = None
    supervisor_action: Literal["approve_override", "confirm_block"]
    new_anchor_value: Optional[float] = None
    supervisor_notes: str = ""


class FeedbackOverrideResponse(BaseModel):
    status: str
    request_id: str
    recalibrated: bool
    new_baseline_mean: Optional[float] = None
    message: str
