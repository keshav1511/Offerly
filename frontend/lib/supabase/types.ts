export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  graphql_public: {
    Tables: {
      [_ in never]: never
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      graphql: {
        Args: {
          extensions?: Json
          operationName?: string
          query?: string
          variables?: Json
        }
        Returns: Json
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
  public: {
    Tables: {
      application_events: {
        Row: {
          application_id: string
          created_at: string
          event_time: string
          event_type: string
          id: string
          payload: Json | null
        }
        Insert: {
          application_id: string
          created_at?: string
          event_time?: string
          event_type: string
          id?: string
          payload?: Json | null
        }
        Update: {
          application_id?: string
          created_at?: string
          event_time?: string
          event_type?: string
          id?: string
          payload?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "application_events_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
        ]
      }
      application_history: {
        Row: {
          changed_by: string
          created_at: string
          from_status: Database["public"]["Enums"]["application_status"]
          id: string
          job_id: string
          note: string | null
          to_status: Database["public"]["Enums"]["application_status"]
          user_id: string
        }
        Insert: {
          changed_by: string
          created_at?: string
          from_status: Database["public"]["Enums"]["application_status"]
          id?: string
          job_id: string
          note?: string | null
          to_status: Database["public"]["Enums"]["application_status"]
          user_id: string
        }
        Update: {
          changed_by?: string
          created_at?: string
          from_status?: Database["public"]["Enums"]["application_status"]
          id?: string
          job_id?: string
          note?: string | null
          to_status?: Database["public"]["Enums"]["application_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "application_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_overview"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "application_history_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      applications: {
        Row: {
          applied_at: string | null
          cover_letter_id: string | null
          created_at: string
          deleted_at: string | null
          id: string
          interview_date: string | null
          job_id: string
          notes: Json | null
          offer_date: string | null
          priority: Database["public"]["Enums"]["priority"]
          rejection_date: string | null
          resume_id: string | null
          salary_offered: number | null
          status: Database["public"]["Enums"]["application_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          cover_letter_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          interview_date?: string | null
          job_id: string
          notes?: Json | null
          offer_date?: string | null
          priority?: Database["public"]["Enums"]["priority"]
          rejection_date?: string | null
          resume_id?: string | null
          salary_offered?: number | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          cover_letter_id?: string | null
          created_at?: string
          deleted_at?: string | null
          id?: string
          interview_date?: string | null
          job_id?: string
          notes?: Json | null
          offer_date?: string | null
          priority?: Database["public"]["Enums"]["priority"]
          rejection_date?: string | null
          resume_id?: string | null
          salary_offered?: number | null
          status?: Database["public"]["Enums"]["application_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_overview"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "applications_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          created_at: string
          deleted_at: string | null
          description: string | null
          id: string
          industry: string | null
          linkedin_url: string | null
          location: string | null
          logo_url: string | null
          name: string
          notes: string | null
          size: Database["public"]["Enums"]["company_size"] | null
          updated_at: string
          user_id: string
          website: string | null
        }
        Insert: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          location?: string | null
          logo_url?: string | null
          name: string
          notes?: string | null
          size?: Database["public"]["Enums"]["company_size"] | null
          updated_at?: string
          user_id: string
          website?: string | null
        }
        Update: {
          created_at?: string
          deleted_at?: string | null
          description?: string | null
          id?: string
          industry?: string | null
          linkedin_url?: string | null
          location?: string | null
          logo_url?: string | null
          name?: string
          notes?: string | null
          size?: Database["public"]["Enums"]["company_size"] | null
          updated_at?: string
          user_id?: string
          website?: string | null
        }
        Relationships: []
      }
      job_skill_map: {
        Row: {
          created_at: string
          job_id: string
          skill_id: string
        }
        Insert: {
          created_at?: string
          job_id: string
          skill_id: string
        }
        Update: {
          created_at?: string
          job_id?: string
          skill_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_skill_map_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_overview"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_skill_map_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_skill_map_skill_id_fkey"
            columns: ["skill_id"]
            isOneToOne: false
            referencedRelation: "job_skills"
            referencedColumns: ["id"]
          },
        ]
      }
      job_skills: {
        Row: {
          category: string | null
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      job_tag_map: {
        Row: {
          created_at: string
          job_id: string
          tag_id: string
        }
        Insert: {
          created_at?: string
          job_id: string
          tag_id: string
        }
        Update: {
          created_at?: string
          job_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "job_tag_map_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_overview"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "job_tag_map_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "job_tag_map_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "job_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      job_tags: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          application_url: string | null
          applied_at: string | null
          benefits: string | null
          company_id: string
          created_at: string
          currency: string | null
          deadline: string | null
          deleted_at: string | null
          department: string | null
          description: string | null
          embedding: string | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          expires_at: string | null
          external_job_id: string | null
          id: string
          job_url: string | null
          location: string | null
          metadata: Json | null
          posted_at: string | null
          priority: Database["public"]["Enums"]["priority"]
          requirements: string | null
          responsibilities: string | null
          salary_max: number | null
          salary_min: number | null
          source: string | null
          status: Database["public"]["Enums"]["application_status"]
          title: string
          updated_at: string
          user_id: string
          work_mode: Database["public"]["Enums"]["work_mode"] | null
        }
        Insert: {
          application_url?: string | null
          applied_at?: string | null
          benefits?: string | null
          company_id: string
          created_at?: string
          currency?: string | null
          deadline?: string | null
          deleted_at?: string | null
          department?: string | null
          description?: string | null
          embedding?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          expires_at?: string | null
          external_job_id?: string | null
          id?: string
          job_url?: string | null
          location?: string | null
          metadata?: Json | null
          posted_at?: string | null
          priority?: Database["public"]["Enums"]["priority"]
          requirements?: string | null
          responsibilities?: string | null
          salary_max?: number | null
          salary_min?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          title: string
          updated_at?: string
          user_id: string
          work_mode?: Database["public"]["Enums"]["work_mode"] | null
        }
        Update: {
          application_url?: string | null
          applied_at?: string | null
          benefits?: string | null
          company_id?: string
          created_at?: string
          currency?: string | null
          deadline?: string | null
          deleted_at?: string | null
          department?: string | null
          description?: string | null
          embedding?: string | null
          employment_type?:
            | Database["public"]["Enums"]["employment_type"]
            | null
          expires_at?: string | null
          external_job_id?: string | null
          id?: string
          job_url?: string | null
          location?: string | null
          metadata?: Json | null
          posted_at?: string | null
          priority?: Database["public"]["Enums"]["priority"]
          requirements?: string | null
          responsibilities?: string | null
          salary_max?: number | null
          salary_min?: number | null
          source?: string | null
          status?: Database["public"]["Enums"]["application_status"]
          title?: string
          updated_at?: string
          user_id?: string
          work_mode?: Database["public"]["Enums"]["work_mode"] | null
        }
        Relationships: [
          {
            foreignKeyName: "jobs_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      notes: {
        Row: {
          content: string
          created_at: string
          deleted_at: string | null
          id: string
          job_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          job_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          job_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_overview"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "notes_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          deleted_at: string | null
          experience_level:
            | Database["public"]["Enums"]["experience_level"]
            | null
          full_name: string | null
          github_url: string | null
          id: string
          linkedin_url: string | null
          preferred_location: string | null
          target_role: string | null
          target_salary_max: number | null
          target_salary_min: number | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          full_name?: string | null
          github_url?: string | null
          id: string
          linkedin_url?: string | null
          preferred_location?: string | null
          target_role?: string | null
          target_salary_max?: number | null
          target_salary_min?: number | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          deleted_at?: string | null
          experience_level?:
            | Database["public"]["Enums"]["experience_level"]
            | null
          full_name?: string | null
          github_url?: string | null
          id?: string
          linkedin_url?: string | null
          preferred_location?: string | null
          target_role?: string | null
          target_salary_max?: number | null
          target_salary_min?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          ats_score: number | null
          created_at: string
          deleted_at: string | null
          embedding: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          is_default: boolean
          job_snapshot: Json | null
          parsed_at: string | null
          parsed_text: string
          parser_version: string | null
          parsing_error: string | null
          parsing_status: string
          structured_data: Json
          tailoring_metadata: Json | null
          updated_at: string
          user_id: string
          version_name: string
        }
        Insert: {
          ats_score?: number | null
          created_at?: string
          deleted_at?: string | null
          embedding?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          is_default?: boolean
          job_snapshot?: Json | null
          parsed_at?: string | null
          parsed_text: string
          parser_version?: string | null
          parsing_error?: string | null
          parsing_status?: string
          structured_data?: Json
          tailoring_metadata?: Json | null
          updated_at?: string
          user_id: string
          version_name?: string
        }
        Update: {
          ats_score?: number | null
          created_at?: string
          deleted_at?: string | null
          embedding?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          is_default?: boolean
          job_snapshot?: Json | null
          parsed_at?: string | null
          parsed_text?: string
          parser_version?: string | null
          parsing_error?: string | null
          parsing_status?: string
          structured_data?: Json
          tailoring_metadata?: Json | null
          updated_at?: string
          user_id?: string
          version_name?: string
        }
        Relationships: []
      }
      saved_jobs: {
        Row: {
          created_at: string
          id: string
          job_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          job_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          job_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "job_overview"
            referencedColumns: ["job_id"]
          },
          {
            foreignKeyName: "saved_jobs_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "jobs"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      application_dashboard: {
        Row: {
          accepted: number | null
          average_ats_score: number | null
          interviews: number | null
          offers: number | null
          rejected: number | null
          total_applications: number | null
          user_id: string | null
          wishlist: number | null
        }
        Relationships: []
      }
      job_overview: {
        Row: {
          application_count: number | null
          company: string | null
          employment_type: Database["public"]["Enums"]["employment_type"] | null
          job_id: string | null
          posted_date: string | null
          title: string | null
          user_id: string | null
          work_mode: Database["public"]["Enums"]["work_mode"] | null
        }
        Relationships: []
      }
    }
    Functions: {
      active_interviews: { Args: { user_uuid: string }; Returns: number }
      application_count_by_status: {
        Args: { user_uuid: string }
        Returns: {
          count: number
          status: Database["public"]["Enums"]["application_status"]
        }[]
      }
      average_ats_score: { Args: { user_uuid: string }; Returns: number }
      latest_application: {
        Args: { user_uuid: string }
        Returns: {
          applied_at: string
          company_name: string
          id: string
          job_title: string
          status: Database["public"]["Enums"]["application_status"]
        }[]
      }
      offers_received: { Args: { user_uuid: string }; Returns: number }
      wishlist_count: { Args: { user_uuid: string }; Returns: number }
    }
    Enums: {
      application_status:
        | "wishlist"
        | "applied"
        | "oa"
        | "interview"
        | "hr"
        | "offer"
        | "accepted"
        | "rejected"
        | "withdrawn"
      company_size:
        | "1-10"
        | "11-50"
        | "51-200"
        | "201-500"
        | "501-1000"
        | "1000+"
      employment_type: "internship" | "full_time" | "part_time" | "contract"
      experience_level: "entry" | "mid" | "senior" | "lead"
      priority: "low" | "medium" | "high" | "critical"
      work_mode: "remote" | "hybrid" | "onsite"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  graphql_public: {
    Enums: {},
  },
  public: {
    Enums: {
      application_status: [
        "wishlist",
        "applied",
        "oa",
        "interview",
        "hr",
        "offer",
        "accepted",
        "rejected",
        "withdrawn",
      ],
      company_size: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
      employment_type: ["internship", "full_time", "part_time", "contract"],
      experience_level: ["entry", "mid", "senior", "lead"],
      priority: ["low", "medium", "high", "critical"],
      work_mode: ["remote", "hybrid", "onsite"],
    },
  },
} as const
