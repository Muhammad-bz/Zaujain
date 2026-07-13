/**
 * Class Name Utility
 *
 * Combines clsx and tailwind-merge for conditional class composition.
 * Use this everywhere instead of template literals for Tailwind classes.
 *
 * @example
 * cn('base-class', isActive && 'active-class', variant === 'primary' && 'bg-rose')
 */

import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
