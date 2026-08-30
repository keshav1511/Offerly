"use client";

import React, { useState, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, AlertCircle, RefreshCw, ArrowLeft, CheckCircle2 } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeService } from "@/features/resume/services/resume.service";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { Button } from "@/components/Button";
import { AuthPageTransition } from "@/features/auth/components/AuthPageTransition";

import { useUpdateProfile } from "@/features/auth/hooks/useProfile";

const DISCOVERY_MESSAGES = [
  "Reading your Master Resume...",
  "Detecting GitHub profile...",
  "Extracting technical skills...",
  "Identifying leadership experience...",
  "Classifying career stage...",
  "Building your Career Profile..."
];

function ExtractResumeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resumeId") || "";
  const { mutate: updateProfile } = useUpdateProfile();

  useEffect(() => {
    updateProfile({ onboarding_step: "extract" });
  }, [updateProfile]);
  const queryClient = useQueryClient();

  const [activeMessageIndex, setActiveMessageIndex] = useState(0);
  const [fakeProgress, setFakeProgress] = useState(0);
  const triggerRef = useRef(false);

  // TanStack Mutation for parsing triggering
  const { mutate, isPending, isError, error, isSuccess, reset } = useMutation({
    mutationKey: ["parse-resume", resumeId],
    mutationFn: async () => {
      if (!resumeId) throw new Error("No Master Resume ID provided.");
      return await resumeService.parseResume(resumeId, true);
    },
    onSuccess: () => {
      // Invalidate queries so subsequent steps have fresh data
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["structured-resume", resumeId] });
      queryClient.invalidateQueries({ queryKey: ["resume", resumeId] });
      
      // Complete visual progress, pause for user perception, then navigate
      setFakeProgress(100);
      setTimeout(() => {
        router.push(`/onboarding/discovery?resumeId=${resumeId}`);
      }, 1000);
    }
  });

  // 1. Cycle status messages
  useEffect(() => {
    if (!isPending) return;
    const interval = setInterval(() => {
      setActiveMessageIndex((prev) => (prev + 1) % DISCOVERY_MESSAGES.length);
    }, 2500);
    return () => clearInterval(interval);
  }, [isPending]);

  // 2. Animate progress bar incrementally up to 95%
  useEffect(() => {
    if (!isPending) return;
    const interval = setInterval(() => {
      setFakeProgress((prev) => {
        if (prev >= 95) return 95;
        // Increase faster in beginning, slower near end
        const increment = prev < 50 ? 5 : 2;
        return prev + increment;
      });
    }, 400);
    return () => clearInterval(interval);
  }, [isPending]);

  // 3. Trigger auto-start on mount
  useEffect(() => {
    if (resumeId && !triggerRef.current) {
      triggerRef.current = true;
      mutate();
    }
  }, [resumeId, mutate]);

  const handleRetry = () => {
    reset();
    setFakeProgress(0);
    setActiveMessageIndex(0);
    mutate();
  };

  const handleBack = () => {
    router.push("/onboarding/resume");
  };

  return (
    <AuthPageTransition>
      <div className="space-y-6">
        {/* Step Progress Tracker */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
            <span>STEP: MASTER_RESUME_PARSING</span>
            <span>2 / 5</span>
          </div>
          <div className="h-1 w-full bg-secondary flex gap-0.5" role="progressbar" aria-valuenow={40} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full w-2/5 bg-accent" />
            <div className="h-full w-3/5 bg-secondary" />
          </div>
        </div>

        <AuthCard>
          <AuthHeader
            title="ANALYZING MASTER RESUME"
            subtitle="AI is extracting domains, tech stacks, experience levels, and links to construct your Career Profile."
          />

          {isPending && (
            <div className="border border-border p-5 sm:p-8 bg-background/30 space-y-6 text-center rounded-lg">
              <div className="flex flex-col items-center justify-center space-y-3">
                <Loader2 className="w-8 h-8 text-accent animate-spin" />
                <p className="text-xs font-mono uppercase tracking-wider font-semibold animate-pulse">
                  {DISCOVERY_MESSAGES[activeMessageIndex]}
                </p>
                <p className="text-[10px] text-muted-foreground font-mono uppercase">
                  Performing multidimensional skill classification...
                </p>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[9px] font-mono text-muted-foreground uppercase">
                  <span>Extraction progress</span>
                  <span>{fakeProgress}%</span>
                </div>
                <div className="w-full bg-secondary h-1.5 overflow-hidden">
                  <div
                    className="bg-accent h-full transition-all duration-300"
                    style={{ width: `${fakeProgress}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {isSuccess && (
            <div className="border border-border p-5 sm:p-8 bg-background/30 space-y-4 text-center rounded-lg">
              <div className="flex flex-col items-center justify-center space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 animate-bounce" />
                <p className="text-xs font-mono uppercase tracking-wider font-semibold text-emerald-500">
                  Parsing Completed!
                </p>
                <p className="text-[10px] text-muted-foreground font-mono uppercase">
                  Compiling Discovery Metrics...
                </p>
              </div>
              <div className="w-full bg-secondary h-1.5 overflow-hidden">
                <div className="bg-emerald-500 h-full w-full" />
              </div>
            </div>
          )}

          {isError && (
            <div className="space-y-6">
              <div className="flex items-start gap-2.5 p-4 border border-destructive/25 rounded bg-destructive/5 text-left">
                <AlertCircle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-semibold text-destructive font-mono uppercase">Extraction Interrupted</h4>
                  <p className="text-[10px] font-mono text-destructive leading-relaxed uppercase">
                    {error instanceof Error ? error.message : "An unexpected parsing error occurred. Please try again."}
                  </p>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  className="flex-1 font-mono text-[10px] uppercase border-zinc-200 dark:border-zinc-800 text-zinc-500 flex items-center justify-center gap-1.5"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Start Over</span>
                </Button>
                <Button
                  type="button"
                  onClick={handleRetry}
                  className="flex-1 font-mono text-[10px] uppercase bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 flex items-center justify-center gap-1.5"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Retry Parse</span>
                </Button>
              </div>
            </div>
          )}
        </AuthCard>
      </div>
    </AuthPageTransition>
  );
}

export default function OnboardingExtractPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    }>
      <ExtractResumeContent />
    </Suspense>
  );
}
