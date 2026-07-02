import { Database } from '@/lib/supabase/types';

export type CompanyRow = Database['public']['Tables']['companies']['Row'];
export type CompanyInsert = Database['public']['Tables']['companies']['Insert'];
export type CompanyUpdate = Database['public']['Tables']['companies']['Update'];

export interface CompanyFilters {
  search?: string;
  industry?: string;
  size?: CompanyRow['size'];
  page?: number;
  pageSize?: number;
}
