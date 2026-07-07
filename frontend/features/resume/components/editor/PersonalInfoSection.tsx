import React from "react";
import { UseFormRegister, FieldErrors } from "react-hook-form";
import { ResumeStructuredData } from "../../types/parsing.types";

interface PersonalInfoSectionProps {
  register: UseFormRegister<ResumeStructuredData>;
  errors: FieldErrors<ResumeStructuredData>;
}

export function PersonalInfoSection({ register, errors }: PersonalInfoSectionProps) {
  return (
    <div className="space-y-6 bg-white dark:bg-zinc-950 p-6 rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm">
      <div>
        <h2 className="font-mono text-sm uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50 border-b border-zinc-100 dark:border-zinc-950 pb-2">
          Personal Information
        </h2>
        <p className="text-[10px] text-zinc-400 dark:text-zinc-500 font-mono mt-1">
          Review and update your primary contact details.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Name */}
        <div className="space-y-1.5">
          <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
            Full Name *
          </label>
          <input
            type="text"
            {...register("personal.name")}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            placeholder="e.g. John Doe"
          />
          {errors.personal?.name && (
            <p className="text-[10px] font-mono text-red-500">{errors.personal.name.message}</p>
          )}
        </div>

        {/* Email */}
        <div className="space-y-1.5">
          <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
            Email Address *
          </label>
          <input
            type="email"
            {...register("personal.email")}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            placeholder="e.g. john.doe@example.com"
          />
          {errors.personal?.email && (
            <p className="text-[10px] font-mono text-red-500">{errors.personal.email.message}</p>
          )}
        </div>

        {/* Phone */}
        <div className="space-y-1.5">
          <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
            Phone Number
          </label>
          <input
            type="text"
            {...register("personal.phone")}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            placeholder="e.g. +1 (555) 019-2834"
          />
          {errors.personal?.phone && (
            <p className="text-[10px] font-mono text-red-500">{errors.personal.phone.message}</p>
          )}
        </div>

        {/* Location */}
        <div className="space-y-1.5">
          <label className="block font-mono text-[10px] uppercase tracking-wider font-semibold text-zinc-500">
            Location
          </label>
          <input
            type="text"
            {...register("personal.location")}
            className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 font-sans text-xs focus:outline-none focus:border-zinc-400 dark:focus:border-zinc-700 transition-colors"
            placeholder="e.g. New York, NY"
          />
          {errors.personal?.location && (
            <p className="text-[10px] font-mono text-red-500">{errors.personal.location.message}</p>
          )}
        </div>
      </div>
    </div>
  );
}
