import React from 'react';

interface NavbarProps {
  onNewInvestigation: () => void;
  investigationCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewInvestigation,
  investigationCount,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white font-bold text-lg">
            <svg
              className="w-5 h-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
              />
            </svg>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-white tracking-tight">
                ReleaseOps
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                AI Investigator
              </span>
            </div>
            <p className="text-xs text-zinc-400 hidden sm:block">
              Automated CI/CD failure diagnosis with tool calling
            </p>
          </div>
        </div>

        {/* Actions & Metrics */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 text-xs text-zinc-400 px-3 py-1.5 rounded-lg bg-zinc-900 border border-zinc-800">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              <strong className="text-zinc-200">{investigationCount}</strong> saved
            </span>
          </div>

          <button
            onClick={onNewInvestigation}
            className="flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-all shadow-md shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-95 cursor-pointer"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2.5"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Investigate Run</span>
          </button>
        </div>
      </div>
    </header>
  );
};
