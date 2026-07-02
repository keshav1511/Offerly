/**
 * Formats an ISO date string into a user-friendly format (e.g. Jul 2, 2026).
 */
export function formatDate(isoString: string | null | undefined): string {
  if (!isoString) return "N/A";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "N/A";
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "N/A";
  }
}

/**
 * Formats a date string into an input-friendly date format (YYYY-MM-DD) for HTML inputs.
 */
export function formatDateForInput(isoString: string | null | undefined): string {
  if (!isoString) return "";
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return "";
    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
}

/**
 * Returns a human-friendly relative time text (e.g., '2 days remaining', 'Deadline passed').
 */
export function getDeadlineStatus(isoString: string | null | undefined): {
  text: string;
  isOverdue: boolean;
} {
  if (!isoString) return { text: "No deadline", isOverdue: false };
  try {
    const deadline = new Date(isoString);
    if (isNaN(deadline.getTime())) return { text: "No deadline", isOverdue: false };
    
    const now = new Date();
    // Normalize times to midnight for accurate day calculations
    const deadlineMidnight = new Date(deadline.getFullYear(), deadline.getMonth(), deadline.getDate());
    const nowMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffTime = deadlineMidnight.getTime() - nowMidnight.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: "Deadline passed", isOverdue: true };
    }
    if (diffDays === 0) {
      return { text: "Deadline today", isOverdue: false };
    }
    if (diffDays === 1) {
      return { text: "Deadline tomorrow", isOverdue: false };
    }
    return { text: `${diffDays} days remaining`, isOverdue: false };
  } catch {
    return { text: "No deadline", isOverdue: false };
  }
}
