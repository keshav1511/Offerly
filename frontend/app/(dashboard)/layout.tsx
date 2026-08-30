"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { LayoutDashboard, FileText, Briefcase, Building2, Settings, Menu, X, LogOut } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";

interface SidebarLinkProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

function SidebarLink({ href, icon, label, active, onClick }: SidebarLinkProps) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 px-4 py-2.5 rounded-md font-mono text-xs uppercase tracking-wider font-semibold transition-all duration-200 border ${
        active
          ? "bg-zinc-900 text-white border-zinc-900 dark:bg-white dark:text-zinc-950 dark:border-white shadow-sm"
          : "text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 border-transparent dark:text-zinc-400 dark:hover:text-zinc-100 dark:hover:bg-zinc-900/60"
      }`}
    >
      <span className="shrink-0">{icon}</span>
      <span>{label}</span>
    </Link>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { href: "/dashboard", label: "Dashboard", icon: <LayoutDashboard className="w-4 h-4" /> },
    { href: "/resumes", label: "Resumes", icon: <FileText className="w-4 h-4" /> },
    { href: "/jobs", label: "Jobs", icon: <Briefcase className="w-4 h-4" /> },
    { href: "/companies", label: "Companies", icon: <Building2 className="w-4 h-4" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row">
      {/* Mobile Top Navbar */}
      <header className="flex md:hidden items-center justify-between px-5 py-4 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-900 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Image
            src="/images/logo/icon-primary.svg"
            alt="Offerly Logo"
            width={24}
            height={24}
            className="w-6 h-6 object-contain"
          />
          <span className="font-mono text-xs uppercase tracking-widest font-extrabold text-zinc-900 dark:text-zinc-50">
            Offerly
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <button
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="w-8 h-8 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400"
          >
            {isMobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 border-r border-zinc-200 dark:border-zinc-900 bg-white dark:bg-zinc-950 p-6 shrink-0 justify-between">
        <div className="space-y-8">
          {/* Logo Header */}
          <Link href="/dashboard" className="flex items-center gap-2.5 px-2">
            <Image
              src="/images/logo/icon-primary.svg"
              alt="Offerly Logo"
              width={26}
              height={26}
              className="w-6.5 h-6.5 object-contain"
            />
            <span className="font-mono text-sm uppercase tracking-widest font-black text-zinc-900 dark:text-zinc-50">
              Offerly
            </span>
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-col gap-2">
            {navigation.map((item) => (
              <SidebarLink
                key={item.href}
                href={item.href}
                icon={item.icon}
                label={item.label}
                active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
              />
            ))}
          </nav>
        </div>

        {/* Footer & Controls */}
        <div className="space-y-5 border-t border-zinc-100 dark:border-zinc-900 pt-5">
          <div className="flex items-center justify-between px-2">
            <span className="font-mono text-[10px] uppercase tracking-wider text-zinc-400 dark:text-zinc-500 font-semibold">
              Theme Mode
            </span>
            <ThemeToggle />
          </div>

          <Link
            href="/onboarding/email"
            className="flex items-center gap-3 px-4 py-2.5 rounded-md font-mono text-xs uppercase tracking-wider font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 border border-transparent transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </Link>
        </div>
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="md:hidden fixed inset-0 z-40 bg-zinc-950/30 backdrop-blur-sm flex justify-end">
          <div className="w-64 bg-white dark:bg-zinc-950 p-6 flex flex-col justify-between border-l border-zinc-200 dark:border-zinc-900 animate-in slide-in-from-right duration-250">
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <Link href="/dashboard" className="flex items-center gap-2">
                  <Image
                    src="/images/logo/icon-primary.svg"
                    alt="Offerly Logo"
                    width={22}
                    height={22}
                    className="w-5.5 h-5.5 object-contain"
                  />
                  <span className="font-mono text-xs uppercase tracking-widest font-bold text-zinc-900 dark:text-zinc-50">
                    Offerly
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileOpen(false)}
                  className="w-7 h-7 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <nav className="flex flex-col gap-2">
                {navigation.map((item) => (
                  <SidebarLink
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    active={pathname === item.href || pathname.startsWith(`${item.href}/`)}
                    onClick={() => setIsMobileOpen(false)}
                  />
                ))}
              </nav>
            </div>

            <Link
              href="/onboarding/email"
              className="flex items-center gap-3 px-4 py-2.5 rounded-md font-mono text-xs uppercase tracking-wider font-semibold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/10 border border-transparent transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </Link>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        <div className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
