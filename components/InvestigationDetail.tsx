import React, { useState, useMemo } from "react";
import { Investigation } from "../types/investigation";
import { StatusBadge } from "./StatusBadge";

interface InvestigationDetailProps {
  investigation: Investigation;
}

const DEFAULT_STAGES = ["Build", "Deployment", "Discord Notification"];

export const InvestigationDetail: React.FC<InvestigationDetailProps> = ({
  investigation,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Just now";
    try {
      return new Date(dateString).toLocaleString("en-US", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch {
      return dateString;
    }
  };

  const githubRunUrl = `https://github.com/${investigation.owner}/${investigation.repo}/actions/runs/${investigation.runId}`;

  // Compute pipeline stage status to highlight affected/failed jobs
  const pipelineStagesWithStatus = useMemo(() => {
    const failedList = investigation.failedJobs || [];
    const failedNames = failedList.map((j) => (j.jobName || "").toLowerCase());

    let firstFailedIndex = -1;
    DEFAULT_STAGES.forEach((stage, idx) => {
      if (
        firstFailedIndex === -1 &&
        failedNames.some(
          (fn) =>
            fn.includes(stage.toLowerCase()) ||
            stage.toLowerCase().includes(fn),
        )
      ) {
        firstFailedIndex = idx;
      }
    });

    const stages: Array<{
      name: string;
      status: "passed" | "failed" | "skipped" | "neutral";
    }> = DEFAULT_STAGES.map((stage, idx) => {
      const isFailed = failedNames.some(
        (fn) =>
          fn.includes(stage.toLowerCase()) || stage.toLowerCase().includes(fn),
      );

      if (isFailed) {
        return { name: stage, status: "failed" };
      }

      if (firstFailedIndex !== -1) {
        if (idx < firstFailedIndex) {
          return { name: stage, status: "passed" };
        }
        return { name: stage, status: "skipped" };
      }

      if (investigation.status === "success") {
        return { name: stage, status: "passed" };
      }

      return { name: stage, status: "neutral" };
    });

    // Append any extra failed job names not matching DEFAULT_STAGES
    failedList.forEach((fj) => {
      if (!fj.jobName) return;
      const alreadyIncluded = stages.some(
        (s) =>
          s.name.toLowerCase().includes(fj.jobName.toLowerCase()) ||
          fj.jobName.toLowerCase().includes(s.name.toLowerCase()),
      );
      if (!alreadyIncluded) {
        stages.push({ name: fj.jobName, status: "failed" });
      }
    });

    return stages;
  }, [investigation]);

  return (
    <div className="space-y-6">
      {/* Detail Header Banner */}
      <div className="bg-white border border-[#e5e7eb] rounded-2xl p-6 shadow-2xs relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e5e7eb]">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xl sm:text-2xl font-semibold text-[#0d0d0d] tracking-tight">
                {investigation.owner}/{investigation.repo}
              </span>
              <StatusBadge status={investigation.status} size="lg" />
            </div>
            <div className="flex items-center gap-2 text-xs text-[#737373] font-mono mt-1.5 flex-wrap">
              <span>Workflow Run #{investigation.runId}</span>
              <span>•</span>
              <span>Investigated on {formatDate(investigation.createdAt)}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={githubRunUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-xl bg-[#1f883d] hover:bg-[#1a7f37] active:bg-[#187432] active:scale-[0.98] text-white border border-[#1b7c35] shadow-2xs hover:shadow-sm transition-all cursor-pointer group"
            >
              <svg
                className="w-4 h-4 text-white fill-current shrink-0"
                viewBox="0 0 24 24"
              >
                <path
                  fillRule="evenodd"
                  clipRule="evenodd"
                  d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"
                />
              </svg>
              <span>View Run on GitHub</span>
              <svg
                className="w-3.5 h-3.5 text-white/80 group-hover:text-white transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>

        {/* High-level Summary Card */}
        <div className="mt-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#525252]">
              Executive AI Summary
            </span>
          </div>
          <p className="text-xs text-[#171717] leading-relaxed bg-[#f9f9f9] p-4 rounded-xl border border-[#e5e7eb] font-sans">
            {investigation.summary}
          </p>
        </div>

        {/* Persistence alert if any */}
        {investigation._persistenceError && (
          <div className="mt-3 text-xs bg-amber-50 border border-amber-200 text-amber-800 p-3 rounded-xl flex items-center gap-2">
            <svg
              className="w-4 h-4 shrink-0 text-amber-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{investigation._persistenceError}</span>
          </div>
        )}
      </div>

      {/* Failure Breakdown & Suggested Fixes Section */}
      <div>
        {/* Pipeline Execution Flow Banner - Highlighting Affected Jobs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 p-3.5 bg-[#f9f9f9] border border-[#e5e7eb] rounded-2xl shadow-2xs">
          <div className="inline-flex items-center gap-1.5 font-mono text-xs flex-wrap">
            {pipelineStagesWithStatus.map((stage, idx) => (
              <React.Fragment key={stage.name}>
                {idx > 0 && <span className="text-[#8e8e8e]">→</span>}
                {stage.status === "failed" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-300 text-rose-700 font-bold shadow-2xs ring-1 ring-rose-400/30">
                    <svg
                      className="w-3.5 h-3.5 text-rose-600 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                    <span>{stage.name}</span>
                    <span className="text-[10px] uppercase tracking-wider bg-rose-200/80 text-rose-800 px-1 py-0.5 rounded font-semibold">
                      Affected
                    </span>
                  </span>
                ) : stage.status === "passed" ? (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 font-semibold shadow-2xs">
                    <svg
                      className="w-3.5 h-3.5 text-emerald-600 shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span>{stage.name}</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white border border-dashed border-[#d4d4d4] text-[#8e8e8e] font-normal shadow-2xs">
                    <span>{stage.name}</span>
                    <span className="text-[10px] text-[#a3a3a3] font-mono">
                      (skipped)
                    </span>
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base sm:text-lg font-semibold text-[#0d0d0d] tracking-tight flex items-center gap-2">
            <span>Diagnosed Jobs</span>
            <span className="bg-white border border-[#e5e7eb] text-[#525252] font-mono rounded-full px-2 py-0.5 text-[11px]">
              {investigation.failedJobs?.length || 0}
            </span>
          </h3>
        </div>

        {investigation.failedJobs && investigation.failedJobs.length > 0 ? (
          <div className="space-y-6">
            {investigation.failedJobs.map((job, idx) => {
              const evidenceCopyKey = `evidence-${idx}`;
              const fixCopyKey = `fix-${idx}`;

              return (
                <div
                  key={job.jobId || idx}
                  className="bg-white border border-[#e5e7eb] rounded-2xl p-5 sm:p-6 shadow-2xs transition-all hover:border-[#d4d4d4]"
                >
                  {/* Job Header */}
                  <div className="flex items-center justify-between gap-3 pb-4 mb-4 border-b border-[#e5e7eb]">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-[#f4f4f4] text-[#0d0d0d] border border-[#e5e7eb] flex items-center justify-center font-semibold text-xs">
                        {idx + 1}
                      </div>
                      <div>
                        <h4 className="text-sm sm:text-base font-semibold text-[#0d0d0d] flex items-center gap-2">
                          <span>{job.jobName || "Unnamed Job"}</span>
                          {job.jobId && (
                            <span className="text-[11px] font-mono font-normal text-[#525252] bg-[#f4f4f4] border border-[#e5e7eb] px-2 py-0.5 rounded-md">
                              ID: {job.jobId}
                            </span>
                          )}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-5">
                    {/* Root Cause Card */}
                    <div className="bg-rose-50/60 border border-rose-200/80 rounded-xl p-4">
                      <div className="flex items-center gap-2 text-rose-700 font-semibold text-[11px] uppercase tracking-wider mb-2">
                        <svg
                          className="w-4 h-4 shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>Root Cause Analysis</span>
                      </div>
                      <p className="text-xs text-[#171717] leading-relaxed font-sans">
                        {job.rootCause}
                      </p>
                    </div>

                    {/* Evidence & Logs */}
                    {job.evidence && (
                      <div className="bg-[#f9f9f9] rounded-xl border border-[#e5e7eb] overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-2 bg-[#f4f4f4] border-b border-[#e5e7eb] text-[11px] text-[#525252]">
                          <span className="font-mono font-medium flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                            Log Evidence / Error Trace
                          </span>
                          <button
                            onClick={() =>
                              copyToClipboard(job.evidence, evidenceCopyKey)
                            }
                            className="flex items-center gap-1 text-[11px] text-[#525252] hover:text-[#0d0d0d] transition-colors cursor-pointer"
                          >
                            <svg
                              className="w-3.5 h-3.5"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                              />
                            </svg>
                            <span>
                              {copiedKey === evidenceCopyKey
                                ? "Copied!"
                                : "Copy"}
                            </span>
                          </button>
                        </div>
                        <pre className="p-4 text-[11px] font-mono text-[#171717] bg-[#f9f9f9] overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                          {job.evidence}
                        </pre>
                      </div>
                    )}

                    {/* AI-Suggested Fix */}
                    <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-4">
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5 text-emerald-800 font-semibold text-[11px] uppercase tracking-wider">
                          <svg
                            className="w-4 h-4 shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                          <span>AI-Suggested Fix</span>
                        </div>
                        <button
                          onClick={() =>
                            copyToClipboard(job.recommendedFix, fixCopyKey)
                          }
                          className="flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:text-emerald-900 transition-colors cursor-pointer"
                        >
                          <svg
                            className="w-3.5 h-3.5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                          <span>
                            {copiedKey === fixCopyKey ? "Copied!" : "Copy Fix"}
                          </span>
                        </button>
                      </div>
                      <div className="text-xs text-[#171717] leading-relaxed whitespace-pre-wrap font-sans">
                        {job.recommendedFix}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#f9f9f9] border border-[#e5e7eb] rounded-2xl p-8 text-center text-[#737373]">
            <svg
              className="w-10 h-10 mx-auto mb-2 text-[#8e8e8e]"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-xs sm:text-sm font-semibold text-[#0d0d0d]">
              No failed jobs recorded
            </p>
            <p className="text-xs text-[#737373] mt-1">
              This workflow run appears to have completed cleanly without job
              failures.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
