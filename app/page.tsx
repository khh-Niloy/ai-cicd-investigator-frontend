"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Investigation,
  InvestigationStatus,
  InvestigatePayload,
} from "../types/investigation";
import { api } from "../services/api";
import { Navbar } from "../components/Navbar";
import { InvestigationCard } from "../components/InvestigationCard";
import { InvestigationDetail } from "../components/InvestigationDetail";
import { TriggerInvestigationModal } from "../components/TriggerInvestigationModal";
import {
  LoadingSkeleton,
  DetailSkeleton,
  EmptyState,
  ErrorAlert,
} from "../components/FeedbackStates";

export default function Home() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selectedInvestigation, setSelectedInvestigation] =
    useState<Investigation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Status filter (failure | success)
  const [statusFilter, setStatusFilter] =
    useState<InvestigationStatus>("failure");

  // Investigated repository & total workflow runs count
  const TARGET_OWNER = "khh-Niloy";
  const TARGET_REPO = "releaseOps-project-checker";
  const [totalWorkflows, setTotalWorkflows] = useState<number | null>(null);

  // Test workflow dispatch state
  const [dispatchingWorkflow, setDispatchingWorkflow] = useState<string | null>(
    null,
  );
  const [dispatchMessage, setDispatchMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const loadWorkflowStats = useCallback(async () => {
    try {
      const data = await api.getWorkflowRuns(TARGET_OWNER, TARGET_REPO);
      setTotalWorkflows(data.total_count ?? 0);
    } catch (err: unknown) {
      console.error("Failed to load workflow runs count:", err);
    }
  }, []);

  const handleDispatch = async (workflowId: string, workflowName: string) => {
    setDispatchingWorkflow(workflowId);
    setDispatchMessage(null);
    try {
      await api.dispatchWorkflow(
        TARGET_OWNER,
        TARGET_REPO,
        workflowId,
        "main",
      );
      setDispatchMessage({
        type: "success",
        text: `Successfully dispatched ${workflowName}! GitHub Actions workflow is now queued.`,
      });
      setTimeout(() => {
        loadWorkflowStats();
      }, 2500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : "Failed to dispatch workflow";
      setDispatchMessage({
        type: "error",
        text: `Error dispatching ${workflowName}: ${msg}`,
      });
    } finally {
      setDispatchingWorkflow(null);
    }
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getInvestigations(50, 0);
      setInvestigations(data.items || []);

      setSelectedInvestigation((prev) => {
        if (!data.items || data.items.length === 0) return null;
        if (!prev) return data.items.find((item) => item.status === "failure") || data.items[0];
        const match = data.items.find((item) => item._id === prev._id);
        return match || data.items.find((item) => item.status === "failure") || data.items[0];
      });
      setError(null);
    } catch (err: unknown) {
      console.error("Failed to load investigations:", err);
      const message =
        err instanceof Error
          ? err.message
          : "Failed to connect to backend API. Please ensure the backend server is running and MONGODB_URI is configured.";
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function initFetch() {
      try {
        const [investigationsData, workflowData] = await Promise.allSettled([
          api.getInvestigations(50, 0),
          api.getWorkflowRuns(TARGET_OWNER, TARGET_REPO),
        ]);

        if (!ignore) {
          if (investigationsData.status === "fulfilled") {
            const data = investigationsData.value;
            setInvestigations(data.items || []);
            setSelectedInvestigation((prev) => {
              if (!data.items || data.items.length === 0) return null;
              if (!prev) return data.items.find((item) => item.status === "failure") || data.items[0];
              const match = data.items.find((item) => item._id === prev._id);
              return match || data.items.find((item) => item.status === "failure") || data.items[0];
            });
            setError(null);
          } else {
            console.error(
              "Failed to load investigations:",
              investigationsData.reason,
            );
            const message =
              investigationsData.reason instanceof Error
                ? investigationsData.reason.message
                : "Failed to connect to backend API. Please ensure the backend server is running and MONGODB_URI is configured.";
            setError(message);
          }

          if (workflowData.status === "fulfilled") {
            setTotalWorkflows(workflowData.value.total_count ?? 0);
          }
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error("Failed to load initial data:", err);
        }
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    initFetch();

    return () => {
      ignore = true;
    };
  }, []);

  const handleRefresh = () => {
    loadData();
    loadWorkflowStats();
  };

  const handleSelect = (inv: Investigation) => {
    setSelectedInvestigation(inv);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this saved investigation?")) {
      return;
    }

    try {
      await api.deleteInvestigation(id);
      setInvestigations((prev) => prev.filter((item) => item._id !== id));
      if (selectedInvestigation?._id === id) {
        const remaining = investigations.filter((item) => item._id !== id);
        setSelectedInvestigation(remaining.length > 0 ? remaining[0] : null);
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      alert(`Delete failed: ${message}`);
    }
  };

  const handleTriggerInvestigation = async (payload: InvestigatePayload) => {
    setIsSubmitting(true);
    try {
      const result = await api.runInvestigation(payload);
      // Refresh list
      await loadData();
      // Select newly investigated run
      setSelectedInvestigation(result);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFilterChange = (filter: InvestigationStatus) => {
    setStatusFilter(filter);
    const matches = investigations.filter((inv) => inv.status === filter);
    if (matches.length > 0) {
      if (!selectedInvestigation || selectedInvestigation.status !== filter) {
        setSelectedInvestigation(matches[0]);
      }
    } else {
      setSelectedInvestigation(null);
    }
  };

  // Filtered investigations
  const filteredInvestigations = useMemo(() => {
    return investigations.filter((inv) => inv.status === statusFilter);
  }, [investigations, statusFilter]);

  return (
    <div className="min-h-screen bg-white text-[#171717] flex flex-col font-sans selection:bg-neutral-200 selection:text-black">
      {/* Top Navigation */}
      <Navbar
        investigationCount={investigations.length}
        onRefresh={handleRefresh}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <ErrorAlert message={error} onRetry={handleRefresh} />
          </div>
        )}

        {/* Monitored Target & Pipeline Summary Banner */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 mb-6 px-4 py-3 bg-[#f9f9f9] border border-[#e5e7eb] rounded-2xl shadow-2xs">
          {/* Left Side: Target Repository & Total Workflow Runs */}
          <div className="flex items-center gap-2 flex-wrap text-sm text-[#171717]">
            <span className="text-xs font-semibold tracking-wider text-black">
              Target Repository:
            </span>
            <a
              href="https://github.com/khh-Niloy/releaseOps-project-checker/actions"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-700 hover:underline font-medium inline-flex items-center gap-1 font-mono text-xs sm:text-sm"
            >
              <span>
                https://github.com/khh-Niloy/releaseOps-project-checker/actions
              </span>
              <svg
                className="w-3.5 h-3.5 text-blue-500 shrink-0"
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
            <span className="inline-flex items-center gap-1 text-xs font-medium text-[#525252] bg-white border border-[#e5e7eb] px-2.5 py-0.5 rounded-full shadow-2xs font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              {totalWorkflows !== null ? totalWorkflows : "..."} Workflow Runs
            </span>
          </div>

          {/* Right Side: Pipeline Stages */}
          <div className="flex items-center gap-2 text-sm text-[#171717] font-medium shrink-0 flex-wrap">
            <span className="text-xs font-semibold tracking-wider text-black">
              Pipeline Stages (3 Jobs):
            </span>
            <div className="inline-flex items-center gap-1.5 font-mono text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-white border border-[#e5e7eb] text-[#0d0d0d] font-semibold shadow-2xs">
                Build
              </span>
              <span className="text-[#8e8e8e]">→</span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-[#e5e7eb] text-[#0d0d0d] font-semibold shadow-2xs">
                Deployment
              </span>
              <span className="text-[#8e8e8e]">→</span>
              <span className="px-2.5 py-1 rounded-lg bg-white border border-[#e5e7eb] text-[#0d0d0d] font-semibold shadow-2xs">
                Discord Notification
              </span>
            </div>
          </div>
        </div>

        {/* Test Workflow Dispatch Actions (3 Buttons Equally Distributed) */}
        <div className="mb-6 space-y-2.5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Button 1: Dispatch Failure 1 */}
            <button
              onClick={() =>
                handleDispatch(
                  "mock-failure.yml",
                  "Mock Failure 1 (Deployment)",
                )
              }
              disabled={dispatchingWorkflow !== null}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-rose-50/40 border border-[#e5e7eb] hover:border-rose-300 shadow-2xs transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center shrink-0 group-hover:bg-rose-100/80 transition-colors">
                  {dispatchingWorkflow === "mock-failure.yml" ? (
                    <svg
                      className="w-4 h-4 animate-spin text-rose-600"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-rose-600"
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
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-semibold text-[#0d0d0d] group-hover:text-rose-700 transition-colors">
                      Dispatch Failure 1
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-[#525252] border border-[#e5e7eb]">
                      mock-failure.yml
                    </span>
                  </div>
                  <p className="text-[11px] text-[#737373] mt-0.5">
                    Fails on Deployment step
                  </p>
                </div>
              </div>
              <div className="shrink-0 pl-2">
                <span className="text-xs font-semibold text-rose-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  Run <span aria-hidden="true">→</span>
                </span>
              </div>
            </button>

            {/* Button 2: Dispatch Failure 2 (Discord Notifications) */}
            <button
              onClick={() =>
                handleDispatch(
                  "mock-failure-2.yml",
                  "Mock Failure 2 (Discord)",
                )
              }
              disabled={dispatchingWorkflow !== null}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-amber-50/40 border border-[#e5e7eb] hover:border-amber-300 shadow-2xs transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 group-hover:bg-amber-100/80 transition-colors">
                  {dispatchingWorkflow === "mock-failure-2.yml" ? (
                    <svg
                      className="w-4 h-4 animate-spin text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-amber-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                      />
                    </svg>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-semibold text-[#0d0d0d] group-hover:text-amber-700 transition-colors">
                      Dispatch Failure 2
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-[#525252] border border-[#e5e7eb]">
                      mock-failure-2.yml
                    </span>
                  </div>
                  <p className="text-[11px] text-[#737373] mt-0.5">
                    Fails on Discord step
                  </p>
                </div>
              </div>
              <div className="shrink-0 pl-2">
                <span className="text-xs font-semibold text-amber-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  Run <span aria-hidden="true">→</span>
                </span>
              </div>
            </button>

            {/* Button 3: Dispatch Success */}
            <button
              onClick={() => handleDispatch("mock-success.yml", "Mock Success")}
              disabled={dispatchingWorkflow !== null}
              className="flex items-center justify-between p-3.5 rounded-2xl bg-white hover:bg-emerald-50/40 border border-[#e5e7eb] hover:border-emerald-300 shadow-2xs transition-all active:scale-[0.99] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100/80 transition-colors">
                  {dispatchingWorkflow === "mock-success.yml" ? (
                    <svg
                      className="w-4 h-4 animate-spin text-emerald-600"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-4 h-4 text-emerald-600"
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
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs sm:text-sm font-semibold text-[#0d0d0d] group-hover:text-emerald-700 transition-colors">
                      Dispatch Success
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-neutral-100 text-[#525252] border border-[#e5e7eb]">
                      mock-success.yml
                    </span>
                  </div>
                  <p className="text-[11px] text-[#737373] mt-0.5">
                    All stages pass cleanly
                  </p>
                </div>
              </div>
              <div className="shrink-0 pl-2">
                <span className="text-xs font-semibold text-emerald-600 group-hover:translate-x-0.5 transition-transform inline-flex items-center gap-1">
                  Run <span aria-hidden="true">→</span>
                </span>
              </div>
            </button>
          </div>

          {/* Dispatch Feedback Alert */}
          {dispatchMessage && (
            <div
              className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 transition-all ${
                dispatchMessage.type === "success"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : "bg-rose-50 border-rose-200 text-rose-900"
              }`}
            >
              <div className="flex items-center gap-2">
                {dispatchMessage.type === "success" ? (
                  <svg
                    className="w-4 h-4 text-emerald-600 shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4 text-rose-600 shrink-0"
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
                )}
                <span>{dispatchMessage.text}</span>
              </div>
              <button
                onClick={() => setDispatchMessage(null)}
                className="text-[#737373] hover:text-[#0d0d0d] cursor-pointer"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Content Section: 2 Column Layout */}
        {isLoading && investigations.length === 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5">
              <LoadingSkeleton />
            </div>
            <div className="lg:col-span-7">
              <DetailSkeleton />
            </div>
          </div>
        ) : investigations.length === 0 ? (
          <EmptyState onNewInvestigation={() => setIsModalOpen(true)} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left Column: Investigation Runs List */}
            <div className="lg:col-span-5 space-y-3">
              <div className="flex items-center justify-between text-xs text-[#737373] font-medium px-1 flex-wrap gap-2">
                <span>
                  Showing {filteredInvestigations.length} of{" "}
                  {investigations.length} runs
                </span>
                <div className="flex items-center gap-1 bg-[#f4f4f4] p-0.5 rounded-full border border-[#e5e7eb]">
                  {(['failure', 'success'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => handleFilterChange(filter)}
                      className={`text-[11px] px-2.5 py-0.5 rounded-full capitalize transition-all cursor-pointer ${
                        statusFilter === filter
                          ? "bg-white text-[#0d0d0d] shadow-2xs font-semibold"
                          : "text-[#737373] hover:text-[#0d0d0d]"
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {filteredInvestigations.length === 0 ? (
                <div className="p-8 text-center bg-[#f9f9f9] border border-dashed border-[#d4d4d4] rounded-xl text-[#737373] text-xs">
                  No investigations match your filter criteria.
                </div>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-230px)] overflow-y-auto pr-1">
                  {filteredInvestigations.map((inv) => (
                    <InvestigationCard
                      key={inv._id}
                      investigation={inv}
                      isSelected={selectedInvestigation?._id === inv._id}
                      onSelect={handleSelect}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Right Column: Detailed Drilldown */}
            <div className="lg:col-span-7 sticky top-22">
              {selectedInvestigation ? (
                <InvestigationDetail investigation={selectedInvestigation} />
              ) : (
                <div className="p-12 text-center bg-[#f9f9f9] border border-dashed border-[#d4d4d4] rounded-2xl text-[#737373]">
                  <p className="text-xs text-[#737373]">
                    Select an investigation on the left to view root causes and
                    suggested fixes.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Subtle Footer Attribution */}
      <footer className="mt-auto border-t border-[#e5e7eb] py-4 px-4 sm:px-6 lg:px-8 text-center text-[11px] text-[#8e8e8e]">
        <span>ReleaseOps AI Investigator · </span>
        <a
          href="https://icons8.com/icon/vjOiS3RlnWyd/protect"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#525252] hover:text-[#0d0d0d] hover:underline"
        >
          Safety
        </a>{" "}
        icon by{" "}
        <a
          href="https://icons8.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#525252] hover:text-[#0d0d0d] hover:underline"
        >
          Icons8
        </a>
      </footer>

      {/* Modal for Triggering Live Investigation */}
      <TriggerInvestigationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleTriggerInvestigation}
        isLoading={isSubmitting}
      />
    </div>
  );
}
