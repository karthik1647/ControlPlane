#!/usr/bin/env python3
"""
ControlPlane.ai - High-Precision Micro-Benchmark Suite
Measures actual wall-clock latencies (p50, p95, p99) for Tier 1 Scanners,
Tier 2 Grounding Verifier, and End-to-End Gateway Processing.
"""

import sys
import time
import asyncio
import statistics
from pathlib import Path

# Ensure repository root is on sys.path
repo_root = Path(__file__).resolve().parent.parent.parent
if str(repo_root) not in sys.path:
    sys.path.insert(0, str(repo_root))

from backend.app.scanners.pii_scanner import scan_pii
from backend.app.scanners.injection_scanner import scan_injection_toxicity
from backend.app.scanners.cost_scanner import scan_cost_anomaly
from backend.app.scanners.drift_sentinel import RollingDriftTracker
from backend.app.scanners.tier2_grounding import verify_grounding
from backend.app.router import route_action


def compute_percentiles(latencies_ms):
    s = sorted(latencies_ms)
    n = len(s)
    p50 = s[int(n * 0.50)]
    p90 = s[int(n * 0.90)]
    p95 = s[int(n * 0.95)]
    p99 = s[int(n * 0.99)]
    return {
        "count": n,
        "min": min(s),
        "mean": statistics.mean(s),
        "p50": p50,
        "p90": p90,
        "p95": p95,
        "p99": p99,
        "max": max(s),
    }


async def benchmark_tier1(iterations=500):
    prompt = "Please review my quarterly performance and calculate my severance or bonus."
    candidate = "Your bonus calculation is approved for employee ID 4892. Refund processed to card 4532-0123-4567-8910."
    tracker = RollingDriftTracker(alpha=0.40)

    # Warmup
    for _ in range(25):
        await asyncio.gather(
            scan_pii(candidate),
            scan_injection_toxicity(prompt, candidate),
            scan_cost_anomaly(85, "customer_support"),
        )

    latencies = []
    for _ in range(iterations):
        t0 = time.perf_counter()
        p_res, i_res, c_res = await asyncio.gather(
            scan_pii(candidate),
            scan_injection_toxicity(prompt, candidate),
            scan_cost_anomaly(85, "customer_support"),
        )
        elapsed = (time.perf_counter() - t0) * 1000.0
        latencies.append(elapsed)

    return compute_percentiles(latencies)


async def benchmark_tier2(iterations=500):
    context = [
        "Air Canada Bereavement Policy: Bereavement fares are only available prior to travel on select international and domestic flights.",
        "We do not issue retroactive refunds or credits for bereavement after travel has completed or tickets have been purchased at standard rates.",
        "All bereavement claims require submission of death certificate within 14 days of ticket issuance.",
    ]
    candidate = "Yes, you can book standard fare today and simply submit our retroactive bereavement form within 90 days of travel to receive a 50% refund."

    # Warmup
    for _ in range(25):
        await verify_grounding(candidate, context)

    latencies = []
    for _ in range(iterations):
        t0 = time.perf_counter()
        res = await verify_grounding(candidate, context)
        elapsed = (time.perf_counter() - t0) * 1000.0
        latencies.append(elapsed)

    return compute_percentiles(latencies)


async def benchmark_end_to_end_clean(iterations=500):
    prompt = "How do I format an array in Python using list comprehension?"
    candidate = "You can format an array with: [str(x) for x in my_list]."
    use_case = "internal_copilot"

    # Warmup
    for _ in range(25):
        p_res, i_res = await asyncio.gather(
            scan_pii(candidate),
            scan_injection_toxicity(prompt, candidate),
        )
        c_res = await scan_cost_anomaly(30, use_case)
        route_action(
            pii_res=p_res,
            injection_res=i_res,
            cost_res=c_res,
            candidate_response=candidate,
            use_case=use_case,
            request_id="bench_warmup",
            grounding_res=None,
        )

    latencies = []
    for i in range(iterations):
        t0 = time.perf_counter()
        p_res, i_res = await asyncio.gather(
            scan_pii(candidate),
            scan_injection_toxicity(prompt, candidate),
        )
        c_res = await scan_cost_anomaly(30, use_case)
        route_action(
            pii_res=p_res,
            injection_res=i_res,
            cost_res=c_res,
            candidate_response=candidate,
            use_case=use_case,
            request_id=f"bench_{i}",
            grounding_res=None,
        )
        elapsed = (time.perf_counter() - t0) * 1000.0
        latencies.append(elapsed)

    return compute_percentiles(latencies)


async def benchmark_end_to_end_grounded(iterations=500):
    prompt = "Can I claim retroactive bereavement refund?"
    context = [
        "Air Canada Bereavement Policy: We do not issue retroactive refunds or credits after travel has completed."
    ]
    candidate = "Yes, you can book today and claim 50% refund within 90 days of travel."
    use_case = "customer_support"

    # Warmup
    for _ in range(25):
        p_res, i_res = await asyncio.gather(
            scan_pii(candidate),
            scan_injection_toxicity(prompt, candidate),
        )
        c_res = await scan_cost_anomaly(45, use_case)
        g_res = await verify_grounding(candidate, context)
        route_action(
            pii_res=p_res,
            injection_res=i_res,
            cost_res=c_res,
            candidate_response=candidate,
            use_case=use_case,
            request_id="bench_warmup",
            grounding_res=g_res,
        )

    latencies = []
    for i in range(iterations):
        t0 = time.perf_counter()
        p_res, i_res = await asyncio.gather(
            scan_pii(candidate),
            scan_injection_toxicity(prompt, candidate),
        )
        c_res = await scan_cost_anomaly(45, use_case)
        g_res = await verify_grounding(candidate, context)
        route_action(
            pii_res=p_res,
            injection_res=i_res,
            cost_res=c_res,
            candidate_response=candidate,
            use_case=use_case,
            request_id=f"bench_{i}",
            grounding_res=g_res,
        )
        elapsed = (time.perf_counter() - t0) * 1000.0
        latencies.append(elapsed)

    return compute_percentiles(latencies)


async def run_all_benchmarks(n_runs=500):
    print("=" * 80)
    print(f" ControlPlane.ai Micro-Benchmark Suite ({n_runs} iterations each)")
    print("=" * 80)

    print("\n[1/4] Benchmarking Tier 1 Parallel Fast Scanners (PII + Injection + Cost)...")
    t1 = await benchmark_tier1(n_runs)

    print("[2/4] Benchmarking Tier 2 Conditional Grounding Verifier (NLI proposition check)...")
    t2 = await benchmark_tier2(n_runs)

    print("[3/4] Benchmarking Full End-to-End Clean Path (Tier 1 + Categorical Router)...")
    e2e_clean = await benchmark_end_to_end_clean(n_runs)

    print("[4/4] Benchmarking Full End-to-End Grounded Path (Tier 1 + Tier 2 + Router)...")
    e2e_grounded = await benchmark_end_to_end_grounded(n_runs)

    print("\n" + "=" * 80)
    print(" MEASURED LATENCY BENCHMARK RESULTS")
    print("=" * 80)
    print(f"{'Pipeline Component':<36} | {'p50':<8} | {'p90':<8} | {'p95':<8} | {'p99':<8} | {'Mean':<8}")
    print("-" * 80)
    print(f"{'Tier 1 Parallel Scanners':<36} | {t1['p50']:5.2f}ms | {t1['p90']:5.2f}ms | {t1['p95']:5.2f}ms | {t1['p99']:5.2f}ms | {t1['mean']:5.2f}ms")
    print(f"{'Tier 2 Grounding Verifier':<36} | {t2['p50']:5.2f}ms | {t2['p90']:5.2f}ms | {t2['p95']:5.2f}ms | {t2['p99']:5.2f}ms | {t2['mean']:5.2f}ms")
    print(f"{'E2E Gateway (Clean / Fast Path)':<36} | {e2e_clean['p50']:5.2f}ms | {e2e_clean['p90']:5.2f}ms | {e2e_clean['p95']:5.2f}ms | {e2e_clean['p99']:5.2f}ms | {e2e_clean['mean']:5.2f}ms")
    print(f"{'E2E Gateway (Full Grounded Path)':<36} | {e2e_grounded['p50']:5.2f}ms | {e2e_grounded['p90']:5.2f}ms | {e2e_grounded['p95']:5.2f}ms | {e2e_grounded['p99']:5.2f}ms | {e2e_grounded['mean']:5.2f}ms")
    print("=" * 80)
    print("Note: Measured locally on Python 3.11 with unpinned dev process overhead.")
    print("=" * 80 + "\n")


if __name__ == "__main__":
    asyncio.run(run_all_benchmarks(500))
