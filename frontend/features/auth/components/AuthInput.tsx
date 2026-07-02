import React from "react";
import { cn } from "@/utils/cn";

interface AuthInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string | null;
  helperText?: string;
  icon?: React.ReactNode;
}

/**
 * AuthInput
 * 
 * Shared input element with label, icon prefix support, error states, and outlines.
 */
export const AuthInput = React.forwardRef<HTMLInputElement, AuthInputProps>(
  ({ label, error, helperText, icon, className, ...props }, ref) => {
    return (
      <div className="space-y-2">
        {label && (
          <label
            htmlFor={props.id}
            className="block font-mono text-[10px] uppercase tracking-widest text-muted-foreground font-bold"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-muted-foreground/60">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            className={cn(
              "w-full h-11 bg-background border font-mono text-xs tracking-wider outline-none transition-colors rounded-none placeholder:text-muted-foreground/35",
              icon ? "pl-11 pr-4" : "px-4",
              error 
                ? "border-destructive text-destructive focus:border-destructive focus:ring-1 focus:ring-destructive" 
                : "border-border text-foreground focus:border-accent focus:ring-1 focus:ring-accent",
              props.disabled && "opacity-50 cursor-not-allowed bg-secondary/25",
              className
            )}
            aria-invalid={error ? "true" : "false"}
            {...props}
          />
        </div>
        
        {error && (
          <p
            className="font-mono text-[9px] text-destructive uppercase tracking-widest animate-in fade-in duration-200"
            role="alert"
          >
            {error}
          </p>
        )}

        {!error && helperText && (
          <p className="font-mono text-[9px] text-muted-foreground/60 uppercase tracking-widest">
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

AuthInput.displayName = "AuthInput";
