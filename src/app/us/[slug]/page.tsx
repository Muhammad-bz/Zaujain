import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createServerComponentClient()

  const { data } = await supabase
    .from('experiences')
    .select('title, welcome_message')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!data) return { title: 'Gift not found' }

  return {
    title: data.title,
    description: data.welcome_message ?? 'A personalised gift made for you.',
    robots: { index: false, follow: false },
  }
}

export default async function RecipientExperiencePage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerComponentClient()

  // Use the RPC for access control
  const { data: accessResult } = await supabase
    .rpc('get_experience_by_slug', { p_slug: slug })

  if (!accessResult?.success) {
    if (accessResult?.error === 'Experience not found.') notFound()
    // Private gift — show a lock screen
    return <LockedGift message={accessResult?.error} />
  }

  // Fetch full experience data
  const { data: experience } = await supabase
    .from('experiences')
    .select(`
      *,
      theme:themes(id, name, configuration_json)
    `)
    .eq('slug', slug)
    .single()

  if (!experience || experience.status !== 'published') notFound()

  // Fetch owner profile
  const { data: owner } = await supabase
    .from('users')
    .select('name, avatar_url')
    .eq('id', experience.owner_id)
    .single()

  return (
    <main className="min-h-dvh bg-parchment">
      {/* Ambient background */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background: `
            radial-gradient(ellipse 80% 60% at 50% -20%, rgba(196,113,122,0.15) 0%, transparent 70%),
            radial-gradient(ellipse 50% 40% at 80% 80%, rgba(184,147,90,0.08) 0%, transparent 60%)
          `,
        }}
      />

      <div className="container-fluid relative z-10 flex min-h-dvh flex-col items-center justify-center py-16">
        {/* Wax seal */}
        <div className="mb-8 flex justify-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-rose shadow-rose shadow-lg ring-4 ring-rose/20">
            <span className="font-display text-3xl font-semibold italic text-white/90">Z</span>
          </div>
        </div>

        {/* From */}
        <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted">
          A gift from {owner?.name ?? 'someone special'}
        </p>

        {/* Title */}
        <h1 className="mb-6 text-center font-display text-5xl font-medium leading-tight text-ink sm:text-6xl">
          {experience.title}
        </h1>

        {/* Welcome message */}
        {experience.welcome_message && (
          <div className="mb-10 max-w-md rounded-2xl border border-border bg-surface-raised p-6 text-center shadow-card">
            <p className="font-display text-lg leading-relaxed text-ink-muted italic">
              &ldquo;{experience.welcome_message}&rdquo;
            </p>
          </div>
        )}

        {/* Gift contents teaser */}
        <div className="mb-10 grid w-full max-w-sm gap-3">
          {[
            { icon: '💌', label: 'Love letter' },
            { icon: '🎮', label: 'Couple games' },
            { icon: '📸', label: 'Memory vault' },
            { icon: '⏳', label: 'Time capsule' },
          ].map((item) => (
            <div
              className="flex items-center gap-3 rounded-xl border border-border bg-surface-raised px-4 py-3"
              key={item.label}
            >
              <span className="text-xl">{item.icon}</span>
              <span className="text-sm font-medium text-ink">{item.label}</span>
              <span className="ml-auto text-xs text-muted">Coming soon</span>
            </div>
          ))}
        </div>

        {/* Theme badge */}
        {experience.theme && (
          <p className="text-xs text-muted">
            {experience.theme.name} theme
          </p>
        )}
      </div>
    </main>
  )
}

function LockedGift({ message }: { message?: string }) {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-parchment px-4">
      <div className="text-center">
        <div className="mb-4 flex justify-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-surface ring-1 ring-border">
            <svg className="h-8 w-8 text-muted" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24">
              <rect height="11" rx="1" width="18" x="3" y="11" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
          </div>
        </div>
        <h1 className="font-display text-2xl font-medium text-ink">This gift is private</h1>
        <p className="mt-2 text-sm text-ink-muted">
          {message ?? 'You need permission to view this gift.'}
        </p>
        <a
          className="mt-6 inline-block rounded-full border border-border px-5 py-2 text-sm text-ink-muted hover:border-rose/30 hover:text-rose transition-colors"
          href="/sign-in"
        >
          Sign in
        </a>
      </div>
    </main>
  )
}
