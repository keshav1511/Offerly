"use client";

import React from "react";
import { ThemeProvider } from "./ThemeProvider";
import { ToastProvider } from "./ToastProvider";
import { QueryProvider } from "./QueryProvider";

export function ApplicationProvider({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <ThemeProvider defaultTheme="system" storageKey="offerly-theme">
        <ToastProvider>
          {children}
        </ToastProvider>
      </ThemeProvider>
    </QueryProvider>
  );
}
