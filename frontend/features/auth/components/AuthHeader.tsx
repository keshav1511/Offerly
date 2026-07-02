import React from "react";

interface AuthHeaderProps {
  title: string;
  subtitle: string;
  badge?: React.ReactNode;
}

/**
 * AuthHeader
 * 
 * Reusable header module displaying titles, taglines, and optional badges.
 */
export function AuthHeader({ title, subtitle, badge }: AuthHeaderProps) {
  return (
    <div className="space-y-3 text-left">
      {badge && <div className="inline-block">{badge}</div>}
      <h1 className="text-2xl md:text-3xl font-mono uppercase tracking-wider font-extrabold select-none">
        {title}
      </h1>
      <p className="text-xs text-muted-foreground leading-relaxed font-mono tracking-wide uppercase">
        {subtitle}
      </p>
    </div>
  );
}
