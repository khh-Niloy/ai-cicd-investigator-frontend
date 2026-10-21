import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-xl border border-zinc-800 bg-zinc-900/40 space-y-3">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-zinc-800 rounded w-1/3" />
            <div className="h-5 bg-zinc-800 rounded-full w-16" />
          </div>
          <div className="h-3 bg-zinc-800/80 rounded w-3/4" />
          <div className="h-3 bg-zinc-800/60 rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
        <div className="h-7 bg-zinc-800 rounded w-1/2" />
        <div className="h-4 bg-zinc-800/60 rounded w-1/3" />
        <div className="h-20 bg-zinc-800/40 rounded-xl" />
      </div>
      <div className="p-6 rounded-2xl border border-zinc-800 bg-zinc-900/40 space-y-4">
        <div className="h-6 bg-zinc-800 rounded w-1/4" />
        <div className="h-32 bg-zinc-800/30 rounded-xl" />
      </div>
    </div>
  );
};

interface EmptyStateProps {
  onNewInvestigation: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onNewInvestigation }) => {
  return (
    <div className="text-center py-16 px-4 bg-zinc-900/30 border border-zinc-800/80 rounded-2xl">
      <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center">
        <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      </div>
      <h3 className="text-lg font-bold text-white mb-1">No Investigations Found</h3>
      <p className="text-sm text-zinc-400 max-w-md mx-auto mb-6">
        No CI/CD workflow runs have been investigated yet. Trigger an investigation for any failed GitHub Actions run to analyze root causes and generate AI fixes.
      </p>
      <button
        onClick={onNewInvestigation}
        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-sm font-medium px-5 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20 active:scale-95 cursor-pointer"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
        </svg>
        <span>Investigate Your First Workflow</span>
      </button>
    </div>
  );
};

interface ErrorAlertProps {
  message: string;
  onRetry?: () => void;
}

export const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, onRetry }) => {
  return (
    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 flex items-start justify-between gap-3">
      <div className="flex items-start gap-2.5">
        <svg className="w-5 h-5 shrink-0 mt-0.5 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 className="text-sm font-semibold text-rose-300">Connection or API Error</h4>
          <p className="text-xs text-rose-400/90 mt-0.5">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-200 transition-colors cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
};
