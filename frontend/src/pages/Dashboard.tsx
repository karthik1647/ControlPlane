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
   Dashboard Navbar
   ────────────────────────────────────────────────────────────── */
const DashboardNav: React.FC = () => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Left: Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 rounded-xl bg-cp-600 flex items-center justify-center text-white font-black text-sm shadow-md shadow-cp-600/30">
            CP
          </div>
          <span className="text-base font-bold text-gray-900 tracking-tight">ControlPlane.ai</span>
        </button>

        {/* Center: Title */}
        <h1 className="text-sm font-semibold text-gray-600 hidden sm:block">
          AI Governance Dashboard
        </h1>

        {/* Right: Status */}
        <div className="flex items-center gap-2 text-xs font-mono text-gray-500">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-emerald-600 font-semibold">● Gateway Online :8000</span>
        </div>
      </div>
    </header>
  );
};

/* ──────────────────────────────────────────────────────────────
   Scenario Selector
   ────────────────────────────────────────────────────────────── */

const SCENARIO_COLORS: Record<string, string> = {
  sc01_air_canada:    'border-t-red-500',
  sc04_zillow_drift:  'border-t-amber-500',
  pii_leak:           'border-t-blue-500',
  prompt_injection:   'border-t-red-600',
  clean_grounded:     'border-t-emerald-500',
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
  <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-6 shadow-sm">
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5">
      <div>
        <h2 className="text-base font-bold text-gray-900">Select a scenario to inspect</h2>
        <p className="text-sm text-gray-500 mt-0.5">
          Click any preset to load a real-world AI governance failure case
        </p>
      </div>
      <button
        onClick={onRunDriftSequence}
        disabled={isRunningDrift}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold bg-cp-600 text-white hover:bg-cp-700 transition-colors shadow-md shadow-cp-600/25 disabled:opacity-50 whitespace-nowrap"
      >
        {isRunningDrift ? (
          <>
            <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Simulating 5 Turns…
          </>
        ) : (
          <>⚡ Simulate 5-Turn Drift Sequence →</>
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
            className={`text-left p-4 rounded-xl border-t-4 border border-gray-200 transition-all duration-150 flex flex-col gap-2 ${topColor} ${
              isActive
                ? 'bg-cp-50 ring-2 ring-cp-500 shadow-md shadow-cp-500/10'
                : 'bg-white hover:bg-gray-50 hover:shadow-sm'
            }`}
          >
            {/* Badge */}
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200 self-start">
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
  const hasContext = request.context_documents.length > 0 && request.context_documents[0].trim() !== '';

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-sm flex flex-col h-full">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-cp-600 animate-pulse" />
          <h2 className="text-base font-bold text-gray-900">Configure Inspection Payload</h2>
        </div>
        <p className="text-xs text-gray-500 ml-4">Set prompt, context documents, and candidate response</p>
      </div>

      <div className="px-6 py-5 space-y-5 flex-1">
        {/* Use Case */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">Use Case</label>
          <select
            value={request.use_case}
            onChange={(e) => onChange({ ...request, use_case: e.target.value as UseCase })}
            className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-sm font-medium text-gray-800 focus:outline-none focus:ring-2 focus:ring-cp-500 focus:border-cp-500 transition appearance-none cursor-pointer"
          >
            {(Object.keys(USE_CASE_LABELS) as UseCase[]).map((uc) => (
              <option key={uc} value={uc}>{USE_CASE_LABELS[uc]}</option>
            ))}
          </select>
        </div>

        {/* User Prompt */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">User Prompt</label>
          <textarea
            rows={2}
            value={request.prompt}
            onChange={(e) => onChange({ ...request, prompt: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-cp-500 focus:border-cp-500 transition resize-none"
            placeholder="Enter user query..."
          />
        </div>

        {/* Ground Truth / RAG Context */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <button
              onClick={() => setContextOpen(!contextOpen)}
              className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 hover:text-cp-600 transition-colors"
            >
              <svg
                className={`w-3.5 h-3.5 transition-transform ${contextOpen ? 'rotate-90' : ''}`}
                fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
              </svg>
              Ground Truth / RAG Context
            </button>
            {hasContext ? (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-cp-100 border border-cp-200 text-[10px] font-bold text-cp-700">
                ✓ Tier 2 Active
              </span>
            ) : (
              <span className="text-[10px] text-gray-400 font-mono">Tier 2 Skipped</span>
            )}
          </div>
          {contextOpen && (
            <textarea
              rows={3}
              value={request.context_documents.join('\n\n')}
              onChange={(e) =>
                onChange({
                  ...request,
                  context_documents: e.target.value.trim() ? [e.target.value.trim()] : [],
                })
              }
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-700 font-mono focus:outline-none focus:ring-2 focus:ring-cp-500 focus:border-cp-500 transition resize-none"
              placeholder="Paste authoritative policy document or grounding snippet..."
            />
          )}
        </div>

        {/* Candidate Response */}
        <div>
          <label className="block text-xs font-semibold text-gray-700 mb-1.5">
            Candidate Response <span className="text-gray-400 font-normal">(Upstream model output)</span>
          </label>
          <textarea
            rows={3}
            value={request.candidate_response}
            onChange={(e) => onChange({ ...request, candidate_response: e.target.value })}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-cp-500 focus:border-cp-500 transition resize-none"
            placeholder="Enter raw generated response to inspect..."
          />
        </div>

        {/* Token Count + Valuation */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Token Count</label>
            <input
              type="number"
              value={request.token_count}
              onChange={(e) => onChange({ ...request, token_count: parseInt(e.target.value) || 0 })}
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 font-mono focus:outline-none focus:ring-2 focus:ring-cp-500 focus:border-cp-500 transition"
            />
          </div>
          {request.use_case === 'decision_agent' && (
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5">
                Asset Valuation ($)
              </label>
              <input
                type="number"
                value={request.request_metadata?.valuation_amount || 0}
                onChange={(e) =>
                  onChange({
                    ...request,
                    request_metadata: {
                      ...request.request_metadata,
                      valuation_amount: parseFloat(e.target.value) || 0,
                    },
                  })
                }
                className="w-full bg-gray-50 border border-amber-200 rounded-xl px-3 py-2.5 text-sm text-amber-700 font-mono focus:outline-none focus:ring-2 focus:ring-amber-400 transition"
              />
            </div>
          )}
        </div>
      </div>

      {/* Submit */}
      <div className="px-6 pb-6">
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full py-3.5 rounded-xl text-sm font-bold text-white bg-cp-600 hover:bg-cp-700 transition-all shadow-lg shadow-cp-600/25 flex items-center justify-center gap-2 disabled:opacity-60 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-cp-600/30"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Inspecting via ControlPlane.ai…
            </>
          ) : (
            <>🛡️ Dispatch through ControlPlane.ai →</>
          )}
        </button>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   Action Banner
   ────────────────────────────────────────────────────────────── */
interface ActionConfig {
  label: string;
  headline: string;
  bg: string;
  border: string;
  badgeBg: string;
  badgeText: string;
  icon: string;
}

const ACTION_CONFIG: Record<string, ActionConfig> = {
  allow: {
    label: 'ALLOW',
    headline: 'Response Allowed',
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-700',
    icon: '✅',
  },
  inline_edit: {
    label: 'INLINE EDIT',
    headline: 'Response Sanitized',
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-700',
    icon: '🛡️',
  },
  quarantine: {
    label: 'QUARANTINE',
    headline: 'Held for Human Review',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-700',
    icon: '⚠️',
  },
  block: {
    label: 'BLOCK',
    headline: 'Response Blocked',
    bg: 'bg-red-50',
    border: 'border-red-300',
    badgeBg: 'bg-red-100',
    badgeText: 'text-red-700',
    icon: '🛑',
  },
};

interface ActionBannerProps {
  response: GuardResponse;
  totalLatencyMs: number;
}

const ActionBanner: React.FC<ActionBannerProps> = ({ response, totalLatencyMs }) => {
  const cfg = ACTION_CONFIG[response.action] ?? ACTION_CONFIG.allow;
  const severityPct = Math.min(100, response.decision.severity * 100);

  return (
    <div className={`border rounded-2xl p-6 mb-5 shadow-sm ${cfg.bg} ${cfg.border}`}>
      {/* Top row */}
      <div className="flex items-start justify-between gap-4 mb-5 pb-5 border-b border-black/10">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{cfg.icon}</span>
          <div>
            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${cfg.badgeBg} ${cfg.badgeText} mb-1`}>
              {cfg.label}
            </span>
            <h3 className="text-xl font-black text-gray-900">{cfg.headline}</h3>
            <p className="text-xs text-gray-500 mt-0.5 font-mono">
              Request ID: {response.decision.request_id}
            </p>
          </div>
        </div>
        {/* Latency big number */}
        <div className="text-right shrink-0">
          <div className="text-3xl font-black text-gray-900 font-mono">
            {totalLatencyMs.toFixed(1)}
            <span className="text-base font-semibold text-gray-500 ml-1">ms</span>
          </div>
          <div className="text-xs font-medium text-gray-500">Total Gateway Latency</div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
        {/* Severity */}
        <div className="bg-white/60 border border-white rounded-xl p-3">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Severity Score</div>
          <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1.5">
            <div
              className={`h-1.5 rounded-full ${severityPct > 70 ? 'bg-red-500' : severityPct > 40 ? 'bg-amber-500' : 'bg-emerald-500'}`}
              style={{ width: `${severityPct}%` }}
            />
          </div>
          <div className="text-sm font-black text-gray-900 font-mono">{response.decision.severity.toFixed(2)}</div>
        </div>
        {/* Confidence */}
        <div className="bg-white/60 border border-white rounded-xl p-3">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Confidence</div>
          <div className="text-sm font-black text-gray-900 font-mono">{response.decision.confidence.toFixed(2)}</div>
        </div>
        {/* Risk Category */}
        <div className="bg-white/60 border border-white rounded-xl p-3">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Risk Category</div>
          <div className="text-sm font-bold text-gray-900 uppercase">{response.decision.primary_risk_category}</div>
        </div>
        {/* Applied Policy */}
        <div className="bg-white/60 border border-white rounded-xl p-3">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Applied Policy</div>
          <div className="text-xs font-semibold text-gray-700">{response.decision.applied_use_case}</div>
        </div>
      </div>

      {/* Diagnostic findings */}
      {response.decision.reasons.length > 0 && (
        <div className="bg-white/60 border border-white rounded-xl p-4">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Diagnostic Findings</div>
          <ul className="space-y-1">
            {response.decision.reasons.map((reason, i) => (
              <li key={i} className="text-sm text-gray-700 flex items-start gap-2">
                <span className="text-gray-400 mt-0.5">›</span>
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
    { label: 'Tier 1 Fast Scanners', ms: lat.tier1_total_ms, color: 'bg-cp-500' },
    { label: 'Tier 2 Grounding', ms: lat.tier2_total_ms, color: 'bg-violet-500' },
    { label: 'Decision Router', ms: lat.routing_ms, color: 'bg-cyan-500' },
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
          ⚡ Latency Waterfall
        </h3>
        <div className="text-xs font-mono text-gray-500">
          Budget:{' '}
          <span className="font-bold text-gray-700">&lt;{budgetMs}ms</span>
          <span className="text-gray-400 ml-1">({budgetPct.toFixed(1)}% consumed)</span>
        </div>
      </div>

      {/* Stacked bar */}
      <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden flex mb-5 border border-gray-200">
        {bars.map((b) => (
          b.ms > 0 ? (
            <div
              key={b.label}
              style={{ width: `${Math.max(3, (b.ms / total) * 100)}%` }}
              className={`${b.color} transition-all`}
              title={`${b.label}: ${b.ms.toFixed(1)}ms`}
            />
          ) : null
        ))}
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-4 gap-3">
        {bars.map((b) => (
          <div key={b.label} className="bg-gray-50 border border-gray-200 rounded-xl p-3 text-center">
            <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 leading-tight">{b.label}</div>
            <div className="text-sm font-black text-gray-900 font-mono">
              {b.ms > 0 ? `${b.ms.toFixed(1)}ms` : 'Skipped'}
            </div>
          </div>
        ))}
        <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-center">
          <div className="text-[10px] font-bold text-emerald-600 uppercase tracking-wider mb-1">Total Cost</div>
          <div className="text-sm font-black text-emerald-700 font-mono">{total.toFixed(1)}ms</div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   Tier Breakdown
   ────────────────────────────────────────────────────────────── */
interface TierBreakdownProps {
  response: GuardResponse;
}

const TierBreakdown: React.FC<TierBreakdownProps> = ({ response }) => {
  const { tier1_results: t1, tier2_results: t2, tier2_triggered } = response;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 mb-5 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4">Scanner Breakdown</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* PII Scanner */}
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-800">🔒 PII Scanner</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              t1.pii.detected
                ? 'bg-blue-100 text-blue-700 border-blue-300'
                : 'bg-emerald-100 text-emerald-700 border-emerald-300'
            }`}>
              {t1.pii.detected ? 'DETECTED' : 'CLEAN'}
            </span>
          </div>
          <div className="space-y-1 text-xs font-mono text-gray-600">
            <div>Severity: <span className="text-gray-900 font-semibold">{t1.pii.severity.toFixed(2)}</span> · Confidence: <span className="text-gray-900 font-semibold">{t1.pii.confidence.toFixed(2)}</span></div>
            <div>
              Entities Found:{' '}
              <span className="text-cp-700 font-semibold">
                {t1.pii.entities_found.length > 0 ? t1.pii.entities_found.join(', ') : 'None'}
              </span>
            </div>
            <div>Scan time: <span className="text-gray-500">{t1.pii.latency_ms.toFixed(1)}ms</span></div>
          </div>
        </div>

        {/* Injection Sentinel */}
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-800">🛑 Injection Sentinel</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              t1.injection_toxicity.detected
                ? 'bg-red-100 text-red-700 border-red-300'
                : 'bg-emerald-100 text-emerald-700 border-emerald-300'
            }`}>
              {t1.injection_toxicity.detected ? 'THREAT' : 'CLEAN'}
            </span>
          </div>
          <div className="space-y-1 text-xs font-mono text-gray-600">
            <div>Severity: <span className="text-gray-900 font-semibold">{t1.injection_toxicity.severity.toFixed(2)}</span> · Confidence: <span className="text-gray-900 font-semibold">{t1.injection_toxicity.confidence.toFixed(2)}</span></div>
            <div>
              Patterns Matched:{' '}
              <span className="text-red-600 font-semibold">
                {t1.injection_toxicity.matched_patterns.length > 0 ? t1.injection_toxicity.matched_patterns.join(', ') : 'None'}
              </span>
            </div>
            <div>Scan time: <span className="text-gray-500">{t1.injection_toxicity.latency_ms.toFixed(1)}ms</span></div>
          </div>
        </div>

        {/* Cost / Drift Sentinel */}
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-800">
              📈 {t1.cost_anomaly.metric_type === 'valuation' ? 'Valuation Drift Sentinel' : 'Token Volume Sentinel'}
            </span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              t1.cost_anomaly.detected
                ? 'bg-amber-100 text-amber-700 border-amber-300'
                : 'bg-emerald-100 text-emerald-700 border-emerald-300'
            }`}>
              {t1.cost_anomaly.detected ? 'ANOMALY' : 'NORMAL'}
            </span>
          </div>
          <div className="space-y-1 text-xs font-mono text-gray-600">
            {t1.cost_anomaly.metric_type === 'valuation' ? (
              <>
                <div>Observed: <span className="text-amber-700 font-semibold">${t1.cost_anomaly.observed_value.toLocaleString()}</span></div>
                <div>Baseline: <span className="text-gray-900 font-semibold">${t1.cost_anomaly.baseline_value.toLocaleString()}</span></div>
              </>
            ) : (
              <>
                <div>Tokens: <span className="text-gray-900 font-semibold">{t1.cost_anomaly.token_count}</span></div>
                <div>Baseline: <span className="text-gray-900 font-semibold">{t1.cost_anomaly.baseline_value}</span></div>
              </>
            )}
            <div>
              Drift Score:{' '}
              <span className="text-amber-600 font-semibold">{t1.cost_anomaly.z_score.toFixed(2)}σ</span>
            </div>
            <div>Scan time: <span className="text-gray-500">{t1.cost_anomaly.latency_ms.toFixed(1)}ms</span></div>
          </div>
        </div>

        {/* Tier 2 Grounding */}
        <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-bold text-gray-800">🎯 Hallucination Guard</span>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
              !tier2_triggered
                ? 'bg-gray-100 text-gray-500 border-gray-300'
                : t2?.detected
                ? 'bg-red-100 text-red-700 border-red-300'
                : 'bg-emerald-100 text-emerald-700 border-emerald-300'
            }`}>
              {!tier2_triggered ? 'SKIPPED' : t2?.detected ? 'HALLUCINATION DETECTED' : 'GROUNDED'}
            </span>
          </div>
          <div className="space-y-1 text-xs font-mono text-gray-600">
            {tier2_triggered && t2 ? (
              <>
                <div>
                  Grounding Score:{' '}
                  <span className={`font-semibold ${t2.grounding_score < 0.5 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {(t2.grounding_score * 100).toFixed(0)}%
                  </span>
                </div>
                <div>
                  Unsupported Claims:{' '}
                  <span className="text-red-600 font-semibold">
                    {t2.unsupported_claims.length > 0 ? t2.unsupported_claims.join('; ') : 'None'}
                  </span>
                </div>
                <div>Scan time: <span className="text-gray-500">{t2.latency_ms.toFixed(1)}ms</span></div>
              </>
            ) : (
              <div className="text-gray-400 italic">Bypassed — 0ms added to request latency.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   Output Diff
   ────────────────────────────────────────────────────────────── */
interface OutputDiffProps {
  rawCandidate: string;
  response: GuardResponse;
}

const OUTPUT_DIFF_CONFIG: Record<string, { bg: string; border: string; text: string }> = {
  allow:       { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800' },
  inline_edit: { bg: 'bg-blue-50',    border: 'border-blue-200',    text: 'text-blue-800'    },
  quarantine:  { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-800'   },
  block:       { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-800'     },
};

const OutputDiff: React.FC<OutputDiffProps> = ({ rawCandidate, response }) => {
  const cfg = OUTPUT_DIFF_CONFIG[response.action] ?? OUTPUT_DIFF_CONFIG.allow;
  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
      <h3 className="text-sm font-bold text-gray-900 mb-4">
        Output Transformation
        <span className="ml-2 text-xs font-mono font-semibold text-gray-500 uppercase">
          → {response.action}
        </span>
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Raw */}
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center justify-between">
            <span>Raw Upstream Response</span>
            <span className="text-gray-400 font-mono text-[10px]">Unsanitized</span>
          </div>
          <div className="bg-gray-100 border border-gray-200 rounded-xl p-3.5 text-xs font-mono text-gray-700 whitespace-pre-wrap min-h-[90px] leading-relaxed">
            {rawCandidate || <span className="text-gray-400 italic">No candidate submitted.</span>}
          </div>
        </div>
        {/* Final */}
        <div>
          <div className="text-xs font-semibold text-gray-500 mb-2 flex items-center justify-between">
            <span>Final Delivered Response</span>
            <span className={`text-[10px] font-bold font-mono uppercase ${
              response.action === 'block' ? 'text-red-600'
              : response.action === 'inline_edit' ? 'text-blue-600'
              : response.action === 'quarantine' ? 'text-amber-600'
              : 'text-emerald-600'
            }`}>{response.action.toUpperCase()}</span>
          </div>
          <div className={`border rounded-xl p-3.5 text-xs font-mono whitespace-pre-wrap min-h-[90px] leading-relaxed ${cfg.bg} ${cfg.border} ${cfg.text}`}>
            {response.final_response || <span className="italic opacity-60">Awaiting gateway execution…</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ──────────────────────────────────────────────────────────────
   Drift Sequence Viewer
   ────────────────────────────────────────────────────────────── */
interface DriftViewerProps {
  results: DriftStepResult[];
  onClose: () => void;
}

const DriftSequenceViewer: React.FC<DriftViewerProps> = ({ results, onClose }) => (
  <div className="bg-white border-l-4 border-l-amber-400 border border-amber-200 rounded-2xl p-6 mb-6 shadow-sm">
    <div className="flex items-start justify-between mb-5">
      <div>
        <h3 className="text-base font-black text-gray-900 mb-1">
          SC-04: Zillow Compounding Valuation Drift
        </h3>
        <p className="text-sm text-gray-500">
          Stateful trend tracking catches compounding +25% drift across 5 turns ($400k baseline). Drift Score
          reaches 3.30σ at Turn 5 → escalated to Human Review Queue.
        </p>
      </div>
      <button
        onClick={onClose}
        className="shrink-0 text-xs text-gray-500 hover:text-gray-800 px-3 py-1.5 rounded-lg bg-gray-100 border border-gray-200 transition-colors"
      >
        Close
      </button>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
      {results.map((res) => {
        const isQuarantined = res.action === 'quarantine';
        const isWarn = res.action === 'inline_edit';
        return (
          <div
            key={res.step}
            className={`p-4 rounded-xl border transition-all duration-200 ${
              isQuarantined
                ? 'bg-red-50 border-red-300 ring-2 ring-red-300 shadow-lg shadow-red-100'
                : isWarn
                ? 'bg-amber-50 border-amber-300'
                : 'bg-emerald-50 border-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold text-gray-600 font-mono">Turn #{res.step}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase ${
                isQuarantined
                  ? 'bg-red-100 text-red-700 border-red-300'
                  : isWarn
                  ? 'bg-amber-100 text-amber-700 border-amber-300'
                  : 'bg-emerald-100 text-emerald-700 border-emerald-300'
              }`}>
                {isQuarantined ? '🚨 HOLD' : isWarn ? '⚠ EDIT' : '✓ ALLOW'}
              </span>
            </div>

            <div className="space-y-1.5 text-xs font-mono text-gray-600">
              <div>
                <span className="text-gray-400">Price: </span>
                <span className="font-bold text-gray-900">${res.price.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-gray-400">Drift Score: </span>
                <span className={`font-bold ${res.driftScore >= 3.0 ? 'text-red-600' : res.driftScore >= 1.5 ? 'text-amber-600' : 'text-emerald-600'}`}>
                  {res.driftScore.toFixed(2)}σ
                </span>
              </div>
              <div>
                <span className="text-gray-400">Severity: </span>
                <span className="text-gray-700">{res.severity.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-black/10 text-[10px] font-semibold">
              {isQuarantined ? (
                <span className="text-red-600">Escalated to Human Review Queue</span>
              ) : isWarn ? (
                <span className="text-amber-600">Flagged — drift anomaly noted</span>
              ) : (
                <span className="text-emerald-600">Within normal range</span>
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
  <div className="flex flex-col items-center justify-center flex-1 border-2 border-dashed border-gray-200 rounded-2xl p-16 bg-gray-50">
    <div className="w-16 h-16 rounded-2xl bg-cp-100 flex items-center justify-center mb-5">
      <svg className="w-8 h-8 text-cp-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
      </svg>
    </div>
    <h3 className="text-base font-bold text-gray-900 mb-2">Ready to Inspect</h3>
    <p className="text-sm text-gray-500 text-center max-w-xs leading-relaxed">
      Select a scenario above or configure a custom payload, then dispatch through ControlPlane.ai.
    </p>
  </div>
);

/* ──────────────────────────────────────────────────────────────
   Dashboard Page (main export) — preserves all state & API logic
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

  // Multi-turn drift simulation state for SC-04
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
        err.message || 'Gateway unreachable. Ensure the FastAPI backend is running on port 8000.'
      );
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  // Runs the 5-turn Zillow drift sequence ($410k -> $500k) with a fresh unique asset_id
  const handleRunDriftSequence = async () => {
    setIsRunningDrift(true);
    setDriftResults(null);
    setSelectedPresetId('sc04_zillow_drift');

    // Generate fresh asset ID to ensure independent replaying without sticky baseline collisions
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
      // Small pause for realistic telemetry visualization
      await new Promise((r) => setTimeout(r, 200));
    }

    setDriftResults(steps);
    setIsRunningDrift(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
      <DashboardNav />

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Scenario Selector */}
        <ScenarioSelector
          selectedPresetId={selectedPresetId}
          onSelectPreset={handleSelectPreset}
          onRunDriftSequence={handleRunDriftSequence}
          isRunningDrift={isRunningDrift}
        />

        {/* Drift Sequence Viewer */}
        {driftResults && (
          <DriftSequenceViewer
            results={driftResults}
            onClose={() => setDriftResults(null)}
          />
        )}

        {/* Error Banner */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm">
            <div className="flex items-center gap-2.5 text-sm text-red-700">
              <span className="text-base">⚠️</span>
              <span>
                <strong>Gateway Error:</strong> {errorMessage}
              </span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-sm text-red-500 hover:text-red-700 underline font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main 2-column grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left: Input Console */}
          <div className="lg:col-span-5 flex flex-col">
            <InputConsole
              request={request}
              onChange={setRequest}
              onSubmit={() => handleExecuteGuard()}
              isLoading={isLoading}
            />
          </div>

          {/* Right: Gateway Results */}
          <div className="lg:col-span-7 flex flex-col gap-0">
            {response ? (
              <>
                <ActionBanner
                  response={response}
                  totalLatencyMs={response.latency_breakdown.total_gateway_overhead_ms}
                />
                <LatencyWaterfall response={response} />
                <TierBreakdown response={response} />
                <OutputDiff rawCandidate={request.candidate_response} response={response} />
              </>
            ) : (
              <EmptyState />
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white py-5 mt-12 text-center text-xs text-gray-400">
        ControlPlane.ai Prototype · Accenture Innovation Challenge 2026 — Track 1 · Team: High Performance Athletes
      </footer>
    </div>
  );
};
