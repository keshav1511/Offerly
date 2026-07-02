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
