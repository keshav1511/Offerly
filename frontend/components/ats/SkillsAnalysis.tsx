import React from "react";
import { Check, X, ShieldAlert } from "lucide-react";

interface SkillsAnalysisProps {
  matchingKeywords: string[];
  missingKeywords: string[];
}

export function SkillsAnalysis({ matchingKeywords, missingKeywords }: SkillsAnalysisProps) {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded p-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <ShieldAlert className="w-5 h-5 text-zinc-500" />
        <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50">
          Target Keywords Analysis
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Matching Keywords */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-450 font-bold flex items-center gap-1.5">
            <Check className="w-4 h-4" />
            Matching Keywords ({matchingKeywords.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {matchingKeywords.map((word, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[10px] font-mono bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 border border-emerald-200/40 dark:border-emerald-900/30 rounded"
              >
                {word}
              </span>
            ))}
            {matchingKeywords.length === 0 && (
              <p className="text-xs text-zinc-400 italic">No matching keywords found.</p>
            )}
          </div>
        </div>

        {/* Missing Keywords */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-rose-600 dark:text-rose-450 font-bold flex items-center gap-1.5">
            <X className="w-4 h-4" />
            Missing Keywords ({missingKeywords.length})
          </h4>
          <div className="flex flex-wrap gap-1.5">
            {missingKeywords.map((word, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 text-[10px] font-mono bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 border border-rose-200/40 dark:border-rose-900/30 rounded"
              >
                {word}
              </span>
            ))}
            {missingKeywords.length === 0 && (
              <p className="text-xs text-zinc-400 italic">No missing keywords detected!</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
