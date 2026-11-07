/**
 * Formats a past timestamp as a human-readable relative time string.
 *
 * Rules (Requirements 7.1):
 * - < 60 seconds:  "just now"
 * - 1–59 minutes:  "X minutes ago"  (whole minutes)
 * - 1–23 hours:    "X hours ago"    (whole hours)
 * - 24+ hours:     "X days ago"     (whole days)
 */
export function formatSyncAge(timestamp: Date): string {
  const elapsedMs = Date.now() - timestamp.getTime();
  const elapsedSec = Math.floor(elapsedMs / 1000);

  if (elapsedSec < 60) return "just now";

  const elapsedMin = Math.floor(elapsedSec / 60);
  if (elapsedMin < 60) return `${elapsedMin} minute${elapsedMin === 1 ? "" : "s"} ago`;

  const elapsedHr = Math.floor(elapsedMin / 60);
  if (elapsedHr < 24) return `${elapsedHr} hour${elapsedHr === 1 ? "" : "s"} ago`;

  const elapsedDays = Math.floor(elapsedHr / 24);
  return `${elapsedDays} day${elapsedDays === 1 ? "" : "s"} ago`;
}
