export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          avatar_url: string | null;
          preferred_location: string | null;
          linkedin_url: string | null;
          github_url: string | null;
          target_role: string | null;
          experience_level: "entry" | "mid" | "senior" | "lead" | null;
          target_salary_min: number;
          target_salary_max: number;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferred_location?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          target_role?: string | null;
          experience_level?: "entry" | "mid" | "senior" | "lead" | null;
          target_salary_min?: number;
          target_salary_max?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          preferred_location?: string | null;
          linkedin_url?: string | null;
          github_url?: string | null;
          target_role?: string | null;
          experience_level?: "entry" | "mid" | "senior" | "lead" | null;
          target_salary_min?: number;
          target_salary_max?: number;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          website: string | null;
          linkedin_url: string | null;
          industry: string | null;
          location: string | null;
          size: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+" | null;
          logo_url: string | null;
          description: string | null;
          notes: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          website?: string | null;
          linkedin_url?: string | null;
          industry?: string | null;
          location?: string | null;
          size?: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+" | null;
          logo_url?: string | null;
          description?: string | null;
          notes?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          website?: string | null;
          linkedin_url?: string | null;
          industry?: string | null;
          location?: string | null;
          size?: "1-10" | "11-50" | "51-200" | "201-500" | "501-1000" | "1000+" | null;
          logo_url?: string | null;
          description?: string | null;
          notes?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      jobs: {
        Row: {
          id: string;
          user_id: string;
          company_id: string;
          title: string;
          description: string | null;
          location: string | null;
          salary_min: number;
          salary_max: number;
          priority: "low" | "medium" | "high" | "critical";
          status: "wishlist" | "applied" | "oa" | "interview" | "hr" | "offer" | "accepted" | "rejected" | "withdrawn";
          work_mode: "remote" | "hybrid" | "onsite" | null;
          employment_type: "internship" | "full_time" | "part_time" | "contract" | null;
          job_url: string | null;
          applied_at: string | null;
          deadline: string | null;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          company_id: string;
          title: string;
          description?: string | null;
          location?: string | null;
          salary_min?: number;
          salary_max?: number;
          priority?: "low" | "medium" | "high" | "critical";
          status?: "wishlist" | "applied" | "oa" | "interview" | "hr" | "offer" | "accepted" | "rejected" | "withdrawn";
          work_mode?: "remote" | "hybrid" | "onsite" | null;
          employment_type?: "internship" | "full_time" | "part_time" | "contract" | null;
          job_url?: string | null;
          applied_at?: string | null;
          deadline?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          company_id?: string;
          title?: string;
          description?: string | null;
          location?: string | null;
          salary_min?: number;
          salary_max?: number;
          priority?: "low" | "medium" | "high" | "critical";
          status?: "wishlist" | "applied" | "oa" | "interview" | "hr" | "offer" | "accepted" | "rejected" | "withdrawn";
          work_mode?: "remote" | "hybrid" | "onsite" | null;
          employment_type?: "internship" | "full_time" | "part_time" | "contract" | null;
          job_url?: string | null;
          applied_at?: string | null;
          deadline?: string | null;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          version_name: string;
          parsed_text: string;
          structured_data: Json;
          file_path: string;
          file_name: string;
          file_type: string;
          file_size: number;
          ats_score: number | null;
          is_default: boolean;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          version_name?: string;
          parsed_text: string;
          structured_data: Json;
          file_path: string;
          file_name: string;
          file_type: string;
          file_size: number;
          ats_score?: number | null;
          is_default?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          version_name?: string;
          parsed_text?: string;
          structured_data?: Json;
          file_path?: string;
          file_name?: string;
          file_type?: string;
          file_size?: number;
          ats_score?: number | null;
          is_default?: boolean;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      notes: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          content: string;
          deleted_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          content: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_id?: string;
          content?: string;
          deleted_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      application_history: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          changed_by: string;
          from_status: "wishlist" | "applied" | "oa" | "interview" | "hr" | "offer" | "accepted" | "rejected" | "withdrawn";
          to_status: "wishlist" | "applied" | "oa" | "interview" | "hr" | "offer" | "accepted" | "rejected" | "withdrawn";
          note: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          changed_by: string;
          from_status: "wishlist" | "applied" | "oa" | "interview" | "hr" | "offer" | "accepted" | "rejected" | "withdrawn";
          to_status: "wishlist" | "applied" | "oa" | "interview" | "hr" | "offer" | "accepted" | "rejected" | "withdrawn";
          note?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_id?: string;
          changed_by?: string;
          from_status?: "wishlist" | "applied" | "oa" | "interview" | "hr" | "offer" | "accepted" | "rejected" | "withdrawn";
          to_status?: "wishlist" | "applied" | "oa" | "interview" | "hr" | "offer" | "accepted" | "rejected" | "withdrawn";
          note?: string | null;
          created_at?: string;
        };
      };
      job_tags: {
        Row: {
          id: string;
          name: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          created_at?: string;
        };
      };
      job_tag_map: {
        Row: {
          job_id: string;
          tag_id: string;
          created_at: string;
        };
        Insert: {
          job_id: string;
          tag_id: string;
          created_at?: string;
        };
        Update: {
          job_id?: string;
          tag_id?: string;
          created_at?: string;
        };
      };
    };
  };
}
