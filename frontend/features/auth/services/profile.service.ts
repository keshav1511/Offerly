import { SupabaseClient } from "@supabase/supabase-js";
import { supabase as defaultClient } from "@/lib/supabase/client";
import { Database, Json } from "@/lib/supabase/types";
import { ResumeStructuredData } from "@/features/resume/types/parsing.types";

export class ProfileService {
  private readonly client: SupabaseClient<Database>;

  constructor(client: SupabaseClient<Database> = defaultClient) {
    this.client = client;
  }

  private async getCurrentUserId(): Promise<string> {
    const { data: { user }, error } = await this.client.auth.getUser();
    if (error || !user) {
      throw new Error("Authentication required.");
    }
    return user.id;
  }

  /**
   * Fetches the current user's profile metadata and structured data.
   */
  async getProfile() {
    try {
      const userId = await this.getCurrentUserId();
      const { data, error } = await this.client
        .from("profiles")
        .select("*")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    } catch (err) {
      console.error("[ProfileService] getProfile failed:", err);
      throw err;
    }
  }

  /**
   * Updates general profile columns.
   */
  async updateProfile(updates: Partial<Database["public"]["Tables"]["profiles"]["Update"]>) {
    try {
      const userId = await this.getCurrentUserId();
      const { data, error } = await this.client
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    } catch (err) {
      console.error("[ProfileService] updateProfile failed:", err);
      throw err;
    }
  }

  /**
   * Uploads an avatar image to public storage bucket 'avatars' and returns its public URL.
   */
  async uploadAvatar(file: File): Promise<string> {
    try {
      const userId = await this.getCurrentUserId();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.]/g, '_');
      const storagePath = `${userId}/${Date.now()}_${cleanFileName}`;

      const { error: uploadError } = await this.client.storage
        .from('avatars')
        .upload(storagePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Failed to upload avatar: ${uploadError.message}`);
      }

      const { data: { publicUrl } } = this.client.storage
        .from('avatars')
        .getPublicUrl(storagePath);

      return publicUrl;
    } catch (err) {
      console.error("[ProfileService] uploadAvatar failed:", err);
      throw err;
    }
  }

  /**
   * Syncs the confirmed structured resume data to profiles.structured_data JSONB column.
   */
  async syncProfileStructuredData(structuredData: ResumeStructuredData) {
    try {
      const userId = await this.getCurrentUserId();
      
      // Map personal info fields directly to top-level profile columns where appropriate
      const updates = {
        full_name: structuredData.personal.name || "",
        preferred_location: structuredData.personal.location || "",
        linkedin_url: structuredData.links.linkedin || "",
        github_url: structuredData.links.github || "",
        structured_data: structuredData as unknown as Json,
      };

      const { data, error } = await this.client
        .from("profiles")
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }
      return data;
    } catch (err) {
      console.error("[ProfileService] syncProfileStructuredData failed:", err);
      throw err;
    }
  }
}

export const profileService = new ProfileService();
