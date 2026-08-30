import React from "react";

export default function Loading() {
  return (
    <div className="space-y-6 max-w-5xl py-8 animate-pulse font-sans">
      {/* Header Loading */}
      <div className="flex items-center gap-3">
        <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <div className="h-36 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200/50 dark:border-zinc-800/40" />
          <div className="h-60 bg-zinc-105 dark:bg-zinc-900 rounded border border-zinc-200/50 dark:border-zinc-800/40" />
          <div className="h-56 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200/50 dark:border-zinc-800/40" />
        </div>

        <div className="space-y-6">
          <div className="h-44 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200/50 dark:border-zinc-800/40" />
          <div className="h-64 bg-zinc-105 dark:bg-zinc-900 rounded border border-zinc-200/50 dark:border-zinc-800/40" />
        </div>
      </div>
    </div>
  );
}
