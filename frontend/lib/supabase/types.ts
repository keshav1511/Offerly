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
      users: {
        Row: {
          id: string;
          email: string;
          target_role: string | null;
          experience_level: "entry" | "mid" | "senior" | "lead" | null;
          target_salary_min: number | null;
          target_salary_max: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          target_role?: string | null;
          experience_level?: "entry" | "mid" | "senior" | "lead" | null;
          target_salary_min?: number | null;
          target_salary_max?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          target_role?: string | null;
          experience_level?: "entry" | "mid" | "senior" | "lead" | null;
          target_salary_min?: number | null;
          target_salary_max?: number | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      resumes: {
        Row: {
          id: string;
          user_id: string;
          version_name: string;
          raw_text: string;
          structured_data: Json;
          file_path: string;
          ats_score: number | null;
          is_primary: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          version_name?: string;
          raw_text: string;
          structured_data: Json;
          file_path: string;
          ats_score?: number | null;
          is_primary?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          version_name?: string;
          raw_text?: string;
          structured_data?: Json;
          file_path?: string;
          ats_score?: number | null;
          is_primary?: boolean;
          created_at?: string;
        };
      };
      companies: {
        Row: {
          id: string;
          name: string;
          domain: string | null;
          logo_url: string | null;
          description: string | null;
          industries: string[];
        };
        Insert: {
          id?: string;
          name: string;
          domain?: string | null;
          logo_url?: string | null;
          description?: string | null;
          industries?: string[];
        };
        Update: {
          id?: string;
          name?: string;
          domain?: string | null;
          logo_url?: string | null;
          description?: string | null;
          industries?: string[];
        };
      };
      jobs: {
        Row: {
          id: string;
          company_id: string;
          title: string;
          description: string;
          location: string;
          salary_min: number | null;
          salary_max: number | null;
          required_skills: string[];
          embedding: string | null; // Vector is serialized as string in generic JS clients
          source_url: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          company_id: string;
          title: string;
          description: string;
          location: string;
          salary_min?: number | null;
          salary_max?: number | null;
          required_skills?: string[];
          embedding?: string | null;
          source_url?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          company_id?: string;
          title?: string;
          description?: string;
          location?: string;
          salary_min?: number | null;
          salary_max?: number | null;
          required_skills?: string[];
          embedding?: string | null;
          source_url?: string | null;
          created_at?: string;
        };
      };
      applications: {
        Row: {
          id: string;
          user_id: string;
          job_id: string;
          resume_id: string | null;
          status: "bookmarked" | "applied" | "interviewing" | "offer_received" | "rejected";
          match_rate: number | null;
          applied_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          job_id: string;
          resume_id?: string | null;
          status: "bookmarked" | "applied" | "interviewing" | "offer_received" | "rejected";
          match_rate?: number | null;
          applied_at?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          job_id?: string;
          resume_id?: string | null;
          status?: "bookmarked" | "applied" | "interviewing" | "offer_received" | "rejected";
          match_rate?: number | null;
          applied_at?: string | null;
          created_at?: string;
        };
      };
      application_logs: {
        Row: {
          id: string;
          application_id: string;
          event_type: string;
          payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          application_id: string;
          event_type: string;
          payload: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          application_id?: string;
          event_type?: string;
          payload?: Json;
          created_at?: string;
        };
      };
    };
  };
}
