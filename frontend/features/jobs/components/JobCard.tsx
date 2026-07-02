import React from "react";
import { Briefcase, MapPin, Edit2, Trash2, Globe, Calendar, DollarSign, ExternalLink } from "lucide-react";
import { JobWithCompany } from "../job.types";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

import { formatSalaryRange } from "@/utils/salary";

interface JobCardProps {
  job: JobWithCompany;
  onEdit?: (job: JobWithCompany) => void;
  onDelete?: (job: JobWithCompany) => void;
}

export function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  const salaryDisplay = formatSalaryRange(job.salary_min, job.salary_max);

  // Generate initials if no logo URL exists
  const initials = job.company?.name
    ? job.company.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .substring(0, 2)
        .toUpperCase()
    : "JB";

  // Priority badge styling
  const priorityStyles = {
    critical: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/50",
    high: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/50",
    medium: "bg-zinc-50 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800",
    low: "bg-zinc-100/50 text-zinc-500 border-zinc-200/60 dark:bg-zinc-900/40 dark:text-zinc-500 dark:border-zinc-850",
  };

  // Status badge styling
  const statusStyles = {
    wishlist: "bg-zinc-100 text-zinc-700 dark:bg-zinc-900 dark:text-zinc-300",
    applied: "bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400",
    oa: "bg-purple-50 text-purple-700 dark:bg-purple-950/20 dark:text-purple-400",
    interview: "bg-orange-50 text-orange-700 dark:bg-orange-950/20 dark:text-orange-400",
    hr: "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400",
    offer: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400",
    accepted: "bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400",
    rejected: "bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400",
    withdrawn: "bg-zinc-100/70 text-zinc-500 dark:bg-zinc-900/60 dark:text-zinc-500",
  };

  return (
    <Card className="flex flex-col justify-between h-56 p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300 group shadow-sm">
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {job.company?.logo_url ? (
              <img
                src={job.company.logo_url}
                alt={`${job.company.name} logo`}
                className="w-10 h-10 rounded object-cover border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 shrink-0"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = "none";
                }}
              />
            ) : (
              <div className="w-10 h-10 rounded border border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 font-mono text-xs font-semibold text-zinc-400 dark:text-zinc-600 shrink-0 select-none">
                {initials}
              </div>
            )}
            <div className="min-w-0">
              <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50 truncate group-hover:text-black dark:group-hover:text-white">
                {job.title}
              </h3>
              <p className="text-[10px] text-zinc-500 dark:text-zinc-400 truncate">
                {job.company?.name || "Unknown Company"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 shrink-0">
            {job.job_url && (
              <a
                href={job.job_url}
                target="_blank"
                rel="noopener noreferrer"
                className="w-7 h-7 flex items-center justify-center border border-transparent hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded transition-colors text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
                title="Open job listing link"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(job)}
                className="w-7 h-7 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded"
                title="Edit job target"
              >
                <Edit2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(job)}
                className="w-7 h-7 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 rounded"
                title="Delete job target"
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 hover:text-red-500" />
              </Button>
            )}
          </div>
        </div>

        {/* Location & Salary Indicators */}
        <div className="space-y-1.5 font-sans">
          <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 min-w-0">
            <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
            <span className="truncate">{job.location || "Remote / Location Open"}</span>
          </div>
          {salaryDisplay && (
            <div className="flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <DollarSign className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
              <span>{salaryDisplay}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer Accents */}
      <div className="border-t border-zinc-100 dark:border-zinc-900/60 pt-3 flex items-center justify-between mt-auto">
        <span className={`px-2 py-0.5 text-[9px] font-mono uppercase tracking-wider font-semibold rounded shrink-0 ${statusStyles[job.status]}`}>
          {job.status}
        </span>
        
        <div className="flex items-center gap-2 shrink-0">
          {job.work_mode && (
            <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider font-medium bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800/80 rounded">
              {job.work_mode}
            </span>
          )}
          <span className={`px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider font-semibold border rounded ${priorityStyles[job.priority]}`}>
            {job.priority}
          </span>
        </div>
      </div>
    </Card>
  );
}
