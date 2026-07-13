/**
 * Date & Time Utilities
 *
 * Consistent date formatting across Zaujain.
 * Uses date-fns for reliable, lightweight date handling.
 */

import {
  format,
  formatDistanceToNow,
  formatDistance,
  isAfter,
  isBefore,
  differenceInDays,
  addDays,
  parseISO,
} from 'date-fns'

/**
 * Formats a date for display in the UI.
 * @example formatDate('2024-02-14') → "February 14, 2024"
 */
export function formatDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMMM d, yyyy')
}

/**
 * Formats a date in short form.
 * @example formatDateShort('2024-02-14') → "Feb 14, 2024"
 */
export function formatDateShort(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'MMM d, yyyy')
}

/**
 * Formats a relative time string.
 * @example formatRelativeTime('2024-02-14') → "3 months ago"
 */
export function formatRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return formatDistanceToNow(d, { addSuffix: true })
}

/**
 * Formats the distance between two dates.
 * @example formatDateDistance('2024-01-01', '2025-01-01') → "about 1 year"
 */
export function formatDateDistance(from: string | Date, to: string | Date): string {
  const fromDate = typeof from === 'string' ? parseISO(from) : from
  const toDate = typeof to === 'string' ? parseISO(to) : to
  return formatDistance(fromDate, toDate)
}

/**
 * Calculates days until a future date.
 * Returns 0 if the date is in the past.
 */
export function daysUntil(date: string | Date): number {
  const d = typeof date === 'string' ? parseISO(date) : date
  const now = new Date()
  if (isBefore(d, now)) return 0
  return differenceInDays(d, now)
}

/**
 * Checks if a date has passed.
 */
export function hasPassed(date: string | Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isBefore(d, new Date())
}

/**
 * Checks if a date is in the future.
 */
export function isFuture(date: string | Date): boolean {
  const d = typeof date === 'string' ? parseISO(date) : date
  return isAfter(d, new Date())
}

/**
 * Formats a date for an <input type="date"> value.
 * @example toInputDate('2024-02-14T00:00:00Z') → "2024-02-14"
 */
export function toInputDate(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date
  return format(d, 'yyyy-MM-dd')
}

/**
 * Adds days to a date.
 */
export function addDaysToDate(date: string | Date, days: number): Date {
  const d = typeof date === 'string' ? parseISO(date) : date
  return addDays(d, days)
}

/**
 * Formats a countdown display: "X days, Y hours, Z minutes"
 */
export function formatCountdown(targetDate: string | Date): string {
  const target = typeof targetDate === 'string' ? parseISO(targetDate) : targetDate
  const now = new Date()

  if (isBefore(target, now)) return 'Unlocked'

  const totalSeconds = Math.floor((target.getTime() - now.getTime()) / 1000)
  const days = Math.floor(totalSeconds / (60 * 60 * 24))
  const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60))
  const minutes = Math.floor((totalSeconds % (60 * 60)) / 60)

  if (days > 0) return `${days} day${days !== 1 ? 's' : ''}, ${hours}h ${minutes}m`
  if (hours > 0) return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes}m`
  return `${minutes} minute${minutes !== 1 ? 's' : ''}`
}
