'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Investigation, InvestigationStatus, InvestigatePayload } from '../types/investigation';
import { api } from '../services/api';
import { Navbar } from '../components/Navbar';
import { InvestigationCard } from '../components/InvestigationCard';
import { InvestigationDetail } from '../components/InvestigationDetail';
import { TriggerInvestigationModal } from '../components/TriggerInvestigationModal';
import { LoadingSkeleton, DetailSkeleton, EmptyState, ErrorAlert } from '../components/FeedbackStates';

export default function Home() {
  const [investigations, setInvestigations] = useState<Investigation[]>([]);
  const [selectedInvestigation, setSelectedInvestigation] = useState<Investigation | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Filters & search
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | InvestigationStatus>('all');

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await api.getInvestigations(50, 0);
      setInvestigations(data.items || []);

      setSelectedInvestigation((prev) => {
        if (!data.items || data.items.length === 0) return null;
        if (!prev) return data.items[0];
        const match = data.items.find((item) => item._id === prev._id);
        return match || data.items[0];
      });
      setError(null);
    } catch (err: unknown) {
      console.error('Failed to load investigations:', err);
      const message =
        err instanceof Error
          ? err.message
          : 'Failed to connect to backend API. Please ensure the backend server is running and MONGODB_URI is configured.';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let ignore = false;

    async function initFetch() {
      try {
        const data = await api.getInvestigations(50, 0);
        if (!ignore) {
          setInvestigations(data.items || []);
          setSelectedInvestigation((prev) => {
            if (!data.items || data.items.length === 0) return null;
            if (!prev) return data.items[0];
            const match = data.items.find((item) => item._id === prev._id);
            return match || data.items[0];
          });
          setError(null);
        }
      } catch (err: unknown) {
        if (!ignore) {
          console.error('Failed to load investigations:', err);
          const message =
            err instanceof Error
              ? err.message
              : 'Failed to connect to backend API. Please ensure the backend server is running and MONGODB_URI is configured.';
          setError(message);
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
  };

  const handleSelect = (inv: Investigation) => {
    setSelectedInvestigation(inv);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm('Are you sure you want to delete this saved investigation?')) {
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
      const message = err instanceof Error ? err.message : 'Unknown error';
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

  // Filtered investigations
  const filteredInvestigations = useMemo(() => {
    return investigations.filter((inv) => {
      const matchesSearch =
        searchQuery.trim() === '' ||
        inv.owner.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.repo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.runId.includes(searchQuery) ||
        inv.summary.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === 'all' || inv.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [investigations, searchQuery, statusFilter]);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex flex-col font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Top Navigation */}
      <Navbar
        onNewInvestigation={() => setIsModalOpen(true)}
        investigationCount={investigations.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Error Alert */}
        {error && (
          <div className="mb-6">
            <ErrorAlert message={error} onRetry={handleRefresh} />
          </div>
        )}

        {/* Dashboard Controls: Search, Filters, Refresh */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 mb-6 bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-2xl">
          {/* Search Bar */}
          <div className="relative flex-1">
            <svg
              className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              placeholder="Search by repo, run ID, or keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/80 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
            />
          </div>

          {/* Status Filter Buttons */}
          <div className="flex items-center gap-1 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
            {(['all', 'failure', 'success', 'unknown'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => setStatusFilter(filter)}
                className={`text-xs font-medium px-3 py-1.5 rounded-lg capitalize transition-all cursor-pointer ${
                  statusFilter === filter
                    ? 'bg-zinc-800 text-white shadow-sm'
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>

          {/* Refresh Action */}
          <button
            onClick={handleRefresh}
            disabled={isLoading}
            title="Refresh list"
            className="flex items-center justify-center gap-1.5 text-xs text-zinc-300 hover:text-white px-3 py-2 rounded-xl bg-zinc-950 hover:bg-zinc-800 border border-zinc-800 transition-all disabled:opacity-50 cursor-pointer"
          >
            <svg
              className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-emerald-400' : ''}`}
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
            <span className="hidden sm:inline">Refresh</span>
          </button>
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
              <div className="flex items-center justify-between text-xs text-zinc-400 font-medium px-1">
                <span>
                  Showing {filteredInvestigations.length} of {investigations.length} runs
                </span>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-emerald-400 hover:underline cursor-pointer"
                  >
                    Clear search
                  </button>
                )}
              </div>

              {filteredInvestigations.length === 0 ? (
                <div className="p-8 text-center bg-zinc-900/40 border border-zinc-800 rounded-xl text-zinc-400 text-xs">
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
                <div className="p-12 text-center bg-zinc-900/30 border border-zinc-800 rounded-2xl text-zinc-400">
                  <p className="text-sm">Select an investigation on the left to view root causes and suggested fixes.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

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
