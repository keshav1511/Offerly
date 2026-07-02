"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { Container } from "@/components/Container";
import { Section } from "@/components/Section";
import { Button } from "@/components/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { 
  FileText, 
  CheckSquare, 
  Cpu, 
  ChevronRight,
  Database
} from "lucide-react";
import { useToast } from "@/providers/ToastProvider";

export default function Home() {
  const { toast } = useToast();
  const router = useRouter();

  const handleCTA = () => {
    toast("Loading onboarding flow...", "info", 1500);
    router.push("/onboarding/email");
  };

  const features = [
    {
      icon: <FileText className="h-6 w-6 text-accent" />,
      title: "Resume Engineering",
      description: "Tailor and rebuild resumes for specific roles. Extract segments, run gap analysis, and generate PDF versions instantly."
    },
    {
      icon: <Cpu className="h-6 w-6 text-foreground" />,
      title: "AI Semantic Matching",
      description: "Map resumes to job details using high-dimensional cosine similarity. Highlight critical, secondary, and missing skills."
    },
    {
      icon: <CheckSquare className="h-6 w-6 text-foreground" />,
      title: "Kanban Board Tracker",
      description: "Track progress from bookmarks to interviews and contract signing. Centralize company files and salaries in one panel."
    }
  ];

  const sprints = [
    { number: "0", title: "Scaffolding & Docs", desc: "Define folders, API routes, database models, and coding standards. (Current)", status: "done" },
    { number: "1", title: "User & Profiles", desc: "Integrate database tables and Auth JWT verification handlers.", status: "next" },
    { number: "2", title: "Resume Parser", desc: "Develop JSON schema extractors and file upload buckets.", status: "future" },
    { number: "3", title: "AI Adapters", desc: "Implement hot-swappable providers for Gemini and Claude.", status: "future" },
    { number: "4", title: "Optimization", desc: "Create ATS feedback tailoring logic and headless PDF compilation.", status: "future" },
    { number: "5", title: "Job Boards", desc: "Define opportunity schemas, crawlers, and API endpoints.", status: "future" },
    { number: "6", title: "Vector Matching", desc: "Run HNSW pgvector similarity search on user portfolios.", status: "future" },
    { number: "7", title: "Kanban Board", desc: "Add drag-and-drop lifecycle trackers and user dashboards.", status: "future" }
  ];

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar showLinks={false} />
      {/* 1. HERO SECTION */}
      <Section background="dot-grid" className="flex items-center min-h-[80vh] border-b border-border">
        <Container size="lg" className="relative z-10 py-12 md:py-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1 border border-border bg-secondary/50 font-mono text-[10px] uppercase tracking-wider mb-6"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse" />
            Phase 1 Foundation Live
          </motion.div>

          {/* Official branding icon */}
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.05 }}
            className="flex justify-center mb-6"
          >
            <Image
              src="/images/logo/icon-primary.svg"
              alt="Offerly Icon"
              width={64}
              height={64}
              className="dark:hidden block object-contain"
              priority
            />
            <Image
              src="/images/logo/icon-white.svg"
              alt="Offerly Icon"
              width={64}
              height={64}
              className="hidden dark:block object-contain"
              priority
            />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-5xl md:text-8xl font-mono uppercase tracking-tighter font-extrabold mb-6 leading-none"
          >
            OFFERLY<span className="text-accent font-sans">.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-lg md:text-2xl font-mono tracking-wide text-muted-foreground max-w-3xl mx-auto mb-10"
          >
            FIND SMARTER. APPLY BETTER. GET HIRED.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="text-sm text-muted-foreground/80 max-w-xl mx-auto mb-12 normal-case leading-relaxed"
          >
            An enterprise-grade, AI-powered Career Copilot designed to automate ATS-friendly resume tailoring, compute deep semantic job matches, and centralize application workflows.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex flex-col sm:flex-row justify-center items-center gap-4"
          >
            <Button onClick={handleCTA} size="lg" variant="primary" className="w-full sm:w-auto">
              Get Started
            </Button>
            <a href="/docs/MASTER_PLAN.md" className="w-full sm:w-auto">
              <Button size="lg" variant="outline" className="w-full">
                <span className="flex items-center gap-2">
                  Read Master Plan <ChevronRight className="h-4 w-4" />
                </span>
              </Button>
            </a>
          </motion.div>
        </Container>

        {/* Decorative Grid Line */}
        <div className="absolute top-1/2 left-0 w-full h-[1px] bg-border/20 -z-10" />
      </Section>

      {/* 2. FEATURES SECTION */}
      <Section background="default" className="border-b border-border">
        <Container size="lg">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-mono uppercase tracking-wider font-bold mb-4">
              Core Architecture Pillars
            </h2>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
              Built for Scale. Configured for Control.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((feat, idx) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
              >
                <Card variant="glass" className="h-full flex flex-col justify-between group hover:border-foreground/30">
                  <CardHeader>
                    <div className="mb-4">{feat.icon}</div>
                    <CardTitle className="group-hover:text-accent transition-colors">{feat.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <CardDescription>{feat.description}</CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </Container>
      </Section>

      {/* 3. ARCHITECTURE PREVIEW */}
      <Section background="muted" className="border-b border-border">
        <Container size="lg">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-2.5 py-0.5 border border-border bg-background font-mono text-[9px] uppercase tracking-wider mb-6">
                System Schema
              </div>
              <h2 className="text-2xl md:text-3xl font-mono uppercase tracking-wider font-bold mb-6">
                Clean Architecture Alignment
              </h2>
              <div className="space-y-6 text-sm text-muted-foreground leading-relaxed normal-case">
                <p>
                  Offerly is developed under **Domain-Driven Design (DDD)** concepts, strictly partitioning frontend features and backend business domains.
                </p>
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <span className="mt-1 shrink-0 bg-foreground text-background font-mono text-[10px] w-5 h-5 flex items-center justify-center font-bold">1</span>
                    <div>
                      <strong className="text-foreground block font-mono text-xs uppercase tracking-wider">Feature-Based UI Modules</strong>
                      Features (`auth`, `resume`, `jobs`) hold their own views, store elements, and network endpoints, bypassing complex dependencies.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-1 shrink-0 bg-foreground text-background font-mono text-[10px] w-5 h-5 flex items-center justify-center font-bold">2</span>
                    <div>
                      <strong className="text-foreground block font-mono text-xs uppercase tracking-wider">Decoupled DB Repositories</strong>
                      SQL data routines are separated inside repositories, guaranteeing code stability if we shift to Mongo or Supabase RPC.
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="mt-1 shrink-0 bg-foreground text-background font-mono text-[10px] w-5 h-5 flex items-center justify-center font-bold">3</span>
                    <div>
                      <strong className="text-foreground block font-mono text-xs uppercase tracking-wider">Swappable AI Engines</strong>
                      LLM connections route to virtual providers, enabling direct dynamic switches between Google Gemini and Claude without editing core handlers.
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Code Preview UI */}
            <div className="border border-border bg-card p-6 font-mono text-xs space-y-4 shadow-sm relative overflow-hidden">
              <div className="absolute top-3 right-3 flex gap-1.5">
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="h-2 w-2 rounded-full bg-border" />
                <span className="h-2 w-2 rounded-full bg-border" />
              </div>
              <div className="text-[10px] text-muted-foreground uppercase border-b border-border/40 pb-2 mb-4">
                Architecture Flow Diagram
              </div>
              
              <div className="space-y-3">
                <div className="p-3 border border-border/80 bg-background flex items-center justify-between">
                  <span>Frontend Client (Next.js 15)</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="h-4 w-[1px] bg-border mx-auto" />
                <div className="p-3 border border-accent bg-accent/5 flex items-center justify-between">
                  <span className="text-accent">API Routers (FastAPI)</span>
                  <ChevronRight className="h-4 w-4 text-accent" />
                </div>
                <div className="h-4 w-[1px] bg-border mx-auto" />
                <div className="p-3 border border-border/80 bg-background flex items-center justify-between">
                  <span>Business Logic (Services)</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="h-4 w-[1px] bg-border mx-auto" />
                <div className="p-3 border border-border/80 bg-background flex items-center justify-between">
                  <span>Abstract DB (Repositories)</span>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>

      {/* 4. SPRINT ROADMAP */}
      <Section background="default" className="border-b border-border">
        <Container size="lg">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-2xl md:text-3xl font-mono uppercase tracking-wider font-bold mb-4">
              Sprint Roadmap
            </h2>
            <p className="text-xs font-mono text-muted-foreground uppercase tracking-wide">
              Agile Iteration Lifecycle Overview
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {sprints.map((sp) => (
              <Card 
                key={sp.number} 
                variant={sp.status === "done" ? "accent" : "default"}
                className="flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <span className="font-mono text-lg font-bold">SPRINT {sp.number}</span>
                    <span className="font-mono text-[9px] uppercase px-1.5 py-0.5 border border-border">
                      {sp.status === "done" ? "Done" : sp.status === "next" ? "Up Next" : "Future"}
                    </span>
                  </div>
                  <h3 className="font-mono text-xs uppercase font-semibold mb-2">{sp.title}</h3>
                  <p className="text-xs text-muted-foreground normal-case leading-relaxed">{sp.desc}</p>
                </div>
              </Card>
            ))}
          </div>
        </Container>
      </Section>

      {/* FOOTER */}
      <Footer />
    </div>
  );
}
