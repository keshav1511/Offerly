import { resumeRepository } from "../resume.repository";
import { ResumeRow, ResumeFilters } from "../resume.types";
import { ResumeStructuredData } from "../types/parsing.types";

export class ResumeService {
  /**
   * Retrieves active resumes belonging to the authenticated user.
   */
  async getUserResumes(filters?: ResumeFilters): Promise<ResumeRow[]> {
    try {
      return await resumeRepository.getResumes(filters);
    } catch (error) {
      throw new Error(this.normalizeError(error));
    }
  }

  /**
   * Retrieves a single active resume by its ID.
   */
  async getResumeById(id: string): Promise<ResumeRow> {
    if (!id) {
      throw new Error("Resume ID is required.");
    }
    try {
      return await resumeRepository.getResumeById(id);
    } catch (error) {
      throw new Error(this.normalizeError(error));
    }
  }

  /**
   * Normalizes a version name by trimming and collapsing multiple spaces.
   */
  normalizeVersionName(name: string): string {
    return (name || "").trim().replace(/\s+/g, " ");
  }

  /**
   * Validates and renames a resume version name.
   * Enforces case-insensitive uniqueness per user.
   */
  async renameResume(id: string, newVersionName: string): Promise<ResumeRow> {
    const normalized = this.normalizeVersionName(newVersionName);

    if (!normalized) {
      throw new Error("Version name cannot be empty.");
    }
    if (normalized.length > 100) {
      throw new Error("Version name cannot exceed 100 characters.");
    }

    try {
      // 1. Fetch current active resumes to check for duplicate case-insensitive version names
      const resumes = await resumeRepository.getResumes();
      const isDuplicate = resumes.some(
        (r) => 
          r.id !== id && 
          this.normalizeVersionName(r.version_name).toLowerCase() === normalized.toLowerCase()
      );

      if (isDuplicate) {
        throw new Error("A resume version with this name already exists.");
      }

      // 2. Perform the update preserving the user's casing
      return await resumeRepository.updateResume(id, { version_name: normalized });
    } catch (error) {
      throw new Error(this.normalizeError(error));
    }
  }

  /**
   * Sets a specific resume as the default one.
   */
  async setDefaultResume(id: string): Promise<void> {
    if (!id) {
      throw new Error("Resume ID is required.");
    }
    try {
      await resumeRepository.setDefaultResume(id);
    } catch (error) {
      throw new Error(this.normalizeError(error));
    }
  }

  /**
   * Deletes a resume record and its associated storage file.
   */
  async deleteResume(id: string): Promise<void> {
    if (!id) {
      throw new Error("Resume ID is required.");
    }
    try {
      await resumeRepository.deleteResume(id);
    } catch (error) {
      throw new Error(this.normalizeError(error));
    }
  }

  /**
   * Validates and persists resume metadata in the database after a successful file upload.
   */
  async saveResumeMetadata(
    storagePath: string,
    versionName: string,
    file: File
  ): Promise<ResumeRow> {
    const normalized = this.normalizeVersionName(versionName);

    if (!normalized) {
      throw new Error("Version name cannot be empty.");
    }
    if (normalized.length > 100) {
      throw new Error("Version name cannot exceed 100 characters.");
    }

    try {
      // Enforce case-insensitive duplicate validation on upload
      const resumes = await resumeRepository.getResumes();
      const isDuplicate = resumes.some(
        (r) => this.normalizeVersionName(r.version_name).toLowerCase() === normalized.toLowerCase()
      );

      if (isDuplicate) {
        throw new Error("A resume version with this name already exists.");
      }

      return await resumeRepository.saveResumeMetadata(storagePath, normalized, file);
    } catch (error) {
      throw new Error(this.normalizeError(error));
    }
  }

  /**
   * Triggers background parsing of the target resume document.
   */
  async parseResume(id: string, force: boolean = false): Promise<ResumeRow> {
    if (!id) {
      throw new Error("Resume ID is required.");
    }
    try {
      const response = await fetch("/api/resumes/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ resumeId: id, force }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to parse resume.");
      }
      return data as ResumeRow;
    } catch (error) {
      throw new Error(this.normalizeError(error));
    }
  }

  /**
   * Helper to normalize a URL input (prefixes with https:// if protocol is missing)
   */
  normalizeUrl(url: string): string {
    const trimmed = (url || "").trim();
    if (!trimmed) return "";
    if (/^https?:\/\//i.test(trimmed)) {
      return trimmed;
    }
    return `https://${trimmed}`;
  }

  /**
   * Helper to ensure the structured_data conforms exactly to the required JSON schema
   */
  ensureSchemaConformance(
    data: Partial<ResumeStructuredData> | null | undefined
  ): ResumeStructuredData {
    const d = data || {};
    
    // Normalize links
    const links = {
      github: this.normalizeUrl(d.links?.github || ""),
      linkedin: this.normalizeUrl(d.links?.linkedin || ""),
      portfolio: this.normalizeUrl(d.links?.portfolio || ""),
      leetcode: this.normalizeUrl(d.links?.leetcode || ""),
      codeforces: this.normalizeUrl(d.links?.codeforces || ""),
      kaggle: this.normalizeUrl(d.links?.kaggle || ""),
      behance: this.normalizeUrl(d.links?.behance || ""),
      dribbble: this.normalizeUrl(d.links?.dribbble || ""),
    };

    // Filter duplicate skills case-insensitively
    const rawSkills = Array.isArray(d.skills) ? d.skills : [];
    const uniqueSkillsSet = new Set<string>();
    const skills: string[] = [];
    for (const skill of rawSkills) {
      const cleanSkill = (skill || "").trim();
      if (cleanSkill) {
        const lower = cleanSkill.toLowerCase();
        if (!uniqueSkillsSet.has(lower)) {
          uniqueSkillsSet.add(lower);
          skills.push(cleanSkill);
        }
      }
    }

    return {
      personal: {
        name: (d.personal?.name || "").trim(),
        email: (d.personal?.email || "").trim(),
        phone: (d.personal?.phone || "").trim(),
        location: (d.personal?.location || "").trim(),
      },
      summary: (d.summary || "").trim(),
      skills,
      education: Array.isArray(d.education)
        ? d.education
            .map((edu) => ({
              institution: (edu.institution || "").trim(),
              degree: (edu.degree || "").trim(),
              field_of_study: (edu.field_of_study || "").trim(),
              start_date: (edu.start_date || "").trim(),
              end_date: (edu.end_date || "").trim(),
            }))
            .filter((edu) => edu.institution !== "")
        : [],
      experience: Array.isArray(d.experience)
        ? d.experience
            .map((exp) => ({
              company: (exp.company || "").trim(),
              position: (exp.position || "").trim(),
              location: (exp.location || "").trim(),
              start_date: (exp.start_date || "").trim(),
              end_date: (exp.end_date || "").trim(),
              description: (exp.description || "").trim(),
            }))
            .filter((exp) => exp.company !== "" && exp.position !== "")
        : [],
      projects: Array.isArray(d.projects)
        ? d.projects
            .map((proj) => ({
              name: (proj.name || "").trim(),
              description: (proj.description || "").trim(),
              url: this.normalizeUrl(proj.url || ""),
            }))
            .filter((proj) => proj.name !== "")
        : [],
      certifications: Array.isArray(d.certifications)
        ? d.certifications.map((c) => (c || "").trim()).filter(Boolean)
        : [],
      achievements: Array.isArray(d.achievements)
        ? d.achievements.map((a) => (a || "").trim()).filter(Boolean)
        : [],
      languages: Array.isArray(d.languages)
        ? d.languages.map((l) => (l || "").trim()).filter(Boolean)
        : [],
      volunteer: Array.isArray(d.volunteer)
        ? d.volunteer
            .map((vol) => ({
              company: (vol.company || "").trim(),
              position: (vol.position || "").trim(),
              location: (vol.location || "").trim(),
              start_date: (vol.start_date || "").trim(),
              end_date: (vol.end_date || "").trim(),
              description: (vol.description || "").trim(),
            }))
            .filter((vol) => vol.company !== "" || vol.position !== "")
        : [],
      leadership: Array.isArray(d.leadership)
        ? d.leadership
            .map((lead) => ({
              company: (lead.company || "").trim(),
              position: (lead.position || "").trim(),
              location: (lead.location || "").trim(),
              start_date: (lead.start_date || "").trim(),
              end_date: (lead.end_date || "").trim(),
              description: (lead.description || "").trim(),
            }))
            .filter((lead) => lead.company !== "" || lead.position !== "")
        : [],
      links,
      metadata: {
        pageCount: d.metadata?.pageCount || 1,
        wordCount: d.metadata?.wordCount || 0,
      },
    };
  }

  /**
   * Retrieves the structured_data column for a specific resume, validating ownership.
   */
  async getStructuredResume(resumeId: string): Promise<ResumeStructuredData> {
    if (!resumeId) {
      throw new Error("Resume ID is required.");
    }
    try {
      const data = await resumeRepository.getStructuredResume(resumeId);
      return this.ensureSchemaConformance(data as unknown as Partial<ResumeStructuredData>);
    } catch (error) {
      throw new Error(this.normalizeError(error));
    }
  }

  /**
   * Updates only the structured_data column for a specific resume, validating ownership.
   */
  async updateStructuredResume(
    resumeId: string,
    structuredData: ResumeStructuredData
  ): Promise<ResumeRow> {
    if (!resumeId) {
      throw new Error("Resume ID is required.");
    }
    
    // Normalize and validate structured data
    const normalized = this.ensureSchemaConformance(structuredData);

    // Business validation rules
    if (!normalized.personal.name) {
      throw new Error("Personal Info: Name is required.");
    }
    if (!normalized.personal.email) {
      throw new Error("Personal Info: Email is required.");
    }
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(normalized.personal.email)) {
      throw new Error("Personal Info: Please enter a valid email address.");
    }

    try {
      // Update DB record
      return await resumeRepository.updateStructuredResume(
        resumeId,
        normalized as unknown as Record<string, unknown>
      );
    } catch (error) {
      throw new Error(this.normalizeError(error));
    }
  }

  /**
   * Normalizes technical exceptions into customer-friendly notifications.
   */
  private normalizeError(error: unknown): string {
    if (error instanceof Error) {
      const msg = error.message.toLowerCase();
      // Handle database unique constraint violations gracefully
      if (msg.includes("unique constraint") || msg.includes("duplicate key") || msg.includes("23505") || msg.includes("resumes_user_id_lower_version_name_idx")) {
        return "A resume version with this name already exists.";
      }
      if (msg.includes("permission denied") || msg.includes("42501")) {
        return "Permission denied. You do not have access to this resource.";
      }
      return error.message;
    }
    return "An unexpected error occurred. Please try again.";
  }
}

export const resumeService = new ResumeService();
