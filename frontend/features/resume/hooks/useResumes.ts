import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { resumeService } from "../services/resume.service";
import { ResumeFilters, ResumeRow } from "../resume.types";
import { ResumeStructuredData } from "../types/parsing.types";

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

  // 6. Parse Resume Mutation
  const parseMutation = useMutation({
    mutationFn: ({ id, force }: { id: string; force?: boolean }) =>
      resumeService.parseResume(id, force),
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
    parseResume: parseMutation.mutateAsync,
    isParsing: parseMutation.isPending,
  };
}

/**
 * Hook for loading single resume metadata.
 */
export function useResume(id: string) {
  return useQuery({
    queryKey: ["resume", id],
    queryFn: () => resumeService.getResumeById(id),
    enabled: typeof window !== "undefined" && !!id,
  });
}

/**
 * Hook for loading structured resume data.
 */
export function useStructuredResume(resumeId: string) {
  return useQuery({
    queryKey: ["structured-resume", resumeId],
    queryFn: () => resumeService.getStructuredResume(resumeId),
    enabled: typeof window !== "undefined" && !!resumeId,
  });
}

/**
 * Hook for updating structured resume data with optimistic updates.
 */
export function useUpdateStructuredResume(resumeId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (structuredData: ResumeStructuredData) =>
      resumeService.updateStructuredResume(resumeId, structuredData),
    onMutate: async (newStructuredData) => {
      await queryClient.cancelQueries({ queryKey: ["structured-resume", resumeId] });
      const previousStructuredData = queryClient.getQueryData<ResumeStructuredData>([
        "structured-resume",
        resumeId,
      ]);
      queryClient.setQueryData(["structured-resume", resumeId], newStructuredData);
      return { previousStructuredData };
    },
    onError: (err, newStructuredData, context) => {
      if (context?.previousStructuredData) {
        queryClient.setQueryData(
          ["structured-resume", resumeId],
          context.previousStructuredData
        );
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["structured-resume", resumeId] });
      queryClient.invalidateQueries({ queryKey: ["resumes"] });
    },
  });
}
