/**
 * UI Component Types
 *
 * Shared types used across UI components.
 */

import type { ReactNode } from 'react'

// ─── Shared Component Props ───────────────────────────────────────────────────

export interface WithChildren {
  children: ReactNode
}

export interface WithClassName {
  className?: string
}

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

export type Variant =
  | 'primary'
  | 'secondary'
  | 'ghost'
  | 'outline'
  | 'destructive'
  | 'link'

export type ColorScheme = 'rose' | 'gold' | 'neutral'

// ─── Loading States ───────────────────────────────────────────────────────────

export type LoadingState = 'idle' | 'loading' | 'success' | 'error'

// ─── Toast / Notification ─────────────────────────────────────────────────────

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface ToastConfig {
  type: ToastType
  title: string
  message?: string
  duration?: number
}

// ─── Navigation ───────────────────────────────────────────────────────────────

export interface NavItem {
  label: string
  href: string
  icon?: ReactNode
  badge?: number
  active?: boolean
}

// ─── Form ────────────────────────────────────────────────────────────────────

export interface FormField {
  name: string
  label: string
  placeholder?: string
  required?: boolean
  helperText?: string
}

// ─── Modal / Sheet ────────────────────────────────────────────────────────────

export interface ModalProps extends WithChildren {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
}

// ─── Page Meta ───────────────────────────────────────────────────────────────

export interface PageMeta {
  title: string
  description?: string
  image?: string
  noIndex?: boolean
}

// ─── API Response ─────────────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  data: T | null
  error: string | null
  success: boolean
}
