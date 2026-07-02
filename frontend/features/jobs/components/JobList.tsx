"use client";

import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { JobWithCompany } from "../job.types";
import { useJobs } from "../hooks/useJobs";
import { JobCard } from "./JobCard";
import { JobSkeleton } from "./JobSkeleton";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/Button";

interface JobListProps {
  onEdit?: (job: JobWithCompany) => void;
  onDelete?: (job: JobWithCompany) => void;
  onCreateClick?: () => void;
}

export function JobList({ onEdit, onDelete, onCreateClick }: JobListProps) {
  // Filter States
  const [search, setSearch] = useState<string>("");
  const [status, setStatus] = useState<string>("all");
  const [priority, setPriority] = useState<string>("all");
  const [workMode, setWorkMode] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const pageSize = 6;

  // Debounced search query
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on search change
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Construct filters payload
  const filters = {
    page,
    pageSize: pageSize + 1, // Fetch one extra element to check next page existence
    search: debouncedSearch.trim() || undefined,
    status: status !== "all" ? (status as any) : undefined,
    priority: priority !== "all" ? (priority as any) : undefined,
    work_mode: workMode !== "all" ? (workMode as any) : undefined,
  };

  // Consume TanStack queries
  const { jobs: results, isLoading, isError, error, refetch } = useJobs(filters);

  const hasMore = results.length > pageSize;
  const jobs = hasMore ? results.slice(0, pageSize) : results;

  const handleFilterChange = (setter: React.Dispatch<React.SetStateAction<string>>) => {
    return (e: React.ChangeEvent<HTMLSelectElement>) => {
      setter(e.target.value);
      setPage(1); // Reset to page 1 on filter changes
    };
  };

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="flex flex-col xl:flex-row items-stretch xl:items-center gap-4 justify-between border-b border-zinc-100 dark:border-zinc-900 pb-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 w-full xl:w-auto">
          {/* Search Box */}
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search jobs by title..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 font-sans text-xs placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            />
          </div>

          {/* Status Filter */}
          <div className="relative w-full">
            <select
              value={status}
              onChange={handleFilterChange(setStatus)}
              className="w-full pl-3 pr-8 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 font-mono text-xs text-zinc-600 dark:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors cursor-pointer appearance-none"
            >
              <option value="all">ALL STATUSES</option>
              <option value="wishlist">WISHLIST</option>
              <option value="applied">APPLIED</option>
              <option value="oa">ONLINE ASSESSMENT (OA)</option>
              <option value="interview">INTERVIEW</option>
              <option value="hr">HR ROUND</option>
              <option value="offer">OFFER EXTENDED</option>
              <option value="accepted">ACCEPTED</option>
              <option value="rejected">REJECTED</option>
              <option value="withdrawn">WITHDRAWN</option>
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>

          {/* Priority Filter */}
          <div className="relative w-full">
            <select
              value={priority}
              onChange={handleFilterChange(setPriority)}
              className="w-full pl-3 pr-8 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 font-mono text-xs text-zinc-600 dark:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors cursor-pointer appearance-none"
            >
              <option value="all">ALL PRIORITIES</option>
              <option value="low">LOW PRIORITY</option>
              <option value="medium">MEDIUM PRIORITY</option>
              <option value="high">HIGH PRIORITY</option>
              <option value="critical">CRITICAL PRIORITY</option>
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>

          {/* Work Mode Filter */}
          <div className="relative w-full">
            <select
              value={workMode}
              onChange={handleFilterChange(setWorkMode)}
              className="w-full pl-3 pr-8 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 font-mono text-xs text-zinc-600 dark:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors cursor-pointer appearance-none"
            >
              <option value="all">ALL WORK MODES</option>
              <option value="remote">REMOTE</option>
              <option value="hybrid">HYBRID</option>
              <option value="onsite">ONSITE</option>
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {onCreateClick && (
          <Button
            onClick={onCreateClick}
            className="w-full xl:w-auto font-mono text-xs uppercase tracking-wider gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Job Listing
          </Button>
        )}
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <JobSkeleton />
      ) : isError ? (
        <div className="border border-red-200/60 dark:border-red-950/30 rounded-lg p-6 text-center bg-red-50/20 dark:bg-red-950/10">
          <p className="text-xs font-mono text-red-600 dark:text-red-400">
            {error instanceof Error ? error.message : "Failed to load job catalog."}
          </p>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="mt-4 font-mono text-xs uppercase tracking-wider"
          >
            Try Again
          </Button>
        </div>
      ) : jobs.length === 0 ? (
        <EmptyState onCreateClick={onCreateClick} />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))}
          </div>

          {/* Pagination Controls */}
          {(page > 1 || hasMore) && (
            <div className="flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 pt-5 font-mono text-xs text-zinc-500">
              <span>
                PAGE {page}
              </span>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className="w-8 h-8 p-0 flex items-center justify-center rounded"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={!hasMore}
                  onClick={() => setPage((p) => p + 1)}
                  className="w-8 h-8 p-0 flex items-center justify-center rounded"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
