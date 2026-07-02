"use client";

import React from "react";
import { cn } from "@/utils/cn";

interface OnboardingProgressProps {
  currentStep: 1 | 2 | 3;
}

/**
 * Onboarding Progress Visual Stepper
 * 
 * Renders a high-contrast progress tracker:
 * Authentication
 * ●────○────○
 * Email Verify Complete
 */
export function OnboardingProgress({ currentStep }: OnboardingProgressProps) {
  const steps = [
    { id: 1, label: "Email" },
    { id: 2, label: "Verify" },
    { id: 3, label: "Complete" },
  ];

  return (
    <div className="space-y-4 font-mono select-none" aria-label="Onboarding progress tracker">
      {/* Upper header */}
      <div className="flex justify-between items-center text-[9px] uppercase tracking-widest text-muted-foreground/60">
        <span>AUTHENTICATION</span>
        <span>{currentStep} / 3</span>
      </div>

      {/* Segmented Stepper */}
      <div className="flex items-center justify-between relative px-2 py-1">
        {/* Background Line */}
        <div className="absolute top-[9px] left-3 right-3 h-[1px] bg-border/80 -z-10" />

        {steps.map((step) => {
          const isDone = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <div key={step.id} className="flex flex-col items-center bg-background px-3">
              {/* Dot */}
              <div
                className={cn(
                  "h-2.5 w-2.5 rounded-full border transition-all duration-300",
                  {
                    "bg-foreground border-foreground": isDone, // Done steps are monochrome filled
                    "bg-accent border-accent": isActive,       // Active step is Nothing Red
                    "bg-background border-border": !isDone && !isActive,
                  }
                )}
                aria-current={isActive ? "step" : undefined}
              />
              
              {/* Label */}
              <span
                className={cn(
                  "text-[9px] uppercase tracking-wider mt-2.5 font-bold transition-all duration-300",
                  {
                    "text-foreground": isActive || isDone,
                    "text-muted-foreground/45": !isDone && !isActive,
                  }
                )}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
