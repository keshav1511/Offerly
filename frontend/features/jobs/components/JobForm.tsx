import React, { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { createJobSchema, CreateJobInput } from "../job.validation";
import { JobRow } from "../job.types";
import { useCompanies } from "@/features/companies/hooks/useCompanies";
import { Button } from "@/components/Button";
import { ChevronDown, Check } from "lucide-react";
import { formatDateForInput } from "@/utils/date";

interface JobFormProps {
  initialData?: JobRow | null;
  onSubmit: (data: CreateJobInput) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function JobForm({ initialData, onSubmit, onCancel, isLoading }: JobFormProps) {
  const isEditMode = !!initialData;
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 1. Load companies dynamically using TanStack Query
  const { companies } = useCompanies();

  const [companySearch, setCompanySearch] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Initialize form with Zod schema validation
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CreateJobInput>({
    resolver: zodResolver(createJobSchema),
    defaultValues: {
      company_id: initialData?.company_id || "",
      title: initialData?.title || "",
      description: initialData?.description || "",
      location: initialData?.location || "",
      salary_min: initialData?.salary_min ? Number(initialData.salary_min) : 0,
      salary_max: initialData?.salary_max ? Number(initialData.salary_max) : 0,
      priority: initialData?.priority || "medium",
      status: initialData?.status || "wishlist",
      work_mode: initialData?.work_mode || null,
      employment_type: initialData?.employment_type || null,
      job_url: initialData?.job_url || "",
      applied_at: initialData?.applied_at ? formatDateForInput(initialData.applied_at) : null,
      deadline: initialData?.deadline ? formatDateForInput(initialData.deadline) : null,
    },
  });

  const watchedCompanyId = watch("company_id");

  // Pre-populate company name in edit mode or when company is loaded
  useEffect(() => {
    if (initialData?.company_id && companies.length > 0) {
      const match = companies.find((c) => c.id === initialData.company_id);
      if (match) {
        setCompanySearch(match.name);
      }
    }
  }, [initialData, companies]);

  // Handle outside clicks to close the dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Filter companies based on search typing
  const filteredCompanies = companies.filter((c) =>
    c.name.toLowerCase().includes(companySearch.toLowerCase())
  );

  const handleSelectCompany = (id: string, name: string) => {
    setValue("company_id", id, { shouldValidate: true });
    setCompanySearch(name);
    setIsDropdownOpen(false);
  };

  const handleFormSubmit = async (data: CreateJobInput) => {
    // Standardize optional empty URL string, dates to null values
    const payload = {
      ...data,
      applied_at: data.applied_at ? new Date(data.applied_at).toISOString() : null,
      deadline: data.deadline ? new Date(data.deadline).toISOString() : null,
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
      <div className="space-y-4">
        {/* Title Input */}
        <div className="space-y-1.5">
          <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
            Job Title *
          </label>
          <input
            type="text"
            disabled={isLoading}
            placeholder="e.g. Senior Frontend Engineer"
            {...register("title")}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50"
          />
          {errors.title && (
            <p className="text-[10px] font-mono text-red-500">{errors.title.message}</p>
          )}
        </div>

        {/* Company Dropdown Selection */}
        <div className="space-y-1.5 relative" ref={dropdownRef}>
          <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
            Target Company *
          </label>
          <div className="relative">
            <input
              type="text"
              disabled={isLoading}
              placeholder="Search companies..."
              value={companySearch}
              onChange={(e) => {
                setCompanySearch(e.target.value);
                setIsDropdownOpen(true);
              }}
              onFocus={() => setIsDropdownOpen(true)}
              className="w-full pl-3 pr-9 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50"
            />
            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
          </div>

          {/* Search Dropdown Overlay */}
          {isDropdownOpen && (
            <div className="absolute z-20 w-full mt-1 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 rounded shadow-lg max-h-48 overflow-y-auto">
              {filteredCompanies.length === 0 ? (
                <div className="p-3 text-xs text-zinc-500 font-sans text-center">
                  No matching companies found. Add companies first in the Companies Tab.
                </div>
              ) : (
                filteredCompanies.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleSelectCompany(c.id, c.name)}
                    className="w-full flex items-center justify-between px-3 py-2 text-left text-xs font-sans text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors border-b border-zinc-50 dark:border-zinc-900 last:border-b-0"
                  >
                    <span>{c.name}</span>
                    {watchedCompanyId === c.id && <Check className="w-3.5 h-3.5 text-zinc-900 dark:text-zinc-50" />}
                  </button>
                ))
              )}
            </div>
          )}
          {errors.company_id && (
            <p className="text-[10px] font-mono text-red-500">{errors.company_id.message}</p>
          )}
        </div>

        {/* Salary Min & Salary Max Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Min Salary ($)
            </label>
            <input
              type="number"
              disabled={isLoading}
              placeholder="e.g. 100000"
              {...register("salary_min", { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50"
            />
            {errors.salary_min && (
              <p className="text-[10px] font-mono text-red-500">{errors.salary_min.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Max Salary ($)
            </label>
            <input
              type="number"
              disabled={isLoading}
              placeholder="e.g. 130000"
              {...register("salary_max", { valueAsNumber: true })}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50"
            />
            {errors.salary_max && (
              <p className="text-[10px] font-mono text-red-500">{errors.salary_max.message}</p>
            )}
          </div>
        </div>

        {/* Work Mode & Employment Type Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Work Mode
            </label>
            <select
              disabled={isLoading}
              {...register("work_mode")}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <option value="">Select mode...</option>
              <option value="remote">Remote</option>
              <option value="hybrid">Hybrid</option>
              <option value="onsite">Onsite</option>
            </select>
            {errors.work_mode && (
              <p className="text-[10px] font-mono text-red-500">{errors.work_mode.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Employment Contract
            </label>
            <select
              disabled={isLoading}
              {...register("employment_type")}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <option value="">Select type...</option>
              <option value="full_time">Full Time</option>
              <option value="part_time">Part Time</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </select>
            {errors.employment_type && (
              <p className="text-[10px] font-mono text-red-500">{errors.employment_type.message}</p>
            )}
          </div>
        </div>

        {/* Priority & Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Priority Ranking
            </label>
            <select
              disabled={isLoading}
              {...register("priority")}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <option value="low">Low Priority</option>
              <option value="medium">Medium Priority</option>
              <option value="high">High Priority</option>
              <option value="critical">Critical Priority</option>
            </select>
            {errors.priority && (
              <p className="text-[10px] font-mono text-red-500">{errors.priority.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Pipeline Stage
            </label>
            <select
              disabled={isLoading}
              {...register("status")}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <option value="wishlist">Wishlist</option>
              <option value="applied">Applied</option>
              <option value="oa">Online Assessment (OA)</option>
              <option value="interview">Interviewing</option>
              <option value="hr">HR Screen</option>
              <option value="offer">Offer Extended</option>
              <option value="accepted">Offer Accepted</option>
              <option value="rejected">Rejected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
            {errors.status && (
              <p className="text-[10px] font-mono text-red-500">{errors.status.message}</p>
            )}
          </div>
        </div>

        {/* Job URL & Location Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Job Board / Listing URL
            </label>
            <input
              type="text"
              disabled={isLoading}
              placeholder="e.g. https://jobs.lever.co/acme/123"
              {...register("job_url")}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50"
            />
            {errors.job_url && (
              <p className="text-[10px] font-mono text-red-500">{errors.job_url.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Location City
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

        {/* Applied At & Deadline Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Date Applied
            </label>
            <input
              type="date"
              disabled={isLoading}
              {...register("applied_at")}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50"
            />
            {errors.applied_at && (
              <p className="text-[10px] font-mono text-red-500">{errors.applied_at.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
              Application Deadline
            </label>
            <input
              type="date"
              disabled={isLoading}
              {...register("deadline")}
              className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50"
            />
            {errors.deadline && (
              <p className="text-[10px] font-mono text-red-500">{errors.deadline.message}</p>
            )}
          </div>
        </div>

        {/* Description textarea */}
        <div className="space-y-1.5">
          <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
            Job Description / Requirements
          </label>
          <textarea
            disabled={isLoading}
            placeholder="Paste job descriptions details..."
            rows={4}
            {...register("description")}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors disabled:opacity-50 resize-none"
          />
          {errors.description && (
            <p className="text-[10px] font-mono text-red-500">{errors.description.message}</p>
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
          {isLoading ? "Saving..." : isEditMode ? "Save Changes" : "Track Job"}
        </Button>
      </div>
    </form>
  );
}
