import { SupabaseClient } from "@supabase/supabase-js";
import { Database, Json } from "@/lib/supabase/types";
import { ResumeRepository } from "../resume.repository";
import { ResumeRow } from "../resume.types";
import { extractTextFromPdf, extractTextFromDocx, normalizeText } from "@/utils/parser";
import { GeminiParsingProvider } from "./parsing/geminiParsingProvider";
import { RegexFallbackProvider } from "./parsing/regexFallbackProvider";
import { ResumeStructuredData, ResumeParsingProvider } from "../types/parsing.types";

export class ResumeParsingService {
  private readonly geminiProvider: ResumeParsingProvider;
  private readonly regexProvider: ResumeParsingProvider;

  constructor() {
    this.geminiProvider = new GeminiParsingProvider();
    this.regexProvider = new RegexFallbackProvider();
  }

  /**
   * Helper to sanitize parsed string values, stripping out generic placeholders.
   */
  private sanitizeString(str: string | null | undefined): string {
    if (!str) return "";
    const s = str.trim();
    const placeholders = [
      "university / college",
      "university/college",
      "university / college name",
      "university/college name",
      "degree",
      "degree (e.g. b.s., m.s.)",
      "major",
      "major / field",
      "company name",
      "job title",
      "role name",
      "parsed experience content placeholder",
      "responsibilities and achievements bullet points",
      "project details",
      "project name",
      "project details description",
      "resume project detail summary",
      "not specified",
      "none",
      "null",
      "n/a",
      "na"
    ];
    if (placeholders.includes(s.toLowerCase())) {
      return "";
    }
    return s;
  }

  /**
   * Helper to ensure the structured_data conforms exactly to the required JSON schema
   * and never omits any key or contains placeholder values.
   */
  private ensureSchemaConformance(
    data: Partial<ResumeStructuredData> | null | undefined,
    wordCount: number
  ): ResumeStructuredData {
    const d = data || {};
    return {
      personal: {
        name: this.sanitizeString(d.personal?.name),
        email: this.sanitizeString(d.personal?.email),
        phone: this.sanitizeString(d.personal?.phone),
        location: this.sanitizeString(d.personal?.location),
      },
      summary: this.sanitizeString(d.summary),
      skills: Array.isArray(d.skills) 
        ? d.skills.map(s => this.sanitizeString(s)).filter(Boolean) 
        : [],
      education: Array.isArray(d.education)
        ? d.education
            .map((edu) => ({
              institution: this.sanitizeString(edu.institution),
              degree: this.sanitizeString(edu.degree),
              field_of_study: this.sanitizeString(edu.field_of_study),
              start_date: this.sanitizeString(edu.start_date),
              end_date: this.sanitizeString(edu.end_date),
            }))
            .filter((edu) => edu.institution !== "")
        : [],
      experience: Array.isArray(d.experience)
        ? d.experience
            .map((exp) => ({
              company: this.sanitizeString(exp.company),
              position: this.sanitizeString(exp.position),
              location: this.sanitizeString(exp.location),
              start_date: this.sanitizeString(exp.start_date),
              end_date: this.sanitizeString(exp.end_date),
              description: this.sanitizeString(exp.description),
            }))
            .filter((exp) => exp.company !== "" || exp.position !== "")
        : [],
      projects: Array.isArray(d.projects)
        ? d.projects
            .map((proj) => ({
              name: this.sanitizeString(proj.name),
              description: this.sanitizeString(proj.description),
              url: this.sanitizeString(proj.url),
            }))
            .filter((proj) => proj.name !== "")
        : [],
      certifications: Array.isArray(d.certifications)
        ? d.certifications.map(c => this.sanitizeString(c)).filter(Boolean)
        : [],
      achievements: Array.isArray(d.achievements)
        ? d.achievements.map(a => this.sanitizeString(a)).filter(Boolean)
        : [],
      languages: Array.isArray(d.languages)
        ? d.languages.map(l => this.sanitizeString(l)).filter(Boolean)
        : [],
      volunteer: Array.isArray(d.volunteer)
        ? d.volunteer
            .map((vol) => ({
              company: this.sanitizeString(vol.company),
              position: this.sanitizeString(vol.position),
              location: this.sanitizeString(vol.location),
              start_date: this.sanitizeString(vol.start_date),
              end_date: this.sanitizeString(vol.end_date),
              description: this.sanitizeString(vol.description),
            }))
            .filter((vol) => vol.company !== "" || vol.position !== "")
        : [],
      leadership: Array.isArray(d.leadership)
        ? d.leadership
            .map((lead) => ({
              company: this.sanitizeString(lead.company),
              position: this.sanitizeString(lead.position),
              location: this.sanitizeString(lead.location),
              start_date: this.sanitizeString(lead.start_date),
              end_date: this.sanitizeString(lead.end_date),
              description: this.sanitizeString(lead.description),
            }))
            .filter((lead) => lead.company !== "" || lead.position !== "")
        : [],
      links: {
        github: this.sanitizeString(d.links?.github),
        linkedin: this.sanitizeString(d.links?.linkedin),
        portfolio: this.sanitizeString(d.links?.portfolio),
        leetcode: this.sanitizeString(d.links?.leetcode),
        codeforces: this.sanitizeString(d.links?.codeforces),
        kaggle: this.sanitizeString(d.links?.kaggle),
        behance: this.sanitizeString(d.links?.behance),
        dribbble: this.sanitizeString(d.links?.dribbble),
      },
      metadata: {
        pageCount: d.metadata?.pageCount || 1,
        wordCount: d.metadata?.wordCount || wordCount || 0,
      },
    };
  }

  /**
   * Parses the target resume by ID, extracting text and structuring metadata.
   */
  async parseResume(
    client: SupabaseClient<Database>,
    resumeId: string,
    force: boolean = false
  ): Promise<ResumeRow> {
    const startTime = Date.now();
    const repo = new ResumeRepository(client);

    // 1. Fetch user session to validate authentication
    const { data: { user }, error: authError } = await client.auth.getUser();
    if (authError || !user) {
      throw new Error("Authentication required.");
    }

    // 2. Fetch target resume from repository
    const resume = await repo.getResumeById(resumeId);

    // Validate ownership
    if (resume.user_id !== user.id) {
      throw new Error("Permission denied. You do not own this resume.");
    }

    // Idempotent parsing check
    if (
      !force &&
      resume.parsed_text &&
      resume.structured_data &&
      resume.parsing_status === "Completed"
    ) {
      console.log(`[ResumeParsingService] Skipped parsing for Resume ID: ${resumeId} (already completed)`);
      return resume;
    }

    // 3. Update status to Processing in the database
    await repo.updateResume(resumeId, {
      parsing_status: "Processing",
      parsing_error: null,
    });

    console.log(`[ResumeParsingService] Starting parse execution. Resume ID: ${resumeId}, Force: ${force}`);

    try {
      // 4. Download file from Supabase Storage
      const { data: fileData, error: storageError } = await client.storage
        .from("resumes")
        .download(resume.file_path);

      if (storageError || !fileData) {
        throw new Error(`Failed to download resume file from storage: ${storageError?.message || "unknown"}`);
      }

      // Convert Blob to Buffer
      const arrayBuffer = await fileData.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // 5. Detect and Extract Text
      let rawText = "";
      if (resume.file_type === "application/pdf" || resume.file_path.endsWith(".pdf")) {
        rawText = await extractTextFromPdf(buffer);
      } else if (
        resume.file_type === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
        resume.file_path.endsWith(".docx")
      ) {
        rawText = await extractTextFromDocx(buffer);
      } else {
        throw new Error(`Unsupported file type: ${resume.file_type || "unknown"}`);
      }

      if (!rawText.trim()) {
        throw new Error("The resume document contains no readable text.");
      }

      // Normalize Text
      const normalizedText = normalizeText(rawText);

      // 6. Structured JSON Extraction with fallbacks
      const isGeminiAvailable = !!process.env.GEMINI_API_KEY;
      let rawStructured: Partial<ResumeStructuredData> = {};
      let providerName = "";

      if (isGeminiAvailable) {
        try {
          console.log(`[ResumeParsingService] Attempting Gemini parse for Resume ID: ${resumeId}`);
          rawStructured = await this.geminiProvider.parse(normalizedText);
          providerName = "Gemini";
        } catch (geminiError: unknown) {
          const errMsg = geminiError instanceof Error ? geminiError.message : String(geminiError);
          console.warn(`[ResumeParsingService] Gemini parse failed: ${errMsg}. Falling back to Regex.`);
          rawStructured = await this.regexProvider.parse(normalizedText);
          providerName = "RegexFallback";
        }
      } else {
        console.log(`[ResumeParsingService] Gemini API key not configured. Using Regex fallback.`);
        rawStructured = await this.regexProvider.parse(normalizedText);
        providerName = "RegexFallback";
      }

      const parser_version = `${providerName}-v1`;
      const wordCount = normalizedText.split(/\s+/).filter(Boolean).length;
      
      // Clean and normalize the structured data, removing any possible placeholder values
      const structured_data = this.ensureSchemaConformance(rawStructured, wordCount);

      // 7. Temporary QA Logging
      console.log("[QA Log] Raw extracted PDF text:\n", normalizedText);
      if (providerName === "Gemini") {
        console.log("[QA Log] Gemini JSON response:\n", JSON.stringify(rawStructured, null, 2));
      } else {
        console.log("[QA Log] Regex fallback JSON:\n", JSON.stringify(rawStructured, null, 2));
      }
      console.log("[QA Log] Final structured_data before database insert:\n", JSON.stringify(structured_data, null, 2));

      // 8. Persist results using Repository
      const updatedResume = await repo.updateResume(resumeId, {
        parsed_text: normalizedText,
        structured_data: structured_data as unknown as Json,
        parsing_status: "Completed",
        parsing_error: null,
        parsed_at: new Date().toISOString(),
        parser_version,
      });

      const duration = Date.now() - startTime;
      console.log(
        `[ResumeParsingService] Parsing completed. Resume ID: ${resumeId}, Duration: ${duration}ms, Provider: ${providerName}`
      );

      return updatedResume;
    } catch (err: unknown) {
      const duration = Date.now() - startTime;
      const cleanErrorMessage = err instanceof Error ? err.message : "An unexpected error occurred during document parsing.";
      console.error(
        `[ResumeParsingService] Parsing failed. Resume ID: ${resumeId}, Duration: ${duration}ms, Error: ${cleanErrorMessage}`
      );

      // Persist failure status in the database using Repository
      await repo.updateResume(resumeId, {
        parsing_status: "Failed",
        parsing_error: cleanErrorMessage,
      });

      throw new Error(cleanErrorMessage);
    }
  }
}
export const resumeParsingService = new ResumeParsingService();
