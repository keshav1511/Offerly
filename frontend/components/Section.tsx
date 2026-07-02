import React from "react";
import { cn } from "@/utils/cn";

export interface SectionProps extends React.HTMLAttributes<HTMLElement> {
  background?: "default" | "muted" | "dot-grid";
}

export function Section({ className, background = "default", ...props }: SectionProps) {
  return (
    <section
      className={cn(
        "py-16 md:py-24 relative overflow-hidden border-b border-border/20",
        {
          "bg-background": background === "default",
          "bg-secondary/30": background === "muted",
          "nothing-dot-grid bg-background": background === "dot-grid",
        },
        className
      )}
      {...props}
    />
  );
}
