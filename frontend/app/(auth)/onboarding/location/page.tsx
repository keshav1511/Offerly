"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthPageTransition } from "@/features/auth/components/AuthPageTransition";

/**
 * Onboarding Step 4: Location Preference Page
 */
export default function OnboardingLocationPage() {
  const router = useRouter();

  return (
    <AuthPageTransition>
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
            <span>STEP: LOCATION_PREFERENCE</span>
            <span>4 / 6</span>
          </div>
          <div className="h-1 w-full bg-secondary flex gap-0.5" role="progressbar" aria-valuenow={66} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full w-1/6 bg-accent" />
            <div className="h-full w-1/6 bg-accent" />
            <div className="h-full w-1/6 bg-accent" />
            <div className="h-full w-1/6 bg-accent" />
            <div className="h-full w-2/6 bg-transparent" />
          </div>
        </div>

        <AuthCard>
          <AuthHeader
            title="LOCATION PREFERENCE"
            subtitle="Select your work styles (Remote, On-site, or Hybrid layouts)."
          />

          <div className="border border-border/80 p-8 text-center space-y-4 bg-background/50">
            <div className="mx-auto h-12 w-12 rounded-none bg-primary/5 flex items-center justify-center border border-border">
              <MapPin className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="font-mono text-[10px] text-muted-foreground uppercase tracking-wider">
              [Location map options placeholder]
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-2">
            <AuthButton
              type="button"
              variant="outline"
              onClick={() => router.push("/onboarding/profile")}
              className="w-full sm:w-1/3"
              aria-label="Back to profile setup"
            >
              ← BACK
            </AuthButton>
            <AuthButton
              type="button"
              variant="primary"
              onClick={() => router.push("/onboarding/photo")}
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
