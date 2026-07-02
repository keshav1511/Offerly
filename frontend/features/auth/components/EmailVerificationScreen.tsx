"use client";

import React, { useState } from "react";
import { Mail } from "lucide-react";
import { AuthCard } from "./AuthCard";
import { AuthHeader } from "./AuthHeader";
import { AuthButton } from "./AuthButton";
import { AuthInput } from "./AuthInput";
import { AuthPageTransition } from "./AuthPageTransition";
import { OnboardingProgress } from "./OnboardingProgress";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/providers/ToastProvider";
import { diagnoseSupabaseError } from "@/utils/supabaseError";

interface EmailVerificationScreenProps {
  onBack?: () => void;
  onContinue?: (email: string) => void;
}

/**
 * Onboarding Step 1: Email Verification Screen
 * 
 * Production-ready email entry form.
 * Leverages Supabase Client to trigger standard passwordless OTP code dispatches.
 */
export function EmailVerificationScreen({ onBack, onContinue }: EmailVerificationScreenProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSending) return;
    
    if (!email) {
      setError("ERROR: FIELD_REQUIRED");
      toast("Form validation failed: Email is required.", "error", 3000);
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("ERROR: INVALID_EMAIL_FORMAT");
      toast("Form validation failed: Please enter a valid email address.", "error", 3000);
      return;
    }

    setError(null);
    setIsSending(true);

    try {
      // Trigger Supabase OTP send
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
        }
      });

      if (authError) {
        const errorDetail = diagnoseSupabaseError(authError);
        setError(errorDetail);
        toast(`Authentication error: ${authError.message}`, "error", 5000);
      } else {
        toast(`Verification code generated and sent to: ${email}`, "success", 4000);
        if (onContinue) {
          onContinue(email);
        }
      }
    } catch (err: unknown) {
      const errorDetail = diagnoseSupabaseError(err);
      setError(errorDetail);
      toast(errorDetail, "error", 5000);
    } finally {
      setIsSending(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (error) {
      setError(null);
    }
  };

  return (
    <AuthPageTransition>
      <div className="space-y-8">
        {/* Visual Stepper */}
        <OnboardingProgress currentStep={1} />

        <AuthCard>
          <AuthHeader
            title="LET'S GET STARTED."
            subtitle="Enter your email address. We'll send you a verification code to continue."
          />

          {/* Form */}
          <form onSubmit={handleFormSubmit} className="space-y-6" noValidate>
            <AuthInput
              id="email-field"
              type="email"
              label="EMAIL ADDRESS"
              value={email}
              onChange={handleInputChange}
              placeholder="name@example.com"
              error={error}
              icon={<Mail className="h-4 w-4" />}
              disabled={isSending}
              autoFocus
              required
            />

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <AuthButton
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isSending}
                className="w-full sm:w-1/3"
                aria-label="Back to welcome page"
              >
                ← BACK
              </AuthButton>
              <AuthButton
                type="submit"
                variant="primary"
                disabled={isSending}
                className="w-full sm:w-2/3 border border-primary hover:bg-transparent hover:text-foreground"
                aria-label="Continue registration"
              >
                {isSending ? "SENDING..." : "CONTINUE →"}
              </AuthButton>
            </div>
          </form>
        </AuthCard>
      </div>
    </AuthPageTransition>
  );
}
