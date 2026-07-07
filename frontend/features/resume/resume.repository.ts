import { SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';
import { ResumeRow, ResumeFilters } from './resume.types';
import { ALLOWED_FILE_TYPES, MAX_FILE_SIZE_BYTES } from './resume.validation';

/**
 * Resume Repository Layer
 * 
 * Provides integrations with Supabase Storage bucket ('resumes') and resumes database tables.
 * Restricts operations strictly to authenticated user sessions.
 */
export class ResumeRepository {
  private readonly client: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database> = defaultClient) {
    this.client = client;
  }

  /**
   * Helper to retrieve active authenticated user's ID.
   */
  private async getCurrentUserId(): Promise<string> {
    const { data: { user }, error } = await this.client.auth.getUser();
    if (error || !user) {
      throw new Error('Authentication required.');
    }
    return user.id;
  }

  /**
   * Uploads a resume file to storage and persists metadata in the database.
   */
  async uploadResume(
    file: File,
    versionName: string
  ): Promise<ResumeRow> {
    const userId = await this.getCurrentUserId();

    // 1. File validations
    if (!ALLOWED_FILE_TYPES.includes(file.type)) {
      throw new Error('Invalid file type. Only PDF and DOCX documents are supported.');
    }
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error('File is too large. Maximum size allowed is 5MB.');
    }

    // Generate unique ID for database and storage path
    const resumeId = crypto.randomUUID();
    const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
    const storagePath = `${userId}/${resumeId}_${cleanFileName}`;

    // 2. Upload to Supabase Storage bucket 'resumes'
    const { error: uploadError } = await this.client.storage
      .from('resumes')
      .upload(storagePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (uploadError) {
      throw new Error(`Failed to upload file to storage: ${uploadError.message}`);
    }

    // 3. Persist metadata in public.resumes table
    // Check if user already has a default resume. If not, make this one default!
    const { data: existingDefault, error: checkError } = await this.client
      .from('resumes')
      .select('id')
      .eq('user_id', userId)
      .eq('is_default', true)
      .is('deleted_at', null)
      .maybeSingle();

    if (checkError) {
      throw new Error(`Failed to check default resume: ${checkError.message}`);
    }

    const isDefault = !existingDefault;

    const { data, error: insertError } = await this.client
      .from('resumes')
      .insert({
        id: resumeId,
        user_id: userId,
        version_name: versionName,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: storagePath,
        is_default: isDefault,
        parsed_text: "",
        ats_score: null,
      })
      .select()
      .single();

    if (insertError) {
      // Cleanup storage if database insert fails
      await this.client.storage.from('resumes').remove([storagePath]);
      throw new Error(`Failed to save resume record: ${insertError.message}`);
    }

    return data;
  }

  /**
   * Retrieves a list of active resumes for the authenticated user.
   */
  async getResumes(filters?: ResumeFilters): Promise<ResumeRow[]> {
    const userId = await this.getCurrentUserId();
    let query = this.client
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (filters?.page && filters?.pageSize) {
      const from = (filters.page - 1) * filters.pageSize;
      const to = from + filters.pageSize - 1;
      query = query.range(from, to);
    }

    // Order by default resume first, then by creation date descending
    query = query.order('is_default', { ascending: false }).order('created_at', { ascending: false });

    const { data, error } = await query;
    if (error) {
      throw new Error(`Failed to retrieve resumes: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Updates metadata of a resume (e.g. rename version_name).
   */
  async updateResume(id: string, updates: Partial<ResumeRow>): Promise<ResumeRow> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await this.client
      .from('resumes')
      .update(updates)
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update resume: ${error.message}`);
    }

    return data;
  }

  /**
   * Soft deletes a resume.
   */
  async deleteResume(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();

    // 1. Fetch resume to see if it is default and get file path
    const { data: resume, error: fetchError } = await this.client
      .from('resumes')
      .select('is_default, file_path')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .single();

    if (fetchError || !resume) {
      throw new Error('Resume not found.');
    }

    // 2. Perform soft delete
    const { error: deleteError } = await this.client
      .from('resumes')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (deleteError) {
      throw new Error(`Failed to delete resume: ${deleteError.message}`);
    }

    // 3. Delete from storage
    if (resume.file_path) {
      await this.client.storage.from('resumes').remove([resume.file_path]);
    }

    // 4. If we deleted the default resume, automatically assign default to the most recent remaining resume
    if (resume.is_default) {
      const { data: remaining, error: remainingError } = await this.client
        .from('resumes')
        .select('id')
        .eq('user_id', userId)
        .is('deleted_at', null)
        .order('created_at', { ascending: false })
        .limit(1);

      if (!remainingError && remaining && remaining.length > 0) {
        await this.client
          .from('resumes')
          .update({ is_default: true })
          .eq('id', remaining[0].id)
          .eq('user_id', userId);
      }
    }
  }

  /**
   * Sets a specific resume as the default one for the user, removing default status from all others.
   */
  async setDefaultResume(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();

    // 1. Set all user's resumes to false
    const { error: resetError } = await this.client
      .from('resumes')
      .update({ is_default: false })
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (resetError) {
      throw new Error(`Failed to reset default resumes: ${resetError.message}`);
    }

    // 2. Set targeted resume to true
    const { error: setErrors } = await this.client
      .from('resumes')
      .update({ is_default: true })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (setErrors) {
      throw new Error(`Failed to set default resume: ${setErrors.message}`);
    }
  }

  /**
   * Persists resume metadata in public.resumes table after successful upload.
   */
  async saveResumeMetadata(
    storagePath: string,
    versionName: string,
    file: File
  ): Promise<ResumeRow> {
    const userId = await this.getCurrentUserId();

    // Check if user already has a default resume. If not, make this one default!
    const { data: existingDefault, error: checkError } = await this.client
      .from('resumes')
      .select('id')
      .eq('user_id', userId)
      .eq('is_default', true)
      .is('deleted_at', null)
      .maybeSingle();

    if (checkError) {
      throw new Error(`Failed to check default resume: ${checkError.message}`);
    }

    const isDefault = !existingDefault;

    const { data, error: insertError } = await this.client
      .from('resumes')
      .insert({
        user_id: userId,
        version_name: versionName,
        file_name: file.name,
        file_type: file.type,
        file_size: file.size,
        file_path: storagePath,
        is_default: isDefault,
        parsed_text: "",
        ats_score: null,
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to save resume record: ${insertError.message}`);
    }

    return data;
  }
}
export const resumeRepository = new ResumeRepository();
