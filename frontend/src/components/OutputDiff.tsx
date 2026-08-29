import React from 'react';
import { GuardAction } from '../types';

interface Props {
  rawCandidate: string;
  finalResponse: string;
  action: GuardAction;
}

export const OutputDiff: React.FC<Props> = ({ rawCandidate, finalResponse, action }) => {
  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-4.5 shadow-xl">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
          Payload Transformation & Delivery Inspector
        </h3>
        <span className="text-[11px] font-mono text-slate-400">
          Action: <span className="text-indigo-300 font-bold uppercase">{action}</span>
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Raw Upstream Response */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Raw Upstream Response (Before Guard)</span>
            <span className="text-[10px] text-slate-500 font-mono">Unsanitized</span>
          </div>
          <div className="bg-slate-950 border border-slate-800/90 rounded-lg p-3 text-xs font-mono text-slate-300 whitespace-pre-wrap min-h-[90px] leading-relaxed">
            {rawCandidate || <span className="text-slate-600 italic">No input candidate submitted.</span>}
          </div>
        </div>

        {/* Final Guarded Output Delivered to User */}
        <div>
          <div className="text-[11px] font-semibold text-slate-400 mb-1.5 flex items-center justify-between">
            <span>Final Delivered Response (After Guard)</span>
            <span
              className={`text-[10px] font-bold font-mono ${
                action === 'block'
                  ? 'text-rose-400'
                  : action === 'inline_edit'
                  ? 'text-blue-400'
                  : action === 'quarantine'
                  ? 'text-amber-400'
                  : 'text-emerald-400'
              }`}
            >
              {action.toUpperCase()}
            </span>
          </div>
          <div
            className={`border rounded-lg p-3 text-xs font-mono whitespace-pre-wrap min-h-[90px] leading-relaxed ${
              action === 'block'
                ? 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                : action === 'inline_edit'
                ? 'bg-blue-950/40 border-blue-500/40 text-blue-100'
                : action === 'quarantine'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : 'bg-emerald-950/30 border-emerald-500/30 text-emerald-100'
            }`}
          >
            {finalResponse || <span className="text-slate-600 italic">Awaiting gateway execution...</span>}
          </div>
        </div>
      </div>
    </div>
  );
};
