import { SupabaseClient } from '@supabase/supabase-js';
import { supabase as defaultClient } from '@/lib/supabase/client';
import { Database } from '@/lib/supabase/types';
import { CompanyRow, CompanyFilters } from './company.types';
import { CreateCompanyInput, UpdateCompanyInput } from './company.validation';

/**
 * Company Repository Layer
 * 
 * Provides database access abstractions for managing target employers in Offerly.
 * Handles client dependency injection (to support SSR/Server actions) and sanitizes
 * empty inputs before writing to Supabase.
 */
export class CompanyRepository {
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
  private sanitizeInput<T extends Record<string, any>>(input: T): T {
    const cleaned = { ...input };
    for (const key in cleaned) {
      if (cleaned[key] === '') {
        cleaned[key] = null as any;
      }
    }
    return cleaned;
  }

  /**
   * Creates a new company owned by the currently authenticated user.
   */
  async createCompany(input: CreateCompanyInput): Promise<CompanyRow> {
    const userId = await this.getCurrentUserId();
    const sanitized = this.sanitizeInput(input);

    const { data, error } = await this.client
      .from('companies')
      .insert({
        ...sanitized,
        user_id: userId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create company: ${error.message}`);
    }

    return data;
  }

  /**
   * Retrieves a list of active companies associated with the authenticated user.
   * Supports pagination (page, pageSize) and filtering (search, industry, size).
   */
  async getCompanies(filters?: CompanyFilters): Promise<CompanyRow[]> {
    const userId = await this.getCurrentUserId();

    let query = this.client
      .from('companies')
      .select('*')
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (filters) {
      if (filters.search) {
        query = query.ilike('name', `%${filters.search}%`);
      }
      if (filters.industry) {
        query = query.eq('industry', filters.industry);
      }
      if (filters.size) {
        query = query.eq('size', filters.size);
      }
      if (filters.page && filters.pageSize) {
        const from = (filters.page - 1) * filters.pageSize;
        const to = from + filters.pageSize - 1;
        query = query.range(from, to);
      }
    }

    // Default alphabetical sorting
    query = query.order('name', { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(`Failed to retrieve companies: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Retrieves a single active company profile by ID (scoped to the authenticated user).
   */
  async getCompanyById(id: string): Promise<CompanyRow | null> {
    const userId = await this.getCurrentUserId();
    const { data, error } = await this.client
      .from('companies')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .maybeSingle();

    if (error) {
      throw new Error(`Failed to retrieve company details: ${error.message}`);
    }

    return data;
  }

  /**
   * Updates an existing company's data (scoped to the authenticated user).
   */
  async updateCompany(id: string, input: UpdateCompanyInput): Promise<CompanyRow> {
    const userId = await this.getCurrentUserId();
    const sanitized = this.sanitizeInput(input);

    const { data, error } = await this.client
      .from('companies')
      .update(sanitized)
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update company: ${error.message}`);
    }

    return data;
  }

  /**
   * Soft deletes a company by writing the current timestamp to deleted_at (scoped to the authenticated user).
   */
  async deleteCompany(id: string): Promise<void> {
    const userId = await this.getCurrentUserId();
    const { error } = await this.client
      .from('companies')
      .update({ deleted_at: new Date().toISOString() })
      .eq('id', id)
      .eq('user_id', userId)
      .is('deleted_at', null);

    if (error) {
      throw new Error(`Failed to soft-delete company: ${error.message}`);
    }
  }
}
export const companyRepository = new CompanyRepository();
