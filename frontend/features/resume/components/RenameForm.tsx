import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { renameResumeSchema, RenameResumeInput } from "../resume.validation";
import { ResumeRow } from "../resume.types";
import { Button } from "@/components/Button";

interface RenameFormProps {
  resume: ResumeRow;
  onSubmit: (data: RenameResumeInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function RenameForm({ resume, onSubmit, onCancel, isLoading }: RenameFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RenameResumeInput>({
    resolver: zodResolver(renameResumeSchema),
    defaultValues: {
      version_name: resume.version_name,
    },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="space-y-1.5">
        <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
          New Version Name *
        </label>
        <input
          type="text"
          disabled={isLoading}
          placeholder="e.g. Full Stack Developer V3"
          {...register("version_name")}
          className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50"
        />
        {errors.version_name && (
          <p className="text-[10px] font-mono text-red-500">{errors.version_name.message}</p>
        )}
      </div>

      <div className="flex items-center justify-end gap-3 border-t border-zinc-100 dark:border-zinc-900 pt-4 mt-6">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
          className="font-mono text-xs uppercase tracking-wider"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isLoading}
          className="font-mono text-xs uppercase tracking-wider"
        >
          {isLoading ? "Saving..." : "Rename Version"}
        </Button>
      </div>
    </form>
  );
}
