import { Database } from '@/lib/supabase/types';

export type ResumeRow = Database['public']['Tables']['resumes']['Row'];
export type ResumeInsert = Database['public']['Tables']['resumes']['Insert'];
export type ResumeUpdate = Database['public']['Tables']['resumes']['Update'];

export interface ResumeFilters {
  page?: number;
  pageSize?: number;
}
