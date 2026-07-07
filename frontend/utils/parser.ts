import mammoth from "mammoth";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdf = require("pdf-parse") as (
  dataBuffer: Buffer
) => Promise<{ text: string }>;

/**
 * Normalizes plain text extracted from document files:
 * - Trims leading/trailing whitespace.
 * - Standardizes line endings.
 * - Collapses duplicate internal whitespaces while preserving single space.
 */
export function normalizeText(text: string): string {
  if (!text) return "";
  return text
    .trim()
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n\s*\n/g, "\n\n");
}

/**
 * Extracts raw text from a PDF buffer.
 */
export async function extractTextFromPdf(buffer: Buffer): Promise<string> {
  const data = await pdf(buffer);
  return data.text || "";
}

/**
 * Extracts raw text from a DOCX buffer.
 */
export async function extractTextFromDocx(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value || "";
}
