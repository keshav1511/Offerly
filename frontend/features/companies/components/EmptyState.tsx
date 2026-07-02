import React from "react";
import { Building2, Plus } from "lucide-react";
import { Button } from "@/components/Button";

interface EmptyStateProps {
  onCreateClick?: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-12 text-center max-w-lg mx-auto bg-zinc-50/50 dark:bg-zinc-900/10 backdrop-blur-sm transition-all duration-300">
      <div className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 bg-white dark:bg-zinc-900 shadow-sm">
        <Building2 className="w-6 h-6 text-zinc-400 dark:text-zinc-600" />
      </div>
      <h3 className="text-sm font-mono uppercase tracking-wider font-semibold text-zinc-900 dark:text-zinc-50">
        No Companies Found
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 mb-6 max-w-sm">
        You are not tracking any companies yet. Start adding the organizations you're targeting or interviewing with.
      </p>
      {onCreateClick && (
        <Button onClick={onCreateClick} variant="outline" size="sm" className="font-mono text-xs uppercase tracking-wider gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Company
        </Button>
      )}
    </div>
  );
}
