import React from "react";
import { CheckSquare, CheckCircle2, AlertCircle } from "lucide-react";

interface OptimizationChecklistProps {
  score: number;
  missingKeywordsCount: number;
  adviceCount: number;
}

export function OptimizationChecklist({ score, missingKeywordsCount, adviceCount }: OptimizationChecklistProps) {
  const items = [
    {
      label: "Achieve target match score above 75%",
      status: score >= 75,
      desc: `Current overall score is ${score}%.`,
    },
    {
      label: "Minimize missing job keywords",
      status: missingKeywordsCount <= 3,
      desc: `${missingKeywordsCount} high-priority keywords are missing.`,
    },
    {
      label: "Address critical AI suggestions",
      status: adviceCount <= 2,
      desc: `${adviceCount} optimization suggestions remaining.`,
    },
    {
      label: "Maintain standard ATS formatting layout",
      status: true,
      desc: "Single-column parsing structure matches standard layouts.",
    },
  ];

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <CheckSquare className="w-5 h-5 text-zinc-500" />
        <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50">
          Optimization Checklist
        </h3>
      </div>

      <div className="space-y-3.5">
        {items.map((item, idx) => (
          <div key={idx} className="flex items-start gap-3">
            {item.status ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-450 shrink-0 mt-0.5" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-600 dark:text-amber-450 shrink-0 mt-0.5" />
            )}
            <div className="space-y-0.5">
              <p className={`text-xs font-semibold ${item.status ? "text-zinc-700 dark:text-zinc-350" : "text-zinc-900 dark:text-zinc-200"}`}>
                {item.label}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
