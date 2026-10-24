import React, { useState } from 'react';
import { InvestigatePayload } from '../types/investigation';

interface TriggerInvestigationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payload: InvestigatePayload) => Promise<void>;
  isLoading: boolean;
}

export const TriggerInvestigationModal: React.FC<TriggerInvestigationModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
}) => {
  const [owner, setOwner] = useState('');
  const [repo, setRepo] = useState('');
  const [runId, setRunId] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!owner.trim() || !repo.trim() || !runId.trim()) {
      setErrorMessage('Please provide Owner, Repository, and Run ID.');
      return;
    }

    setErrorMessage(null);
    try {
      await onSubmit({
        owner: owner.trim(),
        repo: repo.trim(),
        run_id: runId.trim(),
      });
      // Reset fields on success
      setOwner('');
      setRepo('');
      setRunId('');
      onClose();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Investigation failed. Check backend logs.';
      setErrorMessage(msg);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white border border-[#e5e7eb] rounded-2xl w-full max-w-lg shadow-xl overflow-hidden">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#e5e7eb] flex items-center justify-between bg-white">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-[#0d0d0d] text-white flex items-center justify-center shrink-0">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-semibold text-[#0d0d0d] tracking-tight">Investigate Workflow Run</h3>
              <p className="text-xs text-[#737373]">Trigger Gemini AI tool calling investigation</p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-[#737373] hover:text-[#0d0d0d] p-1.5 rounded-lg hover:bg-[#f4f4f4] transition-colors disabled:opacity-50 cursor-pointer"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {errorMessage && (
            <div className="p-3 text-xs bg-rose-50 border border-rose-200 text-rose-700 rounded-xl flex items-start gap-2">
              <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#0d0d0d]">
              GitHub Owner / Organization <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="e.g., vercel or octocat"
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full bg-[#f4f4f4] border border-[#e5e7eb] rounded-xl px-3.5 py-2.5 text-xs text-[#0d0d0d] placeholder-[#8e8e8e] focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-400/15 transition-all font-mono shadow-2xs disabled:bg-[#e5e5e5] disabled:text-[#a3a3a3] disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#0d0d0d]">
              Repository Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="e.g., next.js or my-service"
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="w-full bg-[#f4f4f4] border border-[#e5e7eb] rounded-xl px-3.5 py-2.5 text-xs text-[#0d0d0d] placeholder-[#8e8e8e] focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-400/15 transition-all font-mono shadow-2xs disabled:bg-[#e5e5e5] disabled:text-[#a3a3a3] disabled:cursor-not-allowed"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-[#0d0d0d]">
              Workflow Run ID <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              disabled={isLoading}
              placeholder="e.g., 1428571428"
              value={runId}
              onChange={(e) => setRunId(e.target.value)}
              className="w-full bg-[#f4f4f4] border border-[#e5e7eb] rounded-xl px-3.5 py-2.5 text-xs text-[#0d0d0d] placeholder-[#8e8e8e] focus:outline-none focus:border-blue-400 focus:bg-white focus:ring-2 focus:ring-blue-400/15 transition-all font-mono shadow-2xs disabled:bg-[#e5e5e5] disabled:text-[#a3a3a3] disabled:cursor-not-allowed"
            />
            <p className="text-[11px] text-[#737373]">
              Found in the GitHub Actions workflow run URL: actions/runs/[run_id]
            </p>
          </div>

          {isLoading && (
            <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-xl text-center space-y-1.5">
              <div className="inline-flex items-center gap-2 text-blue-900 text-xs font-semibold">
                <svg className="w-4 h-4 animate-spin text-blue-600" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>ReleaseOps AI is investigating...</span>
              </div>
              <p className="text-[11px] text-[#525252]">
                Executing GitHub API tools, reading workflow logs, and diagnosing root causes with Gemini.
              </p>
            </div>
          )}

          {/* Modal Footer */}
          <div className="pt-3 border-t border-[#e5e7eb] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="bg-white border border-[#e5e7eb] hover:bg-[#fbfbfb] text-[#262626] rounded-xl shadow-2xs px-4 py-2 text-xs font-medium transition-all cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-semibold bg-[#0d0d0d] hover:bg-neutral-800 text-white shadow-2xs transition-all active:scale-[0.98] disabled:bg-[#e5e5e5] disabled:text-[#a3a3a3] disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <>
                  <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  <span>Investigating...</span>
                </>
              ) : (
                <>
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                  <span>Start Investigation</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
