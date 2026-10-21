import React from 'react';
import { InvestigationStatus } from '../types/investigation';

interface StatusBadgeProps {
  status: InvestigationStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5 font-medium',
    lg: 'text-sm px-3.5 py-1.5 gap-2 font-medium',
  };

  switch (status) {
    case 'failure':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-rose-500/10 text-rose-400 border border-rose-500/20 ${sizeClasses[size]}`}
        >
          <svg
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span>Failed</span>
        </span>
      );
    case 'success':
      return (
        <span
          className={`inline-flex items-center rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 ${sizeClasses[size]}`}
        >
          <svg
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
          <span>Success</span>
        </span>
      );
    case 'unknown':
    default:
      return (
        <span
          className={`inline-flex items-center rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 ${sizeClasses[size]}`}
        >
          <svg
            className="w-3.5 h-3.5 shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2.5"
          >
            <circle cx="12" cy="12" r="9" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01" />
          </svg>
          <span>Unknown</span>
        </span>
      );
  }
};
