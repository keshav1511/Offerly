/**
 * Diagnose Supabase Error
 * 
 * Inspects exceptions to identify specific failure modes
 * (e.g. network errors, CORS issues, or bad keys) and maps them to clean user messages.
 */
export function diagnoseSupabaseError(error: unknown): string {
  // Inspect the thrown error
  if (error instanceof Error) {
    const msg = error.message;

    // Handle standard network fetch failures
    if (msg.includes("Failed to fetch") || msg.includes("fetch failed")) {
      return "NETWORK ERROR: CONNECTION FAILED. PLEASE CHECK YOUR INTERNET CONNECTION AND VERIFY THAT THE SUPABASE SERVICE IS ACTIVE.";
    }

    // CORS issues or other fetch issues
    if (msg.includes("CORS") || msg.toLowerCase().includes("cors")) {
      return "CORS ERROR: REQUEST BLOCKED BY CORS POLICY. VERIFY ALLOWED ORIGINS IN SUPABASE DASHBOARD.";
    }

    return `SUPABASE AUTH ERROR: ${msg.toUpperCase()}`;
  }

  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;
    if (typeof errObj.message === "string") {
      return `SUPABASE ERROR: ${errObj.message.toUpperCase()}`;
    }
  }

  return "AN UNEXPECTED ERROR OCCURRED DURING SUPABASE COMMUNICATION.";
}

/**
 * Mask Supabase Anon Key
 * 
 * Returns a masked representation of the API key, showing only the first and last few characters.
 */
export function maskAnonKey(key: string): string {
  if (!key) return "MISSING_KEY";
  if (key.length <= 15) return "INVALID_SHORT_KEY";
  return `${key.substring(0, 8)}...${key.substring(key.length - 8)}`;
}
