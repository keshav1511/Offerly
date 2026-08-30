import React from "react";
import { Card, CardContent } from "@/components/Card";
import { cn } from "@/utils/cn";

interface AuthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

/**
 * AuthCard
 * 
 * Reusable card container wrapper for authentication screens.
 * Centralizes corner radii, borders, responsive padding, and background filters.
 */
export function AuthCard({ children, className, ...props }: AuthCardProps) {
  return (
    <Card variant="glass" className={cn("border-border", className)} {...props}>
      <CardContent className="p-5 sm:p-8 md:p-12 space-y-8">
        {children}
      </CardContent>
    </Card>
  );
}
