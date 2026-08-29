import React from 'react';
import { LatencyBreakdown, UseCase } from '../types';

interface Props {
  latency: LatencyBreakdown;
  useCase: UseCase;
}

const USE_CASE_BUDGETS: Record<UseCase, number> = {
  customer_support: 150.0,
  internal_copilot: 500.0,
  decision_agent: 1500.0,
};

export const LatencyWaterfall: React.FC<Props> = ({ latency, useCase }) => {
  const budgetMs = USE_CASE_BUDGETS[useCase] || 150.0;
  const totalMs = latency.total_gateway_overhead_ms || 1.0;
  const budgetPercent = Math.min(100, (totalMs / budgetMs) * 100);

  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-4.5 mb-5 shadow-xl">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <span>⚡ Real-Time Latency Waterfall</span>
          <span className="text-[10px] text-emerald-400 font-mono font-normal">
            (Strict &lt;80ms Tier 1 Constraint Enforced)
          </span>
        </h3>
        <div className="text-xs font-mono">
          <span className="text-slate-400">Budget: </span>
          <span className="text-indigo-300 font-bold">&lt;{budgetMs}ms</span>
          <span className="text-slate-500 ml-1">({budgetPercent.toFixed(1)}% consumed)</span>
        </div>
      </div>

      {/* Latency Waterfall Bar */}
      <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800 mb-3">
        <div
          style={{ width: `${Math.max(5, (latency.tier1_total_ms / totalMs) * 100)}%` }}
          className="bg-indigo-500 hover:bg-indigo-400 transition-all cursor-pointer"
          title={`Tier 1 Fast Scanners: ${latency.tier1_total_ms}ms`}
        ></div>
        {latency.tier2_total_ms > 0 && (
          <div
            style={{ width: `${Math.max(5, (latency.tier2_total_ms / totalMs) * 100)}%` }}
            className="bg-purple-500 hover:bg-purple-400 transition-all cursor-pointer"
            title={`Tier 2 Deep Grounding: ${latency.tier2_total_ms}ms`}
          ></div>
        )}
        <div
          style={{ width: `${Math.max(2, (latency.routing_ms / totalMs) * 100)}%` }}
          className="bg-cyan-500 hover:bg-cyan-400 transition-all cursor-pointer"
          title={`Priority Action Routing: ${latency.routing_ms}ms`}
        ></div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-4 gap-2 text-center text-xs">
        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-indigo-400 font-semibold uppercase">Tier 1 Fast (Parallel)</div>
          <div className="font-mono font-bold text-slate-200">{latency.tier1_total_ms.toFixed(1)} ms</div>
        </div>
        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-purple-400 font-semibold uppercase">Tier 2 Grounding</div>
          <div className="font-mono font-bold text-slate-200">
            {latency.tier2_total_ms > 0 ? `${latency.tier2_total_ms.toFixed(1)} ms` : 'Skipped (0ms)'}
          </div>
        </div>
        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-cyan-400 font-semibold uppercase">Decision Router</div>
          <div className="font-mono font-bold text-slate-200">{latency.routing_ms.toFixed(1)} ms</div>
        </div>
        <div className="bg-slate-950/70 p-2 rounded-lg border border-slate-800/80">
          <div className="text-[10px] text-emerald-400 font-semibold uppercase">Total Gateway Cost</div>
          <div className="font-mono font-bold text-emerald-300">{latency.total_gateway_overhead_ms.toFixed(1)} ms</div>
        </div>
      </div>
    </div>
  );
};
