'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { signUp } from '../actions'
import {
  AuthCard,
  AuthHeader,
  AuthField,
  AuthInput,
  AuthButton,
  AuthError,
  AuthSuccess,
} from './AuthCard'

export function SignUpForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    setFieldErrors({})

    const formData = new FormData(event.currentTarget)

    // Client-side password match check before hitting the server
    if (formData.get('password') !== formData.get('confirmPassword')) {
      setFieldErrors({ confirmPassword: "Passwords don't match" })
      return
    }

    startTransition(async () => {
      const result = await signUp(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.success && result.message) {
        setSuccess(result.message)
      }
    })
  }

  // After successful signup, show only the confirmation message
  if (success) {
    return (
      <AuthCard>
        <div className="text-center">
          <div className="mb-4 flex justify-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-success-light">
              <svg
                className="h-7 w-7 text-success"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0l-8 4-8-4" />
              </svg>
            </div>
          </div>
          <h2 className="mb-2 font-display text-2xl font-medium text-ink">
            Check your inbox
          </h2>
          <p className="text-sm leading-relaxed text-ink-muted">{success}</p>
          <p className="mt-6 text-sm text-muted">
            Already confirmed?{' '}
            <Link className="font-medium text-rose hover:underline" href="/sign-in">
              Sign in
            </Link>
          </p>
        </div>
      </AuthCard>
    )
  }

  return (
    <AuthCard>
      <AuthHeader
        subtitle="Create an account to start building your first gift."
        title="Create your account"
      />

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        {error && <AuthError message={error} />}

        <AuthField error={fieldErrors.name} id="name" label="Your name">
          <AuthInput
            autoComplete="name"
            id="name"
            name="name"
            placeholder="Muhammad"
            required
            type="text"
          />
        </AuthField>

        <AuthField error={fieldErrors.email} id="email" label="Email address">
          <AuthInput
            autoComplete="email"
            id="email"
            inputMode="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </AuthField>

        <AuthField error={fieldErrors.password} id="password" label="Password">
          <AuthInput
            autoComplete="new-password"
            id="password"
            name="password"
            placeholder="At least 8 characters"
            required
            type="password"
          />
        </AuthField>

        <AuthField
          error={fieldErrors.confirmPassword}
          id="confirmPassword"
          label="Confirm password"
        >
          <AuthInput
            autoComplete="new-password"
            id="confirmPassword"
            name="confirmPassword"
            placeholder="Repeat your password"
            required
            type="password"
          />
        </AuthField>

        <AuthButton loading={isPending} type="submit">
          {isPending ? 'Creating account…' : 'Create account'}
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link className="font-medium text-rose hover:underline" href="/sign-in">
          Sign in
        </Link>
      </p>
    </AuthCard>
  )
}
