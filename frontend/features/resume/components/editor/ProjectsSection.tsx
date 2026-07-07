import React from "react";
import { UseFormRegister, FieldErrors, useFieldArray, Control } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { ResumeStructuredData } from "../../types/parsing.types";

interface ProjectsSectionProps {
  register: UseFormRegister<ResumeStructuredData>;
  errors: FieldErrors<ResumeStructuredData>;
  control: Control<ResumeStructuredData>;
}

export function ProjectsSection({ register, errors, control }: ProjectsSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "projects",
  });

  return (
    <div className="space-y-6 bg-white dark:bg-zinc-950 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900/60 pb-2">
        <div>
          <h2 className="font-mono text-sm uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50">
            Projects
          </h2>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-1">
            Showcase personal, academic, or professional projects.
          </p>
        </div>
        <Button
          type="button"
          onClick={() =>
            append({
              name: "",
              description: "",
              url: "",
            })
          }
          variant="outline"
          className="h-8 px-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Project</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 italic py-2 text-center">
          No projects found. Click Add Project to create one.
        </p>
      ) : (
        <div className="space-y-6">
          {fields.map((field, index) => {
            const itemErrors = errors.projects?.[index];

            return (
              <div
                key={field.id}
                className="p-5 border border-zinc-100 dark:border-zinc-900 rounded-lg bg-zinc-50/50 dark:bg-zinc-900/20 relative group/card space-y-4"
              >
                {/* Delete button absolute right corner */}
                <button
                  type="button"
                  onClick={() => remove(index)}
                  className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-red-500 dark:text-zinc-500 dark:hover:text-red-400 rounded transition-colors"
                  title="Remove project entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Name */}
                  <div className="space-y-1.5 pr-8">
                    <label className="block font-mono text-[9px] uppercase tracking-wider font-semibold text-zinc-500">
                      Project Name *
                    </label>
                    <input
                      type="text"
                      {...register(`projects.${index}.name` as const)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
                      placeholder="e.g. Portfolio Website"
                    />
                    {itemErrors?.name && (
                      <p className="text-[9px] font-mono text-red-500">
                        {itemErrors.name.message}
                      </p>
                    )}
                  </div>

                  {/* URL */}
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-wider font-semibold text-zinc-500">
                      Project Link (URL)
                    </label>
                    <input
                      type="text"
                      {...register(`projects.${index}.url` as const)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
                      placeholder="e.g. github.com/username/project"
                    />
                    {itemErrors?.url && (
                      <p className="text-[9px] font-mono text-red-500">
                        {itemErrors.url.message}
                      </p>
                    )}
                  </div>

                  {/* Description */}
                  <div className="space-y-1.5 md:col-span-2">
                    <label className="block font-mono text-[9px] uppercase tracking-wider font-semibold text-zinc-500">
                      Project Description
                    </label>
                    <textarea
                      rows={3}
                      {...register(`projects.${index}.description` as const)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors resize-y leading-relaxed"
                      placeholder="Describe the problem you solved, your role, and features implemented..."
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
