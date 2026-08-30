"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { 
  CheckCircle2, AlertTriangle, AlertCircle, ArrowRight, Sparkles, ShieldCheck, Loader2
} from "lucide-react";
import { useStructuredResume } from "@/features/resume/hooks/useResumes";
import { AuthCard } from "@/features/auth/components/AuthCard";
import { AuthHeader } from "@/features/auth/components/AuthHeader";
import { Button } from "@/components/Button";
import { AuthPageTransition } from "@/features/auth/components/AuthPageTransition";

interface DiscoveryItem {
  type: "success" | "warning";
  label: string;
}

interface MissingItem {
  id: string;
  title: string;
  description: string;
  urgency: "required" | "recommended";
}

import { useUpdateProfile } from "@/features/auth/hooks/useProfile";

function DiscoveryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resumeId") || "";
  const { mutate: updateProfile } = useUpdateProfile();

  useEffect(() => {
    updateProfile({ onboarding_step: "discovery" });
  }, [updateProfile]);

  const { data: structured, isLoading, isError } = useStructuredResume(resumeId);
  const [visibleItemsCount, setVisibleItemsCount] = useState(0);

  // Progressive reveal trigger
  useEffect(() => {
    if (!structured) return;
    const itemsCount = 4 + 
      (structured.links?.github ? 1 : 0) + 
      (structured.links?.linkedin ? 1 : 0) + 
      (!structured.links?.portfolio ? 1 : 0) + 
      (!structured.links?.linkedin ? 1 : 0) +
      (!structured.personal?.phone ? 1 : 0) +
      (structured.education?.some(e => !e.end_date) ? 1 : 0);

    const timer = setInterval(() => {
      setVisibleItemsCount((prev) => {
        if (prev >= itemsCount) {
          clearInterval(timer);
          return prev;
        }
        return prev + 1;
      });
    }, 2500);

    return () => clearInterval(timer);
  }, [structured]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] flex-col gap-3 font-mono text-xs uppercase text-muted-foreground">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
        <span>Compiling Discovery Dashboard...</span>
      </div>
    );
  }

  if (isError || !structured) {
    return (
      <AuthCard>
        <div className="text-center p-5 sm:p-8 space-y-4">
          <AlertCircle className="w-10 h-10 text-destructive mx-auto" />
          <h3 className="text-sm font-mono uppercase font-semibold">Discovery Compile Failed</h3>
          <p className="text-[10px] text-muted-foreground font-mono uppercase leading-relaxed">
            {"We couldn't retrieve the structured details of your Master Resume."}
          </p>
          <Button onClick={() => router.push("/onboarding/resume")} variant="outline" className="text-xs uppercase font-mono">
            Back to Upload
          </Button>
        </div>
      </AuthCard>
    );
  }

  // Parse structured data variables
  const skillsCount = structured.skills?.length || 0;
  const projectsCount = structured.projects?.length || 0;
  const certificationsCount = structured.certifications?.length || 0;
  const leadershipCount = (structured.leadership?.length || 0) + (structured.volunteer?.length || 0);

  // 1. Compile Discoveries List
  const discoveries: DiscoveryItem[] = [
    { type: "success", label: `${skillsCount} Technical Skills Cluster Found` },
    { type: "success", label: `${projectsCount} Professional Projects Identified` },
    { type: "success", label: `${certificationsCount} Industry Certifications Found` },
    { type: "success", label: `${leadershipCount} Leadership & Volunteer Roles Identified` },
  ];

  if (structured.links?.github) {
    discoveries.push({ type: "success", label: "GitHub Profile Link Detected" });
  }
  if (structured.links?.linkedin) {
    discoveries.push({ type: "success", label: "LinkedIn Profile Link Detected" });
  }

  // Warnings
  if (!structured.links?.portfolio) {
    discoveries.push({ type: "warning", label: "Portfolio Website Missing" });
  }
  if (!structured.links?.linkedin) {
    discoveries.push({ type: "warning", label: "LinkedIn Profile missing" });
  }
  if (!structured.personal?.phone) {
    discoveries.push({ type: "warning", label: "Phone Number Incomplete" });
  }
  
  const isEduDateAmbiguous = structured.education?.some(e => !e.end_date || e.end_date.toLowerCase().includes("present"));
  if (isEduDateAmbiguous) {
    discoveries.push({ type: "warning", label: "Graduation date unclear" });
  }

  // 2. Compile Actionable Missing Info Cards
  const missingItems: MissingItem[] = [];
  if (!structured.links?.portfolio) {
    missingItems.push({
      id: "portfolio",
      title: "Missing Portfolio Website",
      description: "Adding a portfolio link showcases active projects and design credentials to tech recruiters.",
      urgency: "recommended"
    });
  }
  if (!structured.links?.linkedin) {
    missingItems.push({
      id: "linkedin",
      title: "LinkedIn Link missing",
      description: "LinkedIn integrations increase recruiter response ratios by up to 40%.",
      urgency: "recommended"
    });
  }
  if (!structured.personal?.phone) {
    missingItems.push({
      id: "phone",
      title: "Phone Number Incomplete",
      description: "A complete mobile number is required by most ATS systems to schedule phone calls.",
      urgency: "required"
    });
  }
  if (isEduDateAmbiguous) {
    missingItems.push({
      id: "graduation",
      title: "Graduation Year Ambiguous",
      description: "Verify your graduation target month/year to lock in early career cohort applications.",
      urgency: "required"
    });
  }

  // 3. Section-by-Section Confidence Calculations (Deterministic logic)
  const confidenceScores = {
    personal: structured.personal?.name && structured.personal?.email ? "HIGH" : "MEDIUM",
    skills: skillsCount > 8 ? "HIGH" : skillsCount > 3 ? "MEDIUM" : "LOW",
    experience: structured.experience?.length > 0 && structured.experience.every(e => e.description && e.description.length > 50) ? "HIGH" : "MEDIUM",
    education: structured.education?.length > 0 && !isEduDateAmbiguous ? "HIGH" : "MEDIUM"
  };

  // 4. Calculate total years of experience
  const calculateExperienceYears = () => {
    let totalYears = 0;
    structured.experience?.forEach(exp => {
      const start = parseInt(exp.start_date.match(/\d{4}/)?.[0] || "0", 10);
      const endVal = exp.end_date.toLowerCase().includes("present") ? new Date().getFullYear() : parseInt(exp.end_date.match(/\d{4}/)?.[0] || "0", 10);
      if (start > 0 && endVal >= start) {
        totalYears += (endVal - start);
      }
    });
    return totalYears || 0;
  };

  const experienceYears = calculateExperienceYears();

  // Career stage classification
  const getCareerStage = () => {
    if (experienceYears < 2) return "Entry Level";
    if (experienceYears < 5) return "Mid-Senior Level";
    if (experienceYears < 10) return "Senior level";
    return "Lead / Principal";
  };

  return (
    <AuthPageTransition>
      <div className="space-y-6 max-w-4xl mx-auto">
        {/* Step Progress Tracker */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
            <span>STEP: MASTER_RESUME_DISCOVERY</span>
            <span>3 / 5</span>
          </div>
          <div className="h-1 w-full bg-secondary flex gap-0.5" role="progressbar" aria-valuenow={60} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full w-3/5 bg-accent" />
            <div className="h-full w-2/5 bg-secondary" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 text-left">
          {/* Main Discoveries Card (Left) */}
          <div className="md:col-span-3 space-y-6">
            <AuthCard>
              <AuthHeader
                title="WE ANALYZED YOUR MASTER RESUME"
                subtitle="Here is what our parsing engine extracted. Discoveries are mapped to standard compliance layers."
              />

              {/* Progressively Revealed Discovery Items */}
              <div className="space-y-3.5 pt-2">
                {discoveries.slice(0, visibleItemsCount).map((item, idx) => (
                  <div 
                    key={idx}
                    className={`flex items-start gap-2.5 p-3 rounded border transition-all duration-500 animate-in fade-in slide-in-from-bottom-2 ${
                      item.type === "success" 
                        ? "border-emerald-500/10 bg-emerald-50/5 text-emerald-600 dark:text-emerald-400" 
                        : "border-amber-500/10 bg-amber-50/5 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {item.type === "success" ? (
                      <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    )}
                    <span className="font-mono text-[10px] uppercase font-semibold leading-normal">
                      {item.label}
                    </span>
                  </div>
                ))}

                {visibleItemsCount < discoveries.length && (
                  <div className="flex items-center gap-2 p-3 text-zinc-400 font-mono text-[9px] uppercase animate-pulse">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Mapping remaining metadata...</span>
                  </div>
                )}
              </div>
            </AuthCard>

            {/* Confidence Ratings breakdown */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 rounded-lg space-y-3 shadow-sm">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-accent" />
                Extraction Confidence Ratings
              </h4>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-1 font-mono">
                {Object.entries(confidenceScores).map(([section, score]) => (
                  <div key={section} className="p-2 border border-zinc-100 dark:border-zinc-900 rounded bg-secondary/10">
                    <p className="text-[8px] text-zinc-400 uppercase">{section}</p>
                    <p className={`text-[10px] font-bold mt-1 ${
                      score === "HIGH" ? "text-emerald-500" : score === "MEDIUM" ? "text-amber-500" : "text-rose-500"
                    }`}>
                      {score}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Actionable Insights Panel (Right) */}
          <div className="md:col-span-2 space-y-6">
            {/* Career Profile Preview */}
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 rounded-lg space-y-4 shadow-sm">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-accent" />
                Career Profile Preview
              </h4>
              
              <div className="space-y-3 font-mono text-[10px] uppercase">
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-1.5">
                  <span className="text-zinc-400">Career Stage</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{getCareerStage()}</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-1.5">
                  <span className="text-zinc-400">Experience Years</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200">{experienceYears} Years</span>
                </div>
                <div className="flex justify-between border-b border-zinc-100 dark:border-zinc-900 pb-1.5">
                  <span className="text-zinc-400">Key Domain</span>
                  <span className="font-bold text-zinc-800 dark:text-zinc-200 truncate max-w-[150px]">
                    {structured.experience?.[0]?.position || "Engineering"}
                  </span>
                </div>
                <div className="space-y-1 pt-1.5">
                  <span className="text-zinc-400 block mb-1">Core Tech Stack</span>
                  <div className="flex flex-wrap gap-1">
                    {structured.skills.slice(0, 4).map((skill, i) => (
                      <span key={i} className="px-1.5 py-0.5 text-[8px] bg-secondary border border-border/40 text-zinc-600 dark:text-zinc-400 rounded">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Actionable Missing Cards */}
            {missingItems.length > 0 && (
              <div className="space-y-3">
                <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold">
                  Recommended Additions
                </h4>
                <div className="space-y-2.5 max-h-[35vh] overflow-y-auto pr-1">
                  {missingItems.map((item) => (
                    <div key={item.id} className="p-3.5 border border-zinc-200 dark:border-zinc-800 rounded bg-white dark:bg-zinc-950 space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[9px] font-mono font-bold uppercase">{item.title}</span>
                        <span className={`px-1.5 py-0.5 text-[7px] font-mono font-bold uppercase rounded ${
                          item.urgency === "required" 
                            ? "bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-450" 
                            : "bg-amber-50 text-amber-600 dark:bg-amber-950/20 dark:text-amber-450"
                        }`}>
                          {item.urgency}
                        </span>
                      </div>
                      <p className="text-[9px] font-mono uppercase text-zinc-500 dark:text-zinc-400 leading-relaxed text-left">
                        {item.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <Button
              onClick={() => router.push(`/onboarding/review?resumeId=${resumeId}`)}
              className="w-full bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 py-3 rounded text-xs font-mono font-bold tracking-widest uppercase flex items-center justify-center gap-1.5"
            >
              <span>Review My Profile</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </AuthPageTransition>
  );
}

export default function OnboardingDiscoveryPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    }>
      <DiscoveryContent />
    </Suspense>
  );
}
