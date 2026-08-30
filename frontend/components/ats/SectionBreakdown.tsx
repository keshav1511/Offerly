import React from "react";
import { ListFilter } from "lucide-react";

interface SectionBreakdownProps {
  keywordScore: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  formattingConfidence: number;
}

export function SectionBreakdown({
  keywordScore,
  skillsMatch,
  experienceMatch,
  educationMatch,
  formattingConfidence,
}: SectionBreakdownProps) {
  const categories = [
    { name: "Keyword Density", score: keywordScore },
    { name: "Skills Relevance", score: skillsMatch },
    { name: "Experience Depth", score: experienceMatch },
    { name: "Education Credentials", score: educationMatch },
    { name: "Formatting & Style", score: formattingConfidence },
  ];

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded p-6 space-y-5 shadow-sm">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <ListFilter className="w-5 h-5 text-zinc-500" />
        <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50">
          Resume Section Breakdown
        </h3>
      </div>

      <div className="space-y-4">
        {categories.map((cat, idx) => {
          let barColor = "bg-rose-500";
          if (cat.score >= 80) barColor = "bg-emerald-500";
          else if (cat.score >= 65) barColor = "bg-amber-500";

          return (
            <div key={idx} className="space-y-1.5">
              <div className="flex justify-between items-center text-xs">
                <span className="font-medium text-zinc-700 dark:text-zinc-300 font-sans">{cat.name}</span>
                <span className="font-mono font-semibold text-zinc-900 dark:text-zinc-100">{cat.score}%</span>
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                <div
                  className={`h-full ${barColor} transition-all duration-1000 ease-out`}
                  style={{ width: `${cat.score}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
