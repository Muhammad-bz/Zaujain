'use client'

import { useState, useTransition } from 'react'
import { updateExperience, publishExperience } from '../actions'
import { cn } from '@/utils/cn'

interface Theme {
  id: string
  name: string
  category: string
  preview_image: string | null
}

interface Experience {
  slug: string
  title: string
  welcome_message: string | null
  cover_image: string | null
  theme_id: string | null
  status: string
  theme?: { id: string; name: string } | null
}

interface Props {
  experience: Experience
  themes: Theme[]
}

type Section = 'details' | 'theme' | 'share'

export function GiftEditor({ experience, themes }: Props) {
  const [activeSection, setActiveSection] = useState<Section>('details')
  const [isPending, startTransition] = useTransition()
  const [isPublishing, startPublishing] = useTransition()
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedThemeId, setSelectedThemeId] = useState(
    experience.theme_id ?? ''
  )

  function handleSave(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSaved(false)
    setError(null)
    const formData = new FormData(event.currentTarget)
    if (selectedThemeId) formData.set('themeId', selectedThemeId)

    startTransition(async () => {
      const result = await updateExperience(experience.slug, formData)
      if (result?.error) {
        setError(result.error)
      } else {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    })
  }

  function handlePublish() {
    startPublishing(async () => {
      await publishExperience(experience.slug)
    })
  }

  const tabs: { id: Section; label: string }[] = [
    { id: 'details', label: 'Details' },
    { id: 'theme', label: 'Theme' },
    { id: 'share', label: 'Share' },
  ]

  return (
    <div className="mx-auto max-w-2xl">
      {/* Tabs */}
      <div className="mb-8 flex gap-1 rounded-xl bg-surface p-1">
        {tabs.map((tab) => (
          <button
            className={cn(
              'flex-1 rounded-lg py-2 text-sm font-medium transition-all duration-150',
              activeSection === tab.id
                ? 'bg-surface-raised text-ink shadow-sm'
                : 'text-ink-muted hover:text-ink'
            )}
            key={tab.id}
            onClick={() => setActiveSection(tab.id)}
            type="button"
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Details section */}
      {activeSection === 'details' && (
        <form className="space-y-5" onSubmit={handleSave}>
          {error && (
            <div className="rounded-xl border border-error/20 bg-error-light px-4 py-3 text-sm text-error">
              {error}
            </div>
          )}

          <div className="card rounded-2xl p-6 space-y-5">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="title">
                Gift title
              </label>
              <input
                className="input-base"
                defaultValue={experience.title}
                id="title"
                maxLength={80}
                name="title"
                required
                type="text"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-ink" htmlFor="welcomeMessage">
                Welcome message
              </label>
              <textarea
                className="input-base resize-none"
                defaultValue={experience.welcome_message ?? ''}
                id="welcomeMessage"
                maxLength={500}
                name="welcomeMessage"
                placeholder="Write something warm for when they open your gift…"
                rows={5}
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              className="flex items-center gap-2 rounded-full bg-rose px-6 py-2.5 text-sm font-medium text-white shadow-rose shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md disabled:opacity-60"
              disabled={isPending}
              type="submit"
            >
              {isPending ? 'Saving…' : saved ? '✓ Saved' : 'Save changes'}
            </button>
          </div>
        </form>
      )}

      {/* Theme section */}
      {activeSection === 'theme' && (
        <div className="space-y-5">
          <p className="text-sm text-ink-muted">
            Choose a theme for your gift. This affects colours, animations, and the overall mood.
          </p>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {themes.map((theme) => (
              <button
                className={cn(
                  'rounded-2xl border-2 p-4 text-left transition-all duration-150',
                  selectedThemeId === theme.id
                    ? 'border-rose bg-rose-light'
                    : 'border-border bg-surface-raised hover:border-rose/40'
                )}
                key={theme.id}
                onClick={() => setSelectedThemeId(theme.id)}
                type="button"
              >
                {/* Theme preview swatch */}
                <div className="mb-3 h-16 w-full rounded-xl bg-gradient-to-br from-surface to-parchment-deep" />
                <p className="text-sm font-medium text-ink">{theme.name}</p>
                <p className="text-xs text-muted capitalize">{theme.category}</p>
              </button>
            ))}
          </div>

          {selectedThemeId && selectedThemeId !== experience.theme_id && (
            <button
              className="rounded-full bg-rose px-6 py-2.5 text-sm font-medium text-white shadow-rose shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
              disabled={isPending}
              onClick={() => {
                startTransition(async () => {
                  const fd = new FormData()
                  fd.set('themeId', selectedThemeId)
                  const result = await updateExperience(experience.slug, fd)
                  if (result?.error) setError(result.error)
                  else setSaved(true)
                })
              }}
              type="button"
            >
              {isPending ? 'Applying…' : 'Apply theme'}
            </button>
          )}
        </div>
      )}

      {/* Share section */}
      {activeSection === 'share' && (
        <div className="space-y-6">
          <div className="card rounded-2xl p-6 space-y-3">
            <p className="text-sm font-medium text-ink">Your gift link</p>
            <div className="flex items-center gap-2">
              <code className="flex-1 rounded-lg bg-surface px-3 py-2 text-xs text-ink-muted break-all">
                {typeof window !== 'undefined' ? window.location.origin : ''}/us/{experience.slug}
              </code>
              <button
                className="shrink-0 rounded-lg border border-border px-3 py-2 text-xs text-ink-muted hover:border-rose/30 hover:text-rose transition-colors"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `${window.location.origin}/us/${experience.slug}`
                  )
                }}
                type="button"
              >
                Copy
              </button>
            </div>
            <p className="text-xs text-muted">
              Share this link with {experience.status === 'published' ? 'them when you\'re ready.' : 'them after you publish.'}
            </p>
          </div>

          {experience.status !== 'published' && (
            <div className="card rounded-2xl p-6 space-y-4">
              <div>
                <p className="text-sm font-medium text-ink">Ready to share?</p>
                <p className="mt-1 text-sm text-ink-muted">
                  Publishing makes your gift accessible to the recipient via the link above.
                </p>
              </div>
              <button
                className="flex w-full items-center justify-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-medium text-white shadow-rose shadow-sm transition-all hover:-translate-y-0.5 disabled:opacity-60"
                disabled={isPublishing}
                onClick={handlePublish}
                type="button"
              >
                {isPublishing ? 'Publishing…' : '🎁 Publish gift'}
              </button>
            </div>
          )}

          {experience.status === 'published' && (
            <div className="rounded-xl border border-success/20 bg-success-light px-4 py-3 text-sm text-success">
              ✓ Your gift is published and ready to share.
            </div>
          )}
        </div>
      )}
    </div>
  )
}
