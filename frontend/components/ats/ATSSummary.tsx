import React from "react";
import { Brain, Star, AlertTriangle, Lightbulb } from "lucide-react";

interface ATSSummaryProps {
  advice: string[];
  skillsMatch: number;
  experienceMatch: number;
}

export function ATSSummary({ advice, skillsMatch, experienceMatch }: ATSSummaryProps) {
  // Determine strongest strengths and weaknesses based on subscores
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  if (skillsMatch >= 75) {
    strengths.push("High alignment in core skills and technical qualifiers.");
  } else {
    weaknesses.push("Significant gaps in target keyword matching skills.");
  }

  if (experienceMatch >= 75) {
    strengths.push("Excellent work experience duration and responsibilities depth.");
  } else {
    weaknesses.push("Experience details need re-wording to highlight target qualifiers.");
  }

  // Fallback strengths/weaknesses if empty
  if (strengths.length === 0) {
    strengths.push("Valid education credentials and formatting foundation.");
  }
  if (weaknesses.length === 0) {
    weaknesses.push("Verify formatting style matches standard ATS parsers.");
  }

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded p-6 space-y-6 shadow-sm">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <Brain className="w-5 h-5 text-zinc-500" />
        <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50">
          AI Match Assessment Summary
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Key Strengths */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-emerald-600 dark:text-emerald-450 font-bold flex items-center gap-1.5">
            <Star className="w-4 h-4" />
            Key Strengths
          </h4>
          <ul className="space-y-2">
            {strengths.map((str, idx) => (
              <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed flex items-start gap-2">
                <span className="text-emerald-500 mt-0.5">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Core Gaps */}
        <div className="space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-amber-600 dark:text-amber-450 font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Primary Optimization Gaps
          </h4>
          <ul className="space-y-2">
            {weaknesses.map((weak, idx) => (
              <li key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed flex items-start gap-2">
                <span className="text-amber-500 mt-0.5">•</span>
                <span>{weak}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Advice / Recommendations */}
      {advice.length > 0 && (
        <div className="border-t border-zinc-100 dark:border-zinc-900 pt-5 space-y-3">
          <h4 className="text-xs font-mono uppercase tracking-wider text-zinc-500 font-bold flex items-center gap-1.5">
            <Lightbulb className="w-4 h-4 text-zinc-405" />
            AI Actionable Recommendations
          </h4>
          <div className="space-y-2">
            {advice.map((item, idx) => (
              <p key={idx} className="text-xs text-zinc-600 dark:text-zinc-400 font-sans leading-relaxed pl-5 relative">
                <span className="absolute left-0 top-0 font-mono text-[10px] text-zinc-400 font-bold">{(idx + 1).toString().padStart(2, "0")}.</span>
                {item}
              </p>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
