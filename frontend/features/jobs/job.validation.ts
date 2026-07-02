import { z } from 'zod';

export const JobPriorityEnum = z.enum(['low', 'medium', 'high', 'critical']);
export const JobStatusEnum = z.enum([
  'wishlist',
  'applied',
  'oa',
  'interview',
  'hr',
  'offer',
  'accepted',
  'rejected',
  'withdrawn',
]);
export const WorkModeEnum = z.enum(['remote', 'hybrid', 'onsite']);
export const EmploymentTypeEnum = z.enum(['internship', 'full_time', 'part_time', 'contract']);

// Raw ZodObject schema to allow using .partial() safely
export const baseJobSchema = z.object({
  company_id: z.string().uuid('Invalid company selection'),
  title: z.string().trim().min(1, 'Job title is required').max(150, 'Title must be under 150 characters'),
  description: z.string().trim().nullable().optional(),
  location: z.string().trim().max(150, 'Location must be under 150 characters').nullable().optional(),
  salary_min: z.number().nonnegative('Minimum salary must be 0 or greater').default(0),
  salary_max: z.number().nonnegative('Maximum salary must be 0 or greater').default(0),
  priority: JobPriorityEnum.default('medium'),
  status: JobStatusEnum.default('wishlist'),
  work_mode: WorkModeEnum.nullable().optional(),
  employment_type: EmploymentTypeEnum.nullable().optional(),
  job_url: z.string().trim().url('Invalid job URL').or(z.literal('')).nullable().optional(),
  applied_at: z.string().nullable().optional(),
  deadline: z.string().nullable().optional(),
});

// Refined schema for Job Creation with validations
export const createJobSchema = baseJobSchema.refine(
  (data) => data.salary_max >= data.salary_min,
  {
    message: 'Maximum salary must be greater than or equal to minimum salary',
    path: ['salary_max'],
  }
);

// Safe partial schema for updates
export const updateJobSchema = baseJobSchema.partial();

export type CreateJobInput = z.input<typeof createJobSchema>;
export type UpdateJobInput = z.input<typeof updateJobSchema>;
