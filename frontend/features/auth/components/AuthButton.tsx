import React from "react";
import { Button, ButtonProps } from "@/components/Button";
import { cn } from "@/utils/cn";

interface AuthButtonProps extends ButtonProps {
  fullWidth?: boolean;
}

/**
 * AuthButton
 * 
 * Reusable buttons configuration built on top of basic Button primitives.
 * Applies custom font sizes, text conversions, and widths for auth card actions.
 */
export function AuthButton({ children, fullWidth = false, className, ...props }: AuthButtonProps) {
  return (
    <Button
      className={cn(
        "font-mono text-[10px] tracking-widest font-bold uppercase justify-center transition-all",
        fullWidth ? "w-full" : "",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
