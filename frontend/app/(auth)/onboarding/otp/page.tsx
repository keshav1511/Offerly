"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OtpVerificationScreen } from "@/features/auth/components/OtpVerificationScreen";

/**
 * OtpContent Component
 * 
 * Extracts searchParams within a safe Suspense context.
 */
function OtpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "user@example.com";

  const handleBack = () => {
    // Back button returns to the Email Verification step
    router.push("/onboarding/email");
  };

  const handleContinue = () => {
    // Redirects user to the resume upload onboarding step
    router.push("/onboarding/resume");
  };

  return (
    <OtpVerificationScreen
      email={email}
      onBack={handleBack}
      onContinue={handleContinue}
    />
  );
}

/**
 * Onboarding OTP Verification Page
 * 
 * Wraps searchParams query extraction in Suspense to prevent Next.js 15
 * compilation warnings.
 */
export default function OnboardingOtpPage() {
  return (
    <Suspense 
      fallback={
        <div className="min-h-screen flex items-center justify-center font-mono text-xs text-muted-foreground bg-background">
          LOADING VERIFICATION PARAMETERS...
        </div>
      }
    >
      <OtpContent />
    </Suspense>
  );
}
