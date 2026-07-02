import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createCompanySchema, CreateCompanyInput } from "../company.validation";
import { CompanyRow } from "../company.types";
import { Button } from "@/components/Button";

interface CompanyFormProps {
  initialData?: CompanyRow | null;
  onSubmit: (data: CreateCompanyInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function CompanyForm({ initialData, onSubmit, onCancel, isLoading }: CompanyFormProps) {
  // Determine if editing
  const isEditMode = !!initialData;

  // Initialize form with hook-form and Zod schemas
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCompanyInput>({
    resolver: zodResolver(createCompanySchema),
    defaultValues: {
      name: initialData?.name || "",
      website: initialData?.website || "",
      linkedin_url: initialData?.linkedin_url || "",
      logo_url: initialData?.logo_url || "",
      industry: initialData?.industry || "",
      location: initialData?.location || "",
      size: initialData?.size || null,
      description: initialData?.description || "",
      notes: initialData?.notes || "",
    },
  });

  const handleFormSubmit = async (data: CreateCompanyInput) => {
    await onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="space-y-4">
        {/* Name Input */}
        <div className="space-y-1.5">
          <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
            Company Name *
          </label>
          <input
            type="text"
            disabled={isLoading}
            placeholder="e.g. Acme Corporation"
            {...register("name")}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50"
          />
          {errors.name && (
            <p className="text-[10px] font-mono text-red-500">{errors.name.message}</p>
          )}
        </div>

        {/* Website & Logo Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Website URL
            </label>
            <input
              type="text"
              disabled={isLoading}
              placeholder="e.g. https://acme.co"
              {...register("website")}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50"
            />
            {errors.website && (
              <p className="text-[10px] font-mono text-red-500">{errors.website.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Logo URL
            </label>
            <input
              type="text"
              disabled={isLoading}
              placeholder="e.g. https://acme.co/logo.png"
              {...register("logo_url")}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50"
            />
            {errors.logo_url && (
              <p className="text-[10px] font-mono text-red-500">{errors.logo_url.message}</p>
            )}
          </div>
        </div>

        {/* LinkedIn & Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              LinkedIn Company URL
            </label>
            <input
              type="text"
              disabled={isLoading}
              placeholder="e.g. https://linkedin.com/company/acme"
              {...register("linkedin_url")}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50"
            />
            {errors.linkedin_url && (
              <p className="text-[10px] font-mono text-red-500">{errors.linkedin_url.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Location
            </label>
            <input
              type="text"
              disabled={isLoading}
              placeholder="e.g. San Francisco, CA"
              {...register("location")}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50"
            />
            {errors.location && (
              <p className="text-[10px] font-mono text-red-500">{errors.location.message}</p>
            )}
          </div>
        </div>

        {/* Industry & Size Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Industry
            </label>
            <input
              type="text"
              disabled={isLoading}
              placeholder="e.g. Software / Fintech"
              {...register("industry")}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50"
            />
            {errors.industry && (
              <p className="text-[10px] font-mono text-red-500">{errors.industry.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Company Size Brackets
            </label>
            <select
              disabled={isLoading}
              {...register("size")}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <option value="">Select company size...</option>
              <option value="1-10">1-10 Employees</option>
              <option value="11-50">11-50 Employees</option>
              <option value="51-200">51-200 Employees</option>
              <option value="201-500">201-500 Employees</option>
              <option value="501-1000">501-1000 Employees</option>
              <option value="1000+">1000+ Employees</option>
            </select>
            {errors.size && (
              <p className="text-[10px] font-mono text-red-500">{errors.size.message}</p>
            )}
          </div>
        </div>

        {/* Description TextArea */}
        <div className="space-y-1.5">
          <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
            Description
          </label>
          <textarea
            disabled={isLoading}
            placeholder="Describe what the company does..."
            rows={3}
            {...register("description")}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50 resize-none"
          />
          {errors.description && (
            <p className="text-[10px] font-mono text-red-500">{errors.description.message}</p>
          )}
        </div>

        {/* Notes TextArea */}
        <div className="space-y-1.5">
          <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
            Personal Notes
          </label>
          <textarea
            disabled={isLoading}
            placeholder="Add internal hiring contacts, notes from networking, or target departments..."
            rows={3}
            {...register("notes")}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50 resize-none"
          />
          {errors.notes && (
            <p className="text-[10px] font-mono text-red-500">{errors.notes.message}</p>
          )}
        </div>
      </div>

      {/* Button Controls */}
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
          {isLoading ? "Saving..." : isEditMode ? "Save Changes" : "Create Company"}
        </Button>
      </div>
    </form>
  );
}
