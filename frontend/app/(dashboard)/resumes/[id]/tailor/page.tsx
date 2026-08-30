"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  ArrowLeft, 
  Link2, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  TrendingUp, 
  FileText, 
  HelpCircle, 
  RefreshCw, 
  ArrowRight,
  ShieldAlert,
  Save,
  BrainCircuit,
  Wand2,
  BarChart3,
  Download
} from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/Button";
import { Card, CardContent } from "@/components/Card";
import { useToast } from "@/providers/ToastProvider";
import { useResume, useStructuredResume } from "@/features/resume/hooks/useResumes";
import { ResumeRow } from "@/features/resume/resume.types";
import { 
  useExtractJob, 
  useATSAnalysis, 
  useTailorResume, 
  useSaveTailoredResume 
} from "@/features/resume/hooks/useTailoring";
import { JobDetails, ATSAnalysisReport, TailoredResumeResponse } from "@/features/resume/types/tailoring.types";

export default function TailorPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();
  const { toast } = useToast();

  // Queries
  const { data: resume, isLoading: isResumeLoading } = useResume(id);
  const { data: originalStructured } = useStructuredResume(id);

  // Mutations
  const extractJobMutation = useExtractJob();
  const atsAnalysisMutation = useATSAnalysis(id);
  const tailorResumeMutation = useTailorResume(id);
  const saveResumeMutation = useSaveTailoredResume(id);

  // Stepper state
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Input states
  const [jobUrl, setJobUrl] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("");

  // Extracted/Calculated Data
  const [jobSnapshot, setJobSnapshot] = useState<JobDetails | null>(null);
  const [atsReport, setAtsReport] = useState<ATSAnalysisReport | null>(null);
  const [tailoredResult, setTailoredResult] = useState<TailoredResumeResponse | null>(null);
  
  const [customVersionName, setCustomVersionName] = useState("");
  const [savedResume, setSavedResume] = useState<ResumeRow | null>(null);

  const [bulletDecisions, setBulletDecisions] = useState<{
    original: string;
    current: string;
    reason: string;
    requirement: string;
    confidence: number;
    status: 'accepted' | 'rejected';
  }[]>([]);

  useEffect(() => {
    if (tailoredResult?.explanation?.bulletSuggestions) {
      const suggestions = tailoredResult.explanation.bulletSuggestions.map(s => ({
        original: s.originalBullet,
        current: s.tailoredBullet,
        reason: s.reason,
        requirement: s.requirement,
        confidence: s.confidence,
        status: 'accepted' as const,
      }));
      setBulletDecisions(suggestions);
    } else {
      setBulletDecisions([]);
    }
  }, [tailoredResult]);

  const getCompiledStructuredData = () => {
    if (!tailoredResult) return null;
    const data = JSON.parse(JSON.stringify(tailoredResult.tailoredData));
    
    bulletDecisions.forEach(decision => {
      if (decision.status === 'rejected') {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data.experience.forEach((exp: any) => {
          if (exp.description.includes(decision.current)) {
            exp.description = exp.description.replace(decision.current, decision.original);
          }
        });
      } else if (decision.status === 'accepted' && decision.current !== decision.original) {
        const defaultTailoredText = tailoredResult.explanation.bulletSuggestions?.find(
          s => s.originalBullet === decision.original
        )?.tailoredBullet;
        
        if (defaultTailoredText) {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          data.experience.forEach((exp: any) => {
            if (exp.description.includes(defaultTailoredText)) {
              exp.description = exp.description.replace(defaultTailoredText, decision.current);
            }
          });
        }
      }
    });

    return data;
  };

  // Step 1: Process URL Extraction or Direct Text Ingest
  const handleIngest = async () => {
    if (jobUrl.trim()) {
      try {
        toast("Scraping job requirements from URL...", "info", 2000);
        const result = await extractJobMutation.mutateAsync({ url: jobUrl });
        setJobSnapshot(result);
        setCompanyName(result.companyName);
        setJobTitle(result.jobTitle);
        setJobDescription(result.description);
        setLocation(result.location);
        setEmploymentType(result.employmentType);
        
        toast("Job details extracted successfully!", "success");
        // Proceed to ATS analysis immediately
        runATSAnalysis(result.description);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        toast(`URL Extraction failed: ${msg}. Falling back to manual description.`, "warning", 4000);
      }
    } else if (jobDescription.trim()) {
      const manualSnapshot: JobDetails = {
        companyName: companyName.trim() || "Target Company",
        jobTitle: jobTitle.trim() || "Target Role",
        description: jobDescription.trim(),
        location: location.trim() || "Remote/Hybrid",
        employmentType: employmentType.trim() || "Full-time",
      };
      setJobSnapshot(manualSnapshot);
      runATSAnalysis(manualSnapshot.description);
    } else {
      toast("Please enter either a Job URL or Job Description details.", "warning");
    }
  };

  // Run ATS compatibility assessment
  const runATSAnalysis = async (descText: string) => {
    try {
      toast("Running keyword alignment report...", "info", 2000);
      const report = await atsAnalysisMutation.mutateAsync({ jobDescription: descText });
      setAtsReport(report);
      toast("ATS Compatibility Analysis completed!", "success");
      setStep(2);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast(`ATS Analysis failed: ${msg}`, "error");
    }
  };

  // Step 2: Trigger Resume Tailoring
  const handleGenerateTailored = async () => {
    if (!jobSnapshot) return;
    try {
      toast("Rewriting summaries and experience bullet points...", "info", 3000);
      const tailored = await tailorResumeMutation.mutateAsync({ 
        jobDescription: jobSnapshot.description 
      });
      setTailoredResult(tailored);
      
      // Default version naming convention
      const companyClean = jobSnapshot.companyName.replace(/\s+/g, "");
      const titleClean = jobSnapshot.jobTitle.replace(/\s+/g, "");
      setCustomVersionName(`Tailored - ${companyClean} ${titleClean}`);
      
      toast("Resume optimization completed!", "success");
      setStep(3);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast(`Resume Tailoring failed: ${msg}`, "error");
    }
  };

  // Step 3: Save approved version
  const handleSaveVersion = async () => {
    if (!tailoredResult || !jobSnapshot || !atsReport) return;
    if (!customVersionName.trim()) {
      toast("Please specify a version name.", "warning");
      return;
    }

    try {
      const result = await saveResumeMutation.mutateAsync({
        versionName: customVersionName.trim(),
        tailoredData: getCompiledStructuredData() || tailoredResult.tailoredData,
        jobSnapshot,
        explanation: tailoredResult.explanation as unknown as Record<string, unknown>,
        atsScore: atsReport.overallScore,
        atsReport: atsReport as unknown as Record<string, unknown>,
      });
      setSavedResume(result);
      toast("Tailored resume version saved successfully!", "success");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      toast(`Failed to save resume: ${msg}`, "error");
    }
  };

  if (savedResume) {
    return (
      <div className="space-y-6 max-w-2xl mx-auto py-12 text-center font-sans">
        <div className="mx-auto w-16 h-16 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8" />
        </div>
        <h2 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">Tailored Resume Saved!</h2>
        <p className="text-sm text-zinc-500 max-w-md mx-auto leading-relaxed">
          Version <span className="font-mono text-zinc-900 dark:text-zinc-100 font-semibold">&ldquo;{savedResume.version_name}&rdquo;</span> has been created successfully as a new immutable resume history node.
        </p>

        <div className="grid grid-cols-1 gap-3 max-w-sm mx-auto pt-8">
          <Button
            onClick={() => router.push(`/ats/${savedResume.id}`)}
            className="w-full bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 py-2.5 rounded text-xs font-mono tracking-wider uppercase font-semibold flex items-center justify-center gap-2"
          >
            <BarChart3 className="w-4 h-4" />
            <span>View ATS Report</span>
          </Button>

          <Button
            disabled
            variant="outline"
            className="w-full border border-zinc-200 dark:border-zinc-800 text-zinc-400 dark:text-zinc-650 py-2.5 rounded text-xs font-mono tracking-wider uppercase font-semibold flex items-center justify-center gap-2 cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            <span>Download Resume (Future Module)</span>
          </Button>

          <Button
            onClick={() => router.push("/resumes")}
            variant="outline"
            className="w-full border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 py-2.5 rounded text-xs font-mono tracking-wider uppercase font-semibold flex items-center justify-center gap-2"
          >
            <span>Continue to Library</span>
          </Button>
        </div>
      </div>
    );
  }

  if (isResumeLoading || !resume) {
    return (
      <div className="space-y-6 max-w-5xl py-8 animate-pulse font-sans">
        <div className="h-8 w-64 bg-zinc-200 dark:bg-zinc-800 rounded" />
        <div className="h-32 bg-zinc-100 dark:bg-zinc-900 rounded" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl py-8 font-sans">
      <div className="flex items-center gap-3">
        <Link href="/resumes" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <PageHeader 
          title="Resume Tailoring Studio"
          description={`Customize and optimize "${resume.version_name}" for a target job specification.`}
        />
      </div>

      {/* Stepper Wizard Indicator */}
      <div className="flex items-center justify-between max-w-3xl mx-auto border-b border-zinc-200 dark:border-zinc-800 pb-5">
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
            step === 1 ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900"
          }`}>1</span>
          <span className={`text-xs font-semibold ${step === 1 ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400"}`}>Job Details</span>
        </div>
        <ArrowRight className="w-4 h-4 text-zinc-300" />
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
            step === 2 ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900"
          }`}>2</span>
          <span className={`text-xs font-semibold ${step === 2 ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400"}`}>ATS Match Report</span>
        </div>
        <ArrowRight className="w-4 h-4 text-zinc-300" />
        <div className="flex items-center gap-2">
          <span className={`w-7 h-7 rounded-full flex items-center justify-center font-mono text-xs font-bold ${
            step === 3 ? "bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950" : "bg-zinc-100 text-zinc-500 dark:bg-zinc-900"
          }`}>3</span>
          <span className={`text-xs font-semibold ${step === 3 ? "text-zinc-900 dark:text-zinc-50" : "text-zinc-400"}`}>Tailor & Preview</span>
        </div>
      </div>

      {/* STEP 1: JOB DETAILS INGESTION */}
      {step === 1 && (
        <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
          <CardContent className="p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-sm font-mono uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <Link2 className="w-4 h-4 text-zinc-400" />
                Ingest Job URL
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500">
                Paste a link to a job posting (e.g. Greenhouse, Lever, LinkedIn, etc.) to extract details automatically.
              </p>
              <div className="flex gap-3">
                <input
                  type="url"
                  placeholder="https://careers.google.com/jobs/results/..."
                  value={jobUrl}
                  onChange={(e) => setJobUrl(e.target.value)}
                  className="flex-1 px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-xs font-mono focus:border-zinc-400 dark:focus:border-zinc-700 outline-none text-zinc-900 dark:text-zinc-100"
                />
                <Button 
                  disabled={extractJobMutation.isPending || atsAnalysisMutation.isPending}
                  onClick={handleIngest}
                  className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 rounded px-4 text-xs font-mono tracking-wider uppercase font-semibold flex items-center gap-2 shrink-0"
                >
                  {extractJobMutation.isPending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="w-3.5 h-3.5" />
                  )}
                  Analyze URL
                </Button>
              </div>
            </div>

            <div className="relative flex py-2 items-center">
              <div className="flex-grow border-t border-zinc-100 dark:border-zinc-900"></div>
              <span className="flex-shrink mx-4 text-[10px] font-mono text-zinc-400 uppercase tracking-widest">OR Paste Details</span>
              <div className="flex-grow border-t border-zinc-100 dark:border-zinc-900"></div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Company Name</label>
                <input
                  type="text"
                  placeholder="e.g. Stripe"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-xs focus:border-zinc-400 dark:focus:border-zinc-700 outline-none text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Job Title / Role</label>
                <input
                  type="text"
                  placeholder="e.g. Senior Frontend Engineer"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-xs focus:border-zinc-400 dark:focus:border-zinc-700 outline-none text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Location</label>
                <input
                  type="text"
                  placeholder="e.g. San Francisco, CA (Hybrid)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-xs focus:border-zinc-400 dark:focus:border-zinc-700 outline-none text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Employment Type</label>
                <input
                  type="text"
                  placeholder="e.g. Full-time / Contract"
                  value={employmentType}
                  onChange={(e) => setEmploymentType(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-xs focus:border-zinc-400 dark:focus:border-zinc-700 outline-none text-zinc-900 dark:text-zinc-100"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Job Description Text</label>
              <textarea
                rows={8}
                placeholder="Paste the full job requirements and specifications here..."
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-xs focus:border-zinc-400 dark:focus:border-zinc-700 outline-none text-zinc-900 dark:text-zinc-100 font-sans"
              />
            </div>

            <div className="flex justify-end pt-3">
              <Button
                disabled={atsAnalysisMutation.isPending}
                onClick={handleIngest}
                className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 rounded px-5 py-2.5 text-xs font-mono tracking-wider uppercase font-semibold flex items-center gap-2"
              >
                {atsAnalysisMutation.isPending ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <>
                    <span>Next: Match Assessment</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* STEP 2: ATS MATCH ASSESSMENT */}
      {step === 2 && atsReport && jobSnapshot && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Score Ring Card */}
            <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 flex flex-col items-center justify-center text-center space-y-4">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400 font-bold">Overall compatibility</span>
              <div className="relative w-36 h-36 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" className="stroke-zinc-100 dark:stroke-zinc-900" strokeWidth="6" fill="transparent" />
                  <circle 
                    cx="50" 
                    cy="50" 
                    r="40" 
                    className="stroke-zinc-900 dark:stroke-zinc-100 transition-all duration-1000" 
                    strokeWidth="6" 
                    fill="transparent" 
                    strokeDasharray={251.2}
                    strokeDashoffset={251.2 - (251.2 * atsReport.overallScore) / 100}
                  />
                </svg>
                <div className="absolute text-center">
                  <span className="text-3xl font-mono font-black text-zinc-900 dark:text-zinc-50">{atsReport.overallScore}%</span>
                  <p className="text-[9px] font-mono uppercase text-zinc-400 font-semibold tracking-wider">ATS Score</p>
                </div>
              </div>
              <p className="text-xs text-zinc-500 font-sans px-2">
                This rating represents how well your skills, formatting, and history match requirements.
              </p>
            </Card>

            {/* Match Breakdown Columns */}
            <Card className="col-span-1 md:col-span-2 border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 space-y-5">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-zinc-400" />
                Score Categories Breakdown
              </h3>
              
              <div className="space-y-4">
                {[
                  { label: "Keyword Matching", value: atsReport.keywordScore },
                  { label: "Skills Compatibility", value: atsReport.skillsMatch },
                  { label: "Experience Seniority", value: atsReport.experienceMatch },
                  { label: "Education Mapping", value: atsReport.educationMatch },
                  { label: "Formatting Confidence", value: atsReport.formattingConfidence },
                ].map((item, idx) => (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-semibold text-zinc-600 dark:text-zinc-400">
                      <span>{item.label}</span>
                      <span className="font-mono text-zinc-900 dark:text-zinc-200">{item.value}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-full overflow-hidden">
                      <div className="h-full bg-zinc-900 dark:bg-zinc-100" style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Keywords Gap Panel */}
          <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6">
            <CardContent className="p-0 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Matching Keywords */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" />
                    Matching Keywords ({atsReport.matchingKeywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {atsReport.matchingKeywords.length > 0 ? (
                      atsReport.matchingKeywords.map((word, i) => (
                        <span key={i} className="px-2 py-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded border border-emerald-100 dark:border-emerald-900/30">
                          {word}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-zinc-400 dark:text-zinc-500 font-sans italic">No matching keywords found.</span>
                    )}
                  </div>
                </div>

                {/* Missing Keywords */}
                <div className="space-y-3">
                  <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-rose-600 dark:text-rose-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    Missing Keywords ({atsReport.missingKeywords.length})
                  </h3>
                  <div className="flex flex-wrap gap-1.5">
                    {atsReport.missingKeywords.length > 0 ? (
                      atsReport.missingKeywords.map((word, i) => (
                        <span key={i} className="px-2 py-1 text-[10px] font-semibold bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 rounded border border-rose-100 dark:border-rose-900/30">
                          {word}
                        </span>
                      ))
                    ) : (
                      <span className="text-xs text-emerald-600 font-sans italic">Excellent! You have no critical missing keywords.</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actionable Advice */}
              <div className="space-y-3 border-t border-zinc-100 dark:border-zinc-900/60 pt-5">
                <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-zinc-400" />
                  ATS Optimization Strategy
                </h3>
                <ul className="space-y-2">
                  {atsReport.advice.map((item, idx) => (
                    <li key={idx} className="text-xs text-zinc-500 dark:text-zinc-400 flex items-start gap-2.5 font-sans leading-relaxed">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 dark:bg-zinc-50 mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* Step 2 Actions */}
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={() => setStep(1)}
              className="border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded px-4 py-2 text-xs font-mono tracking-wider uppercase font-semibold"
            >
              Back to Job Details
            </Button>
            
            <Button
              disabled={tailorResumeMutation.isPending}
              onClick={handleGenerateTailored}
              className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 rounded px-5 py-2.5 text-xs font-mono tracking-wider uppercase font-semibold flex items-center gap-2"
            >
              {tailorResumeMutation.isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5" />
                  <span>Generate Tailored Resume</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}

      {/* STEP 3: TAILORED PREVIEW & EXPLANATION PANEL */}
      {step === 3 && tailoredResult && jobSnapshot && atsReport && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Diff Preview Pane */}
            <div className="col-span-1 md:col-span-2 space-y-4">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <FileText className="w-4 h-4 text-zinc-400" />
                Resume Tailoring Diff Preview
              </h3>

              <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 max-h-[60vh] overflow-y-auto p-5 space-y-6">
                {/* Professional Summary comparison */}
                <div className="space-y-2 pb-5 border-b border-zinc-100 dark:border-zinc-900/60">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Professional Summary</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-zinc-200/50 dark:border-zinc-800/40">
                      <p className="text-[10px] font-mono text-rose-600 uppercase tracking-widest mb-1.5 font-bold">Original</p>
                      <p className="text-xs text-zinc-500 font-sans leading-relaxed">{originalStructured?.summary || "No summary specified."}</p>
                    </div>
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-900/50 rounded border border-zinc-200/50 dark:border-zinc-800/40">
                      <p className="text-[10px] font-mono text-emerald-600 uppercase tracking-widest mb-1.5 font-bold">Tailored</p>
                      <p className="text-xs text-zinc-800 dark:text-zinc-200 font-sans leading-relaxed">{tailoredResult.tailoredData.summary}</p>
                    </div>
                  </div>
                </div>

                {/* Skills comparison */}
                <div className="space-y-2 pb-5 border-b border-zinc-100 dark:border-zinc-900/60">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Skills Comparison</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">Original Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {originalStructured?.skills.map((s, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 text-[9px] bg-zinc-100 text-zinc-600 dark:bg-zinc-900 dark:text-zinc-400 border border-zinc-200/50 dark:border-zinc-800/30 rounded">{s}</span>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider font-semibold">Tailored Skills</p>
                      <div className="flex flex-wrap gap-1">
                        {tailoredResult.tailoredData.skills.map((s, idx) => {
                          const isNew = !originalStructured?.skills.includes(s);
                          return (
                            <span 
                              key={idx} 
                              className={`px-1.5 py-0.5 text-[9px] border rounded ${
                                isNew 
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30 font-semibold" 
                                  : "bg-zinc-100 text-zinc-600 border-zinc-200/50 dark:bg-zinc-900 dark:text-zinc-400 dark:border-zinc-800/30"
                              }`}
                            >
                              {s}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Interactive Bullet Suggestions Panel */}
                <div className="space-y-4">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Interactive AI Bullet Ingestion Studio</h4>
                  
                  {bulletDecisions && bulletDecisions.length > 0 ? (
                    <div className="space-y-4">
                      {bulletDecisions.map((decision, idx) => (
                        <div 
                          key={idx} 
                          className={`p-4 border rounded-lg space-y-3 transition-colors ${
                            decision.status === 'rejected'
                              ? "border-rose-200/40 bg-rose-50/5 dark:border-rose-900/10 dark:bg-rose-950/5"
                              : "border-zinc-200 dark:border-zinc-800 bg-secondary/10"
                          }`}
                        >
                          <div className="flex flex-wrap justify-between items-center gap-2">
                            <span className="px-2 py-0.5 text-[8px] font-mono font-bold bg-accent/15 text-accent uppercase tracking-wider rounded">
                              Target JD: {decision.requirement || "General Optimization"}
                            </span>
                            <span className="font-mono text-[9px] text-zinc-400">
                              Confidence: {decision.confidence}%
                            </span>
                          </div>

                          <div className="space-y-2 text-left">
                            {/* Original bullet */}
                            <div className="text-[11px] font-sans text-zinc-400 line-through leading-relaxed">
                              &ldquo;{decision.original}&rdquo;
                            </div>
                            
                            {/* Tailored / Edited bullet */}
                            {decision.status === 'accepted' ? (
                              <textarea
                                rows={2}
                                value={decision.current}
                                onChange={(e) => {
                                  const list = [...bulletDecisions];
                                  list[idx].current = e.target.value;
                                  setBulletDecisions(list);
                                }}
                                className="w-full px-3 py-1.5 border border-zinc-200 dark:border-zinc-850 rounded bg-white dark:bg-zinc-900 text-xs font-sans text-zinc-800 dark:text-zinc-200 focus:outline-none focus:border-accent animate-in fade-in"
                              />
                            ) : (
                              <div className="text-xs font-sans text-zinc-500 italic uppercase">
                                Bullet suggestion rejected (using original CV text)
                              </div>
                            )}
                          </div>

                          {/* Explanation reason */}
                          <div className="text-[9px] font-mono text-zinc-400 uppercase italic">
                            Why: {decision.reason}
                          </div>

                          {/* Action toggle buttons */}
                          <div className="flex gap-2 justify-end pt-1">
                            <button
                              type="button"
                              onClick={() => {
                                const list = [...bulletDecisions];
                                list[idx].status = 'rejected';
                                setBulletDecisions(list);
                              }}
                              className={`font-mono text-[9px] uppercase px-3 py-1.5 border cursor-pointer ${
                                decision.status === 'rejected' 
                                  ? "border-rose-500 text-rose-500 bg-rose-50/10" 
                                  : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                              }`}
                            >
                              Reject Suggestion
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const list = [...bulletDecisions];
                                list[idx].status = 'accepted';
                                setBulletDecisions(list);
                              }}
                              className={`font-mono text-[9px] uppercase px-3 py-1.5 border cursor-pointer ${
                                decision.status === 'accepted' 
                                  ? "bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-50 dark:text-zinc-950 dark:border-zinc-50" 
                                  : "border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                              }`}
                            >
                              Accept Suggestion
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    /* Fallback to simple experience block if no suggestions are returned */
                    <div className="space-y-4">
                      {tailoredResult.tailoredData.experience.map((exp, idx) => {
                        const origExp = originalStructured?.experience[idx];
                        return (
                          <div key={idx} className="space-y-2 border-b border-zinc-100 dark:border-zinc-900/50 pb-4 last:border-0 last:pb-0">
                            <p className="text-xs font-semibold text-zinc-800 dark:text-zinc-300 font-mono">
                              {exp.position} at {exp.company}
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/30 rounded border border-zinc-200/40 dark:border-zinc-800/20">
                                <p className="text-xs text-zinc-400 font-sans whitespace-pre-wrap leading-relaxed">
                                  {origExp?.description || "No description provided."}
                                </p>
                              </div>
                              <div className="p-2.5 bg-zinc-50 dark:bg-zinc-900/30 rounded border border-zinc-200/40 dark:border-zinc-800/20">
                                <p className="text-xs text-zinc-700 dark:text-zinc-200 font-sans whitespace-pre-wrap leading-relaxed">
                                  {exp.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </Card>
            </div>

            {/* AI Explanation Side Panel */}
            <div className="space-y-5">
              <h3 className="text-xs font-mono uppercase tracking-wider font-bold text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-zinc-400" />
                AI Explanation Panel
              </h3>

              <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-5">
                {/* Confidence Level */}
                <div className="flex items-center justify-between border-b border-zinc-100 dark:border-zinc-900 pb-3">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Optimization Confidence</span>
                  <span className="text-sm font-mono font-bold text-zinc-900 dark:text-zinc-50">{tailoredResult.explanation.aiConfidence}%</span>
                </div>

                {/* Modified sections list */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">Sections Modified</h4>
                  <div className="flex flex-wrap gap-1">
                    {tailoredResult.explanation.sectionsModified.map((sec, i) => (
                      <span key={i} className="px-2 py-0.5 text-[9px] font-semibold bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 rounded">
                        {sec}
                      </span>
                    ))}
                    {tailoredResult.explanation.sectionsModified.length === 0 && (
                      <span className="text-[10px] text-zinc-400 italic">No changes suggested.</span>
                    )}
                  </div>
                </div>

                {/* Added keywords */}
                <div className="space-y-2">
                  <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-semibold">Added Keywords</h4>
                  <div className="flex flex-wrap gap-1">
                    {tailoredResult.explanation.addedKeywords.map((word, i) => (
                      <span key={i} className="px-2 py-0.5 text-[9px] font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 rounded">
                        +{word}
                      </span>
                    ))}
                    {tailoredResult.explanation.addedKeywords.length === 0 && (
                      <span className="text-[10px] text-zinc-400 italic">No new keywords injected.</span>
                    )}
                  </div>
                </div>

                {/* Warnings */}
                {tailoredResult.explanation.warnings.length > 0 && (
                  <div className="space-y-2 border-t border-zinc-100 dark:border-zinc-900 pt-3">
                    <h4 className="text-[10px] font-mono uppercase tracking-wider text-rose-600 flex items-center gap-1.5 font-bold">
                      <ShieldAlert className="w-3.5 h-3.5" />
                      Factual Integrity Warnings
                    </h4>
                    <div className="space-y-1.5">
                      {tailoredResult.explanation.warnings.map((warn, i) => (
                        <p key={i} className="text-[10px] text-zinc-400 dark:text-zinc-500 font-sans leading-relaxed flex items-start gap-1">
                          <span>•</span>
                          <span>{warn}</span>
                        </p>
                      ))}
                    </div>
                  </div>
                )}
              </Card>

              {/* Version Naming details before save */}
              <Card className="border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 space-y-3.5">
                <label className="text-[10px] font-mono uppercase tracking-wider text-zinc-400 font-bold block">Save Resume Version As</label>
                <input
                  type="text"
                  placeholder="e.g. Tailored - Stripe Senior Dev"
                  value={customVersionName}
                  onChange={(e) => setCustomVersionName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-xs focus:border-zinc-400 dark:focus:border-zinc-700 outline-none text-zinc-900 dark:text-zinc-100 font-semibold"
                />
              </Card>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center border-t border-zinc-100 dark:border-zinc-900 pt-5">
            <Button
              variant="outline"
              onClick={() => setStep(2)}
              className="border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded px-4 py-2 text-xs font-mono tracking-wider uppercase font-semibold"
            >
              Back to ATS Report
            </Button>
            
            <Button
              disabled={saveResumeMutation.isPending}
              onClick={handleSaveVersion}
              className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 rounded px-5 py-2.5 text-xs font-mono tracking-wider uppercase font-semibold flex items-center gap-2"
            >
              {saveResumeMutation.isPending ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <Save className="w-3.5 h-3.5" />
                  <span>Approve & Save Version</span>
                </>
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
