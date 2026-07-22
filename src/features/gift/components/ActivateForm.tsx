'use client'

import { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { redeemActivationKey } from '../actions'

export function ActivateForm() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [keyValue, setKeyValue] = useState('')
  const router = useRouter()

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    startTransition(async () => {
      const result = await redeemActivationKey(formData)
      if (result.error) {
        setError(result.error)
        return
      }
      if (result.success && result.keyId) {
        // Key redeemed — go to gift creation wizard
        router.push(`/gift/new?keyId=${result.keyId}&type=${result.productType}`)
      }
    })
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      {error && (
        <div
          className="rounded-xl border border-error/20 bg-error-light px-4 py-3 text-sm text-error"
          role="alert"
        >
          {error}
        </div>
      )}

      <div className="space-y-2">
        <label className="block text-sm font-medium text-ink" htmlFor="key">
          Activation key
        </label>
        <input
          autoCapitalize="characters"
          autoComplete="off"
          autoCorrect="off"
          className="input-base font-mono text-center text-base tracking-widest uppercase"
          id="key"
          maxLength={32}
          name="key"
          onChange={(e) => setKeyValue(e.target.value.toUpperCase())}
          placeholder="XXXX-XXXX-XXXX-XXXX"
          required
          spellCheck={false}
          type="text"
          value={keyValue}
        />
        <p className="text-xs text-muted">
          Your key was included with your purchase.
        </p>
      </div>

      <button
        className="flex w-full items-center justify-center gap-2 rounded-full bg-rose px-6 py-3.5 font-sans text-sm font-medium text-white shadow-rose shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={isPending || keyValue.length < 4}
        type="submit"
      >
        {isPending ? (
          <>
            <svg className="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" fill="currentColor" />
            </svg>
            Unlocking…
          </>
        ) : (
          'Open my gift'
        )}
      </button>

      <p className="text-center text-sm text-ink-muted">
        Want to create a gift?{' '}
        <a className="font-medium text-rose hover:underline" href="/sign-up">
          Get started
        </a>
      </p>
    </form>
  )
}
