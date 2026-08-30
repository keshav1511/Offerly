import React from "react";
import { Info, Building2, Briefcase, Calendar } from "lucide-react";

interface JobMatchInsightsProps {
  jobTitle: string;
  companyName: string;
  generatedAt: string;
}

export function JobMatchInsights({ jobTitle, companyName, generatedAt }: JobMatchInsightsProps) {
  const formatDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded p-6 space-y-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-900 pb-3">
        <Info className="w-5 h-5 text-zinc-500" />
        <h3 className="text-sm font-mono uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50">
          Job Match Insights
        </h3>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Company Name */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200/50 dark:border-zinc-800/40 flex items-center gap-3">
          <Building2 className="w-5 h-5 text-zinc-400 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Target Company</p>
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{companyName}</p>
          </div>
        </div>

        {/* Job Title */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200/50 dark:border-zinc-800/40 flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-zinc-400 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Target Position</p>
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{jobTitle}</p>
          </div>
        </div>

        {/* Match Date */}
        <div className="p-3 bg-zinc-50 dark:bg-zinc-900 rounded border border-zinc-200/50 dark:border-zinc-800/40 flex items-center gap-3">
          <Calendar className="w-5 h-5 text-zinc-400 shrink-0" />
          <div className="space-y-0.5">
            <p className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Analyzed On</p>
            <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{formatDate(generatedAt)}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
