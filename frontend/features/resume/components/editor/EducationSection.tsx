import React from "react";
import { UseFormRegister, FieldErrors, useFieldArray, Control } from "react-hook-form";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/Button";
import { ResumeStructuredData } from "../../types/parsing.types";

interface EducationSectionProps {
  register: UseFormRegister<ResumeStructuredData>;
  errors: FieldErrors<ResumeStructuredData>;
  control: Control<ResumeStructuredData>;
}

export function EducationSection({ register, errors, control }: EducationSectionProps) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "education",
  });

  return (
    <div className="space-y-6 bg-white dark:bg-zinc-950 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900/60 pb-2">
        <div>
          <h2 className="font-mono text-sm uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50">
            Education History
          </h2>
          <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-1">
            Manage your academic history, degrees, and institutions.
          </p>
        </div>
        <Button
          type="button"
          onClick={() =>
            append({
              institution: "",
              degree: "",
              field_of_study: "",
              start_date: "",
              end_date: "",
            })
          }
          variant="outline"
          className="h-8 px-3 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-wider"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Education</span>
        </Button>
      </div>

      {fields.length === 0 ? (
        <p className="text-xs font-mono text-zinc-400 dark:text-zinc-500 italic py-2 text-center">
          No education entries found. Click Add Education to create one.
        </p>
      ) : (
        <div className="space-y-6">
          {fields.map((field, index) => {
            const itemErrors = errors.education?.[index];

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
                  title="Remove education entry"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Institution */}
                  <div className="space-y-1.5 md:col-span-2 pr-8">
                    <label className="block font-mono text-[9px] uppercase tracking-wider font-semibold text-zinc-500">
                      Institution / School *
                    </label>
                    <input
                      type="text"
                      {...register(`education.${index}.institution` as const)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
                      placeholder="e.g. Stanford University"
                    />
                    {itemErrors?.institution && (
                      <p className="text-[9px] font-mono text-red-500">
                        {itemErrors.institution.message}
                      </p>
                    )}
                  </div>

                  {/* Degree */}
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-wider font-semibold text-zinc-500">
                      Degree
                    </label>
                    <input
                      type="text"
                      {...register(`education.${index}.degree` as const)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
                      placeholder="e.g. Bachelor of Science"
                    />
                  </div>

                  {/* Field of Study */}
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-wider font-semibold text-zinc-500">
                      Field of Study
                    </label>
                    <input
                      type="text"
                      {...register(`education.${index}.field_of_study` as const)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
                      placeholder="e.g. Computer Science"
                    />
                  </div>

                  {/* Start Date */}
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-wider font-semibold text-zinc-500">
                      Start Date
                    </label>
                    <input
                      type="text"
                      {...register(`education.${index}.start_date` as const)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
                      placeholder="e.g. Sep 2018 or 2018-09"
                    />
                  </div>

                  {/* End Date */}
                  <div className="space-y-1.5">
                    <label className="block font-mono text-[9px] uppercase tracking-wider font-semibold text-zinc-500">
                      End Date / Expected End Date
                    </label>
                    <input
                      type="text"
                      {...register(`education.${index}.end_date` as const)}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
                      placeholder="e.g. Jun 2022 or Present"
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
