# Dashboard Screenshots Guide

Place your recorded dashboard screenshots in this directory using the filenames below. These correspond directly to the embedded images in the root `README.md`.

| File | Scenario Reference | View to Capture |
|---|---|---|
| `dashboard-allow.png` | Clean Traffic / Positive Control | **Live Simulator** tab with clean developer or support query (`ALLOW` status banner, green badge, ~0.1ms latency waterfall). |
| `dashboard-quarantine.png` | SC-04: Zillow Valuation Drift | **Live Simulator** tab after running the 5-turn drift sequence showing Turn 5 held in `QUARANTINE` (> 3.0σ drift score). |
| `dashboard-block.png` | SC-01: Air Canada Hallucination | **Live Simulator** tab with ungrounded bereavement policy claim triggering a Tier 2 hard `BLOCK`. |
| `dashboard-hitl.png` | Human Review Queue (HITL) | **Human Review (HITL)** tab showing quarantined items with the "Approve & Recalibrate Baseline" and "Confirm Block" action buttons. |
| `dashboard-benchmark.png` | 50-Case Enterprise Benchmark | **50-Case Benchmark** tab showing 100% pass rate, 0.0% FPR, 0.0% FNR, and the domain-filtered test cases table. |

### Recommended Dimensions:
- Standard desktop resolution (1920x1080 or 1440x900)
- PNG format for crisp text rendering
