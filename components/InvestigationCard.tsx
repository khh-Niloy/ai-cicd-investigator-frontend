import React from 'react';
import { Investigation } from '../types/investigation';
import { StatusBadge } from './StatusBadge';

interface InvestigationCardProps {
  investigation: Investigation;
  isSelected: boolean;
  onSelect: (investigation: Investigation) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
}

export const InvestigationCard: React.FC<InvestigationCardProps> = ({
  investigation,
  isSelected,
  onSelect,
  onDelete,
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Just now';
    try {
      const date = new Date(dateString);
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(date);
    } catch {
      return dateString;
    }
  };

  const failedJobsCount = investigation.failedJobs?.length || 0;

  return (
    <div
      onClick={() => onSelect(investigation)}
      className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'bg-zinc-900 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50'
          : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700 hover:bg-zinc-900'
      }`}
    >
      {/* Top Header: Repo, Run ID, Status */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 text-xs font-mono text-zinc-400 truncate">
            <svg
              className="w-3.5 h-3.5 shrink-0 text-zinc-500"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
              />
            </svg>
            <span className="font-semibold text-zinc-200 truncate">
              {investigation.owner}/{investigation.repo}
            </span>
          </div>
          <div className="text-xs text-zinc-400 font-mono mt-0.5">
            Run #{investigation.runId}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <StatusBadge status={investigation.status} size="sm" />
          <button
            onClick={(e) => onDelete(investigation._id, e)}
            title="Delete investigation"
            className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded transition-all cursor-pointer"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Summary preview */}
      <p className="text-xs text-zinc-400 line-clamp-2 mb-3 leading-relaxed">
        {investigation.summary}
      </p>

      {/* Footer stats */}
      <div className="flex items-center justify-between text-[11px] text-zinc-400 pt-2 border-t border-zinc-800/80">
        <span className="flex items-center gap-1 text-zinc-400 font-medium">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              failedJobsCount > 0 ? 'bg-rose-400' : 'bg-emerald-400'
            }`}
          />
          {failedJobsCount} {failedJobsCount === 1 ? 'failed job' : 'failed jobs'} diagnosed
        </span>
        <span className="text-zinc-400 font-mono">
          {formatDate(investigation.createdAt)}
        </span>
      </div>
    </div>
  );
};
