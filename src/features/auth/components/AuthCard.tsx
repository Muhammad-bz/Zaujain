'use client'

import { cn } from '@/utils/cn'

// ─── Card ─────────────────────────────────────────────────────────────────────

export function AuthCard({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'w-full max-w-md rounded-3xl border border-border bg-surface-raised p-8 shadow-xl',
        className
      )}
    >
      {children}
    </div>
  )
}

// ─── Header ───────────────────────────────────────────────────────────────────

export function AuthHeader({
  title,
  subtitle,
}: {
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-8 text-center">
      <h1 className="font-display text-3xl font-medium text-ink">{title}</h1>
      {subtitle && (
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">{subtitle}</p>
      )}
    </div>
  )
}

// ─── Field ────────────────────────────────────────────────────────────────────

export function AuthField({
  label,
  id,
  error,
  children,
}: {
  label: string
  id: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-ink" htmlFor={id}>
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs text-error" role="alert">
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Input ────────────────────────────────────────────────────────────────────

export function AuthInput({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        'input-base',
        'transition-all duration-150',
        className
      )}
      {...props}
    />
  )
}

// ─── Submit Button ────────────────────────────────────────────────────────────

export function AuthButton({
  children,
  loading = false,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { loading?: boolean }) {
  return (
    <button
      className={cn(
        'flex w-full items-center justify-center gap-2 rounded-full',
        'bg-rose px-6 py-3 font-sans text-sm font-medium text-white',
        'shadow-rose shadow-sm transition-all duration-200',
        'hover:-translate-y-0.5 hover:shadow-md',
        'active:translate-y-0 active:shadow-sm',
        'disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0',
        className
      )}
      disabled={loading || props.disabled}
      {...props}
    >
      {loading && (
        <svg
          aria-hidden="true"
          className="h-4 w-4 animate-spin"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            fill="currentColor"
          />
        </svg>
      )}
      {children}
    </button>
  )
}

// ─── Error Alert ──────────────────────────────────────────────────────────────

export function AuthError({ message }: { message: string }) {
  return (
    <div
      className="rounded-xl border border-error/20 bg-error-light px-4 py-3 text-sm text-error"
      role="alert"
    >
      {message}
    </div>
  )
}

// ─── Success Alert ────────────────────────────────────────────────────────────

export function AuthSuccess({ message }: { message: string }) {
  return (
    <div
      className="rounded-xl border border-success/20 bg-success-light px-4 py-3 text-sm text-success"
      role="status"
    >
      {message}
    </div>
  )
}
