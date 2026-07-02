import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeRepository } from "../resume.repository";
import { ResumeFilters, ResumeRow } from "../resume.types";

/**
 * Hook for managing resumes data and cache via TanStack Query.
 */
export function useResumes(filters?: ResumeFilters) {
  const queryClient = useQueryClient();

  // 1. Fetch Resumes Query
  const resumesQuery = useQuery({
    queryKey: ["resumes", filters],
    queryFn: () => resumeRepository.getResumes(filters),
  });

  // 2. Upload Resume Mutation
  const uploadMutation = useMutation({
    mutationFn: ({ file, versionName }: { file: File; versionName: string }) =>
      resumeRepository.uploadResume(file, versionName),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });

  // 3. Update Resume Mutation (rename version)
  const updateMutation = useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: Partial<ResumeRow> }) =>
      resumeRepository.updateResume(id, updates),
    onSuccess: (updatedResume) => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
      queryClient.invalidateQueries({ queryKey: ["resume", updatedResume.id] });
    },
  });

  // 4. Soft Delete Resume Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => resumeRepository.deleteResume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });

  // 5. Set Default Resume Mutation
  const setDefaultMutation = useMutation({
    mutationFn: (id: string) => resumeRepository.setDefaultResume(id),
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
    uploadResume: uploadMutation.mutateAsync,
    isUploading: uploadMutation.isPending,
    updateResume: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteResume: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
    setDefaultResume: setDefaultMutation.mutateAsync,
    isSettingDefault: setDefaultMutation.isPending,
  };
}
