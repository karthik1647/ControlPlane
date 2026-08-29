import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GuardRequest, GuardResponse, PresetScenario, DriftStepResult, UseCase } from '../types';
import { PRESET_SCENARIOS, generateFreshAssetId } from '../presets';

/* ──────────────────────────────────────────────────────────────
   Helpers & constants
   ────────────────────────────────────────────────────────────── */

const USE_CASE_BUDGETS: Record<UseCase, number> = {
  customer_support: 150.0,
  internal_copilot: 500.0,
  decision_agent: 1500.0,
};

const USE_CASE_LABELS: Record<UseCase, string> = {
  customer_support: 'Customer Support (<150ms)',
  internal_copilot: 'Internal Copilot (<500ms)',
  decision_agent: 'Decision Agent (<1.5s)',
};

/* ──────────────────────────────────────────────────────────────
   Inline SVG Icons (Clean 1.5px Vectors)
   ────────────────────────────────────────────────────────────── */
const ShieldCheckIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
  </svg>
);

const ShieldAlertIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0 3.75h.007v.008H12v-.008zM12 3s7.5 3 7.5 8.25c0 5.25-4.5 9-7.5 10.5-3-1.5-7.5-5.25-7.5-10.5C4.5 6 12 3 12 3z" />
  </svg>
);

const TrendingUpIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18L9 11.25l4.306 4.307a11.95 11.95 0 005.814-5.519l2.74-1.22m0 0l-5.94-2.28m5.94 2.28l-2.28 5.941" />
  </svg>
);

const TargetIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m0 13.5V21m9-9h-2.25M5.25 12H3m15.364 6.364l-1.591-1.591M6.227 6.227L4.636 4.636m12.728 0l-1.591 1.591M6.227 17.773l-1.591 1.591M12 7.5a4.5 4.5 0 100 9 4.5 4.5 0 000-9z" />
  </svg>
);

const AlertTriangleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
  </svg>
);

const ArrowRightIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
  </svg>
);

const CheckCircleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

/* ──────────────────────────────────────────────────────────────
   Dashboard Navbar
   ────────────────────────────────────────────────────────────── */
const DashboardNav: React.FC = () => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200/80 shadow-xs">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 hover:opacity-85 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-cp-600 flex items-center justify-center text-white font-black text-sm shadow-xs">
            CP
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">ControlPlane.ai</span>
        </button>

        <h1 className="text-sm font-semibold text-gray-600 hidden sm:block">
          AI Governance Dashboard
        </h1>

        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-emerald-700 font-semibold">Gateway Active :8000</span>
        </div>
      </div>
    </header>
  );
};

/* ──────────────────────────────────────────────────────────────
   Scenario Selector
   ────────────────────────────────────────────────────────────── */

const SCENARIO_COLORS: Record<string, string> = {
  sc01_air_canada:    'border-t-rose-700',
  sc04_zillow_drift:  'border-t-amber-600',
  pii_leak:           'border-t-blue-600',
  prompt_injection:   'border-t-rose-800',
  clean_grounded:     'border-t-emerald-600',
};

interface ScenarioSelectorProps {
  selectedPresetId: string | null;
  onSelectPreset: (p: PresetScenario) => void;
  onRunDriftSequence: () => void;
  isRunningDrift: boolean;
}

const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  selectedPresetId,
  onSelectPreset,
  onRunDriftSequence,
  isRunningDrift,
}) => (
  <div className="bg-white border border-gray-200/90 rounded-2xl p-6 mb-6 shadow-xs">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
      <div>
        <h2 className="text-base font-bold text-gray-900">Select Governance Scenario</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Select a benchmark to evaluate policy routing and execution safety
        </p>
      </div>
      <button
        onClick={onRunDriftSequence}
        disabled={isRunningDrift}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-cp-600 text-white hover:bg-cp-700 transition-colors shadow-xs disabled:opacity-50 whitespace-nowrap"
      >
        {isRunningDrift ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Executing 5-Turn Replay…
          </>
        ) : (
          <>
            <span>Simulate 5-Turn Drift Sequence</span>
            <ArrowRightIcon className="w-4 h-4" />
          </>
        )}
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
      {PRESET_SCENARIOS.map((preset) => {
        const isActive = selectedPresetId === preset.id;
        const topColor = SCENARIO_COLORS[preset.id] ?? 'border-t-gray-400';
        return (
          <button
            key={preset.id}
            onClick={() => onSelectPreset(preset)}
            className={`text-left p-4 rounded-xl border-t-4 border border-gray-200/90 transition-all duration-150 flex flex-col gap-2 ${topColor} ${
              isActive
                ? 'bg-cp-50/60 ring-2 ring-cp-500 shadow-xs'
                : 'bg-white hover:bg-gray-50'
            }`}
          >
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-gray-100 text-gray-700 border border-gray-200/80 self-start">
              {preset.tag}
            </span>
            <div className="text-xs font-bold text-gray-900 line-clamp-1">
              {preset.title.split(':')[0]}
            </div>
            <div className="text-[11px] text-gray-500 line-clamp-2 leading-relaxed">
              {preset.title.split(':')[1]?.trim() || preset.description}
            </div>
          </button>
        );
      })}
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────────
   Input Console
   ────────────────────────────────────────────────────────────── */
interface InputConsoleProps {
  request: GuardRequest;
  onChange: (r: GuardRequest) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

const InputConsole: React.FC<InputConsoleProps> = ({ request, onChange, onSubmit, isLoading }) => {
  const [contextOpen, setContextOpen] = useState(true);

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs flex flex-col gap-4">
      <div>
        <h2 className="text-base font-bold text-gray-900">Configure Inspection Payload</h2>
        <p className="text-xs text-gray-500 mt-0.5">
          Specify user prompt, ground truth context, and model candidate response
        </p>
      </div>

      {/* Use Case */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Use Case Profile
        </label>
        <select
          value={request.use_case}
          onChange={(e) => onChange({ ...request, use_case: e.target.value as UseCase })}
          className="w-full text-xs font-medium text-gray-800 bg-gray-50 border border-gray-300/80 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-cp-500"
        >
          {Object.entries(USE_CASE_LABELS).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </div>

      {/* User Prompt */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          User Prompt
        </label>
        <textarea
          rows={3}
          value={request.prompt}
          onChange={(e) => onChange({ ...request, prompt: e.target.value })}
          className="w-full text-xs font-mono text-gray-800 bg-gray-50 border border-gray-300/80 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-cp-500 resize-y leading-relaxed"
          placeholder="Enter prompt..."
        />
      </div>

      {/* Ground Truth RAG Context */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <button
            type="button"
            onClick={() => setContextOpen(!contextOpen)}
            className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider hover:text-cp-600 transition-colors"
          >
            <span>Ground Truth / RAG Context</span>
            <span className="text-[10px] text-gray-400">{contextOpen ? '▲' : '▼'}</span>
          </button>
          {request.context_documents.length > 0 && (
            <span className="text-[10px] font-semibold text-cp-700 bg-cp-50 px-2 py-0.5 rounded border border-cp-200">
              Tier 2 Active
            </span>
          )}
        </div>

        {contextOpen && (
          <textarea
            rows={3}
            value={request.context_documents.join('\n\n')}
            onChange={(e) =>
              onChange({
                ...request,
                context_documents: e.target.value ? [e.target.value] : [],
              })
            }
            className="w-full text-xs font-mono text-gray-800 bg-gray-50 border border-gray-300/80 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-cp-500 resize-y leading-relaxed"
            placeholder="Enter reference documents for Tier 2 grounding verification..."
          />
        )}
      </div>

      {/* Candidate Response */}
      <div>
        <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
          Candidate Response (Upstream Model Output)
        </label>
        <textarea
          rows={3}
          value={request.candidate_response}
          onChange={(e) => onChange({ ...request, candidate_response: e.target.value })}
          className="w-full text-xs font-mono text-gray-800 bg-gray-50 border border-gray-300/80 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-cp-500 resize-y leading-relaxed"
          placeholder="Enter model candidate output..."
        />
      </div>

      {/* Token Count */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
            Token Count
          </label>
          <input
            type="number"
            value={request.token_count}
            onChange={(e) => onChange({ ...request, token_count: parseInt(e.target.value) || 0 })}
            className="w-full text-xs font-mono text-gray-800 bg-gray-50 border border-gray-300/80 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-cp-500"
          />
        </div>
        {request.request_metadata?.valuation_amount !== undefined && (
          <div>
            <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">
              Valuation Amount ($)
            </label>
            <input
              type="number"
              value={request.request_metadata.valuation_amount}
              onChange={(e) =>
                onChange({
                  ...request,
                  request_metadata: {
                    ...request.request_metadata,
                    valuation_amount: parseFloat(e.target.value) || 0,
                  },
                })
              }
              className="w-full text-xs font-mono text-gray-800 bg-gray-50 border border-gray-300/80 rounded-xl p-3 focus:outline-none focus:ring-2 focus:ring-cp-500"
            />
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        onClick={onSubmit}
        disabled={isLoading}
        className="w-full mt-2 py-3.5 px-4 bg-cp-600 hover:bg-cp-700 text-white font-semibold text-sm rounded-xl shadow-xs transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {isLoading ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Executing Inspection…
          </>
        ) : (
          <>
            <span>Dispatch through ControlPlane.ai</span>
            <ArrowRightIcon className="w-4 h-4" />
          </>
        )}
      </button>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   Action Banner (Refined Softened Failure Themes)
   ────────────────────────────────────────────────────────────── */
interface ActionConfig {
  label: string;
  headline: string;
  bg: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  icon: React.FC<{ className?: string }>;
}

const ACTION_CONFIG: Record<string, ActionConfig> = {
  allow: {
    label: 'ALLOW',
    headline: 'Response Allowed',
    bg: 'bg-emerald-50/70',
    border: 'border-emerald-200/90',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    icon: CheckCircleIcon,
  },
  inline_edit: {
    label: 'INLINE EDIT',
    headline: 'Response Sanitized',
    bg: 'bg-blue-50/70',
    border: 'border-blue-200/90',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    icon: ShieldCheckIcon,
  },
  quarantine: {
    label: 'QUARANTINE',
    headline: 'Held for Human Review',
    bg: 'bg-amber-50/70',
    border: 'border-amber-200/90',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    icon: AlertTriangleIcon,
  },
  block: {
    label: 'BLOCK',
    headline: 'Response Blocked',
    bg: 'bg-slate-50',
    border: 'border-rose-300/90',
    badgeBg: 'bg-rose-100',
    badgeText: 'text-rose-900 border border-rose-200',
    icon: ShieldAlertIcon,
  },
};

interface ActionBannerProps {
  response: GuardResponse;
  totalLatencyMs: number;
}

const ActionBanner: React.FC<ActionBannerProps> = ({ response, totalLatencyMs }) => {
  const cfg = ACTION_CONFIG[response.action] ?? ACTION_CONFIG.allow;
  const IconComponent = cfg.icon;
  const severityPct = Math.min(100, response.decision.severity * 100);

  return (
    <div className={`border rounded-2xl p-6 mb-5 shadow-xs ${cfg.bg} ${cfg.border}`}>
      <div className="flex items-start justify-between gap-4 mb-5 pb-5 border-b border-gray-200/70">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-gray-900 shadow-xs">
            <IconComponent className="w-6 h-6 text-cp-700" />
          </div>
          <div>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-[10px] font-bold ${cfg.badgeBg} ${cfg.badgeText} mb-1`}>
              {cfg.label}
            </span>
            <h3 className="text-xl font-bold text-gray-900">{cfg.headline}</h3>
            <p className="text-xs text-gray-500 font-mono mt-0.5">
              Request ID: {response.decision.request_id}
            </p>
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-3xl font-bold text-gray-900 font-mono tracking-tight">
            {totalLatencyMs.toFixed(1)}
            <span className="text-sm font-medium text-gray-500 ml-1">ms</span>
          </div>
          <div className="text-xs font-medium text-gray-500">Total Gateway Latency</div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        <div className="bg-white/80 border border-gray-200/80 rounded-xl p-3">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Severity Score</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
            <div
              className={`h-1.5 rounded-full ${severityPct > 70 ? 'bg-rose-700' : severityPct > 40 ? 'bg-amber-600' : 'bg-emerald-600'}`}
              style={{ width: `${severityPct}%` }}
            />
          </div>
          <div className="text-sm font-bold text-gray-900 font-mono">{response.decision.severity.toFixed(2)}</div>
        </div>
        <div className="bg-white/80 border border-gray-200/80 rounded-xl p-3">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Confidence</div>
          <div className="text-sm font-bold text-gray-900 font-mono">{response.decision.confidence.toFixed(2)}</div>
        </div>
        <div className="bg-white/80 border border-gray-200/80 rounded-xl p-3">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Risk Category</div>
          <div className="text-xs font-bold text-gray-900 uppercase">{response.decision.primary_risk_category}</div>
        </div>
        <div className="bg-white/80 border border-gray-200/80 rounded-xl p-3">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1.5">Applied Policy</div>
          <div className="text-xs font-medium text-gray-700">{response.decision.applied_use_case}</div>
        </div>
      </div>

      {response.decision.reasons.length > 0 && (
        <div className="bg-white/80 border border-gray-200/80 rounded-xl p-4">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Diagnostic Findings</div>
          <ul className="space-y-1">
            {response.decision.reasons.map((reason, i) => (
              <li key={i} className="text-xs text-gray-700 font-medium flex items-start gap-2">
                <span className="text-cp-600 font-bold">•</span>
                {reason}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   Latency Waterfall
   ────────────────────────────────────────────────────────────── */
interface LatencyWaterfallProps {
  response: GuardResponse;
}

const LatencyWaterfall: React.FC<LatencyWaterfallProps> = ({ response }) => {
  const { latency_breakdown: lat, decision } = response;
  const budgetMs = USE_CASE_BUDGETS[decision.applied_use_case as UseCase] ?? 150;
  const total = lat.total_gateway_overhead_ms || 1;
  const budgetPct = Math.min(100, (total / budgetMs) * 100);

  const bars = [
    { label: 'Tier 1 Fast Scanners', ms: lat.tier1_total_ms, color: 'bg-cp-600' },
    { label: 'Tier 2 Grounding', ms: lat.tier2_total_ms, color: 'bg-cp-400' },
    { label: 'Policy Router', ms: lat.routing_ms, color: 'bg-slate-700' },
  ];

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-6 mb-5 shadow-xs">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
          Real-Time Latency Breakdown
        </h3>
        <span className="text-xs font-mono font-medium text-gray-500">
          SLA Budget: &lt;{budgetMs}ms ({budgetPct.toFixed(1)}% consumed)
        </span>
      </div>

      <div className="w-full bg-gray-100 rounded-full h-3 flex overflow-hidden mb-4">
        {bars.map((b) => {
          const pct = Math.max(1, (b.ms / total) * 100);
          return (
            <div
              key={b.label}
              className={`h-full ${b.color} transition-all duration-300`}
              style={{ width: `${pct}%` }}
              title={`${b.label}: ${b.ms.toFixed(1)}ms`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-3 gap-3">
        {bars.map((b) => (
          <div key={b.label} className="p-2.5 rounded-xl bg-gray-50 border border-gray-200/80">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`w-2 h-2 rounded-full ${b.color}`} />
              <span className="text-[11px] font-medium text-gray-600 line-clamp-1">{b.label}</span>
            </div>
            <div className="text-sm font-bold text-gray-900 font-mono">{b.ms.toFixed(2)} ms</div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   Tier Diagnostics Breakdown
   ────────────────────────────────────────────────────────────── */
interface TierBreakdownProps {
  response: GuardResponse;
}

const TierBreakdown: React.FC<TierBreakdownProps> = ({ response }) => {
  const { tier1_results: t1, tier2_results: t2, tier2_triggered: t2Triggered } = response;
  const ca = t1.cost_anomaly;

  return (
    <div className="bg-white border border-gray-200/90 rounded-2xl p-6 mb-5 shadow-xs">
      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider mb-4">
        Multi-Tier Diagnostic Inspection
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* PII */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldCheckIcon className="w-4 h-4 text-cp-600" />
              <span className="text-xs font-bold text-gray-900">PII & Privacy Scanner</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                t1.pii.detected ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {t1.pii.detected ? 'DETECTED' : 'CLEAN'}
            </span>
          </div>
          <div className="text-xs text-gray-600 space-y-1 font-mono">
            <div>Severity: <span className="font-semibold text-gray-900">{t1.pii.severity.toFixed(2)}</span> | Conf: <span className="font-semibold text-gray-900">{t1.pii.confidence.toFixed(2)}</span></div>
            <div>Entities: <span className="font-semibold text-cp-700">{t1.pii.entities_found.length > 0 ? t1.pii.entities_found.join(', ') : 'None'}</span></div>
          </div>
        </div>

        {/* Injection */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <ShieldAlertIcon className="w-4 h-4 text-cp-600" />
              <span className="text-xs font-bold text-gray-900">Injection Sentinel</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                t1.injection_toxicity.detected ? 'bg-rose-100 text-rose-900' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {t1.injection_toxicity.detected ? 'THREAT DETECTED' : 'CLEAN'}
            </span>
          </div>
          <div className="text-xs text-gray-600 space-y-1 font-mono">
            <div>Severity: <span className="font-semibold text-gray-900">{t1.injection_toxicity.severity.toFixed(2)}</span> | Conf: <span className="font-semibold text-gray-900">{t1.injection_toxicity.confidence.toFixed(2)}</span></div>
            <div>Patterns: <span className="font-semibold text-rose-800">{t1.injection_toxicity.matched_patterns.length > 0 ? t1.injection_toxicity.matched_patterns.join(', ') : 'None'}</span></div>
          </div>
        </div>

        {/* Cost / Drift */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TrendingUpIcon className="w-4 h-4 text-cp-600" />
              <span className="text-xs font-bold text-gray-900">
                {ca.metric_type === 'valuation' ? 'Asset Valuation Drift Sentinel' : 'Token Volume Anomaly Sentinel'}
              </span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                ca.detected ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {ca.detected ? 'ANOMALY DETECTED' : 'NORMAL'}
            </span>
          </div>
          <div className="text-xs text-gray-600 space-y-1 font-mono">
            {ca.metric_type === 'valuation' ? (
              <>
                <div>Observed Value: <span className="font-bold text-amber-800">${ca.observed_value.toLocaleString()}</span></div>
                <div>Asset Baseline (μ₀): <span className="font-semibold text-gray-800">${ca.baseline_value.toLocaleString()}</span></div>
              </>
            ) : (
              <>
                <div>Tokens: <span className="font-bold text-gray-900">{ca.token_count}</span></div>
                <div>Token Baseline (μ): <span className="font-semibold text-gray-800">{ca.baseline_value}</span></div>
              </>
            )}
            <div>Drift Score: <span className="font-bold text-amber-800">{ca.z_score.toFixed(2)}σ</span></div>
          </div>
        </div>

        {/* Tier 2 Grounding */}
        <div className="p-4 rounded-xl bg-gray-50 border border-gray-200/80">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <TargetIcon className="w-4 h-4 text-cp-600" />
              <span className="text-xs font-bold text-gray-900">Tier 2 Grounding Verifier</span>
            </div>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                !t2Triggered
                  ? 'bg-gray-200 text-gray-600'
                  : t2?.detected
                  ? 'bg-rose-100 text-rose-900'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {!t2Triggered ? 'SKIPPED' : t2?.detected ? 'HALLUCINATION DETECTED' : 'GROUNDED'}
            </span>
          </div>
          <div className="text-xs text-gray-600 space-y-1 font-mono">
            {t2Triggered && t2 ? (
              <>
                <div>Grounding Score: <span className={`font-bold ${t2.grounding_score < 0.5 ? 'text-rose-800' : 'text-emerald-800'}`}>{(t2.grounding_score * 100).toFixed(0)}%</span></div>
                <div className="line-clamp-2">Unsupported Claims: <span className="font-semibold text-rose-800">{t2.unsupported_claims.length > 0 ? t2.unsupported_claims.join('; ') : 'None'}</span></div>
              </>
            ) : (
              <div className="text-gray-500 italic">Bypassed: 0ms added to request latency.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   Output Inspector / Diff
   ────────────────────────────────────────────────────────────── */
interface OutputDiffProps {
  rawCandidate: string;
  finalResponse: string;
  action: string;
}

const OutputDiff: React.FC<OutputDiffProps> = ({ rawCandidate, finalResponse, action }) => (
  <div className="bg-white border border-gray-200/90 rounded-2xl p-6 shadow-xs">
    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
      <h3 className="text-xs font-bold text-gray-900 uppercase tracking-wider">
        Payload Delivery Inspector
      </h3>
      <span className="text-xs font-mono font-semibold text-gray-600">
        Action: <span className="text-cp-700 uppercase font-bold">{action}</span>
      </span>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <div className="text-xs font-semibold text-gray-500 mb-2">Raw Upstream Response</div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-mono text-gray-800 min-h-[90px] leading-relaxed">
          {rawCandidate || <span className="text-gray-400 italic">No input candidate submitted.</span>}
        </div>
      </div>

      <div>
        <div className="text-xs font-semibold text-gray-500 mb-2">Final Delivered Response</div>
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-3.5 text-xs font-mono text-gray-900 min-h-[90px] leading-relaxed">
          {finalResponse || <span className="text-gray-400 italic">Awaiting gateway execution...</span>}
        </div>
      </div>
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────────
   Drift Sequence Viewer
   ────────────────────────────────────────────────────────────── */
interface DriftSequenceViewerProps {
  results: DriftStepResult[];
  onClose: () => void;
}

const DriftSequenceViewer: React.FC<DriftSequenceViewerProps> = ({ results, onClose }) => (
  <div className="bg-white border-2 border-amber-300 rounded-2xl p-6 mb-6 shadow-sm">
    <div className="flex items-center justify-between pb-4 mb-4 border-b border-gray-200">
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-gray-900">SC-04: Zillow Valuation Drift Sequence</span>
          <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded">
            5-Turn Stateful EMA Replay
          </span>
        </div>
        <p className="text-xs text-gray-500 mt-0.5">
          Exponential Moving Average tracking catching cumulative valuation drift ($400k baseline).
        </p>
      </div>
      <button
        onClick={onClose}
        className="text-xs font-semibold text-gray-600 hover:text-gray-900 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200"
      >
        Dismiss Replay
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
      {results.map((res) => {
        const isQuarantine = res.action === 'quarantine';
        const isEdit = res.action === 'inline_edit';
        return (
          <div
            key={res.step}
            className={`p-4 rounded-xl border transition-all ${
              isQuarantine
                ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-300'
                : isEdit
                ? 'bg-blue-50 border-blue-300'
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-gray-900 font-mono">Turn #{res.step}</span>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                  isQuarantine
                    ? 'bg-amber-200 text-amber-900'
                    : isEdit
                    ? 'bg-blue-200 text-blue-900'
                    : 'bg-emerald-200 text-emerald-900'
                }`}
              >
                {res.action}
              </span>
            </div>

            <div className="space-y-1 text-xs font-mono text-gray-700">
              <div>Price: <span className="font-bold text-gray-900">${res.price.toLocaleString()}</span></div>
              <div>Drift Score: <span className="font-bold text-amber-800">{res.driftScore.toFixed(2)}σ</span></div>
              <div>Severity: <span className="font-semibold text-gray-800">{res.severity.toFixed(2)}</span></div>
            </div>

            <div className="mt-3 pt-2 border-t border-gray-200/80 text-[10px] font-semibold">
              {isQuarantine ? (
                <span className="text-amber-900">Held for Human Review</span>
              ) : isEdit ? (
                <span className="text-blue-800">Flagged Anomaly</span>
              ) : (
                <span className="text-emerald-700">Allowed</span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  </div>
);

/* ──────────────────────────────────────────────────────────────
   Empty State
   ────────────────────────────────────────────────────────────── */
const EmptyState: React.FC = () => (
  <div className="bg-white border border-gray-200/90 rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center flex-1">
    <div className="w-12 h-12 rounded-2xl bg-cp-50 border border-cp-100 flex items-center justify-center text-cp-600 mb-4">
      <ShieldCheckIcon className="w-6 h-6" />
    </div>
    <h3 className="text-base font-bold text-gray-900 mb-1">Ready for Inspection Payload</h3>
    <p className="text-xs text-gray-500 max-w-sm leading-relaxed">
      Select a benchmark scenario above or enter a custom prompt to evaluate policy decisions in real time.
    </p>
  </div>
);

/* ──────────────────────────────────────────────────────────────
   Dashboard Main Component
   ────────────────────────────────────────────────────────────── */
export const Dashboard: React.FC = () => {
  const [selectedPresetId, setSelectedPresetId] = useState<string | null>('sc01_air_canada');
  const [request, setRequest] = useState<GuardRequest>({
    use_case: PRESET_SCENARIOS[0].use_case,
    prompt: PRESET_SCENARIOS[0].prompt,
    candidate_response: PRESET_SCENARIOS[0].candidate_response,
    context_documents: PRESET_SCENARIOS[0].context_documents,
    token_count: PRESET_SCENARIOS[0].token_count,
    request_metadata: {},
  });

  const [response, setResponse] = useState<GuardResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [driftResults, setDriftResults] = useState<DriftStepResult[] | null>(null);
  const [isRunningDrift, setIsRunningDrift] = useState<boolean>(false);

  const handleSelectPreset = (preset: PresetScenario) => {
    setSelectedPresetId(preset.id);
    setRequest({
      use_case: preset.use_case,
      prompt: preset.prompt,
      candidate_response: preset.candidate_response,
      context_documents: preset.context_documents,
      token_count: preset.token_count,
      request_metadata: preset.valuation_amount
        ? {
            asset_id: preset.asset_id || generateFreshAssetId(),
            valuation_amount: preset.valuation_amount,
            baseline_mean: 400_000,
            baseline_std: 20_000,
          }
        : {},
    });
    setErrorMessage(null);
  };

  const handleExecuteGuard = async (customPayload?: GuardRequest): Promise<GuardResponse | null> => {
    setIsLoading(true);
    setErrorMessage(null);
    const payload = customPayload || request;

    try {
      const res = await fetch('/v1/chat/guard', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`Gateway returned HTTP ${res.status}: ${res.statusText}`);
      }

      const data: GuardResponse = await res.json();
      setResponse(data);
      return data;
    } catch (err: any) {
      console.error('Inspection failed:', err);
      setErrorMessage(
        err.message || 'Gateway unreachable. Ensure the backend server is active on port 8000.'
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunDriftSequence = async () => {
    setIsRunningDrift(true);
    setDriftResults(null);
    setSelectedPresetId('sc04_zillow_drift');

    const freshAssetId = generateFreshAssetId();
    const prices = [410_000, 425_000, 445_000, 470_000, 500_000];
    const steps: DriftStepResult[] = [];

    for (let i = 0; i < prices.length; i++) {
      const price = prices[i];
      const payload: GuardRequest = {
        use_case: 'decision_agent',
        prompt: `Estimate market acquisition offer for Parcel ID #${freshAssetId}.`,
        candidate_response: `Recommended cash acquisition offer is $${price.toLocaleString()} based on automated valuation model.`,
        context_documents: [],
        token_count: 280,
        request_metadata: {
          asset_id: freshAssetId,
          valuation_amount: price,
          baseline_mean: 400_000,
          baseline_std: 20_000,
        },
      };

      const result = await handleExecuteGuard(payload);
      if (result) {
        steps.push({
          step: i + 1,
          price,
          action: result.action,
          driftScore: result.tier1_results.cost_anomaly.z_score,
          severity: result.decision.severity,
          response: result,
        });
      }
      await new Promise((r) => setTimeout(r, 200));
    }

    setDriftResults(steps);
    setIsRunningDrift(false);
  };

  return (
    <div className="min-h-screen bg-gray-50/60 font-sans text-gray-900 antialiased flex flex-col">
      <DashboardNav />

      <main className="max-w-7xl mx-auto px-6 py-8 flex-1 w-full">
        <ScenarioSelector
          selectedPresetId={selectedPresetId}
          onSelectPreset={handleSelectPreset}
          onRunDriftSequence={handleRunDriftSequence}
          isRunningDrift={isRunningDrift}
        />

        {driftResults && (
          <DriftSequenceViewer
            results={driftResults}
            onClose={() => setDriftResults(null)}
          />
        )}

        {errorMessage && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 mb-6 text-xs font-medium text-rose-900 flex items-center justify-between shadow-xs">
            <div className="flex items-center gap-2">
              <AlertTriangleIcon className="w-4 h-4 text-rose-700 shrink-0" />
              <span>
                <strong>Connection Error:</strong> {errorMessage}
              </span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-700 hover:text-rose-950 underline font-mono text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-5 flex flex-col">
            <InputConsole
              request={request}
              onChange={setRequest}
              onSubmit={() => handleExecuteGuard()}
              isLoading={isLoading}
            />
          </div>

          <div className="lg:col-span-7 flex flex-col">
            {response ? (
              <>
                <ActionBanner
                  response={response}
                  totalLatencyMs={response.latency_breakdown.total_gateway_overhead_ms}
                />
                <LatencyWaterfall response={response} />
                <TierBreakdown response={response} />
                <OutputDiff
                  rawCandidate={request.candidate_response}
                  finalResponse={response.final_response}
                  action={response.action}
                />
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </main>

      <footer className="border-t border-gray-200 bg-white py-6 text-center text-xs text-gray-500">
        ControlPlane.ai • Accenture Innovation Challenge 2026 — Track: AI Oversight
      </footer>
    </div>
  );
};
