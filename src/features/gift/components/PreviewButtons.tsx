'use client'

import { useTransition } from 'react'
import { publishExperience } from '../actions'

export function PublishButton({ slug }: { slug: string }) {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      className="rounded-full bg-rose px-4 py-1.5 text-sm font-medium text-white shadow-rose shadow-sm hover:-translate-y-0.5 transition-all disabled:opacity-60"
      disabled={isPending}
      onClick={() => startTransition(async () => { await publishExperience(slug) })}
      type="button"
    >
      {isPending ? 'Publishing…' : 'Publish'}
    </button>
  )
}

export function CopyLinkButton({ slug }: { slug: string }) {
  return (
    <button
      className="flex w-full items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-ink-muted transition-all hover:border-rose/30 hover:text-rose"
      onClick={() => navigator.clipboard.writeText(`${window.location.origin}/us/${slug}`)}
      type="button"
    >
      Copy link
    </button>
  )
}
