/**
 * Format a timestamp or Date to "Mon DD, YYYY" (e.g. "Jun 4, 2026").
 * Returns "Never" for null/undefined.
 */
export function formatDate(
  timestamp: Date | number | null | undefined,
): string {
  if (timestamp == null) return "Never";

  const date = typeof timestamp === "number" ? new Date(timestamp) : timestamp;

  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  return `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

/**
 * Format a date as relative time from now.
 * Returns "Never" for null/undefined, "just now" for <60s,
 * "Xm ago" for <60min, "Xh ago" for <24h, "Xd ago" for <7d,
 * and falls back to `formatDate` for older dates.
 */
export function formatRelativeTime(date: Date | null | undefined): string {
  if (date == null) return "Never";

  const now = Date.now();
  const diffMs = now - date.getTime();
  const seconds = Math.floor(diffMs / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (seconds < 60) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;

  return formatDate(date);
}
