import { useMutation, useQueryClient } from "@tanstack/react-query";
import { JobDetails, ATSAnalysisReport, TailoredResumeResponse } from "../types/tailoring.types";
import { ResumeStructuredData } from "../types/parsing.types";
import { ResumeRow } from "../resume.types";

/**
 * Mutation hook to extract job details from a target URL.
 */
export function useExtractJob() {
  return useMutation<JobDetails, Error, { url: string }>({
    mutationFn: async ({ url }) => {
      const response = await fetch("/api/jobs/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to extract job details.");
      }
      return await response.json();
    },
  });
}

/**
 * Mutation hook to run ATS compatibility gap analysis.
 */
export function useATSAnalysis(resumeId: string) {
  return useMutation<ATSAnalysisReport, Error, { jobDescription: string }>({
    mutationFn: async ({ jobDescription }) => {
      const response = await fetch(`/api/resumes/${resumeId}/analyze`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ jobDescription }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to calculate ATS match score.");
      }
      return await response.json();
    },
  });
}

/**
 * Mutation hook to generate tailored resume details using AI.
 */
export function useTailorResume(resumeId: string) {
  return useMutation<TailoredResumeResponse, Error, { jobDescription: string }>({
    mutationFn: async ({ jobDescription }) => {
      const response = await fetch(`/api/resumes/${resumeId}/tailor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "generate", jobDescription }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to tailor resume details.");
      }
      return await response.json();
    },
  });
}

/**
 * Mutation hook to save the approved tailored resume.
 */
export function useSaveTailoredResume(resumeId: string) {
  const queryClient = useQueryClient();

  return useMutation<
    ResumeRow,
    Error,
    {
      versionName: string;
      tailoredData: ResumeStructuredData;
      jobSnapshot: JobDetails;
      explanation: Record<string, unknown>;
      atsScore: number;
      atsReport?: Record<string, unknown>;
    }
  >({
    mutationFn: async (payload) => {
      const response = await fetch(`/api/resumes/${resumeId}/tailor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save",
          ...payload,
        }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to save tailored resume version.");
      }
      return await response.json();
    },
    onSuccess: () => {
      // Invalidate the resumes list to trigger a refetch of active resumes catalog
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
}
