import React from 'react';
import { Tier1Results, GroundingScanResult } from '../types';

interface Props {
  tier1: Tier1Results;
  tier2: GroundingScanResult | null;
  tier2Triggered: boolean;
}

export const TierBreakdown: React.FC<Props> = ({ tier1, tier2, tier2Triggered }) => {
  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-4.5 mb-5 shadow-xl">
      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3">
        Multi-Tier Inspection Diagnostics
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* PII & Data Privacy */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>🔒</span> PII & Data Privacy Scanner
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                tier1.pii.detected
                  ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {tier1.pii.detected ? 'DETECTED' : 'CLEAN'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 font-mono">
            <div>Severity: <span className="text-slate-200">{tier1.pii.severity.toFixed(2)}</span> | Conf: <span className="text-slate-200">{tier1.pii.confidence.toFixed(2)}</span></div>
            <div>Entities Found: <span className="text-indigo-300">{tier1.pii.entities_found.length > 0 ? tier1.pii.entities_found.join(', ') : 'None'}</span></div>
            <div>Latency: <span className="text-slate-400">{tier1.pii.latency_ms.toFixed(1)} ms</span></div>
          </div>
        </div>

        {/* Prompt Injection & Security */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>🛑</span> Injection & Jailbreak Sentinel
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                tier1.injection_toxicity.detected
                  ? 'bg-red-500/20 text-red-300 border-red-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {tier1.injection_toxicity.detected ? 'THREAT DETECTED' : 'CLEAN'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 font-mono">
            <div>Severity: <span className="text-slate-200">{tier1.injection_toxicity.severity.toFixed(2)}</span> | Conf: <span className="text-slate-200">{tier1.injection_toxicity.confidence.toFixed(2)}</span></div>
            <div>Matched: <span className="text-rose-300">{tier1.injection_toxicity.matched_patterns.length > 0 ? tier1.injection_toxicity.matched_patterns.join(', ') : 'None'}</span></div>
            <div>Latency: <span className="text-slate-400">{tier1.injection_toxicity.latency_ms.toFixed(1)} ms</span></div>
          </div>
        </div>

        {/* Cost & Token / Valuation Drift */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>📈</span>
              {tier1.cost_anomaly.metric_type === 'valuation'
                ? 'Asset Valuation Drift Sentinel'
                : 'Token Volume Anomaly Sentinel'}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                tier1.cost_anomaly.detected
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {tier1.cost_anomaly.detected ? 'ANOMALY DETECTED' : 'NORMAL'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 font-mono">
            {tier1.cost_anomaly.metric_type === 'valuation' ? (
              <>
                <div>
                  Observed Value:{' '}
                  <span className="text-amber-200 font-bold">
                    ${tier1.cost_anomaly.observed_value.toLocaleString()}
                  </span>
                </div>
                <div>
                  Asset Baseline (μ₀):{' '}
                  <span className="text-slate-300">
                    ${tier1.cost_anomaly.baseline_value.toLocaleString()}
                  </span>
                </div>
              </>
            ) : (
              <>
                <div>
                  Tokens:{' '}
                  <span className="text-slate-200 font-bold">
                    {tier1.cost_anomaly.token_count}
                  </span>
                </div>
                <div>
                  Token Baseline (μ):{' '}
                  <span className="text-slate-300">
                    {tier1.cost_anomaly.baseline_value}
                  </span>
                </div>
              </>
            )}
            <div>
              Drift / Z-Score:{' '}
              <span className="text-amber-300 font-bold">
                {tier1.cost_anomaly.z_score.toFixed(2)}σ
              </span>
            </div>
            <div>
              Severity: <span className="text-slate-200">{tier1.cost_anomaly.severity.toFixed(2)}</span>{' '}
              | Conf: <span className="text-slate-200">{tier1.cost_anomaly.confidence.toFixed(2)}</span>
            </div>
            <div>Latency: <span className="text-slate-400">{tier1.cost_anomaly.latency_ms.toFixed(1)} ms</span></div>
          </div>
        </div>

        {/* Tier 2 Grounding & Claim Entailment */}
        <div className="bg-slate-950/70 border border-slate-800/80 rounded-lg p-3">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>🎯</span> Tier 2 Grounding Verifier
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                !tier2Triggered
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : tier2?.detected
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
              }`}
            >
              {!tier2Triggered ? 'SKIPPED' : tier2?.detected ? 'HALLUCINATION DETECTED' : 'GROUNDED'}
            </span>
          </div>
          <div className="text-[11px] text-slate-400 space-y-1 font-mono">
            {tier2Triggered && tier2 ? (
              <>
                <div>Grounding Score: <span className={`font-bold ${tier2.grounding_score < 0.5 ? 'text-rose-400' : 'text-emerald-400'}`}>{(tier2.grounding_score * 100).toFixed(0)}%</span></div>
                <div>Unsupported Claims: <span className="text-rose-300">{tier2.unsupported_claims.length > 0 ? tier2.unsupported_claims.join('; ') : 'None (Fully entailed)'}</span></div>
                <div>Tier 2 Latency: <span className="text-purple-300 font-bold">{tier2.latency_ms.toFixed(1)} ms</span></div>
              </>
            ) : (
              <div className="text-slate-500 italic">Bypassed: 0ms added to request latency.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
