import { z } from 'zod';

export const uploadResumeSchema = z.object({
  version_name: z
    .string()
    .trim()
    .min(1, 'Version name is required')
    .max(100, 'Version name must be under 100 characters'),
});

export const renameResumeSchema = z.object({
  version_name: z
    .string()
    .trim()
    .min(1, 'Version name is required')
    .max(100, 'Version name must be under 100 characters'),
});

export type UploadResumeInput = z.infer<typeof uploadResumeSchema>;
export type RenameResumeInput = z.infer<typeof renameResumeSchema>;
export const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
];
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB

export const structuredResumeSchema = z.object({
  personal: z.object({
    name: z.string().trim().min(1, "Name is required"),
    email: z.string().trim().email("Please enter a valid email address").min(1, "Email is required"),
    phone: z.string().trim(),
    location: z.string().trim(),
  }),
  summary: z.string().trim(),
  skills: z.array(z.string().trim()),
  education: z.array(
    z.object({
      institution: z.string().trim().min(1, "Institution is required"),
      degree: z.string().trim(),
      field_of_study: z.string().trim(),
      start_date: z.string().trim(),
      end_date: z.string().trim(),
    })
  ),
  experience: z.array(
    z.object({
      company: z.string().trim().min(1, "Company is required"),
      position: z.string().trim().min(1, "Position is required"),
      location: z.string().trim(),
      start_date: z.string().trim(),
      end_date: z.string().trim(),
      description: z.string().trim(),
    })
  ),
  projects: z.array(
    z.object({
      name: z.string().trim().min(1, "Project name is required"),
      description: z.string().trim(),
      url: z.string().trim(),
    })
  ),
  certifications: z.array(z.string().trim()),
  achievements: z.array(z.string().trim()),
  languages: z.array(z.string().trim()),
  links: z.object({
    github: z.string().trim(),
    linkedin: z.string().trim(),
    portfolio: z.string().trim(),
  }),
  metadata: z.object({
    pageCount: z.number(),
    wordCount: z.number(),
  }),
});

