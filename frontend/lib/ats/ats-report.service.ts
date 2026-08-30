import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../supabase/types";
import { ResumeRepository } from "@/features/resume/resume.repository";
import { ATSAnalysisReport } from "@/features/resume/types/tailoring.types";

export interface NormalizedATSReport {
  overallScore: number;
  keywordScore: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  formattingConfidence: number;
  projectsMatch: number;
  responsibilityMatch: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  advice: string[];
  eligibilityDetails: {
    readiness: number;
    eligibility: "Low" | "Medium" | "High";
    competition: "Low" | "Medium" | "High";
    reasoning: string;
  };
  recommendation: {
    decision: "ready_to_apply" | "tailoring_recommended" | "not_recommended";
    reason: string;
  };
  versionName: string;
  jobTitle: string;
  companyName: string;
  generatedAt: string;
}

export class ATSReportService {
  /**
   * Fetches and normalizes cached ATS report from resume tailoring metadata.
   */
  async getCachedATSReport(
    client: SupabaseClient<Database>,
    resumeId: string
  ): Promise<NormalizedATSReport | null> {
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) {
      throw new Error("Authentication required.");
    }

    const repo = new ResumeRepository(client);
    const resume = await repo.getResumeById(resumeId);

    if (resume.user_id !== user.id) {
      throw new Error("Permission denied. You do not own this resume.");
    }

    const metadata = resume.tailoring_metadata as Record<string, unknown> | null;
    if (!metadata || !metadata.atsReport) {
      return null;
    }

    const report = metadata.atsReport as Partial<ATSAnalysisReport>;
    const jobMetadata = (metadata.jobMetadata || {}) as Record<string, unknown>;

    return {
      overallScore: Number(report.overallScore) || 0,
      keywordScore: Number(report.keywordScore) || 0,
      skillsMatch: Number(report.skillsMatch) || 0,
      experienceMatch: Number(report.experienceMatch) || 0,
      educationMatch: Number(report.educationMatch) || 0,
      formattingConfidence: Number(report.formattingConfidence) || 0,
      projectsMatch: Number(report.projectsMatch) || 0,
      responsibilityMatch: Number(report.responsibilityMatch) || 0,
      matchingKeywords: Array.isArray(report.matchingKeywords) ? report.matchingKeywords : [],
      missingKeywords: Array.isArray(report.missingKeywords) ? report.missingKeywords : [],
      advice: Array.isArray(report.advice) ? report.advice : [],
      eligibilityDetails: report.eligibilityDetails || {
        readiness: Number(report.experienceMatch) || 0,
        eligibility: "Medium",
        competition: "High",
        reasoning: "Experience reasoning is not yet computed."
      },
      recommendation: report.recommendation || {
        decision: "tailoring_recommended",
        reason: "Optimization recommended."
      },
      versionName: resume.version_name || "Untitled Version",
      jobTitle: (jobMetadata.jobTitle as string) || (resume.job_snapshot as Record<string, unknown>)?.jobTitle as string || "Target Position",
      companyName: (jobMetadata.companyName as string) || (resume.job_snapshot as Record<string, unknown>)?.companyName as string || "Target Company",
      generatedAt: (metadata.generatedAt as string) || resume.created_at || new Date().toISOString(),
    };
  }
}

export const atsReportService = new ATSReportService();
