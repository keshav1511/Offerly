import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { companyRepository } from "../company.repository";
import { CompanyFilters, CompanyRow } from "../company.types";
import { CreateCompanyInput, UpdateCompanyInput } from "../company.validation";

/**
 * Hook for managing companies data and cache via TanStack Query.
 */
export function useCompanies(filters?: CompanyFilters) {
  const queryClient = useQueryClient();

  // 1. Fetch Companies Query
  const companiesQuery = useQuery({
    queryKey: ["companies", filters],
    queryFn: () => companyRepository.getCompanies(filters),
  });

  // 2. Create Company Mutation
  const createMutation = useMutation({
    mutationFn: (input: CreateCompanyInput) => companyRepository.createCompany(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  // 3. Update Company Mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateCompanyInput }) =>
      companyRepository.updateCompany(id, input),
    onSuccess: (updatedCompany) => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
      queryClient.invalidateQueries({ queryKey: ["company", updatedCompany.id] });
    },
  });

  // 4. Soft Delete Company Mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => companyRepository.deleteCompany(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["companies"] });
    },
  });

  return {
    companies: companiesQuery.data || [],
    isLoading: companiesQuery.isLoading,
    isError: companiesQuery.isError,
    error: companiesQuery.error,
    refetch: companiesQuery.refetch,
    createCompany: createMutation.mutateAsync,
    isCreating: createMutation.isPending,
    updateCompany: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,
    deleteCompany: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
