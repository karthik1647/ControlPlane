import React from 'react';
import { PRESET_SCENARIOS } from '../presets';
import { PresetScenario } from '../types';

interface Props {
  selectedPresetId: string | null;
  onSelectPreset: (preset: PresetScenario) => void;
  onRunDriftSequence: () => void;
  isRunningDrift: boolean;
}

export const ScenarioSelector: React.FC<Props> = ({
  selectedPresetId,
  onSelectPreset,
  onRunDriftSequence,
  isRunningDrift,
}) => {
  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-4 mb-6 shadow-xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">
            Enterprise Scenario Presets (Hackathon Benchmarks)
          </h2>
          <p className="text-xs text-slate-400">
            Click any preset to load real-world failure mode or run the compounding drift sequence
          </p>
        </div>
        <button
          onClick={onRunDriftSequence}
          disabled={isRunningDrift}
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 font-bold transition shadow-md disabled:opacity-50"
        >
          {isRunningDrift ? (
            <>
              <span className="w-3 h-3 border-2 border-slate-950 border-t-transparent rounded-full animate-spin"></span>
              Simulating 5 Turns...
            </>
          ) : (
            <>⚡ Simulate SC-04 5-Turn Drift Sequence</>
          )}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
        {PRESET_SCENARIOS.map((preset) => {
          const isSelected = selectedPresetId === preset.id;
          return (
            <button
              key={preset.id}
              onClick={() => onSelectPreset(preset)}
              className={`text-left p-3 rounded-lg border transition duration-150 flex flex-col justify-between ${
                isSelected
                  ? 'bg-slate-800 border-indigo-500 ring-1 ring-indigo-500/50 shadow-indigo-500/10'
                  : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
              }`}
            >
              <div>
                <span
                  className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded border uppercase mb-1.5 ${preset.badgeColor}`}
                >
                  {preset.tag}
                </span>
                <div className="text-xs font-semibold text-slate-200 line-clamp-1">
                  {preset.title.split(':')[0]}
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-2 mt-0.5">
                  {preset.title.split(':')[1] || preset.description}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
