"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Check, FileText } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthPageTransition } from "@/features/auth/components/AuthPageTransition";

/**
 * Onboarding Step 6: Resume Ingestion Setup Page
 */
export default function OnboardingResumePage() {
  const router = useRouter();

  return (
    <AuthPageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
            <span>STEP: RESUME_INGESTION</span>
            <span>6 / 6</span>
          </div>
          <div className="h-1 w-full bg-secondary flex gap-0.5" role="progressbar" aria-valuenow={100} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full w-1/6 bg-accent" />
            <div className="h-full w-1/6 bg-accent" />
            <div className="h-full w-1/6 bg-accent" />
            <div className="h-full w-1/6 bg-accent" />
            <div className="h-full w-1/6 bg-accent" />
            <div className="h-full w-1/6 bg-accent" />
          </div>
        </div>

        <AuthCard>
          <AuthHeader
            title="RESUME INGESTION"
            subtitle="Upload your current CV to start AI parsing and semantic matching."
          />

          <div className="border border-border/80 p-8 text-center space-y-4 bg-background/50">
            <div className="mx-auto h-12 w-12 rounded-none bg-primary/5 flex items-center justify-center border border-border">
              <FileText className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              [Resume dropzone placeholder]
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <AuthButton
              type="button"
              variant="outline"
              onClick={() => router.push("/onboarding/photo")}
              className="w-full sm:w-1/3"
              aria-label="Back to profile picture setup"
            >
              ← BACK
            </AuthButton>
            <AuthButton
              type="button"
              variant="primary"
              onClick={() => router.push("/")}
              className="w-full sm:w-2/3 border border-primary hover:bg-transparent hover:text-foreground"
              aria-label="Finish onboarding"
            >
              FINISH ONBOARDING <Check className="h-3.5 w-3.5 ml-1" />
            </AuthButton>
          </div>
        </AuthCard>
      </div>
    </AuthPageTransition>
  );
}
