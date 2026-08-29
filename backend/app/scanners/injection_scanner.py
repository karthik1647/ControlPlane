"""Tier 1 Scanner: Fast Heuristic Prompt Injection & Malicious Jailbreak Sentinel."""

import re
import time
from backend.app.models import InjectionScanResult

# High-Severity Jailbreak & Exfiltration Patterns
HIGH_SEV_PATTERNS = [
    re.compile(r"ignore\s+(all\s+)?(previous|prior)\s+instructions", re.IGNORECASE),
    re.compile(r"system\s+(override|prompt|instructions)", re.IGNORECASE),
    re.compile(r"disregard\s+(all\s+)?(prior|previous)\s+rules", re.IGNORECASE),
    re.compile(r"dan\s+mode(\s+enabled)?", re.IGNORECASE),
    re.compile(r"you\s+are\s+now\s+(bypassgpt|unrestricted|jailbroken)", re.IGNORECASE),
    re.compile(r"(print|output|leak|reveal)\s+(the\s+)?(initialization|system)\s+prompt", re.IGNORECASE),
    re.compile(r"leak\s+internal\s+instructions", re.IGNORECASE),
]

# Moderate-Severity Jailbreak Patterns
MODERATE_SEV_PATTERNS = [
    re.compile(r"pretend\s+you\s+have\s+no\s+rules", re.IGNORECASE),
    re.compile(r"simulate\s+an\s+unfiltered\s+ai", re.IGNORECASE),
    re.compile(r"roleplay\s+as\s+a\s+rogue\s+agent", re.IGNORECASE),
]


async def scan_injection_toxicity(prompt: str, response: str) -> InjectionScanResult:
    """Scans for unredactable prompt injection/jailbreak patterns in < 2ms."""
    start_time = time.perf_counter()
    matched = []
    severity = 0.0
    confidence = 0.0

    combined_text = f"{prompt} {response}"

    # 1. Check High-Severity Jailbreaks
    for pattern in HIGH_SEV_PATTERNS:
        match = pattern.search(combined_text)
        if match:
            matched.append(match.group(0))
            severity = max(severity, 0.95)
            confidence = max(confidence, 0.90)

    # 2. Check Moderate Patterns
    for pattern in MODERATE_SEV_PATTERNS:
        match = pattern.search(combined_text)
        if match:
            matched.append(match.group(0))
            severity = max(severity, 0.72)
            confidence = max(confidence, 0.60)

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    detected = len(matched) > 0

    return InjectionScanResult(
        detected=detected,
        severity=severity,
        confidence=confidence if detected else 1.0,
        matched_patterns=matched,
        latency_ms=round(elapsed_ms, 2),
    )
