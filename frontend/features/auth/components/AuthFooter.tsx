import React from "react";

interface AuthFooterProps {
  children?: React.ReactNode;
}

/**
 * AuthFooter
 * 
 * Reusable footer sub-element for terms, guidelines, and extra onboarding helpers.
 */
export function AuthFooter({ children }: AuthFooterProps) {
  return (
    <div className="text-center font-mono text-[10px] uppercase tracking-wider text-muted-foreground select-none">
      {children}
    </div>
  );
}
