/**
 * TypeScript Data Contracts exactly matching backend/app/models.py Pydantic schemas.
 */

export type UseCase = 'customer_support' | 'internal_copilot' | 'decision_agent';
export type GuardAction = 'allow' | 'inline_edit' | 'quarantine' | 'block';

export interface GuardRequest {
  use_case: UseCase;
  prompt: string;
  candidate_response: string;
  context_documents: string[];
  token_count: number;
  request_metadata?: {
    asset_id?: string;
    valuation_amount?: number;
    baseline_mean?: number;
    baseline_std?: number;
    [key: string]: any;
  };
}

export interface PIIScanResult {
  detected: boolean;
  severity: number;
  confidence: number;
  entities_found: string[];
  sanitized_text: string;
  latency_ms: number;
}

export interface InjectionScanResult {
  detected: boolean;
  severity: number;
  confidence: number;
  matched_patterns: string[];
  latency_ms: number;
}

export interface CostScanResult {
  detected: boolean;
  severity: number;
  confidence: number;
  metric_type: 'token_count' | 'valuation';  // which anomaly scanner produced this result
  observed_value: number;    // tokens (token_count path) or asset dollars (valuation path)
  baseline_value: number;    // per-use-case token baseline or asset-specific μ₀ (dollars)
  token_count: number;       // actual request token count in both paths (never dollar amount)
  baseline_mean: number;
  z_score: number;
  latency_ms: number;
}

export interface GroundingScanResult {
  detected: boolean;
  severity: number;
  confidence: number;
  unsupported_claims: string[];
  grounding_score: number;
  latency_ms: number;
}

export interface Tier1Results {
  pii: PIIScanResult;
  injection_toxicity: InjectionScanResult;
  cost_anomaly: CostScanResult;
}

export interface DecisionDetails {
  severity: number;
  confidence: number;
  primary_risk_category: string;
  applied_use_case: string;
  reasons: string[];
  request_id: string;
}

export interface LatencyBreakdown {
  tier1_total_ms: number;
  tier2_total_ms: number;
  routing_ms: number;
  total_gateway_overhead_ms: number;
}

export interface GuardResponse {
  action: GuardAction;
  final_response: string;
  decision: DecisionDetails;
  tier1_results: Tier1Results;
  tier2_results: GroundingScanResult | null;
  tier2_triggered: boolean;
  latency_breakdown: LatencyBreakdown;
}

export interface PresetScenario {
  id: string;
  title: string;
  tag: string;
  badgeColor: string;
  description: string;
  use_case: UseCase;
  prompt: string;
  candidate_response: string;
  context_documents: string[];
  token_count: number;
  valuation_amount?: number;
  asset_id?: string;
}

export interface DriftStepResult {
  step: number;
  price: number;
  action: GuardAction;
  driftScore: number;
  severity: number;
  response: GuardResponse;
}

// ─────────────────────────────────────────────────────────────
// Benchmark Suite & HITL Feedback Contracts
// ─────────────────────────────────────────────────────────────
export interface BenchmarkCaseResult {
  id: string;
  domain: string;
  case_type: 'POSITIVE' | 'NEGATIVE';
  expected_action: string;
  actual_action: string;
  passed: boolean;
  latency_ms: number;
  severity: number;
  confidence: number;
  primary_risk: string;
  prompt: string;
  findings: string[];
}

export interface BenchmarkMetrics {
  total_cases: number;
  passed_cases: number;
  accuracy_pct: number;
  false_positive_rate: number;
  false_negative_rate: number;
  precision_pct: number;
  recall_pct: number;
  trust_score_pct: number;
  avg_tier1_latency_ms: number;
  results: BenchmarkCaseResult[];
}

export interface QuarantineItem {
  request_id: string;
  timestamp: number;
  use_case: string;
  prompt: string;
  candidate_response: string;
  asset_id?: string;
  valuation_amount?: number;
  severity: number;
  confidence: number;
  reasons: string[];
  z_score?: number;
  observed_value?: number;
  baseline_value?: number;
}
