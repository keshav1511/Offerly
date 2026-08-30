"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  AlertCircle, Plus, Trash2, ArrowRight, Loader2, Sparkles,
  User, Link2, Briefcase, GraduationCap, Award, BadgeCheck, FileText
} from "lucide-react";
import { AuthButton } from "@/features/auth/components/AuthButton";
import { AuthPageTransition } from "@/features/auth/components/AuthPageTransition";
import { useStructuredResume, useUpdateStructuredResume } from "@/features/resume/hooks/useResumes";
import { useSyncProfileStructuredData, useUpdateProfile } from "@/features/auth/hooks/useProfile";
import { structuredResumeSchema } from "@/features/resume/resume.validation";
import { ResumeStructuredData } from "@/features/resume/types/parsing.types";
import { useToast } from "@/providers/ToastProvider";

interface NavSection {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_SECTIONS: NavSection[] = [
  { id: "sec-personal", label: "Personal Info", icon: User },
  { id: "sec-links", label: "Professional Links", icon: Link2 },
  { id: "sec-career_profile", label: "Career Summary", icon: Sparkles },
  { id: "sec-experience", label: "Experience Timeline", icon: Briefcase },
  { id: "sec-projects", label: "Projects", icon: FileText },
  { id: "sec-skills", label: "Technical Skills", icon: BadgeCheck },
  { id: "sec-education", label: "Education Details", icon: GraduationCap },
  { id: "sec-volunteer_leadership", label: "Achievements & Leadership", icon: Award },
];

function ReviewContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const resumeId = searchParams.get("resumeId") || "";

  const { toast } = useToast();

  // Queries & Mutations
  const { data: structuredData, isLoading: isResumeLoading, isError } = useStructuredResume(resumeId);
  const updateStructuredMutation = useUpdateStructuredResume(resumeId);
  const syncProfileMutation = useSyncProfileStructuredData();
  const { mutate: updateProfile } = useUpdateProfile();

  useEffect(() => {
    updateProfile({ onboarding_step: "review" });
  }, [updateProfile]);

  const [saving, setSaving] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState("sec-personal");

  const {
    register,
    control,
    handleSubmit,
    reset,
    watch,
  } = useForm<ResumeStructuredData>({
    resolver: zodResolver(structuredResumeSchema),
    defaultValues: {
      personal: { name: "", email: "", phone: "", location: "" },
      summary: "",
      skills: [],
      education: [],
      experience: [],
      projects: [],
      certifications: [],
      achievements: [],
      languages: [],
      volunteer: [],
      leadership: [],
      links: { github: "", linkedin: "", portfolio: "", leetcode: "", codeforces: "", kaggle: "", behance: "", dribbble: "" },
      metadata: { pageCount: 1, wordCount: 0 },
      career_profile: {
        career_stage: "Entry Level",
        primary_domain: "",
        primary_tech_stack: [],
        leadership_level: "Individual Contributor",
        strength_areas: [],
        growth_areas: [],
        experience_summary: "",
      }
    },
  });

  const { fields: expFields, append: appendExp, remove: removeExp } = useFieldArray({ control, name: "experience" });
  const { fields: projFields, append: appendProj, remove: removeProj } = useFieldArray({ control, name: "projects" });
  const { fields: eduFields, append: appendEdu, remove: removeEdu } = useFieldArray({ control, name: "education" });
  const { fields: leadFields, append: appendLead, remove: removeLead } = useFieldArray({ control, name: "leadership" });

  // Sync loaded database structured_data with form state, defaulting missing career profile parameters
  useEffect(() => {
    if (structuredData) {
      let totalYears = 0;
      structuredData.experience?.forEach(exp => {
        const start = parseInt(exp.start_date.match(/\d{4}/)?.[0] || "0", 10);
        const endVal = exp.end_date.toLowerCase().includes("present") ? new Date().getFullYear() : parseInt(exp.end_date.match(/\d{4}/)?.[0] || "0", 10);
        if (start > 0 && endVal >= start) {
          totalYears += (endVal - start);
        }
      });
      const experienceYears = totalYears || 0;
      const getCareerStage = () => {
        if (experienceYears < 2) return "Entry Level";
        if (experienceYears < 5) return "Mid-Senior Level";
        if (experienceYears < 10) return "Senior level";
        return "Lead / Principal";
      };

      reset({
        ...structuredData,
        volunteer: structuredData.volunteer || [],
        leadership: structuredData.leadership || [],
        links: {
          github: structuredData.links?.github || "",
          linkedin: structuredData.links?.linkedin || "",
          portfolio: structuredData.links?.portfolio || "",
          leetcode: structuredData.links?.leetcode || "",
          codeforces: structuredData.links?.codeforces || "",
          kaggle: structuredData.links?.kaggle || "",
          behance: structuredData.links?.behance || "",
          dribbble: structuredData.links?.dribbble || "",
        },
        career_profile: {
          career_stage: structuredData.career_profile?.career_stage || getCareerStage(),
          primary_domain: structuredData.career_profile?.primary_domain || structuredData.experience?.[0]?.position || "Software Engineering",
          primary_tech_stack: structuredData.career_profile?.primary_tech_stack || structuredData.skills?.slice(0, 4) || [],
          leadership_level: structuredData.career_profile?.leadership_level || (structuredData.experience?.some(e => e.position.toLowerCase().includes("lead") || e.position.toLowerCase().includes("manager")) ? "Team Lead" : "Individual Contributor"),
          strength_areas: structuredData.career_profile?.strength_areas || ["System Design", "Technical Execution"],
          growth_areas: structuredData.career_profile?.growth_areas || ["Team Mentorship", "Operational Scaling"],
          experience_summary: structuredData.career_profile?.experience_summary || structuredData.summary || "",
        }
      });
    }
  }, [structuredData, reset]);

  const formValues = watch();

  // Navigation Click Handler (Smooth Scroll)
  const handleNavClick = (sectionId: string) => {
    setActiveSectionId(sectionId);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  // Section Validation Status Helper
  const getSectionStatus = (sectionId: string): "complete" | "recommended" | "missing" => {
    switch (sectionId) {
      case "sec-personal":
        return formValues.personal?.name && formValues.personal?.email ? "complete" : "missing";
      case "sec-links":
        return formValues.links?.linkedin || formValues.links?.github ? "complete" : "recommended";
      case "sec-career_profile":
        return formValues.career_profile?.career_stage && formValues.career_profile?.primary_domain ? "complete" : "recommended";
      case "sec-experience":
        return formValues.experience && formValues.experience.length > 0 ? "complete" : "recommended";
      case "sec-projects":
        return formValues.projects && formValues.projects.length > 0 ? "complete" : "recommended";
      case "sec-skills":
        return formValues.skills && formValues.skills.length > 0 ? "complete" : "missing";
      case "sec-education":
        return formValues.education && formValues.education.length > 0 ? "complete" : "missing";
      case "sec-volunteer_leadership":
        return (formValues.volunteer?.length || 0) + (formValues.leadership?.length || 0) > 0 ? "complete" : "recommended";
      default:
        return "complete";
    }
  };

  const onSubmit = async (data: ResumeStructuredData) => {
    if (!resumeId) return;
    setSaving(true);
    try {
      // 1. Normalize array fields
      const cleanSkills = Array.isArray(data.skills)
        ? data.skills
        : (data.skills as string).split(",").map(s => s.trim()).filter(Boolean);

      const cleanCerts = Array.isArray(data.certifications)
        ? data.certifications
        : (data.certifications as string).split(",").map(c => c.trim()).filter(Boolean);

      const cleanAchievements = Array.isArray(data.achievements)
        ? data.achievements
        : (data.achievements as string).split(",").map(a => a.trim()).filter(Boolean);

      const cleanLanguages = Array.isArray(data.languages)
        ? data.languages
        : (data.languages as string).split(",").map(l => l.trim()).filter(Boolean);

      const cleanStrength = Array.isArray(data.career_profile?.strength_areas)
        ? data.career_profile.strength_areas
        : (data.career_profile?.strength_areas as unknown as string || "").split(",").map((s: string) => s.trim()).filter(Boolean);

      const cleanGrowth = Array.isArray(data.career_profile?.growth_areas)
        ? data.career_profile.growth_areas
        : (data.career_profile?.growth_areas as unknown as string || "").split(",").map((g: string) => g.trim()).filter(Boolean);

      const cleanTechStack = Array.isArray(data.career_profile?.primary_tech_stack)
        ? data.career_profile.primary_tech_stack
        : (data.career_profile?.primary_tech_stack as unknown as string || "").split(",").map((t: string) => t.trim()).filter(Boolean);

      const payload: ResumeStructuredData = {
        ...data,
        skills: cleanSkills,
        certifications: cleanCerts,
        achievements: cleanAchievements,
        languages: cleanLanguages,
        career_profile: {
          ...data.career_profile,
          strength_areas: cleanStrength,
          growth_areas: cleanGrowth,
          primary_tech_stack: cleanTechStack,
        }
      };

      // 2. Save structured resume data
      await updateStructuredMutation.mutateAsync(payload);

      // 3. Sync verified profile structures to the profiles table
      await syncProfileMutation.mutateAsync(payload);

      // Navigate to Step 3.5 Personalization Page
      router.push(`/onboarding/personalize?resumeId=${resumeId}`);
    } catch (err) {
      console.error("Failed to save profile:", err);
      toast(err instanceof Error ? err.message : "Failed to save profile.", "error");
    } finally {
      setSaving(false);
    }
  };

  if (isResumeLoading) {
    return (
      <div className="border border-border p-6 sm:p-12 bg-background/30 text-center rounded-lg space-y-3 font-mono text-xs uppercase">
        <Loader2 className="w-8 h-8 text-accent animate-spin mx-auto" />
        <span>Compiling Career Profile...</span>
      </div>
    );
  }

  if (isError || !resumeId) {
    return (
      <div className="border border-destructive/25 p-5 sm:p-8 bg-destructive/5 text-center rounded-lg space-y-4">
        <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
        <p className="text-xs font-mono uppercase tracking-wider font-semibold text-destructive">
          Failed to retrieve Career Profile.
        </p>
        <AuthButton onClick={() => router.push("/onboarding/resume")} variant="outline" size="sm">
          Return to Upload
        </AuthButton>
      </div>
    );
  }

  return (
    <AuthPageTransition>
      <div className="space-y-6 max-w-6xl mx-auto text-left">
        {/* Step Progress Tracker */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center font-mono text-[9px] uppercase tracking-widest text-muted-foreground/60">
            <span>STEP: CAREER_PROFILE_REVIEW</span>
            <span>4 / 5</span>
          </div>
          <div className="h-1 w-full bg-secondary flex gap-0.5" role="progressbar" aria-valuenow={80} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full w-4/5 bg-accent" />
            <div className="h-full w-1/5 bg-secondary" />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Sticky Section Navigation */}
          <div className="lg:col-span-3 lg:sticky lg:top-6 space-y-4">
            <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-4 rounded-lg shadow-sm space-y-2.5">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold border-b border-zinc-100 dark:border-zinc-900 pb-1.5 mb-2">
                Section Progress
              </h4>
              <nav className="space-y-1">
                {NAV_SECTIONS.map((sec) => {
                  const Icon = sec.icon;
                  const status = getSectionStatus(sec.id);
                  const isActive = activeSectionId === sec.id;
                  
                  return (
                    <button
                      key={sec.id}
                      type="button"
                      onClick={() => handleNavClick(sec.id)}
                      className={`w-full flex items-center justify-between p-2 rounded text-[10px] font-mono uppercase transition-colors text-left cursor-pointer ${
                        isActive 
                          ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 font-bold" 
                          : "hover:bg-zinc-50 dark:hover:bg-zinc-900 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <Icon className="w-3.5 h-3.5" />
                        <span>{sec.label}</span>
                      </div>
                      
                      {status === "complete" && (
                        <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-accent" : "bg-emerald-500"}`} />
                      )}
                      {status === "recommended" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                      )}
                      {status === "missing" && (
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Form Content Area */}
          <div className="lg:col-span-9 space-y-6">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              
              {/* Card 1: Personal Details */}
              <div id="sec-personal" className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-lg space-y-4 shadow-sm scroll-mt-6">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2">
                  1. Personal Information
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Full Name *</label>
                    <input
                      {...register("personal.name")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Email *</label>
                    <input
                      type="email"
                      {...register("personal.email")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Phone</label>
                    <input
                      {...register("personal.phone")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Location</label>
                    <input
                      {...register("personal.location")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Card 2: Professional Links */}
              <div id="sec-links" className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-lg space-y-4 shadow-sm scroll-mt-6">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2">
                  2. Professional Profiles & Links
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">LinkedIn</label>
                    <input
                      placeholder="https://linkedin.com/in/username"
                      {...register("links.linkedin")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">GitHub</label>
                    <input
                      placeholder="https://github.com/username"
                      {...register("links.github")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Portfolio / Personal Website</label>
                    <input
                      placeholder="https://mywebsite.com"
                      {...register("links.portfolio")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Card 3: Career Summary Panel */}
              <div id="sec-career_profile" className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-lg space-y-4 shadow-sm scroll-mt-6">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-accent animate-pulse" />
                  3. Career Summary & AI Insights
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Career Stage</label>
                    <select
                      {...register("career_profile.career_stage")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                    >
                      <option value="Entry Level">Entry Level</option>
                      <option value="Mid-Senior Level">Mid-Senior Level</option>
                      <option value="Senior level">Senior level</option>
                      <option value="Lead / Principal">Lead / Principal</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Primary Domain</label>
                    <input
                      placeholder="e.g. Backend Engineering"
                      {...register("career_profile.primary_domain")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Primary Tech Stack (Comma separated)</label>
                    <input
                      placeholder="e.g. Java, Spring Boot, React, AWS"
                      {...register("career_profile.primary_tech_stack")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Leadership Level</label>
                    <select
                      {...register("career_profile.leadership_level")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                    >
                      <option value="Individual Contributor">Individual Contributor</option>
                      <option value="Team Lead">Team Lead</option>
                      <option value="Manager">Manager</option>
                    </select>
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Strength Areas (Comma separated)</label>
                    <input
                      placeholder="e.g. System Design, Technical Execution"
                      {...register("career_profile.strength_areas")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Growth Areas (Comma separated)</label>
                    <input
                      placeholder="e.g. Machine Learning, Team Scaling"
                      {...register("career_profile.growth_areas")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1 sm:col-span-2">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Experience Summary</label>
                    <textarea
                      rows={3}
                      {...register("career_profile.experience_summary")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              </div>

              {/* Card 4: Experience Timeline */}
              <div id="sec-experience" className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-lg space-y-4 shadow-sm scroll-mt-6">
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                    4. Experience Timeline
                  </h3>
                  <button
                    type="button"
                    onClick={() => appendExp({ company: "", position: "", location: "", start_date: "", end_date: "", description: "" })}
                    className="flex items-center gap-1 text-[9px] font-mono uppercase bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 px-2 py-1 rounded cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Job</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {expFields.map((field, index) => (
                    <div key={field.id} className="p-4 border border-zinc-100 dark:border-zinc-900 rounded bg-secondary/5 space-y-3 relative text-left">
                      <button
                        type="button"
                        onClick={() => removeExp(index)}
                        className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Company *</label>
                          <input
                            {...register(`experience.${index}.company`)}
                            className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Position *</label>
                          <input
                            {...register(`experience.${index}.position`)}
                            className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Start Date</label>
                          <input
                            placeholder="e.g. 2021 or 06/2021"
                            {...register(`experience.${index}.start_date`)}
                            className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">End Date</label>
                          <input
                            placeholder="e.g. Present or 2024"
                            {...register(`experience.${index}.end_date`)}
                            className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Description Bullet Points</label>
                          <textarea
                            rows={3}
                            {...register(`experience.${index}.description`)}
                            className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 5: Projects */}
              <div id="sec-projects" className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-lg space-y-4 shadow-sm scroll-mt-6">
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                    5. Projects
                  </h3>
                  <button
                    type="button"
                    onClick={() => appendProj({ name: "", description: "", url: "" })}
                    className="flex items-center gap-1 text-[9px] font-mono uppercase bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 px-2 py-1 rounded cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Project</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {projFields.map((field, index) => (
                    <div key={field.id} className="p-4 border border-zinc-100 dark:border-zinc-900 rounded bg-secondary/5 space-y-3 relative text-left">
                      <button
                        type="button"
                        onClick={() => removeProj(index)}
                        className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Project Name *</label>
                          <input
                            {...register(`projects.${index}.name`)}
                            className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Project URL</label>
                          <input
                            placeholder="https://github.com/..."
                            {...register(`projects.${index}.url`)}
                            className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1 sm:col-span-2">
                          <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Description</label>
                          <textarea
                            rows={2}
                            {...register(`projects.${index}.description`)}
                            className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 6: Skills */}
              <div id="sec-skills" className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-lg space-y-4 shadow-sm scroll-mt-6">
                <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2">
                  6. Technical Skills
                </h3>
                <div className="space-y-1 text-left">
                  <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Skills List (Comma separated) *</label>
                  <input
                    placeholder="React, TypeScript, Go, Docker, AWS"
                    {...register("skills")}
                    className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                    required
                  />
                </div>
              </div>

              {/* Card 7: Education */}
              <div id="sec-education" className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-lg space-y-4 shadow-sm scroll-mt-6">
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                    7. Education Details
                  </h3>
                  <button
                    type="button"
                    onClick={() => appendEdu({ institution: "", degree: "", field_of_study: "", start_date: "", end_date: "" })}
                    className="flex items-center gap-1 text-[9px] font-mono uppercase bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 px-2 py-1 rounded cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Education</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {eduFields.map((field, index) => (
                    <div key={field.id} className="p-4 border border-zinc-100 dark:border-zinc-900 rounded bg-secondary/5 space-y-3 relative text-left">
                      <button
                        type="button"
                        onClick={() => removeEdu(index)}
                        className="absolute top-4 right-4 text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Institution *</label>
                          <input
                            {...register(`education.${index}.institution`)}
                            className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                            required
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Degree</label>
                          <input
                            placeholder="e.g. B.S., M.S."
                            {...register(`education.${index}.degree`)}
                            className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Field of Study</label>
                          <input
                            placeholder="e.g. Computer Science"
                            {...register(`education.${index}.field_of_study`)}
                            className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Start Date</label>
                          <input
                            placeholder="e.g. 2018"
                            {...register(`education.${index}.start_date`)}
                            className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">End Date</label>
                          <input
                            placeholder="e.g. 2022"
                            {...register(`education.${index}.end_date`)}
                            className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Card 8: Achievements & Leadership */}
              <div id="sec-volunteer_leadership" className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 rounded-lg space-y-4 shadow-sm scroll-mt-6">
                <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2">
                  <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                    8. Achievements, Certifications & Leadership
                  </h3>
                </div>

                <div className="grid grid-cols-1 gap-4 text-left">
                  {/* Comma separated inputs */}
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Certifications (Comma separated)</label>
                    <input
                      placeholder="AWS Solution Architect, PMP"
                      {...register("certifications")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Achievements (Comma separated)</label>
                    <input
                      placeholder="Dean's List 2022, Winner of ML Hackathon"
                      {...register("achievements")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="font-mono text-[9px] uppercase text-zinc-400 font-bold">Languages (Comma separated)</label>
                    <input
                      placeholder="English, Spanish, French"
                      {...register("languages")}
                      className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>

                {/* Leadership dynamic timeline */}
                <div className="space-y-4 pt-4 border-t border-zinc-100 dark:border-zinc-900">
                  <div className="flex justify-between items-center">
                    <h4 className="font-mono text-[10px] font-bold uppercase tracking-wider text-zinc-400">Leadership Roles</h4>
                    <button
                      type="button"
                      onClick={() => appendLead({ company: "", position: "", location: "", start_date: "", end_date: "", description: "" })}
                      className="flex items-center gap-1 text-[8px] font-mono uppercase bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 px-2 py-1 rounded cursor-pointer"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Leadership</span>
                    </button>
                  </div>
                  
                  {leadFields.map((field, index) => (
                    <div key={field.id} className="p-3 border border-zinc-100 dark:border-zinc-900 rounded bg-secondary/5 space-y-2 relative">
                      <button
                        type="button"
                        onClick={() => removeLead(index)}
                        className="absolute top-3 right-3 text-rose-500 hover:text-rose-700 cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-left">
                        <div className="space-y-1">
                          <label className="font-mono text-[8px] uppercase text-zinc-400 font-bold">Organization</label>
                          <input
                            {...register(`leadership.${index}.company`)}
                            className="w-full px-2 py-1 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="font-mono text-[8px] uppercase text-zinc-400 font-bold">Role Title</label>
                          <input
                            {...register(`leadership.${index}.position`)}
                            className="w-full px-2 py-1 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans focus:outline-none focus:border-accent"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4">
                <AuthButton
                  type="submit"
                  disabled={saving}
                  variant="primary"
                  fullWidth
                  className="py-3 font-mono text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-1.5"
                >
                  {saving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Saving Career Profile...</span>
                    </>
                  ) : (
                    <>
                      <span>Save & Continue</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </AuthButton>
              </div>

            </form>
          </div>
        </div>
      </div>
    </AuthPageTransition>
  );
}

export default function OnboardingReviewPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="w-8 h-8 text-accent animate-spin" />
      </div>
    }>
      <ReviewContent />
    </Suspense>
  );
}
