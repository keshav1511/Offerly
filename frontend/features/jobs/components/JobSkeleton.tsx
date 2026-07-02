import React from "react";

export function JobSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="border border-zinc-200 dark:border-zinc-800 rounded-lg p-5 bg-white dark:bg-zinc-950 animate-pulse flex flex-col justify-between h-48 shadow-sm"
        >
          <div>
            <div className="flex items-center gap-3.5 mb-4">
              <div className="w-10 h-10 rounded border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900 shrink-0" />
              <div className="space-y-2 w-full">
                <div className="h-3.5 bg-zinc-200 dark:bg-zinc-800 rounded w-2/3" />
                <div className="h-2.5 bg-zinc-100 dark:bg-zinc-900 rounded w-1/3" />
              </div>
            </div>
            <div className="space-y-2">
              <div className="h-2.5 bg-zinc-100 dark:bg-zinc-900 rounded w-11/12" />
              <div className="h-2.5 bg-zinc-100 dark:bg-zinc-900 rounded w-3/4" />
            </div>
          </div>
          <div className="border-t border-zinc-100 dark:border-zinc-900/60 pt-3 flex items-center justify-between mt-4">
            <div className="h-3 bg-zinc-100 dark:bg-zinc-900 rounded w-1/4" />
            <div className="h-3 bg-zinc-100 dark:bg-zinc-900 rounded w-1/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
