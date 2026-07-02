import React from "react";
import Link from "next/link";
import { Container } from "./Container";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-background/50 font-mono text-[10px] uppercase tracking-wider py-12">
      <Container size="lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand block */}
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-sm tracking-tighter">
              <span className="bg-foreground text-background px-1 py-0.5 font-dotmatrix">O</span>
              <span className="font-dotmatrix">OFFERLY</span>
            </div>
            <p className="text-muted-foreground leading-relaxed normal-case tracking-normal text-xs">
              AI-powered Career Copilot for modern job seekers. Ingest resumes, tailors applications, matches opportunities, and tracks outcomes.
            </p>
          </div>

          {/* Links col 1 */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Platform</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/resume" className="text-muted-foreground hover:text-foreground transition-colors">
                  Resume Engineering
                </Link>
              </li>
              <li>
                <Link href="/jobs" className="text-muted-foreground hover:text-foreground transition-colors">
                  Job Matcher
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
                  Application Tracker
                </Link>
              </li>
            </ul>
          </div>

          {/* Links col 2 */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Documentation</h4>
            <ul className="space-y-2">
              <li>
                <a href="/docs/MASTER_PLAN.md" className="text-muted-foreground hover:text-foreground transition-colors">
                  Master Plan
                </a>
              </li>
              <li>
                <a href="/docs/SRS.md" className="text-muted-foreground hover:text-foreground transition-colors">
                  SRS Spec
                </a>
              </li>
              <li>
                <a href="/docs/API_CONVENTIONS.md" className="text-muted-foreground hover:text-foreground transition-colors">
                  API Conventions
                </a>
              </li>
            </ul>
          </div>

          {/* Links col 3 */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Architecture</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-muted-foreground block normal-case tracking-normal text-xs">
                  Client: Next.js 15
                </span>
              </li>
              <li>
                <span className="text-muted-foreground block normal-case tracking-normal text-xs">
                  Engine: FastAPI Async
                </span>
              </li>
              <li>
                <span className="text-muted-foreground block normal-case tracking-normal text-xs">
                  DB: Supabase PostgreSQL
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/40 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-muted-foreground">
          <div>
            © {currentYear} Offerly Inc. All rights reserved.
          </div>
          <div className="flex gap-4">
            <span className="hover:text-foreground transition-colors cursor-pointer">
              Privacy Policy
            </span>
            <span>/</span>
            <span className="hover:text-foreground transition-colors cursor-pointer">
              Terms of Service
            </span>
          </div>
        </div>
      </Container>
    </footer>
  );
}
