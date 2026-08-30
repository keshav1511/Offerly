import React from "react";
import { FileText } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-lg p-6 sm:p-12 text-center max-w-lg mx-auto bg-zinc-50/50 dark:bg-zinc-900/10 backdrop-blur-sm transition-all duration-300">
      <div className="w-12 h-12 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center mb-4 bg-white dark:bg-zinc-900 shadow-sm">
        <FileText className="w-6 h-6 text-zinc-400 dark:text-zinc-600" />
      </div>
      <h3 className="text-sm font-mono uppercase tracking-wider font-semibold text-zinc-900 dark:text-zinc-50">
        No Resumes Uploaded
      </h3>
      <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-2 max-w-sm">
        Drag and drop your resume above to track different versions, test ATS keyword optimization, and link them to job targets.
      </p>
    </div>
  );
}
