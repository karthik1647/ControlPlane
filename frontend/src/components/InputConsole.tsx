import React from 'react';
import { GuardRequest, UseCase } from '../types';

interface Props {
  request: GuardRequest;
  onChange: (updated: GuardRequest) => void;
  onSubmit: () => void;
  isLoading: boolean;
}

export const InputConsole: React.FC<Props> = ({ request, onChange, onSubmit, isLoading }) => {
  return (
    <div className="bg-slate-900/90 backdrop-blur border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col h-full">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
        <div>
          <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-pulse"></span>
            Inspection Payload Console
          </h2>
          <p className="text-xs text-slate-400">Configure prompt, context documents, and upstream model response</p>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-slate-400">Use Case:</label>
          <select
            value={request.use_case}
            onChange={(e) => onChange({ ...request, use_case: e.target.value as UseCase })}
            className="bg-slate-950 border border-slate-700 text-xs font-semibold text-indigo-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
          >
            <option value="customer_support">Customer Support (&lt;150ms)</option>
            <option value="internal_copilot">Internal Copilot (&lt;500ms)</option>
            <option value="decision_agent">Decision Agent (&lt;1.5s)</option>
          </select>
        </div>
      </div>

      <div className="space-y-4 flex-1">
        {/* User Prompt */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            User Prompt
          </label>
          <textarea
            rows={2}
            value={request.prompt}
            onChange={(e) => onChange({ ...request, prompt: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500 transition resize-none"
            placeholder="Enter user query..."
          />
        </div>

        {/* Context Documents */}
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-xs font-semibold text-slate-300">
              Ground Truth / RAG Context Documents (Tier 2)
            </label>
            <span className="text-[11px] text-slate-500">
              {request.context_documents.length > 0 ? 'Tier 2 Active' : 'Tier 2 Skipped (0ms)'}
            </span>
          </div>
          <textarea
            rows={3}
            value={request.context_documents.join('\n\n')}
            onChange={(e) =>
              onChange({
                ...request,
                context_documents: e.target.value.trim() ? [e.target.value.trim()] : [],
              })
            }
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-300 font-mono focus:outline-none focus:border-indigo-500 transition resize-none"
            placeholder="Paste authoritative policy document or grounding snippet..."
          />
        </div>

        {/* Candidate Response */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1">
            Candidate Response (Upstream Model Output)
          </label>
          <textarea
            rows={3}
            value={request.candidate_response}
            onChange={(e) => onChange({ ...request, candidate_response: e.target.value })}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-indigo-100 font-mono focus:outline-none focus:border-indigo-500 transition resize-none"
            placeholder="Enter raw generated response to inspect..."
          />
        </div>

        {/* Metadata & Token Count */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <div>
            <label className="block text-[11px] font-semibold text-slate-400 mb-1">
              Token Count / Consumption
            </label>
            <input
              type="number"
              value={request.token_count}
              onChange={(e) => onChange({ ...request, token_count: parseInt(e.target.value) || 0 })}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
            />
          </div>
          {request.use_case === 'decision_agent' && (
            <div>
              <label className="block text-[11px] font-semibold text-slate-400 mb-1">
                Asset Valuation Amount ($)
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
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono focus:outline-none focus:border-indigo-500"
              />
            </div>
          )}
        </div>
      </div>

      <div className="pt-5 mt-auto">
        <button
          onClick={onSubmit}
          disabled={isLoading}
          className="w-full py-3 px-4 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {isLoading ? (
            <>
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
              Inspecting via ControlPlane.ai...
            </>
          ) : (
            <>🛡️ Dispatch through ControlPlane.ai Gateway</>
          )}
        </button>
      </div>
    </div>
  );
};
