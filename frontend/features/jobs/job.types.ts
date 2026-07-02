import { Database } from '@/lib/supabase/types';

export type JobRow = Database['public']['Tables']['jobs']['Row'];
export type JobInsert = Database['public']['Tables']['jobs']['Insert'];
export type JobUpdate = Database['public']['Tables']['jobs']['Update'];

// Job joined with its target company details
export type JobWithCompany = JobRow & {
  company: {
    name: string;
    logo_url: string | null;
  } | null;
};

export interface JobFilters {
  search?: string;
  status?: JobRow['status'];
  priority?: JobRow['priority'];
  work_mode?: JobRow['work_mode'];
  employment_type?: JobRow['employment_type'];
  company_id?: string;
  page?: number;
  pageSize?: number;
}
