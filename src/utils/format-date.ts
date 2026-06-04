/**
 * Format a timestamp or Date to "Mon DD, YYYY" (e.g. "Jun 4, 2026").
 * Returns "Never" for null/undefined.
 */
export function formatDate(timestamp: Date | number | null | undefined): string {
  if (timestamp == null) return "Never";

  const date = typeof timestamp === "number" ? new Date(timestamp) : timestamp;

  const months = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
  ];

  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}
