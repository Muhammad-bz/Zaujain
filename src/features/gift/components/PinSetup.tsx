'use client'

import { useState } from 'react'

interface Props {
  slug: string
  hasPin: boolean
}

export function PinSetup({ slug, hasPin }: Props) {
  const [pin, setPin] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (pin.length < 4) {
      setError('PIN must be at least 4 digits.')
      return
    }
    if (pin !== confirm) {
      setError("PINs don't match.")
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/gift-pin/set', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, pin }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error ?? 'Failed to set PIN.')
      } else {
        setSuccess(true)
        setPin('')
        setConfirm('')
      }
    } catch {
      setError('Something went wrong.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="card rounded-2xl p-6 space-y-5">
      <div>
        <p className="font-medium text-ink">Recipient PIN</p>
        <p className="mt-1 text-sm text-ink-muted">
          {hasPin
            ? 'Your gift has a PIN set. Update it below.'
            : 'Set a PIN so your recipient can open the gift. Share it with them privately.'}
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
          {error}
        </div>
      )}

      {success && (
        <div className="rounded-xl border border-success/20 bg-success-light px-4 py-3 text-sm text-success">
          ✓ PIN {hasPin ? 'updated' : 'set'} successfully.
        </div>
      )}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-ink" htmlFor="pin">
            {hasPin ? 'New PIN' : 'Set PIN'}
          </label>
          <input
            className="input-base font-mono text-center tracking-widest text-lg"
            id="pin"
            inputMode="numeric"
            maxLength={8}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
            pattern="[0-9]*"
            placeholder="e.g. 1234"
            required
            type="password"
            value={pin}
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-sm font-medium text-ink" htmlFor="confirm">
            Confirm PIN
          </label>
          <input
            className="input-base font-mono text-center tracking-widest text-lg"
            id="confirm"
            inputMode="numeric"
            maxLength={8}
            onChange={(e) => setConfirm(e.target.value.replace(/\D/g, ''))}
            pattern="[0-9]*"
            placeholder="Repeat PIN"
            required
            type="password"
            value={confirm}
          />
        </div>

        <button
          className="flex w-full items-center justify-center gap-2 rounded-full bg-rose px-6 py-2.5 text-sm font-medium text-white shadow-rose shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
          disabled={loading || pin.length < 4 || confirm.length < 4}
          type="submit"
        >
          {loading ? 'Saving…' : hasPin ? 'Update PIN' : 'Set PIN'}
        </button>
      </form>

      <p className="text-xs text-muted">
        Share this PIN with your recipient privately. They'll need it to open the gift.
      </p>
    </div>
  )
}
