import { resumeRepository } from "../resume.repository";
import { ResumeRow, ResumeFilters } from "../resume.types";

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
