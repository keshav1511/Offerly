"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "./AuthCard";
import { AuthHeader } from "./AuthHeader";
import { AuthButton } from "./AuthButton";
import { AuthPageTransition } from "./AuthPageTransition";
import { OnboardingProgress } from "./OnboardingProgress";
import { OtpInput } from "./OtpInput";
import { supabase } from "@/lib/supabase/client";
import { useToast } from "@/providers/ToastProvider";
import { diagnoseSupabaseError } from "@/utils/supabaseError";

interface OtpVerificationScreenProps {
  email?: string;
  onBack?: () => void;
  onContinue?: () => void;
}

/**
 * OtpVerificationScreen
 * 
 * Production-ready email OTP verification screen.
 * Leverages official Supabase Client to trigger OTP verification and code resends.
 * Features strict type-safety, loading disabled locks, error feedback, and countdowns.
 */
export function OtpVerificationScreen({ email = "user@example.com", onBack, onContinue }: OtpVerificationScreenProps) {
  const { toast } = useToast();
  const router = useRouter();
  
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(60);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Timer countdown hook
  useEffect(() => {
    if (timer <= 0) return;
    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [timer]);

  const handleOtpChange = (newOtp: string[]) => {
    setOtp(newOtp);
    if (errorMessage) {
      setErrorMessage(null);
    }
  };

  const isOtpComplete = otp.every((digit) => digit !== "");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isOtpComplete || isVerifying) return;

    const token = otp.join("");
    setIsVerifying(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Primary verification: type signup
      let { data, error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: "signup",
      });

      // Fallback verification: type email
      if (error) {
        const fallback = await supabase.auth.verifyOtp({
          email,
          token,
          type: "email",
        });
        if (!fallback.error) {
          data = fallback.data;
          error = null;
        } else {
          error = fallback.error;
        }
      }

      if (error) {
        const errorDetail = diagnoseSupabaseError(error);
        setErrorMessage(errorDetail);
        toast(`Verification failed: ${error.message}`, "error", 5000);
      } else {
        setSuccessMessage("VERIFICATION SUCCESSFUL! REDIRECTING...");
        toast("Email successfully verified!", "success", 2000);
        
        // Brief transition delay before routing
        setTimeout(() => {
          if (onContinue) {
            onContinue();
          } else {
            router.push("/onboarding/profile");
          }
        }, 1500);
      }
    } catch (err: unknown) {
      const errorDetail = diagnoseSupabaseError(err);
      setErrorMessage(errorDetail);
      toast(errorDetail, "error", 5000);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || isResending || isVerifying) return;

    setIsResending(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      // Primary resend request: type signup
      let { error } = await supabase.auth.resend({
        type: "signup",
        email,
      });

      // Fallback: signInWithOtp (magic link/OTP code)
      if (error) {
        const fallback = await supabase.auth.signInWithOtp({
          email,
        });
        if (!fallback.error) {
          error = null;
        } else {
          error = fallback.error;
        }
      }

      if (error) {
        const errorDetail = diagnoseSupabaseError(error);
        setErrorMessage(errorDetail);
        toast(`Resend failed: ${error.message}`, "error", 5000);
      } else {
        setTimer(60);
        toast(`A new verification code has been sent to: ${email}`, "success", 4000);
      }
    } catch (err: unknown) {
      const errorDetail = diagnoseSupabaseError(err);
      setErrorMessage(errorDetail);
      toast(errorDetail, "error", 5000);
    } finally {
      setIsResending(false);
    }
  };

  // Helper formatting for 00:XX style countdown timer display
  const formatTime = (seconds: number) => {
    const min = String(Math.floor(seconds / 60)).padStart(2, "0");
    const sec = String(seconds % 60).padStart(2, "0");
    return `${min}:${sec}`;
  };

  return (
    <AuthPageTransition>
      <div className="space-y-8">
        <OnboardingProgress currentStep={2} />

        <AuthCard>
          <AuthHeader
            title="VERIFY YOUR EMAIL"
            subtitle={`CODE SENT TO ${email}`}
          />

          <form onSubmit={handleVerify} className="space-y-6">
            <OtpInput
              value={otp}
              onChange={handleOtpChange}
              disabled={isVerifying || isResending}
              error={!!errorMessage}
            />

            {/* Notification messages */}
            {errorMessage && (
              <p className="font-mono text-[10px] text-destructive text-center uppercase tracking-wider animate-in fade-in duration-200" role="alert">
                {errorMessage}
              </p>
            )}

            {successMessage && (
              <p className="font-mono text-[10px] text-accent text-center uppercase tracking-wider animate-in fade-in duration-200" role="status">
                {successMessage}
              </p>
            )}

            {/* Resend Timer Segment */}
            <div className="text-center font-mono text-[10px] tracking-wider uppercase select-none">
              {timer > 0 ? (
                <p className="text-muted-foreground">
                  RESEND IN <span className="font-bold text-accent">{formatTime(timer)}</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={isResending || isVerifying}
                  className="font-bold text-foreground hover:text-accent border-b border-dashed border-foreground hover:border-accent transition-colors py-0.5 focus:outline-none focus:ring-1 focus:ring-ring cursor-pointer uppercase disabled:opacity-40 disabled:cursor-not-allowed"
                  aria-label="Resend verification email code"
                >
                  {isResending ? "RESENDING..." : "RESEND CODE"}
                </button>
              )}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <AuthButton
                type="button"
                variant="outline"
                onClick={onBack}
                disabled={isVerifying || isResending}
                className="w-full sm:w-1/3"
                aria-label="Change email address"
              >
                ← CHANGE EMAIL
              </AuthButton>
              
              <AuthButton
                type="submit"
                variant="primary"
                disabled={!isOtpComplete || isVerifying || isResending}
                className="w-full sm:w-2/3 border border-primary hover:bg-transparent hover:text-foreground"
                aria-label="Verify entered code and continue"
              >
                {isVerifying ? "VERIFYING..." : "VERIFY →"}
              </AuthButton>
            </div>
          </form>
        </AuthCard>
      </div>
    </AuthPageTransition>
  );
}
