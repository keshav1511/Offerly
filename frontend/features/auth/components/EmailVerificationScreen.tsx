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
  const [isSent, setIsSent] = useState(false);

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
      const redirectTo = `${window.location.origin}/auth/callback?next=/resumes`;
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: redirectTo,
        }
      });

      if (authError) {
        const errorDetail = diagnoseSupabaseError(authError);
        setError(errorDetail);
        toast(`Authentication error: ${authError.message}`, "error", 5000);
      } else {
        toast(`Verification link sent to: ${email}`, "success", 4000);
        setIsSent(true);
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

  if (isSent) {
    return (
      <AuthPageTransition>
        <div className="space-y-8">
          {/* Visual Stepper */}
          <OnboardingProgress currentStep={1} />

          <AuthCard>
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-center text-center space-y-4 pt-2">
                <div className="w-12 h-12 rounded-full border border-border flex items-center justify-center bg-accent/5 shadow-sm text-accent animate-pulse">
                  <Mail className="w-6 h-6" />
                </div>
                
                <h1 className="text-xl md:text-2xl font-mono uppercase tracking-wider font-extrabold select-none">
                  Verification link sent
                </h1>
                
                <p className="text-xs text-foreground/80 leading-relaxed font-sans max-w-sm">
                  We&apos;ve sent a verification link to <span className="font-semibold text-zinc-950 dark:text-zinc-50">{email}</span>. Please check your inbox and click the link to verify your account.
                </p>

                <p className="text-[10px] text-muted-foreground leading-relaxed font-mono uppercase max-w-xs pt-1">
                  Didn&apos;t receive it? Check your spam folder or try again.
                </p>
              </div>

              {/* CTAs */}
              <div className="flex flex-col gap-3 pt-4 border-t border-border/60">
                <AuthButton
                  type="button"
                  variant="outline"
                  onClick={() => setIsSent(false)}
                  className="w-full text-xs font-mono uppercase tracking-wider"
                >
                  ← Try Another Email
                </AuthButton>

                {onContinue && (
                  <button
                    type="button"
                    onClick={() => onContinue(email)}
                    className="text-[9px] text-muted-foreground hover:text-foreground font-mono uppercase tracking-widest mt-2 transition-colors cursor-pointer text-center underline underline-offset-4 decoration-border/60"
                  >
                    Enter verification code manually
                  </button>
                )}
              </div>
            </div>
          </AuthCard>
        </div>
      </AuthPageTransition>
    );
  }

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
