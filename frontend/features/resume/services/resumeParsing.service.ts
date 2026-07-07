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
   * Helper to ensure the structured_data conforms exactly to the required JSON schema
   * and never omits any key.
   */
  private ensureSchemaConformance(
    data: Partial<ResumeStructuredData> | null | undefined,
    wordCount: number
  ): ResumeStructuredData {
    const d = data || {};
    return {
      personal: {
        name: d.personal?.name || "",
        email: d.personal?.email || "",
        phone: d.personal?.phone || "",
        location: d.personal?.location || "",
      },
      summary: d.summary || "",
      skills: Array.isArray(d.skills) ? d.skills : [],
      education: Array.isArray(d.education)
        ? d.education.map((edu) => ({
            institution: edu.institution || "",
            degree: edu.degree || "",
            field_of_study: edu.field_of_study || "",
            start_date: edu.start_date || "",
            end_date: edu.end_date || "",
          }))
        : [],
      experience: Array.isArray(d.experience)
        ? d.experience.map((exp) => ({
            company: exp.company || "",
            position: exp.position || "",
            location: exp.location || "",
            start_date: exp.start_date || "",
            end_date: exp.end_date || "",
            description: exp.description || "",
          }))
        : [],
      projects: Array.isArray(d.projects)
        ? d.projects.map((proj) => ({
            name: proj.name || "",
            description: proj.description || "",
            url: proj.url || "",
          }))
        : [],
      certifications: Array.isArray(d.certifications) ? d.certifications : [],
      achievements: Array.isArray(d.achievements) ? d.achievements : [],
      languages: Array.isArray(d.languages) ? d.languages : [],
      links: {
        github: d.links?.github || "",
        linkedin: d.links?.linkedin || "",
        portfolio: d.links?.portfolio || "",
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

      // 6. Select Parsing Provider
      const isGeminiAvailable = !!process.env.GEMINI_API_KEY;
      const provider = isGeminiAvailable ? this.geminiProvider : this.regexProvider;
      const parser_version = `${provider.name}-v1`;

      console.log(`[ResumeParsingService] Selecting parsing provider: ${provider.name} for Resume ID: ${resumeId}`);

      // 7. Structured JSON Extraction
      const rawStructured = await provider.parse(normalizedText);
      const wordCount = normalizedText.split(/\s+/).filter(Boolean).length;
      const structured_data = this.ensureSchemaConformance(rawStructured, wordCount);

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
        `[ResumeParsingService] Parsing completed. Resume ID: ${resumeId}, Duration: ${duration}ms, Provider: ${provider.name}`
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
