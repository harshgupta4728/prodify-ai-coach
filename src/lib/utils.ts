import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// User-entered links are only rendered as clickable hrefs when they are http(s),
// so a saved "javascript:..." link can't run code when clicked
export function safeExternalUrl(url?: string | null): string | undefined {
  if (!url) return undefined
  try {
    const { protocol, href } = new URL(url)
    return protocol === "http:" || protocol === "https:" ? href : undefined
  } catch {
    return undefined
  }
}
