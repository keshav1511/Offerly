import React from "react";
import { FileText, Trash2, Edit2, Star, Calendar } from "lucide-react";
import { ResumeRow } from "../resume.types";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { formatDate } from "@/utils/date";

interface ResumeCardProps {
  resume: ResumeRow;
  onRename?: (resume: ResumeRow) => void;
  onDelete?: (resume: ResumeRow) => void;
  onSetDefault?: (resume: ResumeRow) => void;
  isActionLoading?: boolean;
}

export function ResumeCard({
  resume,
  onRename,
  onDelete,
  onSetDefault,
  isActionLoading,
}: ResumeCardProps) {
  // Abbreviate file sizes
  const formatSize = (bytes: number | string | null | undefined) => {
    if (!bytes) return "0 KB";
    const kb = Number(bytes) / 1024;
    if (kb >= 1024) return `${(kb / 1024).toFixed(1)} MB`;
    return `${Math.round(kb)} KB`;
  };

  return (
    <Card className="flex flex-col justify-between h-40 p-5 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300 group shadow-sm">
      <div className="space-y-3.5">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded border border-zinc-200 dark:border-zinc-800 flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 shrink-0 select-none">
              <FileText className="w-5 h-5 text-zinc-400 dark:text-zinc-500" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 min-w-0">
                <h3 className="font-mono text-xs uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50 truncate group-hover:text-black dark:group-hover:text-white">
                  {resume.version_name}
                </h3>
                {resume.is_default && (
                  <span className="px-1.5 py-0.5 text-[8px] font-mono uppercase tracking-wider font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 rounded shrink-0">
                    DEFAULT
                  </span>
                )}
              </div>
              <p className="text-[10px] text-zinc-400 dark:text-zinc-500 truncate mt-0.5 font-sans">
                {resume.file_name} • {formatSize(resume.file_size)}
              </p>
            </div>
          </div>

          {/* Action triggers */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200 shrink-0">
            {onRename && (
              <Button
                variant="ghost"
                size="icon"
                disabled={isActionLoading}
                onClick={() => onRename(resume)}
                className="w-7 h-7 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 rounded"
                title="Rename resume version"
              >
                <Edit2 className="w-3.5 h-3.5 text-zinc-500 dark:text-zinc-400" />
              </Button>
            )}
            {onDelete && (
              <Button
                variant="ghost"
                size="icon"
                disabled={isActionLoading}
                onClick={() => onDelete(resume)}
                className="w-7 h-7 hover:bg-red-50 dark:hover:bg-red-950/20 hover:text-red-600 dark:hover:text-red-400 rounded"
                title="Delete resume version"
              >
                <Trash2 className="w-3.5 h-3.5 text-zinc-400 dark:text-zinc-500 hover:text-red-500" />
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Footer Info & Default Controls */}
      <div className="border-t border-zinc-100 dark:border-zinc-900/60 pt-3 flex items-center justify-between mt-auto">
        <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 dark:text-zinc-500 shrink-0 font-sans">
          <Calendar className="w-3.5 h-3.5" />
          <span>Uploaded {formatDate(resume.created_at)}</span>
        </div>

        {!resume.is_default && onSetDefault && (
          <Button
            variant="ghost"
            disabled={isActionLoading}
            onClick={() => onSetDefault(resume)}
            className="h-7 px-2.5 font-mono text-[9px] uppercase tracking-wider font-semibold border border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700 bg-white dark:bg-zinc-950 rounded flex items-center gap-1 shrink-0"
          >
            <Star className="w-3 h-3 text-zinc-400 shrink-0" />
            <span>Set Default</span>
          </Button>
        )}
      </div>
    </Card>
  );
}
