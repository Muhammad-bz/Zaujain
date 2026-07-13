'use client'

import { useState, useTransition } from 'react'
import { resetPassword } from '../actions'
import {
  AuthCard,
  AuthHeader,
  AuthField,
  AuthInput,
  AuthButton,
  AuthError,
} from './AuthCard'

export function ResetPasswordForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    setFieldErrors({})

    const formData = new FormData(event.currentTarget)

    if (formData.get('password') !== formData.get('confirmPassword')) {
      setFieldErrors({ confirmPassword: "Passwords don't match" })
      return
    }

    startTransition(async () => {
      const result = await resetPassword(formData)
      if (result?.error) {
        setError(result.error)
      }
    })
  }

  return (
    <AuthCard>
      <AuthHeader
        subtitle="Choose a strong password for your Zaujain account."
        title="Choose a new password"
      />

      <form className="space-y-5" noValidate onSubmit={handleSubmit}>
        {error && <AuthError message={error} />}

        <AuthField error={fieldErrors.password} id="password" label="New password">
          <AuthInput
            autoComplete="new-password"
            autoFocus
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
          label="Confirm new password"
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
          {isPending ? 'Saving…' : 'Save new password'}
        </AuthButton>
      </form>
    </AuthCard>
  )
}
