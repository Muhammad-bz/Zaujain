import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { cookies } from 'next/headers'
import { createHash } from 'crypto'
import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase/server'
import { formatDate, daysUntil, hasPassed } from '@/utils/dates'
import { MemoryCard } from '@/features/memory-vault/components/MemoryCard'
import { PinEntry } from '@/features/gift/components/PinEntry'

interface Props {
  params: Promise<{ slug: string }>
}

function hashPin(pin: string, slug: string): string {
  return createHash('sha256').update(`${pin}-${slug}-zaujain`).digest('hex')
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

  // Check if creator is viewing (skip PIN)
  const { data: { user } } = await supabase.auth.getUser()
  const isOwner = user?.id === experience.owner_id

  // Check PIN cookie
  const cookieStore = await cookies()
  const pinCookie = cookieStore.get(`gift_pin_${slug}`)
  const pinVerified = pinCookie?.value === experience.pin_hash

  // Show PIN entry if gift has a PIN and user is not owner and not verified
  if (experience.pin_hash && !isOwner && !pinVerified) {
    return (
      <PinEntry
        giftTitle={experience.title}
        ownerName={owner?.name ?? 'someone special'}
        slug={slug}
      />
    )
  }

  // Fetch all content
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

  return (
    <main className="min-h-dvh bg-parchment">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 60% at 50% -20%, rgba(196,113,122,0.15) 0%, transparent 70%)',
        }}
      />

      <div className="container-fluid relative z-10 py-16">
        <div className="mx-auto max-w-lg">

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

          {experience.welcome_message && (
            <div className="mb-8 rounded-2xl border border-border bg-surface-raised p-6 text-center shadow-card">
              <p className="font-display text-lg leading-relaxed text-ink-muted italic">
                &ldquo;{experience.welcome_message}&rdquo;
              </p>
            </div>
          )}

          {memories && memories.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 font-display text-2xl font-medium text-ink">Memories</h2>
              <div className="space-y-3">
                {memories.map((memory) => (
                  <MemoryCard key={memory.id} memory={memory} />
                ))}
              </div>
            </section>
          )}

          {drawings && drawings.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 font-display text-2xl font-medium text-ink">Love Canvas</h2>
              <div className="space-y-4">
                {drawings.map((drawing) => (
                  <div className="card rounded-2xl overflow-hidden" key={drawing.id}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img alt="Drawing" className="w-full border-b border-border" src={drawing.cloudinary_url} />
                    {drawing.note && (
                      <div className="p-4">
                        <p className="text-sm text-ink-muted italic">&ldquo;{drawing.note}&rdquo;</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </section>
          )}

          {capsules && capsules.length > 0 && (
            <section className="mb-8">
              <h2 className="mb-4 font-display text-2xl font-medium text-ink">Time Capsules</h2>
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
                            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{capsule.message}</p>
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

          {(!memories || memories.length === 0) &&
           (!drawings || drawings.length === 0) &&
           (!capsules || capsules.length === 0) && (
            <div className="py-12 text-center">
              <p className="font-display text-xl text-ink-muted">Your gift is being prepared.</p>
              <p className="mt-1 text-sm text-muted">Check back soon — something beautiful is on its way.</p>
            </div>
          )}

          <div className="mt-12 text-center">
            <p className="text-xs text-muted">
              Made with <span className="text-rose">♥</span>{' '}using{' '}
              <Link className="hover:underline" href="/">Zaujain</Link>
            </p>
          </div>

        </div>
      </div>
    </main>
  )
}
