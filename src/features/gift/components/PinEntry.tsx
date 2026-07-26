'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface Props {
  slug: string
  giftTitle: string
  ownerName: string
}

export function PinEntry({ slug, giftTitle, ownerName }: Props) {
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (pin.length < 4) return
    setError(null)
    setLoading(true)

    try {
      const res = await fetch('/api/gift-pin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, pin }),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Incorrect PIN. Please try again.')
      } else {
        router.refresh()
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-dvh bg-parchment">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(196,113,122,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="container-fluid relative z-10 flex min-h-dvh flex-col items-center justify-center py-16">
        <div className="w-full max-w-sm">
          {/* Wax seal */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose shadow-rose shadow-lg ring-4 ring-rose/20">
              <span className="font-display text-3xl font-semibold italic text-white/90">Z</span>
            </div>
          </div>

          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted">
              A gift from {ownerName}
            </p>
            <h1 className="font-display text-3xl font-medium text-ink">
              {giftTitle}
            </h1>
            <p className="mt-3 text-sm text-ink-muted">
              Enter the PIN to open your gift.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="rounded-xl border border-error/20 bg-error-light px-4 py-3 text-center text-sm text-error">
                {error}
              </div>
            )}

            <input
              autoFocus
              className="input-base text-center text-2xl font-mono tracking-widest"
              inputMode="numeric"
              maxLength={8}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
              pattern="[0-9]*"
              placeholder="••••"
              required
              type="password"
              value={pin}
            />

            <button
              className="flex w-full items-center justify-center gap-2 rounded-full bg-rose px-6 py-3.5 text-sm font-medium text-white shadow-rose shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
              disabled={loading || pin.length < 4}
              type="submit"
            >
              {loading ? (
                <>
                  <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
                  </svg>
                  Opening…
                </>
              ) : (
                'Open my gift'
              )}
            </button>
          </form>
        </div>
      </div>
    </main>
  )
}
