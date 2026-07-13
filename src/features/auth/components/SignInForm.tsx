'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { signIn } from '../actions'
import {
  AuthCard,
  AuthHeader,
  AuthField,
  AuthInput,
  AuthButton,
  AuthError,
} from './AuthCard'

export function SignInForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()

  // Show error if redirected here after failed email confirmation
  const urlError = searchParams.get('error')
  const confirmationError =
    urlError === 'confirmation_failed'
      ? 'Email confirmation failed. Please try signing up again.'
      : null

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await signIn(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <AuthCard>
      <AuthHeader
        subtitle="Welcome back. Your gift is waiting."
        title="Sign in"
      />

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        {(error || confirmationError) && (
          <AuthError message={error ?? confirmationError ?? ''} />
        )}

        <AuthField id="email" label="Email address">
          <AuthInput
            autoComplete="email"
            autoFocus
            id="email"
            inputMode="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </AuthField>

        <AuthField id="password" label="Password">
          <AuthInput
            autoComplete="current-password"
            id="password"
            name="password"
            placeholder="Your password"
            required
            type="password"
          />
        </AuthField>

        <div className="flex justify-end">
          <Link
            className="text-xs text-ink-muted hover:text-rose hover:underline"
            href="/forgot-password"
          >
            Forgot password?
          </Link>
        </div>

        <AuthButton loading={isPending} type="submit">
          {isPending ? 'Signing in…' : 'Sign in'}
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Don&apos;t have an account?{' '}
        <Link className="font-medium text-rose hover:underline" href="/sign-up">
          Create one
        </Link>
      </p>
    </AuthCard>
  )
}
