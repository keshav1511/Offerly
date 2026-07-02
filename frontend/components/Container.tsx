import React from "react";
import { cn } from "@/utils/cn";

export interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl" | "full";
}

export function Container({ className, size = "lg", ...props }: ContainerProps) {
  return (
    <div
      className={cn(
        "mx-auto px-4 sm:px-6 lg:px-8 w-full",
        {
          "max-w-3xl": size === "sm",
          "max-w-5xl": size === "md",
          "max-w-7xl": size === "lg",
          "max-w-[90rem]": size === "xl",
          "max-w-full": size === "full",
        },
        className
      )}
      {...props}
    />
  );
}
