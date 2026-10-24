import React from "react";
import Image from "next/image";

interface NavbarProps {
  onNewInvestigation?: () => void;
  investigationCount: number;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  investigationCount,
  onRefresh,
  isLoading,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#e5e7eb] bg-white/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="relative w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow-2xs bg-white border border-[#e5e7eb] p-0.5">
            <Image
              src="/safety-icon.png"
              alt="ReleaseOps Safety Logo"
              width={36}
              height={36}
              className="w-full h-full object-contain"
              priority
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-base sm:text-lg text-[#0d0d0d] tracking-tight">
                ReleaseOps
              </span>
              <span className="bg-white border border-[#e5e7eb] text-[#525252] font-mono rounded-full px-2 py-0.5 text-[11px] font-medium">
                AI Investigator
              </span>
            </div>
            <p className="text-xs text-black hidden sm:block">
              Automated CI/CD failure diagnosis with tool calling
            </p>
          </div>
        </div>

        {/* Actions & Metrics */}
        <div className="flex items-center gap-2.5">
          {/* Saved count badge */}
          <div className="flex items-center gap-2 text-xs text-[#525252] px-3 py-1.5 rounded-full bg-[#f9f9f9] border border-[#e5e7eb]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>
              <strong className="text-[#0d0d0d] font-mono">
                {investigationCount}
              </strong>{" "}
              saved
            </span>
          </div>

          {/* Refresh Action right next to saved text */}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isLoading}
              title="Refresh investigations list"
              className="flex items-center gap-1.5 text-xs font-medium text-[#262626] hover:text-[#0d0d0d] px-3.5 py-1.5 rounded-full bg-white hover:bg-[#fbfbfb] border border-[#e5e7eb] shadow-2xs transition-all disabled:opacity-50 cursor-pointer active:scale-95"
            >
              <svg
                className={`w-3.5 h-3.5 text-[#525252] ${isLoading ? "animate-spin text-[#0d0d0d]" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              <span>Refresh</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
