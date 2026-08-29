"""Tier 1 Scanner: High-Performance PII and Credential Regex Redactor."""

import re
import time
from backend.app.models import PIIScanResult

CREDIT_CARD_REGEX = re.compile(r"\b(?:\d[ -]*?){13,19}\b")
EMAIL_REGEX = re.compile(r"\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b")
SSN_REGEX = re.compile(r"\b\d{3}-\d{2}-\d{4}\b")
AADHAAR_REGEX = re.compile(r"\b\d{4}\s\d{4}\s\d{4}\b")
PHONE_REGEX = re.compile(r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b")
API_KEY_REGEX = re.compile(r"\b(?:sk-[a-zA-Z0-9_\-]{16,}|whsec_[a-zA-Z0-9_\-]{16,}|ghp_[a-zA-Z0-9]{36}|AIza[0-9A-Za-z-_]{35})\b")


def _luhn_checksum(card_str: str) -> bool:
    """Verifies Luhn algorithm for numeric strings to avoid false-positive card numbers."""
    digits = [int(c) for c in re.sub(r"\D", "", card_str)]
    if len(digits) < 13 or len(digits) > 19:
        return False
    checksum = 0
    reverse_digits = digits[::-1]
    for i, d in enumerate(reverse_digits):
        if i % 2 == 1:
            doubled = d * 2
            checksum += doubled - 9 if doubled > 9 else doubled
        else:
            checksum += d
    return checksum % 10 == 0


async def scan_pii(text: str) -> PIIScanResult:
    """Scans and redacts PII/Credentials in < 10ms without external dependencies."""
    start_time = time.perf_counter()
    sanitized = text
    entities_found = []
    max_severity = 0.0

    # 1. API Keys & Secrets (Severity 0.90)
    for match in API_KEY_REGEX.finditer(sanitized):
        entities_found.append("API_KEY")
        max_severity = max(max_severity, 0.90)
    sanitized = API_KEY_REGEX.sub("[API_KEY_REDACTED]", sanitized)

    # 2. Credit Cards with Luhn Check (Severity 0.85)
    for match in CREDIT_CARD_REGEX.finditer(text):
        matched_str = match.group(0)
        if _luhn_checksum(matched_str):
            entities_found.append("CREDIT_CARD")
            max_severity = max(max_severity, 0.85)
            sanitized = sanitized.replace(matched_str, "[CARD_REDACTED]")

    # 3. SSN / National IDs (Severity 0.80)
    if SSN_REGEX.search(sanitized):
        entities_found.append("SSN")
        max_severity = max(max_severity, 0.80)
        sanitized = SSN_REGEX.sub("[SSN_REDACTED]", sanitized)

    if AADHAAR_REGEX.search(sanitized):
        entities_found.append("AADHAAR")
        max_severity = max(max_severity, 0.80)
        sanitized = AADHAAR_REGEX.sub("[ID_REDACTED]", sanitized)

    # 4. Email & Phone (Severity 0.50)
    if EMAIL_REGEX.search(sanitized):
        entities_found.append("EMAIL")
        max_severity = max(max_severity, 0.50)
        sanitized = EMAIL_REGEX.sub("[EMAIL_REDACTED]", sanitized)

    if PHONE_REGEX.search(sanitized):
        entities_found.append("PHONE")
        max_severity = max(max_severity, 0.40)
        sanitized = PHONE_REGEX.sub("[PHONE_REDACTED]", sanitized)

    elapsed_ms = (time.perf_counter() - start_time) * 1000.0
    detected = len(entities_found) > 0

    return PIIScanResult(
        detected=detected,
        severity=max_severity if detected else 0.0,
        confidence=0.95 if detected else 1.0,
        entities_found=list(set(entities_found)),
        sanitized_text=sanitized,
        latency_ms=round(elapsed_ms, 2),
    )
