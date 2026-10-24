import React from 'react';

export const LoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-4 animate-pulse">
      {[1, 2, 3].map((i) => (
        <div key={i} className="p-4 rounded-xl border border-[#e5e7eb] bg-white space-y-3 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="h-4 bg-[#f0f0f0] rounded w-1/3" />
            <div className="h-5 bg-[#f0f0f0] rounded-full w-16" />
          </div>
          <div className="h-3 bg-[#f0f0f0] rounded w-3/4" />
          <div className="h-3 bg-[#f0f0f0] rounded w-1/2" />
        </div>
      ))}
    </div>
  );
};

export const DetailSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="p-6 rounded-2xl border border-[#e5e7eb] bg-white shadow-2xs space-y-4">
        <div className="h-7 bg-[#f0f0f0] rounded w-1/2" />
        <div className="h-4 bg-[#f0f0f0] rounded w-1/3" />
        <div className="h-20 bg-[#f0f0f0] rounded-xl" />
      </div>
      <div className="p-6 rounded-2xl border border-[#e5e7eb] bg-white shadow-2xs space-y-4">
        <div className="h-6 bg-[#f0f0f0] rounded w-1/4" />
        <div className="h-32 bg-[#f0f0f0] rounded-xl" />
      </div>
    </div>
  );
};

interface EmptyStateProps {
  onNewInvestigation: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onNewInvestigation }) => {
  return (
    <div className="text-center py-16 px-4 bg-[#f9f9f9] border border-dashed border-[#d4d4d4] hover:border-[#a3a3a3] rounded-2xl transition-colors">
      <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-white border border-[#e5e7eb] text-[#0d0d0d] flex items-center justify-center shadow-2xs">
        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.5"
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      </div>
      <h3 className="text-base sm:text-lg font-semibold text-[#0d0d0d] tracking-tight mb-1">No Investigations Found</h3>
      <p className="text-xs text-[#737373] max-w-md mx-auto mb-6 leading-relaxed">
        No CI/CD workflow runs have been investigated yet. Trigger an investigation for any failed GitHub Actions run to analyze root causes and generate AI fixes.
      </p>
      <button
        onClick={onNewInvestigation}
        className="inline-flex items-center gap-2 bg-[#0d0d0d] hover:bg-neutral-800 text-white text-xs sm:text-sm font-semibold px-5 py-2.5 rounded-full shadow-2xs transition-all active:scale-[0.98] cursor-pointer"
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
    <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between gap-3 shadow-2xs">
      <div className="flex items-start gap-2.5">
        <svg className="w-5 h-5 shrink-0 mt-0.5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div>
          <h4 className="text-xs sm:text-sm font-semibold text-rose-900">Connection or API Error</h4>
          <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{message}</p>
        </div>
      </div>
      {onRetry && (
        <button
          onClick={onRetry}
          className="shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg bg-white border border-rose-200 hover:bg-rose-100/60 text-rose-800 transition-colors shadow-2xs cursor-pointer"
        >
          Retry
        </button>
      )}
    </div>
  );
};
