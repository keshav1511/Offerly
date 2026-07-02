"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { AuthCard } from "./AuthCard";
import { AuthHeader } from "./AuthHeader";
import { AuthButton } from "./AuthButton";
import { AuthPageTransition } from "./AuthPageTransition";
import { useToast } from "@/providers/ToastProvider";

/**
 * Onboarding Welcome Screen Component
 * 
 * Re-architected to consume shared auth layouts, buttons, and headers.
 */
export function WelcomeScreen() {
  const { toast } = useToast();
  const router = useRouter();

  const handleGetStarted = () => {
    toast("Redirecting to email verification...", "success", 2000);
    router.push("/onboarding/email");
  };

  const handleSignIn = () => {
    toast("Opening credentials authentication panel...", "info", 4000);
  };

  const Badge = (
    <span className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-secondary/50 font-mono text-[9px] uppercase tracking-widest text-muted-foreground select-none">
      <span className="h-1 w-1 bg-accent rounded-full animate-ping" />
      AUTHENTICATION_ONBOARDING
    </span>
  );

  return (
    <AuthPageTransition>
      <AuthCard>
        <AuthHeader
          title="OFFERLY."
          subtitle="YOUR AI CAREER COPILOT"
          badge={Badge}
        />

        {/* Pitch Description */}
        <div className="font-mono text-xs md:text-sm text-muted-foreground leading-relaxed uppercase tracking-wider space-y-1.5 select-none text-left border-l-2 border-border/80 pl-4 py-1">
          <p>FIND THE RIGHT OPPORTUNITIES.</p>
          <p>TAILOR YOUR RESUME WITH AI.</p>
          <p>TRACK EVERY APPLICATION—ALL IN ONE PLACE.</p>
        </div>

        {/* Actions Grid */}
        <div className="pt-2 space-y-4 max-w-sm mx-auto">
          <AuthButton
            onClick={handleGetStarted}
            size="lg"
            variant="primary"
            fullWidth
            aria-label="Get started with onboarding"
          >
            GET STARTED
          </AuthButton>
          
          <button
            onClick={handleSignIn}
            className="block w-full text-center font-mono text-[10px] text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest hover:underline focus:outline-none focus:ring-1 focus:ring-ring py-2 cursor-pointer"
            aria-label="Already have an account? Sign in"
          >
            ALREADY HAVE AN ACCOUNT? SIGN IN
          </button>
        </div>
      </AuthCard>
    </AuthPageTransition>
  );
}
