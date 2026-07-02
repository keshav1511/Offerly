import { z } from 'zod';

export const CompanySizeEnum = z.enum(['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']);

export const createCompanySchema = z.object({
  name: z.string().trim().min(1, 'Company name is required').max(150, 'Name must be under 150 characters'),
  website: z.string().trim().url('Invalid website URL').or(z.literal('')).nullable().optional(),
  linkedin_url: z.string().trim().url('Invalid LinkedIn URL').or(z.literal('')).nullable().optional(),
  logo_url: z.string().trim().url('Invalid logo URL').or(z.literal('')).nullable().optional(),
  industry: z.string().trim().max(100, 'Industry must be under 100 characters').nullable().optional(),
  location: z.string().trim().max(150, 'Location must be under 150 characters').nullable().optional(),
  size: CompanySizeEnum.nullable().optional(),
  description: z.string().trim().nullable().optional(),
  notes: z.string().trim().nullable().optional(),
});

export const updateCompanySchema = createCompanySchema.partial();

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
