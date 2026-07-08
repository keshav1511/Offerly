import { ResumeStructuredData } from "./parsing.types";

export interface JobDetails {
  companyName: string;
  jobTitle: string;
  description: string;
  location: string;
  employmentType: string;
}

export interface ATSAnalysisReport {
  overallScore: number;
  keywordScore: number;
  skillsMatch: number;
  experienceMatch: number;
  educationMatch: number;
  formattingConfidence: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  advice: string[];
}

export interface TailoringExplanation {
  sectionsModified: string[];
  sectionsUnchanged: string[];
  addedKeywords: string[];
  missingKeywords: string[];
  aiConfidence: number;
  warnings: string[];
}

export interface TailoredResumeResponse {
  tailoredData: ResumeStructuredData;
  explanation: TailoringExplanation;
}
