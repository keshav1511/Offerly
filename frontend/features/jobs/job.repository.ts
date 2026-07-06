import { SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';
import { JobRow, JobWithCompany, JobFilters } from './job.types';
import { CreateJobInput, UpdateJobInput } from './job.validation';

/**
 * Job Repository Layer
 * 
 * Provides database access abstractions for managing target positions and job tracking.
 * Joins jobs with company profile references and scopes queries to authenticated user sessions.
 */
export class JobRepository {
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
   * Clean empty strings to null before writing to DB columns.
   */
  private sanitizeInput<T extends Record<string, unknown>>(input: T): T {
    const cleaned = { ...input };
    for (const key in cleaned) {
      if (cleaned[key] === '') {
        cleaned[key] = null as unknown as T[Extract<keyof T, string>];
      }
    }
    return cleaned;
  }

  /**
   * Creates a new job owned by the currently authenticated user.
   */
  async createJob(input: CreateJobInput): Promise<JobRow> {
    const userId = await this.getCurrentUserId();
    const sanitized = this.sanitizeInput(input);

    const { data, error } = await this.client
      .from('jobs')
      .insert({
        ...sanitized,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create job: ${error.message}`);
    }

    return data;
  }

  /**
   * Retrieves a list of active jobs associated with the authenticated user, joined with company details.
   * Supports pagination (page, pageSize) and filtering (search, status, priority, work_mode, employment_type).
   */
  async getJobs(filters?: JobFilters): Promise<JobWithCompany[]> {
    const userId = await this.getCurrentUserId();

    let query = this.client
      .from('jobs')
      .select('*, company:companies(name, logo_url)')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (filters) {
      if (filters.search) {
        query = query.ilike('title', `%${filters.search}%`);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.priority) {
        query = query.eq('priority', filters.priority);
      }
      if (filters.work_mode) {
        query = query.eq('work_mode', filters.work_mode);
      }
      if (filters.employment_type) {
        query = query.eq('employment_type', filters.employment_type);
      }
      if (filters.company_id) {
        query = query.eq('company_id', filters.company_id);
      }
      if (filters.page && filters.pageSize) {
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);
      }
    }

    // Default sorting by created_at descending (newest jobs first)
    query = query.order('created_at', { ascending: false });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to retrieve jobs: ${error.message}`);
    }

    return (data as unknown as JobWithCompany[]) || [];
  }

  /**
   * Retrieves a single active job by ID (scoped to the authenticated user), joined with company details.
   */
  async getJobById(id: string): Promise<JobWithCompany | null> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await this.client
      .from('jobs')
      .select('*, company:companies(name, logo_url)')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to retrieve job details: ${error.message}`);
    }

    return data as unknown as JobWithCompany | null;
  }

  /**
   * Updates an existing job's data (scoped to the authenticated user).
   */
  async updateJob(id: string, input: UpdateJobInput): Promise<JobRow> {
    const userId = await this.getCurrentUserId();
    const sanitized = this.sanitizeInput(input);

    const { data, error } = await this.client
      .from('jobs')
      .update(sanitized)
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update job: ${error.message}`);
    }

    return data;
  }

  /**
   * Soft deletes a job by writing the current timestamp to deleted_at (scoped to the authenticated user).
   */
  async deleteJob(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await this.client
      .from('jobs')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to soft-delete job: ${error.message}`);
    }
  }
}
export const jobRepository = new JobRepository();
