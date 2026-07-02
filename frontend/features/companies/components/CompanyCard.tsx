import React from "react";
import { Building2, Link2, MapPin, Edit2, Trash2, Globe } from "lucide-react";
import { CompanyRow } from "../company.types";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";

interface CompanyCardProps {
  company: CompanyRow;
  onEdit?: (company: CompanyRow) => void;
  onDelete?: (company: CompanyRow) => void;
}

export function CompanyCard({ company, onEdit, onDelete }: CompanyCardProps) {
  // Extract clean hostname for display
  const displayUrl = company.website
    ? company.website.replace(/https?:\/\/(www\.)?/, "").split("/")[0]
    : null;

  // Generate initials if no logo URL exists
  const initials = company.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <Card className="flex flex-col justify-between h-56 p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300 group shadow-sm">
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            {company.logo_url ? (
              <img
                src={company.logo_url}
                alt={`${company.name} logo`}
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
                {company.name}
              </h3>
              {displayUrl && (
                <a
                  href={company.website || undefined}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-[10px] text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 font-sans mt-0.5"
                >
                  <Globe className="w-2.5 h-2.5" />
                  <span className="truncate max-w-[120px]">{displayUrl}</span>
                </a>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 shrink-0">
            {onEdit && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEdit(company)}
                className="w-7 h-7 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded"
                title="Edit company"
              >
                <Edit2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDelete(company)}
                className="w-7 h-7 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 rounded"
                title="Delete company"
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 hover:text-red-500" />
              </Button>
            )}
          </div>
        </div>

        {company.description ? (
          <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-relaxed">
            {company.description}
          </p>
        ) : (
          <p className="text-xs text-zinc-400 dark:text-zinc-600 italic">
            No description provided.
          </p>
        )}
      </div>

      <div className="border-t border-zinc-100 dark:border-zinc-900/60 pt-3 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 min-w-0">
          <MapPin className="w-3 h-3 text-zinc-400 dark:text-zinc-600 shrink-0" />
          <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-sans truncate">
            {company.location || "Remote / Unknown"}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {company.industry && (
            <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider font-medium bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 border border-zinc-200/80 dark:border-zinc-800/80 rounded">
              {company.industry}
            </span>
          )}
          {company.size && (
            <span className="px-1.5 py-0.5 text-[9px] font-mono uppercase tracking-wider font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 rounded">
              {company.size}
            </span>
          )}
        </div>
      </div>
    </Card>
  );
}
