import React from "react";
import { Hourglass } from "lucide-react";

export function ImprovementTimeline() {
  const timelineSteps = [
    {
      title: "Step 1: Re-align Contact Info",
      time: "2 mins",
      impact: "Low Impact",
      desc: "Verify email and phone formatting matches global standards."
    },
    {
      title: "Step 2: Inject Missing Keywords",
      time: "10 mins",
      impact: "High Impact",
      desc: "Add target technology keywords inside your skills and experience descriptions."
    },
    {
      title: "Step 3: Refine Bullet Point Descriptions",
      time: "15 mins",
      impact: "Critical Impact",
      desc: "Rewrite responsibilities to highlight metrics and action-oriented results."
    }
  ];

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <Hourglass className="w-5 h-5 text-zinc-500" />
        <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50">
          Optimization Timeline
        </h3>
      </div>

      <div className="space-y-4 relative pl-4 border-l border-zinc-100 dark:border-zinc-900/60 ml-2">
        {timelineSteps.map((step, idx) => (
          <div key={idx} className="space-y-1 relative">
            <span className="absolute -left-[21px] top-1.5 w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100 border border-white dark:border-zinc-950" />
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 font-sans">{step.title}</p>
              <span className="text-[9px] font-mono bg-zinc-105 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-205 dark:border-zinc-800/40 font-semibold">{step.time}</span>
              <span className="text-[9px] font-mono text-zinc-400 font-semibold">{step.impact}</span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">{step.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
