import React from "react";
import { Lightbulb, CheckCircle2 } from "lucide-react";

interface AIRecommendationsProps {
  advice: string[];
}

export function AIRecommendations({ advice }: AIRecommendationsProps) {
  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <Lightbulb className="w-5 h-5 text-zinc-500" />
        <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50">
          AI Recommendations
        </h3>
      </div>

      <div className="space-y-3">
        {advice.map((item, idx) => (
          <div key={idx} className="flex gap-2 text-xs">
            <span className="font-mono text-zinc-400 font-bold shrink-0 mt-0.5">
              {(idx + 1).toString().padStart(2, "0")}.
            </span>
            <p className="text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed">
              {item}
            </p>
          </div>
        ))}
        {advice.length === 0 && (
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-450 py-2">
            <CheckCircle2 className="w-4 h-4" />
            <p className="text-xs font-semibold">Your resume is fully optimized for this role!</p>
          </div>
        )}
      </div>
    </div>
  );
}
