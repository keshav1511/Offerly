"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Sparkles, Loader2, ArrowRight, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthPageTransition } from "@/features/auth/components/AuthPageTransition";
import { useUpdateProfile } from "@/features/auth/hooks/useProfile";

function SuccessContent() {
  const router = useRouter();

  const { mutate: updateProfile, mutateAsync: updateProfileAsync } = useUpdateProfile();
  const [finishing, setFinishing] = useState(false);

  useEffect(() => {
    updateProfile({ onboarding_step: "success" });
  }, [updateProfile]);

  const handleFinish = async () => {
    setFinishing(true);
    try {
      // Mark onboarding as completed in the database
      await updateProfileAsync({
        onboarding_completed: true,
      });
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to complete onboarding:", err);
      // Fallback redirect
      router.push("/dashboard");
    } finally {
      setFinishing(false);
    }
  };

  return (
    <AuthPageTransition>
      <div className="space-y-6 max-w-md mx-auto text-left">
        {/* Step Progress Tracker */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
            <span>STEP: ONBOARDING_SUCCESS</span>
            <span>5 / 5</span>
          </div>
          <div className="h-1 w-full bg-accent" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100} />
        </div>

        <AuthCard>
          <div className="text-center py-6 space-y-6">
            {/* Glowing Icon Container */}
            <div className="relative mx-auto w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center border border-emerald-500/30 animate-pulse">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
              <div className="absolute -top-1 -right-1">
                <Sparkles className="w-4 h-4 text-accent animate-bounce" />
              </div>
            </div>

            <AuthHeader
              title="MISSION CONTROL READY"
              subtitle="Your Career Profile is compiled and the AI Copilot is fully configured."
            />

            {/* Checklist of what was accomplished */}
            <div className="border border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-zinc-950/40 p-4 rounded-lg text-left space-y-3 font-mono text-[10px] uppercase">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Master Resume Ingested</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>AI Entities Extracted</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Target Preferences Calibrated</span>
              </div>
              <div className="flex items-center gap-2">
                <Zap className="w-3.5 h-3.5 text-accent animate-pulse" />
                <span>Career Dashboard Activated</span>
              </div>
            </div>

            {/* Action button to proceed */}
            <div className="pt-2">
              <AuthButton
                type="button"
                onClick={handleFinish}
                disabled={finishing}
                variant="primary"
                fullWidth
                className="py-3 font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-1.5"
              >
                {finishing ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Launching...</span>
                  </>
                ) : (
                  <>
                    <span>Enter Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </AuthButton>
            </div>
          </div>
        </AuthCard>
      </div>
    </AuthPageTransition>
  );
}

export default function OnboardingSuccessPage() {
  return <SuccessContent />;
}
