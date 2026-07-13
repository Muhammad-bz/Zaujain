/**
 * Slug & ID Utilities
 *
 * For generating personalized URLs and activation keys.
 */

/**
 * Converts a string into a URL-safe slug.
 * @example toSlug('Muhammad & Ayesha') → 'muhammad-ayesha'
 */
export function toSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Collapse multiple hyphens
    .replace(/^-+|-+$/g, '') // Trim leading/trailing hyphens
}

/**
 * Creates a personalized experience slug from two names.
 * @example createExperienceSlug('Muhammad', 'Ayesha') → 'muhammad-and-ayesha'
 */
export function createExperienceSlug(name1: string, name2?: string): string {
  if (!name2) return toSlug(name1)
  return `${toSlug(name1)}-and-${toSlug(name2)}`
}

/**
 * Validates that a slug is properly formatted.
 */
export function isValidSlug(slug: string): boolean {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length >= 3 && slug.length <= 60
}

/**
 * Generates a random suffix to make slugs unique.
 * @example generateSlugSuffix() → 'k3m9'
 */
export function generateSlugSuffix(length = 4): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('')
}

/**
 * Formats a slug for display.
 * @example formatSlugDisplay('muhammad-and-ayesha') → 'muhammad & ayesha'
 */
export function formatSlugDisplay(slug: string): string {
  return slug.replace(/-and-/g, ' & ').replace(/-/g, ' ')
}
