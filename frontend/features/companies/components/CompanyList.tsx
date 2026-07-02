"use client";

import React, { useState, useEffect } from "react";
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import { CompanyRow } from "../company.types";
import { useCompanies } from "../hooks/useCompanies";
import { CompanyCard } from "./CompanyCard";
import { CompanySkeleton } from "./CompanySkeleton";
import { EmptyState } from "./EmptyState";
import { Button } from "@/components/Button";

interface CompanyListProps {
  onEdit?: (company: CompanyRow) => void;
  onDelete?: (company: CompanyRow) => void;
  onCreateClick?: () => void;
}

export function CompanyList({ onEdit, onDelete, onCreateClick }: CompanyListProps) {
  // Filter States
  const [search, setSearch] = useState<string>("");
  const [size, setSize] = useState<string>("all");
  const [page, setPage] = useState<number>(1);
  const pageSize = 6; // 6 items per page fits 3-column grid perfectly

  // Debounced search query
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search query
    }, 300);

    return () => clearTimeout(timer);
  }, [search]);

  // Construct filters payload
  const filters = {
    page,
    pageSize: pageSize + 1, // Fetch one extra element to check pagination bounds
    search: debouncedSearch.trim() || undefined,
    size: size !== "all" ? (size as CompanyRow["size"]) : undefined,
  };

  // Consume TanStack queries
  const { companies: results, isLoading, isError, error, refetch } = useCompanies(filters);

  const hasMore = results.length > pageSize;
  const companies = hasMore ? results.slice(0, pageSize) : results;

  const handleSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSize(e.target.value);
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Filters Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4 justify-between border-b border-zinc-100 dark:border-zinc-900 pb-5">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500" />
            <input
              type="text"
              placeholder="Search companies by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 font-sans text-xs placeholder-zinc-400 dark:placeholder-zinc-600 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            />
          </div>

          {/* Size Filter Dropdown */}
          <div className="relative w-full sm:w-44">
            <select
              value={size}
              onChange={handleSizeChange}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded-md bg-white dark:bg-zinc-950 font-mono text-xs text-zinc-600 dark:text-zinc-400 focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors cursor-pointer appearance-none animate-none"
            >
              <option value="all">ALL SIZES</option>
              <option value="1-10">1-10 EMPLOYEES</option>
              <option value="11-50">11-50 EMPLOYEES</option>
              <option value="51-200">51-200 EMPLOYEES</option>
              <option value="201-500">201-500 EMPLOYEES</option>
              <option value="501-1000">501-1000 EMPLOYEES</option>
              <option value="1000+">1000+ EMPLOYEES</option>
            </select>
            <SlidersHorizontal className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-400 pointer-events-none" />
          </div>
        </div>

        {onCreateClick && (
          <Button
            onClick={onCreateClick}
            className="w-full sm:w-auto font-mono text-xs uppercase tracking-wider gap-1.5 shrink-0"
          >
            <Plus className="w-4 h-4" /> Add Company
          </Button>
        )}
      </div>

      {/* Grid Content */}
      {isLoading ? (
        <CompanySkeleton />
      ) : isError ? (
        <div className="border border-red-200/60 dark:border-red-950/30 rounded-lg p-6 text-center bg-red-50/20 dark:bg-red-950/10">
          <p className="text-xs font-mono text-red-600 dark:text-red-400">
            {error instanceof Error ? error.message : "Failed to load companies."}
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
      ) : companies.length === 0 ? (
        <EmptyState onCreateClick={onCreateClick} />
      ) : (
        <div className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.map((company) => (
              <CompanyCard
                key={company.id}
                company={company}
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
