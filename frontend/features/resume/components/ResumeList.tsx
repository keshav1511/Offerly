"use client";

import React, { useState, useEffect } from "react";
import { ResumeRow } from "../resume.types";
import { useResumes } from "../hooks/useResumes";
import { ResumeCard } from "./ResumeCard";
import { ResumeSkeleton } from "./ResumeSkeleton";
import { EmptyState } from "./EmptyState";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/Button";

interface ResumeListProps {
  onRename?: (resume: ResumeRow) => void;
  onDelete?: (resume: ResumeRow) => void;
  onSetDefault?: (resume: ResumeRow) => void;
  onParse?: (resume: ResumeRow, force?: boolean) => void;
  isActionLoading?: boolean;
}

export function ResumeList({
  onRename,
  onDelete,
  onSetDefault,
  onParse,
  isActionLoading,
}: ResumeListProps) {
  const [page, setPage] = useState<number>(1);
  const [mounted, setMounted] = useState(false);
  const pageSize = 4; // Display 4 resumes per page (compact grid layout)

  useEffect(() => {
    setMounted(true);
  }, []);

  // Construct filters payload
  const filters = {
    page,
    pageSize: pageSize + 1,
  };

  const { resumes: results, isLoading, isError, error, refetch } = useResumes(filters);

  const hasMore = results.length > pageSize;
  const resumes = hasMore ? results.slice(0, pageSize) : results;

  return (
    <div className="space-y-6">
      {!mounted || isLoading ? (
        <ResumeSkeleton />
      ) : isError ? (
        <div className="border border-red-200/60 dark:border-red-950/30 rounded-lg p-6 text-center bg-red-50/20 dark:bg-red-950/10">
          <p className="text-xs font-mono text-red-600 dark:text-red-400">
            {error instanceof Error ? error.message : "Failed to load resume catalog."}
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
      ) : resumes.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {resumes.map((resume) => (
              <ResumeCard
                key={resume.id}
                resume={resume}
                onRename={onRename}
                onDelete={onDelete}
                onSetDefault={onSetDefault}
                onParse={onParse}
                isActionLoading={isActionLoading}
              />
            ))}
          </div>

          {/* Pagination */}
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
