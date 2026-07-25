'use client'

import { useState, useTransition } from 'react'
import { createCapsule, deleteCapsule } from '../actions'
import { formatDate, daysUntil, hasPassed } from '@/utils/dates'

interface Capsule {
  id: string
  title: string
  message: string | null
  unlock_date: string
  status: string
  created_at: string
}

interface Props {
  experienceSlug: string
  capsules: Capsule[]
}

export function TimeCapsuleVault({ experienceSlug, capsules: initial }: Props) {
  const [capsules, setCapsules] = useState<Capsule[]>(initial)
  const [showForm, setShowForm] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)
    const formData = new FormData(event.currentTarget)
    const form = event.currentTarget

    startTransition(async () => {
      const result = await createCapsule(experienceSlug, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        form.reset()
        setShowForm(false)
        window.location.reload()
      }
    })
  }

  function handleDelete(capsuleId: string) {
    startTransition(async () => {
      await deleteCapsule(experienceSlug, capsuleId)
      setCapsules((prev) => prev.filter((c) => c.id !== capsuleId))
    })
  }

  // Min date: tomorrow
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const minDate = tomorrow.toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      {!showForm && (
        <button
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-6 text-sm font-medium text-ink-muted transition-all hover:border-rose/40 hover:text-rose"
          onClick={() => setShowForm(true)}
          type="button"
        >
          + Create a time capsule
        </button>
      )}

      {showForm && (
        <div className="card rounded-2xl p-6 space-y-5">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-medium text-ink">
              New time capsule
            </h2>
            <button
              className="text-xs text-muted hover:text-ink"
              onClick={() => setShowForm(false)}
              type="button"
            >
              Cancel
            </button>
          </div>

          {error && (
            <div className="rounded-xl border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleCreate}>
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="title">
                Title
              </label>
              <input
                className="input-base"
                id="title"
                maxLength={100}
                name="title"
                placeholder="e.g. Open on our anniversary"
                required
                type="text"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="message">
                Message <span className="font-normal text-muted">(optional)</span>
              </label>
              <textarea
                className="input-base resize-none"
                id="message"
                maxLength={2000}
                name="message"
                placeholder="Write something for them to read when this unlocks…"
                rows={5}
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="unlock_date">
                Unlock date
              </label>
              <input
                className="input-base"
                id="unlock_date"
                min={minDate}
                name="unlock_date"
                required
                type="date"
              />
              <p className="text-xs text-muted">
                The capsule will be locked until this date.
              </p>
            </div>

            <button
              className="flex w-full items-center justify-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-medium text-white shadow-rose shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? 'Sealing capsule…' : '🔒 Seal capsule'}
            </button>
          </form>
        </div>
      )}

      {capsules.length === 0 && !showForm && (
        <div className="py-16 text-center">
          <p className="font-display text-xl text-ink-muted">No capsules yet.</p>
          <p className="mt-1 text-sm text-muted">
            Your Time Capsule is quietly waiting for its special day.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {capsules.map((capsule) => {
          const unlocked = hasPassed(capsule.unlock_date)
          const days = daysUntil(capsule.unlock_date)

          return (
            <div className="card rounded-2xl p-5" key={capsule.id}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <span className="text-2xl shrink-0">{unlocked ? '🔓' : '⏳'}</span>
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-ink">{capsule.title}</p>
                    {capsule.message && !unlocked && (
                      <p className="mt-1 text-sm text-muted italic">
                        Message sealed until unlock date.
                      </p>
                    )}
                    {capsule.message && unlocked && (
                      <p className="mt-1 text-sm text-ink-muted line-clamp-3">
                        {capsule.message}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      {unlocked ? (
                        <span className="rounded-full bg-success-light px-2.5 py-0.5 text-xs font-medium text-success">
                          Unlocked
                        </span>
                      ) : (
                        <span className="rounded-full bg-warning-light px-2.5 py-0.5 text-xs font-medium text-warning">
                          {days} day{days !== 1 ? 's' : ''} remaining
                        </span>
                      )}
                      <span className="text-xs text-muted">
                        {unlocked ? 'Opened' : 'Opens'} {formatDate(capsule.unlock_date)}
                      </span>
                    </div>
                  </div>
                </div>
                <button
                  className="shrink-0 text-xs text-muted hover:text-error transition-colors"
                  onClick={() => handleDelete(capsule.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
