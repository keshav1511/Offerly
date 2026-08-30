import { ResumeStructuredData } from "./parsing.types";

export interface JobDetails {
  companyName: string;
  jobTitle: string;
  description: string;
  location: string;
  employmentType: string;
  requirements?: string[];
  responsibilities?: string[];
  requiredSkills?: string[];
  preferredSkills?: string[];
  experienceYearsRequired?: string;
  educationRequired?: string;
  techStack?: string[];
  seniority?: string;
  keywords?: string[];
  salary?: string;
}

export interface EligibilityDetails {
  readiness: number;
  eligibility: "Low" | "Medium" | "High";
  competition: "Low" | "Medium" | "High";
  reasoning: string;
}

export interface RecommendationDetails {
  decision: "ready_to_apply" | "tailoring_recommended" | "not_recommended";
  reason: string;
}

export interface ATSAnalysisReport {
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
  eligibilityDetails: EligibilityDetails;
  recommendation: RecommendationDetails;
}

export interface BulletSuggestion {
  originalBullet: string;
  tailoredBullet: string;
  reason: string;
  requirement: string;
  confidence: number;
}

export interface TailoringExplanation {
  sectionsModified: string[];
  sectionsUnchanged: string[];
  addedKeywords: string[];
  missingKeywords: string[];
  aiConfidence: number;
  warnings: string[];
  bulletSuggestions?: BulletSuggestion[];
}

export interface TailoredResumeResponse {
  tailoredData: ResumeStructuredData;
  explanation: TailoringExplanation;
}
