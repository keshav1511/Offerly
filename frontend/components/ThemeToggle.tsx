"use client";

import React from "react";
import { Sun, Moon } from "lucide-react";
import { useTheme } from "@/providers/ThemeProvider";
import { Button } from "./Button";
import { useToast } from "@/providers/ToastProvider";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const toggleTheme = () => {
    if (theme === "light") {
      setTheme("dark");
      toast("Switched to dark theme", "info", 2000);
    } else if (theme === "dark") {
      setTheme("system");
      toast("Switched to system theme", "info", 2000);
    } else {
      setTheme("light");
      toast("Switched to light theme", "info", 2000);
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="border-border hover:border-foreground/30 relative"
      aria-label="Toggle theme color mode"
    >
      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
      <span className="sr-only">Toggle Theme</span>
    </Button>
  );
}
