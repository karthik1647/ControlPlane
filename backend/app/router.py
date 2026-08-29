"""Severity × Confidence Risk Matrix and Category-Aware Priority Router (Tier 1 + Tier 2)."""

from typing import Optional, Tuple
from backend.app.models import (
    CostScanResult,
    GroundingScanResult,
    InjectionScanResult,
    PIIScanResult,
)

# Configurable per-use-case risk thresholds
USE_CASE_THRESHOLDS = {
    "customer_support": {
        "block_severity": 0.70,
        "block_confidence": 0.75,
        "quarantine_severity": 0.60,
        "inline_edit_severity": 0.30,
    },
    "internal_copilot": {
        "block_severity": 0.85,
        "block_confidence": 0.75,
        "quarantine_severity": 0.70,
        "inline_edit_severity": 0.30,
    },
    "decision_agent": {
        "block_severity": 0.75,
        "block_confidence": 0.70,
        "quarantine_severity": 0.65,
        "inline_edit_severity": 0.30,
    },
}


def route_action(
    pii_res: PIIScanResult,
    injection_res: InjectionScanResult,
    cost_res: CostScanResult,
    candidate_response: str,
    use_case: str,
    request_id: str,
    grounding_res: Optional[GroundingScanResult] = None,
) -> Tuple[str, str, float, float, str, list[str]]:
    """Evaluates findings strictly in priority order:
    1. Security Hard Block (Injection meeting use-case block threshold)
    2. Security Escalation (Any other detected injection -> Quarantine)
    3. Grounding Hard Block (Air Canada-style ungrounded policy hallucination)
    4. Grounding Escalation (Ungrounded claim with lower confidence -> Quarantine)
    5. Cleanly Redactable PII -> Inline Edit
    6. General Quarantine (Severe cost/valuation drift -> HITL review)
    7. Moderate Risk (Pass-through / Flag)
    8. Allow (Clean traffic)
    """
    if grounding_res is None:
        grounding_res = GroundingScanResult()

    cfg = USE_CASE_THRESHOLDS.get(use_case, USE_CASE_THRESHOLDS["customer_support"])
    reasons = []

    # Calculate overall max severity and assign confidence using explicit 4-way match
    overall_sev = max(injection_res.severity, grounding_res.severity, pii_res.severity, cost_res.severity)

    if overall_sev == 0.0:
        overall_conf = 1.0
        primary_category = "none"
    elif overall_sev == injection_res.severity:
        overall_conf = injection_res.confidence
        primary_category = "security"
    elif overall_sev == grounding_res.severity:
        overall_conf = grounding_res.confidence
        primary_category = "performance"
    elif overall_sev == pii_res.severity:
        overall_conf = pii_res.confidence
        primary_category = "responsibility"
    else:
        overall_conf = cost_res.confidence
        primary_category = "cost"

    # Diagnostic reasoning
    if injection_res.detected:
        reasons.append(f"Security: Detected injection patterns ({', '.join(injection_res.matched_patterns)})")
    if grounding_res.detected:
        reasons.append(f"Performance: Factual claims unverified by grounding context ({', '.join(grounding_res.unsupported_claims)})")
    if pii_res.detected:
        reasons.append(f"Responsibility: Detected PII entities ({', '.join(pii_res.entities_found)})")
    if cost_res.detected:
        reasons.append(f"Cost: Valuation/token drift detected (Drift/Z-score: {cost_res.z_score})")

    # -------------------------------------------------------------------------
    # PRIORITY 1: SECURITY HARD BLOCK
    # -------------------------------------------------------------------------
    if injection_res.detected:
        if injection_res.severity >= cfg["block_severity"] and injection_res.confidence >= cfg["block_confidence"]:
            return (
                "block",
                "This response cannot be displayed as it violates safety and security policies.",
                injection_res.severity,
                injection_res.confidence,
                "security",
                reasons,
            )

        # -------------------------------------------------------------------------
        # PRIORITY 2: SECURITY ESCALATION -> QUARANTINE
        # Fail-closed: unredactable security threats never reach inline_edit
        # -------------------------------------------------------------------------
        return (
            "quarantine",
            f"This response has been held for compliance review. Reference ID: {request_id}.",
            injection_res.severity,
            injection_res.confidence,
            "security_escalation",
            reasons,
        )

    # -------------------------------------------------------------------------
    # PRIORITY 3: GROUNDING HARD BLOCK (Air Canada-Style Hallucination)
    # -------------------------------------------------------------------------
    if grounding_res.detected:
        if grounding_res.severity >= cfg["block_severity"] and grounding_res.confidence >= cfg["block_confidence"]:
            return (
                "block",
                "This response cannot be provided as it contains claims unverified by official policy. Please refer to official documentation.",
                grounding_res.severity,
                grounding_res.confidence,
                "performance",
                reasons,
            )

        # -------------------------------------------------------------------------
        # PRIORITY 4: GROUNDING ESCALATION -> QUARANTINE
        # -------------------------------------------------------------------------
        return (
            "quarantine",
            f"This response has been held for factual verification review. Reference ID: {request_id}.",
            grounding_res.severity,
            grounding_res.confidence,
            "performance_escalation",
            reasons,
        )

    # -------------------------------------------------------------------------
    # PRIORITY 5: CLEANLY REDACTABLE PII -> INLINE EDIT
    # -------------------------------------------------------------------------
    if pii_res.detected:
        return (
            "inline_edit",
            pii_res.sanitized_text,
            pii_res.severity,
            pii_res.confidence,
            "responsibility",
            reasons,
        )

    # -------------------------------------------------------------------------
    # PRIORITY 6: GENERAL QUARANTINE (Cost / Valuation Drift - Zillow-Style)
    # Design Choice: Cost/valuation anomalies exceeding quarantine_severity
    # always escalate to human review regardless of confidence, since preventing
    # compounding financial losses outweighs the cost of unnecessary review.
    # Cost anomalies never hard-block automatically to avoid business operational paralysis.
    # -------------------------------------------------------------------------
    if overall_sev >= cfg["quarantine_severity"]:
        return (
            "quarantine",
            f"This response has been held for valuation anomaly review. Reference ID: {request_id}.",
            overall_sev,
            overall_conf,
            primary_category,
            reasons,
        )

    # -------------------------------------------------------------------------
    # PRIORITY 7: MODERATE RISK / DRIFT WARNING -> INLINE EDIT (Passthrough + Flag)
    # -------------------------------------------------------------------------
    if overall_sev >= cfg["inline_edit_severity"]:
        return (
            "inline_edit",
            candidate_response,
            overall_sev,
            overall_conf,
            primary_category,
            reasons,
        )

    # -------------------------------------------------------------------------
    # PRIORITY 8: CLEAN TRAFFIC -> ALLOW
    # -------------------------------------------------------------------------
    return (
        "allow",
        candidate_response,
        0.0,
        1.0,
        "none",
        ["Clean response: no policy violations detected"],
    )
