"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { EmailVerificationScreen } from "@/features/auth/components/EmailVerificationScreen";

/**
 * Onboarding Email Verification Page
 * 
 * Renders the email input interface. Configures standard router pushes
 * for back/continue event triggers.
 */
export default function OnboardingEmailPage() {
  const router = useRouter();

  const handleBack = () => {
    // Back button returns to the marketing Landing page
    router.push("/");
  };

  const handleContinue = (email: string) => {
    // Directs user to the OTP page, passing email as query param
    router.push(`/onboarding/otp?email=${encodeURIComponent(email)}`);
  };

  return (
    <EmailVerificationScreen
      onBack={handleBack}
      onContinue={handleContinue}
    />
  );
}
