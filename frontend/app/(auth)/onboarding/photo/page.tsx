"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { Camera } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthPageTransition } from "@/features/auth/components/AuthPageTransition";

/**
 * Onboarding Step 5: Profile Picture Preference Page
 */
export default function OnboardingPhotoPage() {
  const router = useRouter();

  return (
    <AuthPageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
            <span>STEP: PROFILE_PICTURE</span>
            <span>5 / 6</span>
          </div>
          <div className="h-1 w-full bg-secondary flex gap-0.5" role="progressbar" aria-valuenow={83} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full w-1/6 bg-accent" />
            <div className="h-full w-1/6 bg-accent" />
            <div className="h-full w-1/6 bg-accent" />
            <div className="h-full w-1/6 bg-accent" />
            <div className="h-full w-1/6 bg-accent" />
            <div className="h-full w-1/6 bg-transparent" />
          </div>
        </div>

        <AuthCard>
          <AuthHeader
            title="PROFILE PICTURE"
            subtitle="Upload an optional profile picture for your matching profile card."
          />

          <div className="border border-border/80 p-8 text-center space-y-4 bg-background/50">
            <div className="mx-auto h-12 w-12 rounded-none bg-primary/5 flex items-center justify-center border border-border">
              <Camera className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              [Profile picture dropzone placeholder]
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <AuthButton
              type="button"
              variant="outline"
              onClick={() => router.push("/onboarding/location")}
              className="w-full sm:w-1/3"
              aria-label="Back to location preferences"
            >
              ← BACK
            </AuthButton>
            <AuthButton
              type="button"
              variant="primary"
              onClick={() => router.push("/onboarding/resume")}
              className="w-full sm:w-2/3 border border-primary hover:bg-transparent hover:text-foreground"
              aria-label="Continue registration"
            >
              CONTINUE →
            </AuthButton>
          </div>
        </AuthCard>
      </div>
    </AuthPageTransition>
  );
}
