'use client'

import { useState, useTransition } from 'react'
import { createExperience } from '../actions'

interface Props {
  activationKeyId: string
  experienceType: string
}

export function GiftSetupForm({ activationKeyId, experienceType }: Props) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    formData.set('activationKeyId', activationKeyId)
    formData.set('experienceType', experienceType)

    startTransition(async () => {
      const result = await createExperience(formData)
      if (result?.error) setError(result.error)
      // On success, createExperience redirects — nothing to do here
    })
  }

  return (
    <form
      className="mx-auto max-w-lg space-y-6"
      onSubmit={handleSubmit}
    >
      {error && (
        <div
          className="rounded-xl border border-error/20 bg-error-light px-4 py-3 text-sm text-error"
          role="alert"
        >
          {error}
        </div>
      )}

      {/* Gift title */}
      <div className="card rounded-2xl p-6 space-y-4">
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-ink" htmlFor="title">
            Gift title
          </label>
          <input
            autoFocus
            className="input-base"
            id="title"
            maxLength={80}
            name="title"
            placeholder="e.g. A Gift for Ayesha"
            required
            type="text"
          />
          <p className="text-xs text-muted">This will be shown on the gift page.</p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-ink" htmlFor="recipientName">
            Recipient&apos;s name
          </label>
          <input
            className="input-base"
            id="recipientName"
            maxLength={50}
            name="recipientName"
            placeholder="e.g. Ayesha"
            required
            type="text"
          />
        </div>
      </div>

      {/* Welcome message */}
      <div className="card rounded-2xl p-6 space-y-1.5">
        <label className="block text-sm font-medium text-ink" htmlFor="welcomeMessage">
          Welcome message{' '}
          <span className="font-normal text-muted">(optional)</span>
        </label>
        <textarea
          className="input-base resize-none"
          id="welcomeMessage"
          maxLength={500}
          name="welcomeMessage"
          placeholder="Write something to greet them when they open your gift…"
          rows={4}
        />
        <p className="text-xs text-muted">Max 500 characters.</p>
      </div>

      <button
        className="flex w-full items-center justify-center gap-2 rounded-full bg-rose px-6 py-3.5 font-sans text-sm font-medium text-white shadow-rose shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending}
        type="submit"
      >
        {isPending ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
            </svg>
            Creating your gift…
          </>
        ) : (
          <>
            Continue
            <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </>
        )}
      </button>
    </form>
  )
}
