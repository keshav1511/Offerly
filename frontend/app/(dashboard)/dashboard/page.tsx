"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Sparkles, FileText, Briefcase, Plus, SearchCode, Target, ArrowRight,
  AlertTriangle, Loader2, ChevronRight, CheckSquare, Square,
  HeartPulse, ShieldAlert
} from "lucide-react";
import { useProfile } from "@/features/auth/hooks/useProfile";
import { useResumes } from "@/features/resume/hooks/useResumes";
import { useJobs } from "@/features/jobs/hooks/useJobs";
import { Card } from "@/components/Card";
import { Button } from "@/components/Button";
import { Modal } from "@/components/Modal";
import { useToast } from "@/providers/ToastProvider";
import { ATSAnalysisReport, JobDetails } from "@/features/resume/types/tailoring.types";

interface CopilotTask {
  id: string;
  text: string;
  type: "tailor" | "followup" | "skills" | "job";
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();

  // Core data hooks
  const { data: profile } = useProfile();
  const { resumes, isLoading: isResumesLoading } = useResumes();
  const { jobs, isLoading: isJobsLoading } = useJobs();

  // Find the default resume
  const defaultResume = resumes.find(r => r.is_default) || resumes[0];

  // States
  const [mounted, setMounted] = useState(false);
  const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);
  const [jobUrl, setJobUrl] = useState("");
  const [jobText, setJobText] = useState("");
  const [extracting, setExtracting] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);

  // Results states
  const [extractedJob, setExtractedJob] = useState<JobDetails | null>(null);
  const [matchReport, setMatchReport] = useState<ATSAnalysisReport | null>(null);
  const [analysisStep, setAnalysisStep] = useState<"input" | "results">("input");

  // Checklist state for AI Copilot Tasks
  const [checkedTasks, setCheckedTasks] = useState<Record<string, boolean>>({});

  // Calculations for profile completeness
  const [completenessScore, setCompletenessScore] = useState(0);

  useEffect(() => {
    if (profile?.structured_data) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const data = profile.structured_data as any;
      let score = 0;
      if (data.personal?.name) score += 15;
      if (data.personal?.email) score += 10;
      if (data.personal?.phone) score += 5;
      if (data.personal?.location) score += 5;
      if (data.summary) score += 10;
      if (data.skills && data.skills.length > 0) score += 15;
      if (data.experience && data.experience.length > 0) score += 20;
      if (data.education && data.education.length > 0) score += 10;
      if (data.links?.linkedin || data.links?.github) score += 10;
      setCompletenessScore(score || 85); // Default high parsing baseline
    } else {
      setCompletenessScore(85);
    }
  }, [profile]);

  const handleRunAnalysis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobUrl.trim() && !jobText.trim()) {
      toast("Please provide either a Job URL or a Job Description.", "error");
      return;
    }

    setExtracting(true);
    setExtractedJob(null);
    setMatchReport(null);

    try {
      const extractResponse = await fetch("/api/jobs/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: jobUrl.trim() || undefined, text: jobText.trim() || undefined }),
      });

      if (!extractResponse.ok) {
        throw new Error("Failed to extract job details.");
      }

      const jobDetails: JobDetails = await extractResponse.json();
      setExtractedJob(jobDetails);
      setExtracting(false);

      if (defaultResume?.id) {
        setAnalyzing(true);
        const analyzeResponse = await fetch(`/api/resumes/${defaultResume.id}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ jobDescription: jobDetails.description }),
        });

        if (!analyzeResponse.ok) {
          throw new Error("Failed to run compatibility analysis.");
        }

        const report: ATSAnalysisReport = await analyzeResponse.json();
        setMatchReport(report);
        setAnalyzing(false);
      }

      setAnalysisStep("results");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Analysis failed.", "error");
      setExtracting(false);
      setAnalyzing(false);
    }
  };

  const handleResetAnalysis = () => {
    setJobUrl("");
    setJobText("");
    setExtractedJob(null);
    setMatchReport(null);
    setAnalysisStep("input");
  };

  const handleProceedToTailoring = () => {
    if (defaultResume?.id) {
      setAnalyzeModalOpen(false);
      router.push(`/resumes/${defaultResume.id}/tailor`);
    }
  };

  const toggleTask = (taskId: string) => {
    setCheckedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // Pipeline summary counts
  const pipelineCounts = {
    wishlist: jobs.filter(j => j.status === "wishlist").length,
    applied: jobs.filter(j => j.status === "applied" || j.status === "oa").length,
    interviewing: jobs.filter(j => j.status === "interview" || j.status === "hr").length,
    offered: jobs.filter(j => j.status === "offer" || j.status === "accepted").length,
  };

  // Curated task list
  const copilotTasks: CopilotTask[] = [
    {
      id: "task-1",
      text: "Tailor your Master Resume for Vercel (Frontend Engineer) - Match is 68%.",
      type: "tailor"
    },
    {
      id: "task-2",
      text: `Follow up on your ${jobs[0]?.title || "Stripe"} application (Applied 5 days ago, average response is 4 days).`,
      type: "followup"
    },
    {
      id: "task-3",
      text: "Add portfolio link to your Career Profile. Incomplete details affect match accuracy by 12%.",
      type: "skills"
    },
    {
      id: "task-4",
      text: "Two new Software Engineer jobs match your tech stack over 90%.",
      type: "job"
    }
  ];

  const name = profile?.full_name || "Keshav";

  if (!mounted || isResumesLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] font-mono text-xs uppercase gap-2">
        <Loader2 className="w-6 h-6 text-accent animate-spin" />
        <span>Initializing Mission Control...</span>
      </div>
    );
  }

  // No resumes uploaded empty state
  if (resumes.length === 0) {
    return (
      <div className="max-w-xl mx-auto space-y-6 py-12 text-left">
        <div className="flex flex-col gap-2 border-b border-zinc-200 dark:border-zinc-900 pb-5">
          <h1 className="font-mono text-lg font-black uppercase tracking-wider">
            Mission Control
          </h1>
          <p className="font-sans text-xs text-zinc-500 uppercase tracking-widest mt-1">
            AI-First Career Copilot
          </p>
        </div>

        <Card className="p-8 text-center border-dashed border-zinc-200 dark:border-zinc-800 bg-transparent space-y-4">
          <FileText className="w-10 h-10 text-zinc-300 mx-auto" />
          <h3 className="font-mono text-sm font-bold uppercase tracking-wider">
            No Master Resume Found
          </h3>
          <p className="font-sans text-xs text-zinc-500 leading-relaxed max-w-sm mx-auto uppercase font-mono">
            To activate your Career Copilot and start matching jobs, please upload your Master Resume.
          </p>
          <div className="pt-2">
            <Button
              onClick={() => router.push("/onboarding/resume")}
              className="font-mono text-xs uppercase tracking-wider bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 px-6 py-2.5"
            >
              Upload Master Resume
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      
      {/* 1. Header Command Area */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-zinc-200 dark:border-zinc-900 pb-5">
        <div>
          <h1 className="font-mono text-lg font-black uppercase tracking-wider">
            Mission Control
          </h1>
          <p className="font-sans text-xs text-zinc-500 uppercase tracking-widest mt-1">
            AI-First Career Copilot
          </p>
        </div>

        {/* User profile identifier */}
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-full border border-border bg-secondary/15 flex items-center justify-center font-mono text-xs uppercase font-bold text-accent">
            {name.charAt(0)}
          </div>
          <div>
            <p className="text-xs font-mono font-bold uppercase">{name}</p>
            <p className="text-[9px] font-mono text-zinc-400 uppercase">Onboarding Verified</p>
          </div>
        </div>
      </div>

      {/* 2. Proactive AI Copilot Card */}
      <Card className="p-6 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/40 relative overflow-hidden space-y-4">
        <div className="absolute top-0 right-0 h-40 w-40 bg-accent/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-accent animate-pulse" />
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
              Good Morning, {name}.
            </h3>
          </div>
          <span className="font-mono text-[9px] px-2 py-0.5 border border-emerald-500/20 bg-emerald-500/5 text-emerald-500 rounded-full font-bold uppercase">
            Copilot Connected
          </span>
        </div>
        
        <p className="font-mono text-[10px] text-zinc-400 uppercase tracking-wide">
          Today I recommend the following actions to improve your response rate:
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {copilotTasks.map((task) => {
            const isChecked = !!checkedTasks[task.id];
            return (
              <button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`w-full flex items-start gap-3 p-3 border rounded text-left transition-all cursor-pointer ${
                  isChecked 
                    ? "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-900 opacity-60" 
                    : "bg-white dark:bg-zinc-900/60 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700"
                }`}
              >
                {isChecked ? (
                  <CheckSquare className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                )}
                <span className={`text-[10px] font-mono leading-relaxed uppercase ${isChecked ? "line-through text-zinc-400" : "text-zinc-600 dark:text-zinc-300"}`}>
                  {task.text}
                </span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* 3. Horizontal Quick Actions Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <button
          onClick={() => setAnalyzeModalOpen(true)}
          className="flex flex-col items-center justify-center p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 rounded hover:border-accent hover:bg-secondary/10 transition-all group cursor-pointer"
        >
          <SearchCode className="w-4 h-4 text-zinc-400 group-hover:text-accent mb-1.5 transition-colors" />
          <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold group-hover:text-foreground">Analyze Job</span>
        </button>

        <button
          onClick={() => {
            if (defaultResume?.id) {
              router.push(`/resumes/${defaultResume.id}/tailor`);
            } else {
              router.push("/resumes");
            }
          }}
          className="flex flex-col items-center justify-center p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 rounded hover:border-accent hover:bg-secondary/10 transition-all group cursor-pointer"
        >
          <Target className="w-4 h-4 text-zinc-400 group-hover:text-accent mb-1.5 transition-colors" />
          <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold group-hover:text-foreground">Tailor Resume</span>
        </button>

        <button
          onClick={() => router.push("/onboarding/resume")}
          className="flex flex-col items-center justify-center p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 rounded hover:border-accent hover:bg-secondary/10 transition-all group cursor-pointer"
        >
          <Plus className="w-4 h-4 text-zinc-400 group-hover:text-accent mb-1.5 transition-colors" />
          <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold group-hover:text-foreground">Upload Master</span>
        </button>

        <button
          onClick={() => router.push("/jobs")}
          className="flex flex-col items-center justify-center p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 rounded hover:border-accent hover:bg-secondary/10 transition-all group cursor-pointer"
        >
          <Briefcase className="w-4 h-4 text-zinc-400 group-hover:text-accent mb-1.5 transition-colors" />
          <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold group-hover:text-foreground">Track Apps</span>
        </button>

        <button
          onClick={() => {
            if (defaultResume?.id) {
              router.push(`/onboarding/review?resumeId=${defaultResume.id}`);
            } else {
              router.push("/onboarding/review");
            }
          }}
          className="flex flex-col items-center justify-center p-3 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/40 rounded hover:border-accent hover:bg-secondary/10 transition-all group col-span-2 sm:col-span-1 cursor-pointer"
        >
          <FileText className="w-4 h-4 text-zinc-400 group-hover:text-accent mb-1.5 transition-colors" />
          <span className="font-mono text-[8px] uppercase tracking-wider text-zinc-500 font-bold group-hover:text-foreground">View Profile</span>
        </button>
      </div>

      {/* 4. Two-Column Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT COLUMN: Pipelines, Discovery, Activity */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Widget 1: Application Summary Pipeline */}
          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 rounded-lg space-y-4 shadow-sm">
            <div className="flex justify-between items-center border-b border-zinc-100 dark:border-zinc-900 pb-2">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider">
                Application Summary Pipeline
              </h3>
              <span className="font-mono text-[8px] px-2 py-0.5 bg-zinc-100 dark:bg-zinc-900 text-zinc-500 font-bold uppercase rounded">
                Active: {jobs.length}
              </span>
            </div>

            {/* Pipeline Stage Indicators */}
            <div className="grid grid-cols-4 gap-2 text-center">
              {[
                { label: "Wishlist", count: pipelineCounts.wishlist },
                { label: "Applied", count: pipelineCounts.applied },
                { label: "Interviewing", count: pipelineCounts.interviewing },
                { label: "Offered", count: pipelineCounts.offered }
              ].map((stage) => (
                <div key={stage.label} className="p-2 border border-zinc-100 dark:border-zinc-900 rounded bg-secondary/5">
                  <p className="font-mono text-[16px] font-bold text-accent">{stage.count}</p>
                  <p className="font-mono text-[8px] text-zinc-400 uppercase mt-0.5">{stage.label}</p>
                </div>
              ))}
            </div>

            {/* Top 3 Active Applications */}
            <div className="space-y-2 pt-2">
              <p className="font-mono text-[8px] text-zinc-400 uppercase tracking-wider">Urgent Action Timeline</p>
              {isJobsLoading ? (
                <div className="p-4 text-center text-xs font-mono text-zinc-400">Loading pipeline details...</div>
              ) : jobs.length === 0 ? (
                <div className="p-4 text-center border border-dashed border-zinc-200 dark:border-zinc-850 bg-secondary/5 font-mono text-[8px] uppercase text-zinc-500">
                  No applications tracked yet. Click Track Apps to add pipelines.
                </div>
              ) : (
                <div className="space-y-2">
                  {jobs.slice(0, 3).map((job) => (
                    <div key={job.id} className="flex justify-between items-center p-3 border border-zinc-100 dark:border-zinc-900 rounded hover:border-zinc-350 dark:hover:border-zinc-700 transition-colors">
                      <div className="min-w-0">
                        <p className="text-[10px] font-mono font-bold uppercase truncate">{job.title}</p>
                        <p className="text-[8px] text-zinc-400 font-mono mt-0.5">{job.location || "Location Not Provided"} &bull; Priority: {job.priority}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[8px] uppercase tracking-widest px-2.5 py-0.5 border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 rounded">
                          {job.status}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Widget 2: Opportunities For You (Discovery) */}
          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 rounded-lg space-y-4 shadow-sm">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2">
              Opportunities For You
            </h3>

            <div className="space-y-3">
              {[
                { title: "Software Engineer", company: "Notion", match: "94% Match", why: "Matches Go, React, and SQL stack from your Experience Timeline." },
                { title: "Frontend Engineer", company: "Vercel", match: "89% Match", why: "Matches Next.js & Tailwind stack from your portfolio projects." },
                { title: "Backend Developer", company: "Stripe", match: "86% Match", why: "Matches API Design & Node.js skills from your Stripe experience details." }
              ].map((role) => (
                <div key={role.company} className="p-3 border border-zinc-100 dark:border-zinc-900 rounded bg-secondary/5 space-y-1.5 text-left">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="text-[10px] font-mono font-bold uppercase">{role.title}</span>
                      <span className="text-[8px] font-mono text-zinc-400 uppercase ml-1.5">at {role.company}</span>
                    </div>
                    <span className="text-[8px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 bg-emerald-500/10 border border-emerald-500/25 text-emerald-500">
                      {role.match}
                    </span>
                  </div>
                  <p className="text-[9px] font-mono text-zinc-500 uppercase leading-relaxed">
                    {role.why}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 3: Career Journey Activity Timeline */}
          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 rounded-lg space-y-4 shadow-sm">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2">
              Career Journey Timeline
            </h3>

            <div className="space-y-4 pl-4 relative before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-100 dark:before:bg-zinc-900">
              {[
                { time: "2 hours ago", text: "Tailored Master Resume for Google Backend Role." },
                { time: "1 day ago", text: "Applied to Vercel Software Engineer Role." },
                { time: "2 days ago", text: "Master Resume parsed and Career Profile verified successfully." }
              ].map((activity) => (
                <div key={activity.time} className="relative space-y-1 text-left">
                  <span className="absolute -left-4 top-1.5 h-1.5 w-1.5 rounded-full bg-accent" />
                  <p className="text-[9px] font-mono text-zinc-400 uppercase">{activity.time}</p>
                  <p className="text-[10px] font-mono uppercase text-zinc-700 dark:text-zinc-300">{activity.text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: Career Health, AI Insights */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Widget 4: Career Pulse (Health Panel) */}
          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 rounded-lg space-y-4 shadow-sm">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2 flex items-center gap-1.5">
              <HeartPulse className="w-4 h-4 text-rose-500 animate-pulse" />
              Career Pulse
            </h3>

            <div className="space-y-4">
              {[
                { label: "Profile Strength", value: completenessScore, why: "LinkedIn & GitHub links connected successfully." },
                { label: "Resume Health", value: 88, why: "Some experience bullets lack quantitative metric figures." },
                { label: "Application Health", value: 75, why: "Maintain standard application follow-up rates." },
                { label: "Interview Readiness", value: 80, why: "Go & React technical domains prep completed." }
              ].map((stat) => (
                <div key={stat.label} className="space-y-1 text-left">
                  <div className="flex justify-between font-mono text-[9px] uppercase">
                    <span className="font-bold text-zinc-500">{stat.label}</span>
                    <span className="text-accent font-bold">{stat.value}%</span>
                  </div>
                  {/* Custom Progress Bar */}
                  <div className="h-1.5 w-full bg-secondary rounded overflow-hidden">
                    <div className="h-full bg-accent" style={{ width: `${stat.value}%` }} />
                  </div>
                  <p className="text-[8px] font-mono text-zinc-400 uppercase mt-0.5">
                    {stat.why}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Widget 5: Proactive AI Insights (Warnings) */}
          <div className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 rounded-lg space-y-4 shadow-sm">
            <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-amber-500" />
              AI Insights & Warnings
            </h3>

            <div className="space-y-3">
              {[
                "You are applying to mostly Senior roles. Mid-level software engineer roles have a 3x higher response rate for your years of experience.",
                "React appears in 92% of matched jobs but is only listed in 1 experience bullet point.",
                "You haven't followed up on your Stripe application in 5 days."
              ].map((warning, i) => (
                <div key={i} className="flex gap-2 p-2.5 border border-amber-500/20 bg-amber-500/5 rounded text-left">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-[9px] font-mono text-amber-800 dark:text-amber-400 uppercase leading-normal">
                    {warning}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>

      {/* 5. Job Scrape & Analysis Modal */}
      <Modal
        isOpen={analyzeModalOpen}
        onClose={() => {
          setAnalyzeModalOpen(false);
          handleResetAnalysis();
        }}
        title="JOB ANALYSIS COMMAND CENTER"
      >
        <div className="space-y-6 text-left">
          {analysisStep === "input" ? (
            <form onSubmit={handleRunAnalysis} className="space-y-4">
              <p className="font-sans text-xs text-zinc-500 leading-relaxed uppercase font-mono">
                Input the target job specifications below. Our AI will scrape the parameters and calculate multidimensional fit vectors.
              </p>

              <div className="space-y-1.5">
                <label className="font-mono text-[9px] uppercase font-bold text-zinc-400">
                  Target Job URL
                </label>
                <input
                  type="url"
                  placeholder="https://company.com/careers/role-name"
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-secondary/10 text-xs font-sans focus:outline-none focus:border-accent"
                  disabled={extracting || analyzing}
                />
              </div>

              <div className="flex items-center justify-between font-mono text-[9px] uppercase tracking-wider text-zinc-400 font-bold">
                <span>OR PASTE JOB DESCRIPTION DETAILS</span>
              </div>

              <div className="space-y-1.5">
                <textarea
                  rows={6}
                  placeholder="Paste details of seniority level, core duties, and skill stack requirements here..."
                  value={jobText}
                  onChange={(e) => setJobText(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-secondary/10 text-xs font-sans focus:outline-none focus:border-accent"
                  disabled={extracting || analyzing}
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setAnalyzeModalOpen(false)}
                  className="font-mono text-xs uppercase"
                  disabled={extracting || analyzing}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  className="font-mono text-xs uppercase flex items-center gap-1.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 cursor-pointer"
                  disabled={extracting || analyzing || (!jobUrl.trim() && !jobText.trim())}
                >
                  {extracting ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> SCRAPING URL...
                    </>
                  ) : analyzing ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> RUNNING COMPATIBILITY...
                    </>
                  ) : (
                    <>
                      ANALYZE FIT <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <h3 className="font-mono text-xs font-bold uppercase tracking-wider border-b border-zinc-100 dark:border-zinc-900 pb-2">
                Scraped Job Details
              </h3>
              {extractedJob && (
                <div className="p-3 border border-zinc-100 dark:border-zinc-900 rounded bg-secondary/5 font-mono text-[9px] uppercase space-y-1">
                  <p><span className="text-zinc-400">Title:</span> {extractedJob.jobTitle}</p>
                  <p><span className="text-zinc-400">Location:</span> {extractedJob.location || "Not Scraped"}</p>
                  <p><span className="text-zinc-400">Responsibilities Extracted:</span> {extractedJob.responsibilities?.length || 0} nodes</p>
                </div>
              )}

              {matchReport && (
                <div className="p-3 border border-zinc-150 dark:border-zinc-900 rounded bg-accent/5 font-mono text-[9px] uppercase space-y-2">
                  <div className="flex justify-between items-center font-bold">
                    <span>OVERALL ATS ALIGNMENT FIT:</span>
                    <span className="text-accent">{matchReport.overallScore}%</span>
                  </div>
                  <p><span className="text-zinc-400">Compatibility Verdict:</span> {matchReport.recommendation.reason}</p>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  onClick={handleResetAnalysis}
                  variant="outline"
                  className="font-mono text-xs uppercase"
                >
                  Analyze Another
                </Button>
                <Button
                  onClick={handleProceedToTailoring}
                  className="font-mono text-xs uppercase bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 flex items-center gap-1.5"
                >
                  Proceed to Tailoring <ArrowRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </Modal>

    </div>
  );
}
