export type JobStatus =
  | "wishlist"
  | "applied"
  | "oa"
  | "interview"
  | "hr"
  | "offer"
  | "accepted"
  | "rejected"
  | "withdrawn";

/**
 * Maps job application status enums to human-friendly labels.
 */
export function getStatusLabel(status: JobStatus): string {
  const labels: Record<JobStatus, string> = {
    wishlist: "Wishlist",
    applied: "Applied",
    oa: "Online Assessment (OA)",
    interview: "Interviewing",
    hr: "HR Screen",
    offer: "Offer Extended",
    accepted: "Offer Accepted",
    rejected: "Rejected",
    withdrawn: "Withdrawn",
  };
  return labels[status] || status;
}

/**
 * Returns CSS color class configurations for each status badge.
 */
export function getStatusBadgeStyles(status: JobStatus): string {
  const styles: Record<JobStatus, string> = {
    wishlist: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-900 dark:text-zinc-300 dark:border-zinc-800",
    applied: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/20 dark:text-blue-400 dark:border-blue-900/40",
    oa: "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/20 dark:text-purple-400 dark:border-purple-900/40",
    interview: "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/20 dark:text-orange-400 dark:border-orange-900/40",
    hr: "bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/40",
    offer: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/40",
    accepted: "bg-green-50 text-green-700 border-green-200 dark:bg-green-950/20 dark:text-green-400 dark:border-green-900/40",
    rejected: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/40",
    withdrawn: "bg-zinc-100/70 text-zinc-500 border-zinc-200/50 dark:bg-zinc-900/60 dark:text-zinc-500 dark:border-zinc-850/60",
  };
  return styles[status] || styles.wishlist;
}
