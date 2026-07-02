import React from "react";

interface AuthDividerProps {
  text?: string;
}

/**
 * AuthDivider
 * 
 * Renders a high-contrast monospaced divider line (e.g. ─── OR ───).
 * Used for separating credentials and OAuth providers.
 */
export function AuthDivider({ text = "OR" }: AuthDividerProps) {
  return (
    <div className="flex items-center justify-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/35 select-none py-2" role="separator">
      <div className="flex-grow h-[1px] bg-border/50" />
      <span className="px-3 font-bold">{text}</span>
      <div className="flex-grow h-[1px] bg-border/50" />
    </div>
  );
}
