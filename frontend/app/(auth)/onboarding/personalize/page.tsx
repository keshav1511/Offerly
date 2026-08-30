"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { Briefcase, MapPin, DollarSign, ArrowRight, Loader2, Compass } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthPageTransition } from "@/features/auth/components/AuthPageTransition";
import { useUpdateProfile, useProfile } from "@/features/auth/hooks/useProfile";

interface PersonalizationInput {
  target_role: string;
  preferred_location: string;
  target_salary_min: number;
  target_salary_max: number;
  work_mode: string;
}

function PersonalizeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resumeId") || "";

  const { data: profile, isLoading } = useProfile();
  const { mutate: updateProfile, mutateAsync: updateProfileAsync } = useUpdateProfile();
  const [saving, setSaving] = useState(false);

  const { register, handleSubmit, reset } = useForm<PersonalizationInput>({
    defaultValues: {
      target_role: "",
      preferred_location: "",
      target_salary_min: 80000,
      target_salary_max: 150000,
      work_mode: "Remote",
    },
  });

  // Persist step state and sync loaded profile data
  useEffect(() => {
    updateProfile({ onboarding_step: "personalize" });
  }, [updateProfile]);

  useEffect(() => {
    if (profile) {
      reset({
        target_role: profile.target_role || "",
        preferred_location: profile.preferred_location || "",
        target_salary_min: profile.target_salary_min || 80000,
        target_salary_max: profile.target_salary_max || 150000,
      });
    }
  }, [profile, reset]);

  const onSubmit = async (data: PersonalizationInput) => {
    setSaving(true);
    try {
      await updateProfileAsync({
        target_role: data.target_role,
        preferred_location: data.preferred_location,
        target_salary_min: Number(data.target_salary_min),
        target_salary_max: Number(data.target_salary_max),
      });
      router.push(`/onboarding/photo?resumeId=${resumeId}`);
    } catch (err) {
      console.error("Failed to save personalization preferences:", err);
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="border border-border p-6 sm:p-12 bg-background/30 text-center rounded-lg space-y-3 font-mono text-xs uppercase">
        <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
        <span>Loading preferences...</span>
      </div>
    );
  }

  return (
    <AuthPageTransition>
      <div className="space-y-6 max-w-xl mx-auto text-left">
        {/* Step Progress Tracker */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
            <span>STEP: CAREER_TARGETS</span>
            <span>4.5 / 5</span>
          </div>
          <div className="h-1 w-full bg-secondary flex gap-0.5" role="progressbar" aria-valuenow={90} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full w-[90%] bg-accent" />
            <div className="h-full w-[10%] bg-secondary" />
          </div>
        </div>

        <AuthCard>
          <AuthHeader
            title="CAREER PREFERENCES"
            subtitle="Let your AI Career Copilot know what opportunities to hunt for."
          />

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            
            {/* Target Role */}
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5 text-accent" />
                Target Job Role *
              </label>
              <input
                placeholder="e.g. Staff Backend Engineer"
                {...register("target_role")}
                className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                required
              />
            </div>

            {/* Preferred Location */}
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                Preferred Location
              </label>
              <input
                placeholder="e.g. San Francisco, CA or Remote"
                {...register("preferred_location")}
                className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
              />
            </div>

            {/* Preferred Work Mode */}
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold flex items-center gap-1.5">
                <Compass className="w-3.5 h-3.5 text-accent" />
                Preferred Work Mode
              </label>
              <select
                {...register("work_mode")}
                className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
              >
                <option value="Remote">Remote Only</option>
                <option value="Hybrid">Hybrid</option>
                <option value="Onsite">Onsite</option>
              </select>
            </div>

            {/* Target Salary Grid */}
            <div className="space-y-1">
              <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold flex items-center gap-1.5">
                <DollarSign className="w-3.5 h-3.5 text-accent" />
                Target Salary Range (USD / Year)
              </label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-0.5">
                  <label className="font-mono text-[8px] uppercase text-zinc-500">Min Salary</label>
                  <input
                    type="number"
                    placeholder="80000"
                    {...register("target_salary_min")}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="space-y-0.5">
                  <label className="font-mono text-[8px] uppercase text-zinc-500">Max Salary</label>
                  <input
                    type="number"
                    placeholder="180000"
                    {...register("target_salary_max")}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            {/* Submit Actions */}
            <div className="pt-2">
              <AuthButton
                type="submit"
                disabled={saving}
                variant="primary"
                fullWidth
                className="py-3 font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-1.5"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <span>Continue to Avatar</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </AuthButton>
            </div>

          </form>
        </AuthCard>
      </div>
    </AuthPageTransition>
  );
}

export default function OnboardingPersonalizationPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    }>
      <PersonalizeContent />
    </Suspense>
  );
}
