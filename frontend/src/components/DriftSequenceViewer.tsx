import React from 'react';
import { DriftStepResult } from '../types';

interface Props {
  results: DriftStepResult[];
  onClose: () => void;
}

export const DriftSequenceViewer: React.FC<Props> = ({ results, onClose }) => {
  return (
    <div className="bg-slate-900 border border-amber-500/40 rounded-xl p-5 mb-6 shadow-2xl">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-amber-400 font-bold text-sm">⚡ SC-04: Zillow Compounding Valuation Drift Simulation</span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-mono font-bold">
              Multi-Turn Replay
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Demonstrates stateful EMA tracking catching compounding +25% drift across 5 turns ($400k baseline).
          </p>
        </div>
        <button
          onClick={onClose}
          className="text-xs text-slate-400 hover:text-slate-200 px-2.5 py-1 rounded bg-slate-800 border border-slate-700"
        >
          Close Replay
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
        {results.map((res) => {
          const isQuarantined = res.action === 'quarantine';
          const isWarn = res.action === 'inline_edit';
          return (
            <div
              key={res.step}
              className={`p-3.5 rounded-lg border transition duration-200 ${
                isQuarantined
                  ? 'bg-amber-950/60 border-amber-500 ring-1 ring-amber-500/50 shadow-lg shadow-amber-500/10'
                  : isWarn
                  ? 'bg-blue-950/40 border-blue-500/50'
                  : 'bg-slate-950/70 border-slate-800'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono font-bold text-slate-300">Turn #{res.step}</span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono uppercase ${
                    isQuarantined
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : isWarn
                      ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                      : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  }`}
                >
                  {res.action}
                </span>
              </div>

              <div className="space-y-1.5 text-xs font-mono">
                <div>
                  <span className="text-slate-500">Price: </span>
                  <span className="font-bold text-slate-200">${res.price.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-slate-500">Drift D_t: </span>
                  <span className={`font-bold ${res.driftScore >= 3.0 ? 'text-amber-400' : 'text-slate-300'}`}>
                    {res.driftScore.toFixed(2)}σ
                  </span>
                </div>
                <div>
                  <span className="text-slate-500">Severity: </span>
                  <span className="text-slate-300">{res.severity.toFixed(2)}</span>
                </div>
              </div>

              <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] text-slate-400">
                {isQuarantined ? (
                  <span className="text-amber-300 font-semibold">🚨 Escalated to HITL review</span>
                ) : isWarn ? (
                  <span className="text-blue-300 font-semibold">⚠️ Flagged anomaly</span>
                ) : (
                  <span className="text-emerald-400">✅ Allowed</span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
