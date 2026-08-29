import React, { useState } from 'react';
import { GuardRequest, GuardResponse, PresetScenario, DriftStepResult } from './types';
import { PRESET_SCENARIOS, generateFreshAssetId } from './presets';
import { ScenarioSelector } from './components/ScenarioSelector';
import { InputConsole } from './components/InputConsole';
import { ActionBanner } from './components/ActionBanner';
import { LatencyWaterfall } from './components/LatencyWaterfall';
import { TierBreakdown } from './components/TierBreakdown';
import { OutputDiff } from './components/OutputDiff';
import { DriftSequenceViewer } from './components/DriftSequenceViewer';

export const App: React.FC = () => {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Top Header */}
      <header className="border-b border-slate-800/80 bg-slate-950/80 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-extrabold text-white text-base shadow-lg shadow-indigo-500/20">
              CP
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-extrabold tracking-tight text-white">
                  ControlPlane.ai
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v1.0 Prototype (Round 2)
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Real-Time Risk Detection & Governance Gateway for Multi-Use-Case Enterprise AI
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Gateway Online (:8000)</span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full">
        {/* Scenario Presets Selector */}
        <ScenarioSelector
          selectedPresetId={selectedPresetId}
          onSelectPreset={handleSelectPreset}
          onRunDriftSequence={handleRunDriftSequence}
          isRunningDrift={isRunningDrift}
        />

        {/* Multi-Turn Drift Sequence Viewer for SC-04 */}
        {driftResults && (
          <DriftSequenceViewer
            results={driftResults}
            onClose={() => setDriftResults(null)}
          />
        )}

        {/* Error State Banner */}
        {errorMessage && (
          <div className="bg-rose-950/80 border border-rose-500/50 rounded-xl p-4 mb-6 text-xs text-rose-200 flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-2">
              <span className="text-base">⚠️</span>
              <span>
                <strong>Gateway Connection Error:</strong> {errorMessage}
              </span>
            </div>
            <button
              onClick={() => setErrorMessage(null)}
              className="text-rose-300 hover:text-white underline font-mono"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Main Grid: Input Console (Left) + Gateway Telemetry (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Inspection Payload Console */}
          <div className="lg:col-span-5 flex flex-col">
            <InputConsole
              request={request}
              onChange={setRequest}
              onSubmit={() => handleExecuteGuard()}
              isLoading={isLoading}
            />
          </div>

          {/* Right Column: Gateway Inspection Telemetry */}
          <div className="lg:col-span-7 flex flex-col">
            {response ? (
              <>
                <ActionBanner
                  action={response.action}
                  decision={response.decision}
                  totalLatencyMs={response.latency_breakdown.total_gateway_overhead_ms}
                />
                <LatencyWaterfall
                  latency={response.latency_breakdown}
                  useCase={response.decision.applied_use_case as any}
                />
                <TierBreakdown
                  tier1={response.tier1_results}
                  tier2={response.tier2_results}
                  tier2Triggered={response.tier2_triggered}
                />
                <OutputDiff
                  rawCandidate={request.candidate_response}
                  finalResponse={response.final_response}
                  action={response.action}
                />
              </>
            ) : (
              <div className="bg-slate-900/60 border border-slate-800 border-dashed rounded-xl p-12 text-center text-slate-500 flex flex-col items-center justify-center flex-1">
                <span className="text-4xl mb-3">🛡️</span>
                <h3 className="text-sm font-bold text-slate-300 mb-1">
                  Awaiting Response Payload Inspection
                </h3>
                <p className="text-xs max-w-md text-slate-400">
                  Select a benchmark preset above or enter custom prompts on the left, then click{' '}
                  <strong className="text-indigo-300">Dispatch through ControlPlane.ai</strong> to
                  view real-time tier scores, latency waterwalls, and decision matrix routing.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-4 text-center text-xs text-slate-500">
        ControlPlane.ai Prototype • Accenture Innovation Challenge 2026 — Track 1 • Team: High performance Athletes
      </footer>
    </div>
  );
};
