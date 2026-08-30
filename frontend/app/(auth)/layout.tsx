"use client";

import React from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { Container } from "@/components/Container";
import { Button } from "@/components/Button";
import { ThemeToggle } from "@/components/ThemeToggle";

/**
 * Authentication & Onboarding Shared Layout
 * 
 * Centralizes the top navigation header, footer, background grid styling,
 * responsiveness gutters, and page transitions for all auth routes.
 * 
 * - Width: Centered container constrained to 680px.
 * - Vertical Offset: Shifts card ~80-100px higher for premium UX placement.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleSignIn = () => {
    router.push("/onboarding/email");
  };

  return (
    <div className="min-h-screen flex flex-col nothing-dot-grid bg-background relative overflow-hidden">
      {/* 1. Shared Onboarding Top Navigation Header */}
      <header className="border-b border-border/80 nothing-glass sticky top-0 z-50 w-full" role="banner">
        <Container size="lg" className="flex h-16 items-center justify-between">
          {/* Logo (routes back to landing page) */}
          <div 
            onClick={() => router.push("/")}
            className="flex items-center select-none cursor-pointer"
            role="button"
            aria-label="Return to landing page"
          >
            {/* Desktop Horizontal Logo */}
            <div className="hidden md:block">
              <Image
                src="/images/logo/logo-horizontal-light.svg"
                alt="Offerly Logo"
                width={130}
                height={30}
                className="dark:hidden block object-contain"
                priority
              />
              <Image
                src="/images/logo/logo-horizontal-dark.svg"
                alt="Offerly Logo"
                width={130}
                height={30}
                className="hidden dark:block object-contain"
                priority
              />
            </div>
            {/* Mobile Icon Logo */}
            <div className="block md:hidden">
              <Image
                src="/images/logo/icon-primary.svg"
                alt="Offerly Icon"
                width={28}
                height={28}
                className="dark:hidden block object-contain"
              />
              <Image
                src="/images/logo/icon-white.svg"
                alt="Offerly Icon"
                width={28}
                height={28}
                className="hidden dark:block object-contain"
              />
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center gap-4">
            <ThemeToggle />
            <Button
              variant="outline"
              size="sm"
              onClick={handleSignIn}
              aria-label="Sign in to your account"
              className="h-9 font-mono text-[10px] tracking-wider"
            >
              <span className="flex items-center gap-1.5">
                Sign In <ArrowUpRight className="h-3 w-3" />
              </span>
            </Button>
          </div>
        </Container>
      </header>

      {/* 2. Centered Page Content Container with Offset */}
      <main className="flex-grow flex items-center justify-center py-12 px-4 relative" role="main">
        <div className="max-w-[680px] w-full mt-[-80px] md:mt-[-100px] z-10">
          {/* Centered Brand Mark */}
          <div className="flex flex-col items-center mb-6 text-center space-y-1">
            <Image
              src="/images/logo/icon-primary.svg"
              alt="Offerly Icon"
              width={40}
              height={40}
              className="dark:hidden block object-contain"
              priority
            />
            <Image
              src="/images/logo/icon-white.svg"
              alt="Offerly Icon"
              width={40}
              height={40}
              className="hidden dark:block object-contain"
              priority
            />
            <h2 className="text-base font-mono font-extrabold tracking-widest uppercase mt-2">OFFERLY</h2>
            <p className="text-[9px] text-muted-foreground uppercase tracking-widest font-mono font-bold">AI CAREER COPILOT</p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 100, damping: 15 }}
          >
            {children}
          </motion.div>
        </div>
      </main>

      {/* 3. Shared Onboarding Footer */}
      <footer className="border-t border-border/40 py-6 text-center font-mono text-[9px] text-muted-foreground uppercase tracking-widest select-none bg-background/50">
        <Container size="lg">
          OFFERLY WORKSPACE_REVISION: v0.1.0-alpha.1
        </Container>
      </footer>
    </div>
  );
}
