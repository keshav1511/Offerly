import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ResumeStructuredData } from "../../types/parsing.types";

interface SummarySectionProps {
  register: UseFormRegister<ResumeStructuredData>;
  errors: FieldErrors<ResumeStructuredData>;
}

export function SummarySection({ register, errors }: SummarySectionProps) {
  return (
    <div className="space-y-6 bg-white dark:bg-zinc-950 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div>
        <h2 className="font-mono text-sm uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-950 pb-2">
          Professional Summary
        </h2>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-1">
          A high-level overview of your professional background, skills, and goals.
        </p>
      </div>

      <div className="space-y-1.5">
        <textarea
          rows={5}
          {...register("summary")}
          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors resize-y leading-relaxed"
          placeholder="Summarize your professional highlights..."
        />
        {errors.summary && (
          <p className="text-[10px] font-mono text-red-500">{errors.summary.message}</p>
        )}
      </div>
    </div>
  );
}
