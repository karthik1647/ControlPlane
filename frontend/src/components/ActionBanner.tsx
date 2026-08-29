import React from 'react';
import { GuardAction, DecisionDetails } from '../types';

interface Props {
  action: GuardAction;
  decision: DecisionDetails;
  totalLatencyMs: number;
}

const ACTION_CONFIGS: Record<
  GuardAction,
  { label: string; bg: string; border: string; text: string; icon: string; desc: string }
> = {
  allow: {
    label: 'ALLOW (PASS-THROUGH)',
    bg: 'bg-emerald-950/80',
    border: 'border-emerald-500/50',
    text: 'text-emerald-300',
    icon: '✅',
    desc: 'Response passed all safety, grounding, and cost guardrails without violations.',
  },
  inline_edit: {
    label: 'INLINE EDIT (SANITIZED)',
    bg: 'bg-blue-950/80',
    border: 'border-blue-500/50',
    text: 'text-blue-300',
    icon: '🛡️',
    desc: 'Identified PII or redactable sensitive entities were safely masked in-place.',
  },
  quarantine: {
    label: 'QUARANTINE (HOLD FOR HITL REVIEW)',
    bg: 'bg-amber-950/80',
    border: 'border-amber-500/50',
    text: 'text-amber-300',
    icon: '⚠️',
    desc: 'Escalated to human-in-the-loop review queue due to high severity or systematic anomaly.',
  },
  block: {
    label: 'HARD BLOCK (FALLBACK RETURNED)',
    bg: 'bg-rose-950/80',
    border: 'border-rose-500/50',
    text: 'text-rose-300',
    icon: '🛑',
    desc: 'Critical security violation or ungrounded policy hallucination intercepted.',
  },
};

export const ActionBanner: React.FC<Props> = ({ action, decision, totalLatencyMs }) => {
  const cfg = ACTION_CONFIGS[action] || ACTION_CONFIGS.allow;

  return (
    <div
      className={`${cfg.bg} border ${cfg.border} rounded-xl p-4.5 mb-5 shadow-xl transition-all duration-300`}
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3 mb-3">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{cfg.icon}</span>
          <div>
            <div className="flex items-center gap-2">
              <span className={`text-sm font-extrabold tracking-wide ${cfg.text}`}>
                {cfg.label}
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-slate-900/90 text-slate-300 border border-slate-700 font-mono">
                Req ID: {decision.request_id}
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">{cfg.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-950/80 px-3 py-1.5 rounded-lg border border-slate-800">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Total Gateway Latency</div>
            <div className="text-xs font-mono font-bold text-indigo-300">
              {totalLatencyMs.toFixed(1)} ms
            </div>
          </div>
        </div>
      </div>

      {/* Decision Severity x Confidence Matrix */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Severity (S)
          </span>
          <span className="font-mono font-bold text-slate-100 text-sm">
            {decision.severity.toFixed(2)}
          </span>
        </div>
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Confidence (C)
          </span>
          <span className="font-mono font-bold text-slate-100 text-sm">
            {decision.confidence.toFixed(2)}
          </span>
        </div>
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Primary Risk
          </span>
          <span className="font-mono font-bold text-indigo-300 text-sm uppercase">
            {decision.primary_risk_category}
          </span>
        </div>
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/60">
          <span className="text-[10px] uppercase font-bold text-slate-400 block mb-0.5">
            Applied Policy
          </span>
          <span className="font-mono font-bold text-slate-300 text-xs">
            {decision.applied_use_case}
          </span>
        </div>
      </div>

      {decision.reasons.length > 0 && (
        <div className="mt-3 pt-2.5 border-t border-slate-800/60 text-xs">
          <span className="font-semibold text-slate-300">Diagnostic Findings: </span>
          <span className="text-slate-400">{decision.reasons.join(' | ')}</span>
        </div>
      )}
    </div>
  );
};
