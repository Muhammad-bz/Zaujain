'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { forgotPassword } from '../actions'
import {
  AuthCard,
  AuthHeader,
  AuthField,
  AuthInput,
  AuthButton,
  AuthError,
  AuthSuccess,
} from './AuthCard'

export function ForgotPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setSuccess(null)
    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await forgotPassword(formData)
      if (result.error) {
        setError(result.error)
      } else if (result.success && result.message) {
        setSuccess(result.message)
      }
    })
  }

  return (
    <AuthCard>
      <AuthHeader
        subtitle="Enter your email and we'll send you a link to reset your password."
        title="Reset your password"
      />

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        {error && <AuthError message={error} />}
        {success && <AuthSuccess message={success} />}

        <AuthField id="email" label="Email address">
          <AuthInput
            autoComplete="email"
            autoFocus
            disabled={!!success}
            id="email"
            inputMode="email"
            name="email"
            placeholder="you@example.com"
            required
            type="email"
          />
        </AuthField>

        <AuthButton disabled={!!success} loading={isPending} type="submit">
          {isPending ? 'Sending link…' : 'Send reset link'}
        </AuthButton>
      </form>

      <p className="mt-6 text-center text-sm text-ink-muted">
        Remembered it?{' '}
        <Link className="font-medium text-rose hover:underline" href="/sign-in">
          Back to sign in
        </Link>
      </p>
    </AuthCard>
  )
}
