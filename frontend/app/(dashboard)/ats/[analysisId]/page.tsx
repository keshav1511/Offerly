"use client";

import React from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BarChart3, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/Button";
import { NormalizedATSReport } from "@/lib/ats/ats-report.service";
import {
  ATSScoreCard,
  ATSSummary,
  SkillsAnalysis,
  SectionBreakdown,
  OptimizationChecklist,
  AIRecommendations,
  JobMatchInsights,
  ImprovementTimeline,
  ActionPanel,
} from "@/components/ats";

export default function ATSReportPage() {
  const params = useParams();
  const analysisId = params.analysisId as string;
  const router = useRouter();

  const { data: report, isLoading, isError, error, refetch } = useQuery<NormalizedATSReport, Error>({
    queryKey: ["ats-report", analysisId],
    queryFn: async () => {
      const res = await fetch(`/api/ats/${analysisId}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Failed to retrieve match report.");
      }
      return await res.json();
    },
    retry: false,
  });

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl py-8 animate-pulse font-sans">
        <div className="flex items-center gap-3">
          <div className="w-5 h-5 bg-zinc-200 dark:bg-zinc-800 rounded" />
          <div className="h-6 w-48 bg-zinc-200 dark:bg-zinc-800 rounded" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="col-span-2 space-y-6">
            <div className="h-36 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200/50 dark:border-zinc-800/40" />
            <div className="h-60 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200/50 dark:border-zinc-800/40" />
            <div className="h-56 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200/50 dark:border-zinc-800/40" />
          </div>
          <div className="space-y-6">
            <div className="h-44 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200/50 dark:border-zinc-800/40" />
            <div className="h-64 bg-zinc-100 dark:bg-zinc-900 rounded border border-zinc-200/50 dark:border-zinc-800/40" />
          </div>
        </div>
      </div>
    );
  }

  if (isError) {
    const isNotFound = error?.message.toLowerCase().includes("not found") || error?.message.toLowerCase().includes("404");
    return (
      <div className="max-w-md mx-auto py-16 text-center font-sans space-y-5">
        <div className="mx-auto w-12 h-12 bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 rounded-full flex items-center justify-center">
          <AlertCircle className="w-6 h-6" />
        </div>
        <div className="space-y-1.5">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight">
            {isNotFound ? "No Cached Match Report Found" : "Retrieval Error"}
          </h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto leading-relaxed">
            {isNotFound 
              ? "We couldn't locate any saved ATS Analysis report for this resume version. Please open the resume and run a new tailoring match calculation." 
              : error?.message || "An unexpected error occurred."}
          </p>
        </div>
        <div className="flex items-center justify-center gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/resumes")}
            className="border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded px-4 py-2 text-xs font-mono tracking-wider uppercase font-semibold"
          >
            Go to Library
          </Button>
          {!isNotFound && (
            <Button
              onClick={() => refetch()}
              className="bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-950 rounded px-4 py-2 text-xs font-mono tracking-wider uppercase font-semibold flex items-center gap-1.5"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Retry</span>
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="max-w-md mx-auto py-16 text-center font-sans space-y-4">
        <div className="mx-auto w-12 h-12 bg-zinc-50 dark:bg-zinc-900 text-zinc-400 rounded-full flex items-center justify-center">
          <BarChart3 className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-zinc-900 dark:text-zinc-50">Empty Match Report</h3>
          <p className="text-xs text-zinc-500 max-w-xs mx-auto">This resume does not contain any cached optimization metadata.</p>
        </div>
        <Button
          onClick={() => router.push(`/resumes/${analysisId}/tailor`)}
          className="bg-zinc-900 text-white dark:bg-zinc-50 dark:text-zinc-950 rounded px-4 py-2 text-xs font-mono tracking-wider uppercase font-semibold"
        >
          Run Tailoring Wizard
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl py-8 font-sans">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/resumes" className="text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-zinc-400">Match Report / {report.versionName}</span>
          <h1 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
            ATS Compatibility Score
          </h1>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-1 md:col-span-2 space-y-6">
          <ATSScoreCard 
            score={report.overallScore}
            keywordScore={report.keywordScore}
            skillsMatch={report.skillsMatch}
            experienceMatch={report.experienceMatch}
            educationMatch={report.educationMatch}
            projectsMatch={report.projectsMatch}
            responsibilityMatch={report.responsibilityMatch}
            eligibilityDetails={report.eligibilityDetails}
            recommendation={report.recommendation}
          />

          {/* AI Summary */}
          <ATSSummary
            advice={report.advice}
            skillsMatch={report.skillsMatch}
            experienceMatch={report.experienceMatch}
          />

          {/* Target Keywords Analysis */}
          <SkillsAnalysis
            matchingKeywords={report.matchingKeywords}
            missingKeywords={report.missingKeywords}
          />

          {/* Action Navigation Panel */}
          <ActionPanel resumeId={analysisId} />
        </div>

        <div className="space-y-6">
          {/* Resume Section Breakdown */}
          <SectionBreakdown
            keywordScore={report.keywordScore}
            skillsMatch={report.skillsMatch}
            experienceMatch={report.experienceMatch}
            educationMatch={report.educationMatch}
            formattingConfidence={report.formattingConfidence}
          />

          {/* Optimization Checklist */}
          <OptimizationChecklist
            score={report.overallScore}
            missingKeywordsCount={report.missingKeywords.length}
            adviceCount={report.advice.length}
          />

          {/* AI Action recommendations */}
          <AIRecommendations advice={report.advice} />

          {/* Job Match Insights */}
          <JobMatchInsights
            jobTitle={report.jobTitle}
            companyName={report.companyName}
            generatedAt={report.generatedAt}
          />

          {/* Improvement Timeline */}
          <ImprovementTimeline />
        </div>
      </div>
    </div>
  );
}
