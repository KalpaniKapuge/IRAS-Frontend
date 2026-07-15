import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";

function toDate(value: string | Date) {
  const date = typeof value === "string" ? parseISO(value) : value;
  return isValid(date) ? date : null;
}

export function formatDate(value?: string | Date | null, pattern = "MMM d, yyyy") {
  if (!value) return "—";
  const date = toDate(value);
  return date ? format(date, pattern) : "—";
}

export function formatDateTime(value?: string | Date | null) {
  return formatDate(value, "MMM d, yyyy · h:mm a");
}

export function formatRelative(value?: string | Date | null) {
  if (!value) return "—";
  const date = toDate(value);
  return date ? formatDistanceToNow(date, { addSuffix: true }) : "—";
}
