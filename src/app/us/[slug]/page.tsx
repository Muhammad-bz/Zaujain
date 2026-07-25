import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase/server'
import { formatDate, daysUntil, hasPassed } from '@/utils/dates'

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

  const { data: experience } = await supabase
    .from('experiences')
    .select('*, theme:themes(id, name)')
    .eq('slug', slug)
    .eq('status', 'published')
    .single()

  if (!experience) notFound()

  const { data: owner } = await supabase
    .from('users')
    .select('name')
    .eq('id', experience.owner_id)
    .single()

  const { data: memories } = await supabase
    .from('memories')
    .select('*')
    .eq('experience_id', experience.id)
    .order('created_at', { ascending: false })

  const { data: capsules } = await supabase
    .from('time_capsules')
    .select('*')
    .eq('experience_id', experience.id)
    .order('unlock_date', { ascending: true })

  const { data: drawings } = await supabase
    .from('drawings')
    .select('*')
    .eq('experience_id', experience.id)
    .order('created_at', { ascending: false })

  const MEMORY_ICONS: Record<string, string> = {
    photo: '📸', letter: '💌', video: '🎥',
    voice_note: '🎙️', drawing: '🎨', wallpaper: '🖼️',
  }

  return (
    <main className="min-h-dvh bg-parchment">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background: `radial-gradient(ellipse 80% 60% at 50% -20%, rgba(196,113,122,0.15) 0%, transparent 70%)`,
        }}
      />

      <div className="container-fluid relative z-10 py-16">
        <div className="mx-auto max-w-lg">

          {/* Wax seal header */}
          <div className="mb-8 flex flex-col items-center text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-rose shadow-rose shadow-lg ring-4 ring-rose/20">
              <span className="font-display text-3xl font-semibold italic text-white/90">Z</span>
            </div>
            <p className="mb-2 text-sm font-medium uppercase tracking-widest text-muted">
              A gift from {owner?.name ?? 'someone special'}
            </p>
            <h1 className="font-display text-4xl font-medium leading-tight text-ink sm:text-5xl">
              {experience.title}
            </h1>
          </div>

          {/* Welcome message */}
          {experience.welcome_message && (
            <div className="mb-8 rounded-2xl border border-border bg-surface-raised p-6 text-center shadow-card">
              <p className="font-display text-lg leading-relaxed text-ink-muted italic">
                &ldquo;{experience.welcome_message}&rdquo;
              </p>
            </div>
          )}

          {/* Memories */}
          {memories && memories.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 font-display text-2xl font-medium text-ink">
                Memories
              </h2>
              <div className="space-y-3">
                {memories.map((memory) => (
                  <div className="card rounded-2xl p-5" key={memory.id}>
                    <div className="flex items-start gap-3">
                      <span className="text-2xl shrink-0">
                        {MEMORY_ICONS[memory.type] ?? '📝'}
                      </span>
                      <div className="flex-1 min-w-0">
                        {memory.title && (
                          <p className="font-medium text-ink">{memory.title}</p>
                        )}
                        {memory.description && (
                          <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                            {memory.description}
                          </p>
                        )}
                        {memory.media_url && memory.type === 'photo' && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            alt={memory.title ?? 'Memory'}
                            className="mt-3 w-full rounded-xl border border-border object-cover"
                            src={memory.media_url}
                            style={{ maxHeight: 300 }}
                          />
                        )}
                        {memory.media_url && memory.type !== 'photo' && (
                          <a
                            className="mt-2 block text-xs text-rose hover:underline"
                            href={memory.media_url}
                            rel="noreferrer"
                            target="_blank"
                          >
                            View media →
                          </a>
                        )}
                        <p className="mt-2 text-xs text-muted capitalize">
                          {memory.type.replace('_', ' ')} · {formatDate(memory.created_at)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Love Canvas drawings */}
          {drawings && drawings.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 font-display text-2xl font-medium text-ink">
                Love Canvas
              </h2>
              <div className="space-y-4">
                {drawings.map((drawing) => (
                  <div className="card rounded-2xl overflow-hidden" key={drawing.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      alt="Drawing"
                      className="w-full border-b border-border"
                      src={drawing.cloudinary_url}
                    />
                    {drawing.note && (
                      <div className="p-4">
                        <p className="text-sm text-ink-muted italic">
                          &ldquo;{drawing.note}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Time Capsules */}
          {capsules && capsules.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 font-display text-2xl font-medium text-ink">
                Time Capsules
              </h2>
              <div className="space-y-3">
                {capsules.map((capsule) => {
                  const unlocked = hasPassed(capsule.unlock_date)
                  const days = daysUntil(capsule.unlock_date)
                  return (
                    <div className="card rounded-2xl p-5" key={capsule.id}>
                      <div className="flex items-start gap-3">
                        <span className="text-2xl shrink-0">{unlocked ? '🔓' : '⏳'}</span>
                        <div className="flex-1">
                          <p className="font-medium text-ink">{capsule.title}</p>
                          {unlocked && capsule.message && (
                            <p className="mt-2 text-sm leading-relaxed text-ink-muted">
                              {capsule.message}
                            </p>
                          )}
                          {!unlocked && (
                            <p className="mt-1 text-sm text-muted italic">
                              Opens in {days} day{days !== 1 ? 's' : ''} · {formatDate(capsule.unlock_date)}
                            </p>
                          )}
                          {unlocked && (
                            <span className="mt-2 inline-block rounded-full bg-success-light px-2.5 py-0.5 text-xs font-medium text-success">
                              Unlocked ✓
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Empty state */}
          {(!memories || memories.length === 0) &&
           (!drawings || drawings.length === 0) &&
           (!capsules || capsules.length === 0) && (
            <div className="py-12 text-center">
              <p className="font-display text-xl text-ink-muted">
                Your gift is being prepared.
              </p>
              <p className="mt-1 text-sm text-muted">
                Check back soon — something beautiful is on its way.
              </p>
            </div>
          )}

          {/* Footer */}
          <div className="mt-12 text-center">
            <p className="text-xs text-muted">
              Made with{' '}
              <span className="text-rose">♥</span>
              {' '}using{' '}
              <Link className="hover:underline" href="/">Zaujain</Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}
