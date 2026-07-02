"use client";

import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "destructive" | "outline" | "ghost" | "accent";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center font-mono text-xs uppercase tracking-wider transition-all duration-200 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border cursor-pointer select-none",
          // Nothing aesthetics: sharp corners (rounded-none by default via globals radius 0)
          {
            // Primary: Black in light, White in dark
            "bg-primary text-primary-foreground border-primary hover:bg-transparent hover:text-primary": variant === "primary",
            // Secondary: Light grey in light, Dark grey in dark
            "bg-secondary text-secondary-foreground border-border hover:bg-foreground/5": variant === "secondary",
            // Destructive: Crimson style alert
            "bg-destructive text-destructive-foreground border-destructive hover:bg-transparent hover:text-destructive": variant === "destructive",
            // Outline: Pure border, transparent background
            "bg-transparent text-foreground border-border hover:bg-foreground/5": variant === "outline",
            // Ghost: No border, transparent background
            "bg-transparent text-foreground border-transparent hover:bg-foreground/5": variant === "ghost",
            // Accent: Nothing Red background
            "bg-accent text-accent-foreground border-accent hover:bg-transparent hover:text-accent": variant === "accent",
          },
          {
            "h-8 px-3 text-[10px]": size === "sm",
            "h-10 px-4": size === "md",
            "h-12 px-6 text-sm": size === "lg",
            "h-10 w-10 p-0": size === "icon",
          },
          className
        )}
        {...props}
      >
        {isLoading ? (
          <span className="mr-2 h-3 w-3 animate-spin border-2 border-current border-t-transparent rounded-full" />
        ) : null}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
