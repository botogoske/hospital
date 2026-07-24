import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/** Convert text values to uppercase before submission. Skips UUIDs and empty strings. */
export function toUpper(data: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {}
  for (const key of Object.keys(data)) {
    const val = data[key]
    if (typeof val === "string" && val.length > 0 && !UUID_RE.test(val)) {
      out[key] = val.toUpperCase()
    } else {
      out[key] = val
    }
  }
  return out
}
