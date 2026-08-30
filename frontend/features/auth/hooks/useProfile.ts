import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileService } from "../services/profile.service";
import { ResumeStructuredData } from "@/features/resume/types/parsing.types";
import { Database } from "@/lib/supabase/types";

/**
 * Hook to retrieve user profile data.
 */
export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: () => profileService.getProfile(),
    enabled: typeof window !== "undefined",
  });
}

/**
 * Hook to update standard profile parameters.
 */
export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<Database["public"]["Tables"]["profiles"]["Update"]>) =>
      profileService.updateProfile(updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}

/**
 * Hook to sync parsed resume profile structured JSON data to the profile.
 */
export function useSyncProfileStructuredData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (structuredData: ResumeStructuredData) =>
      profileService.syncProfileStructuredData(structuredData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
