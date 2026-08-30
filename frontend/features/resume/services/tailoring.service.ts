import { LLMProviderFactory } from "@/lib/ai/factory";
import { PromptCompiler } from "@/lib/ai/promptCompiler";
import { ResumeRepository } from "../resume.repository";
import { ResumeRow } from "../resume.types";
import { JobDetails, ATSAnalysisReport, TailoredResumeResponse } from "../types/tailoring.types";
import { ResumeStructuredData } from "../types/parsing.types";
import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "@/lib/supabase/types";

export class TailoringService {
  /**
   * Helper to retrieve a configured provider instance (Claude preferred, Gemini fallback).
   */
  private getProvider() {
    const claudeKey = process.env.CLAUDE_API_KEY;
    const geminiKey = process.env.GEMINI_API_KEY;

    if (claudeKey) {
      return LLMProviderFactory.createProvider("Claude", claudeKey);
    } else if (geminiKey) {
      // Fallback gracefully to Gemini if Claude is not configured
      return LLMProviderFactory.createProvider("Gemini", geminiKey);
    }
    throw new Error("No AI API Keys are configured. Please set GEMINI_API_KEY or CLAUDE_API_KEY.");
  }

  /**
   * Scrapes raw text from a target job URL.
   */
  private async fetchUrlText(url: string): Promise<string> {
    try {
      const response = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        },
      });
      if (!response.ok) {
        throw new Error(`Webpage returned status: ${response.status} ${response.statusText}`);
      }
      const html = await response.text();
      
      // Basic text cleanup
      let text = html
        .replace(/<script[^>]*>([\s\S]*?)<\/script>/gi, "")
        .replace(/<style[^>]*>([\s\S]*?)<\/style>/gi, "")
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim();

      if (text.length > 25000) {
        text = text.substring(0, 25000);
      }
      return text;
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : String(error);
      throw new Error(`Failed to scrape URL text: ${msg}`);
    }
  }

  /**
   * Extracts structured job requirements from a target URL or raw pasted description.
   */
  async extractJobDetails(url?: string, text?: string): Promise<JobDetails> {
    if (!url && !text) {
      throw new Error("Either Job URL or Job Description Text must be provided.");
    }

    const rawText = url ? await this.fetchUrlText(url) : (text || "");
    const provider = this.getProvider();

    const prompt = PromptCompiler.compile("job-extraction", {
      text: rawText,
    });

    const schemaStr = `{
      "companyName": "string",
      "jobTitle": "string",
      "description": "string",
      "location": "string",
      "employmentType": "string",
      "requirements": ["string"],
      "responsibilities": ["string"],
      "requiredSkills": ["string"],
      "preferredSkills": ["string"],
      "experienceYearsRequired": "string",
      "educationRequired": "string",
      "techStack": ["string"],
      "seniority": "string",
      "keywords": ["string"],
      "salary": "string"
    }`;

    try {
      const result = await provider.parseStructuredData<JobDetails>(prompt, schemaStr);
      return {
        companyName: result.companyName || "Not Specified",
        jobTitle: result.jobTitle || "Not Specified",
        description: result.description || rawText.substring(0, 1000),
        location: result.location || "Not Specified",
        employmentType: result.employmentType || "Not Specified",
        requirements: result.requirements || [],
        responsibilities: result.responsibilities || [],
        requiredSkills: result.requiredSkills || [],
        preferredSkills: result.preferredSkills || [],
        experienceYearsRequired: result.experienceYearsRequired || "Not Specified",
        educationRequired: result.educationRequired || "Not Specified",
        techStack: result.techStack || [],
        seniority: result.seniority || "Not Specified",
        keywords: result.keywords || [],
        salary: result.salary || "Not Specified",
      };
    } catch (error) {
      throw new Error(`Job details extraction failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Performs an ATS gap match analysis against a structured resume.
   */
  async analyzeATSCompatibility(
    client: SupabaseClient<Database>,
    resumeId: string,
    jobDescription: string
  ): Promise<ATSAnalysisReport> {
    const repo = new ResumeRepository(client);
    const resume = await repo.getResumeById(resumeId);
    const provider = this.getProvider();

    const prompt = PromptCompiler.compile("ats-analysis", {
      jobDescription,
      resumeData: JSON.stringify(resume.structured_data),
    });

    console.log("[ATSAnalysis QA LOG] resume.structured_data:", JSON.stringify(resume.structured_data, null, 2));
    console.log("[ATSAnalysis QA LOG] compiled prompt payload:", prompt);

    const schemaStr = `{
      "overallScore": 0,
      "keywordScore": 0,
      "skillsMatch": 0,
      "experienceMatch": 0,
      "educationMatch": 0,
      "formattingConfidence": 0,
      "projectsMatch": 0,
      "responsibilityMatch": 0,
      "matchingKeywords": [],
      "missingKeywords": [],
      "advice": [],
      "eligibilityDetails": {
        "readiness": 0,
        "eligibility": "string",
        "competition": "string",
        "reasoning": "string"
      },
      "recommendation": {
        "decision": "string",
        "reason": "string"
      }
    }`;

    try {
      const result = await provider.parseStructuredData<ATSAnalysisReport>(prompt, schemaStr);
      return {
        overallScore: result.overallScore || 0,
        keywordScore: result.keywordScore || 0,
        skillsMatch: result.skillsMatch || 0,
        experienceMatch: result.experienceMatch || 0,
        educationMatch: result.educationMatch || 0,
        formattingConfidence: result.formattingConfidence || 0,
        projectsMatch: result.projectsMatch || 0,
        responsibilityMatch: result.responsibilityMatch || 0,
        matchingKeywords: result.matchingKeywords || [],
        missingKeywords: result.missingKeywords || [],
        advice: result.advice || [],
        eligibilityDetails: result.eligibilityDetails || {
          readiness: result.experienceMatch || 0,
          eligibility: "Medium",
          competition: "High",
          reasoning: "Not Specified"
        },
        recommendation: result.recommendation || {
          decision: "tailoring_recommended",
          reason: "Not Specified"
        }
      };
    } catch (error) {
      throw new Error(`ATS analysis calculation failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Rewrites summaries, bullet points, and skills list targeting the job details.
   */
  async generateTailoredResume(
    client: SupabaseClient<Database>,
    resumeId: string,
    jobDescription: string
  ): Promise<TailoredResumeResponse> {
    const repo = new ResumeRepository(client);
    const resume = await repo.getResumeById(resumeId);
    const provider = this.getProvider();

    // Template schema constraints for ResumeStructuredData matching types/parsing.types.ts
    const resumeSchemaStr = `{
      "personal": { "name": "string", "email": "string", "phone": "string", "location": "string" },
      "summary": "string",
      "skills": ["string"],
      "education": [{ "institution": "string", "degree": "string", "field_of_study": "string", "start_date": "string", "end_date": "string" }],
      "experience": [{ "company": "string", "position": "string", "location": "string", "start_date": "string", "end_date": "string", "description": "string" }],
      "projects": [{ "name": "string", "description": "string", "url": "string" }],
      "certifications": ["string"],
      "achievements": ["string"],
      "languages": ["string"],
      "volunteer": [{ "company": "string", "position": "string", "location": "string", "start_date": "string", "end_date": "string", "description": "string" }],
      "leadership": [{ "company": "string", "position": "string", "location": "string", "start_date": "string", "end_date": "string", "description": "string" }],
      "links": { "github": "string", "linkedin": "string", "portfolio": "string", "leetcode": "string", "codeforces": "string", "kaggle": "string", "behance": "string", "dribbble": "string" },
      "metadata": { "pageCount": 1, "wordCount": 0 }
    }`;

    const prompt = PromptCompiler.compile("resume-tailoring", {
      schema: resumeSchemaStr,
      jobDescription,
      resumeData: JSON.stringify(resume.structured_data),
    });

    console.log("[TailoringService QA LOG] resume.structured_data:", JSON.stringify(resume.structured_data, null, 2));
    console.log("[TailoringService QA LOG] compiled prompt payload:", prompt);

    const wrapperSchemaStr = `{
      "tailoredData": ${resumeSchemaStr},
      "explanation": {
        "sectionsModified": ["string"],
        "sectionsUnchanged": ["string"],
        "addedKeywords": ["string"],
        "missingKeywords": ["string"],
        "aiConfidence": 0,
        "warnings": ["string"],
        "bulletSuggestions": [{ "originalBullet": "string", "tailoredBullet": "string", "reason": "string", "requirement": "string", "confidence": 0 }]
      }
    }`;

    try {
      return await provider.parseStructuredData<TailoredResumeResponse>(prompt, wrapperSchemaStr);
    } catch (error) {
      throw new Error(`Resume tailoring rewrite failed: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  /**
   * Persists the approved tailored resume structure as a new version.
   */
  async saveTailoredVersion(
    client: SupabaseClient<Database>,
    originalResumeId: string,
    versionName: string,
    tailoredData: ResumeStructuredData,
    jobSnapshot: JobDetails,
    explanation: Record<string, unknown>,
    atsScore: number,
    atsReport?: Record<string, unknown>
  ): Promise<ResumeRow> {
    const repo = new ResumeRepository(client);
    const tailoringMetadata = {
      explanation,
      atsReport: atsReport || null,
      generatedAt: new Date().toISOString(),
      modelVersion: "claude-3-5-sonnet-20241022",
      jobMetadata: {
        companyName: jobSnapshot.companyName,
        jobTitle: jobSnapshot.jobTitle,
        location: jobSnapshot.location,
        employmentType: jobSnapshot.employmentType,
      }
    };
    return await repo.createTailoredResume(
      originalResumeId,
      versionName,
      tailoredData as unknown as Record<string, unknown>,
      jobSnapshot as unknown as Record<string, unknown>,
      tailoringMetadata as unknown as Record<string, unknown>,
      atsScore
    );
  }
}

export const tailoringService = new TailoringService();
