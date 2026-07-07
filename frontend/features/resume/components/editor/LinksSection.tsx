import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { GitBranch, Link, Globe } from "lucide-react";
import { ResumeStructuredData } from "../../types/parsing.types";

interface LinksSectionProps {
  register: UseFormRegister<ResumeStructuredData>;
  errors: FieldErrors<ResumeStructuredData>;
}

export function LinksSection({ register, errors }: LinksSectionProps) {
  return (
    <div className="space-y-6 bg-white dark:bg-zinc-950 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div>
        <h2 className="font-mono text-sm uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-950 pb-2">
          Social Links & Portfolios
        </h2>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-1">
          Add your professional profiles and personal portfolio links.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5">
        {/* GitHub */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
            <GitBranch className="w-3.5 h-3.5" />
            <span>GitHub Profile URL</span>
          </label>
          <input
            type="text"
            {...register("links.github")}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            placeholder="e.g. github.com/username"
          />
          {errors.links?.github && (
            <p className="text-[10px] font-mono text-red-500">{errors.links.github.message}</p>
          )}
        </div>

        {/* LinkedIn */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
            <Link className="w-3.5 h-3.5" />
            <span>LinkedIn Profile URL</span>
          </label>
          <input
            type="text"
            {...register("links.linkedin")}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            placeholder="e.g. linkedin.com/in/username"
          />
          {errors.links?.linkedin && (
            <p className="text-[10px] font-mono text-red-500">{errors.links.linkedin.message}</p>
          )}
        </div>

        {/* Portfolio */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
            <Globe className="w-3.5 h-3.5" />
            <span>Portfolio / Personal Website URL</span>
          </label>
          <input
            type="text"
            {...register("links.portfolio")}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            placeholder="e.g. johndoe.dev"
          />
          {errors.links?.portfolio && (
            <p className="text-[10px] font-mono text-red-500">{errors.links.portfolio.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
