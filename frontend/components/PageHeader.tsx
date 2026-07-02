import React from "react";
import { cn } from "@/utils/cn";

export interface PageHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, actions, className, ...props }: PageHeaderProps) {
  return (
    <div
      className={cn(
        "border-b border-border/80 pb-6 mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4",
        className
      )}
      {...props}
    >
      <div className="space-y-1.5">
        <h1 className="text-xl md:text-2xl font-mono uppercase tracking-wider font-bold">
          {title}
        </h1>
        {description && (
          <p className="text-xs text-muted-foreground leading-relaxed max-w-2xl">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="flex items-center gap-3 shrink-0">{actions}</div>}
    </div>
  );
}
