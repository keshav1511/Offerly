"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { Container } from "./Container";
import { Menu, X, ArrowUpRight } from "lucide-react";
import { Button } from "./Button";

interface NavbarProps {
  showLinks?: boolean;
}

/**
 * Common Navigation Header
 * 
 * Includes conditional application route linking configurations.
 */
export function Navbar({ showLinks = false }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const navLinks = showLinks ? [
    { name: "Dashboard", href: "/dashboard" },
    { name: "Resumes", href: "/resume" },
    { name: "Jobs Match", href: "/jobs" },
    { name: "Companies", href: "/companies" },
    { name: "Analytics", href: "/analytics" },
  ] : [];

  const handleSignIn = () => {
    setIsOpen(false);
    router.push("/onboarding/email");
  };

  return (
    <nav className="sticky top-0 z-40 w-full border-b border-border/80 nothing-glass" role="navigation">
      <Container size="lg">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center select-none" aria-label="Offerly home">
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
                width={32}
                height={32}
                className="dark:hidden block object-contain"
              />
              <Image
                src="/images/logo/icon-white.svg"
                alt="Offerly Icon"
                width={32}
                height={32}
                className="hidden dark:block object-contain"
              />
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          {showLinks && navLinks.length > 0 && (
            <div className="hidden md:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors"
                >
                  {link.name}
                </Link>
              ))}
            </div>
          )}

          {/* Desktop Right items */}
          <div className="hidden md:flex items-center gap-4">
            <ThemeToggle />
            <Button variant="outline" className="h-9 px-3 font-mono text-[10px] tracking-wider" onClick={handleSignIn} aria-label="Sign in">
              <span className="flex items-center gap-1.5">
                Sign In <ArrowUpRight className="h-3 w-3" />
              </span>
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="flex md:hidden items-center gap-2">
            <ThemeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(!isOpen)}
              className="border-border"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </Container>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 py-6 space-y-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="flex flex-col gap-4">
            {showLinks && navLinks.length > 0 && navLinks.map((link) => (
              <Link
                key={link.name}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="font-mono text-xs uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors py-2 border-b border-border/20"
              >
                {link.name}
              </Link>
            ))}
            <Button variant="primary" className="w-full justify-center font-mono text-[10px] tracking-wider" onClick={handleSignIn} aria-label="Sign in">
              Sign In
            </Button>
          </div>
        </div>
      )}
    </nav>
  );
}
