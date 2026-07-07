import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeService } from "../services/resume.service";
import { ResumeFilters, ResumeRow } from "../resume.types";

/**
 * Hook for managing resumes data and cache via TanStack Query.
 */
export function useResumes(filters?: ResumeFilters) {
  const queryClient = useQueryClient();

  // 1. Fetch Resumes Query
  const resumesQuery = useQuery({
    queryKey: ["resumes", filters],
    queryFn: () => resumeService.getUserResumes(filters),
    enabled: typeof window !== "undefined",
  });

  // 3. Update Resume Mutation (rename version)
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ResumeRow> }) => {
      const versionName = updates.version_name ?? "";
      return resumeService.renameResume(id, versionName);
    },
    onSuccess: (updatedResume) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["resume", updatedResume.id] });
    },
  });

  // 4. Soft Delete Resume Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => resumeService.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });

  // 5. Set Default Resume Mutation
  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => resumeService.setDefaultResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });

  return {
    resumes: resumesQuery.data || [],
    isLoading: resumesQuery.isLoading,
    isError: resumesQuery.isError,
    error: resumesQuery.error,
    refetch: resumesQuery.refetch,
    updateResume: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteResume: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    setDefaultResume: setDefaultMutation.mutateAsync,
    isSettingDefault: setDefaultMutation.isPending,
  };
}
