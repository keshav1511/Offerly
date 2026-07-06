import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { jobRepository } from "../job.repository";
import { JobFilters } from "../job.types";
import { CreateJobInput, UpdateJobInput } from "../job.validation";

/**
 * Hook for managing jobs data and cache via TanStack Query.
 */
export function useJobs(filters?: JobFilters) {
  const queryClient = useQueryClient();

  // 1. Fetch Jobs Query
  const jobsQuery = useQuery({
    queryKey: ["jobs", filters],
    queryFn: () => jobRepository.getJobs(filters),
  });

  // 2. Create Job Mutation
  const createMutation = useMutation({
    mutationFn: (input: CreateJobInput) => jobRepository.createJob(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  // 3. Update Job Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateJobInput }) =>
      jobRepository.updateJob(id, input),
    onSuccess: (updatedJob) => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
      queryClient.invalidateQueries({ queryKey: ["job", updatedJob.id] });
    },
  });

  // 4. Soft Delete Job Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => jobRepository.deleteJob(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["jobs"] });
    },
  });

  return {
    jobs: jobsQuery.data || [],
    isLoading: jobsQuery.isLoading,
    isError: jobsQuery.isError,
    error: jobsQuery.error,
    refetch: jobsQuery.refetch,
    createJob: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateJob: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteJob: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
