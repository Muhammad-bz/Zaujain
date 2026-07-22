import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase/server'
import { publishExperience } from '@/features/gift/actions'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  return {
    title: `Preview — ${slug}`,
    robots: { index: false, follow: false },
  }
}

export default async function GiftPreviewPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerComponentClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: experience } = await supabase
    .from('experiences')
    .select(`*, theme:themes(id, name)`)
    .eq('slug', slug)
    .eq('owner_id', user.id)
    .single()

  if (!experience) notFound()

  const isPublished = experience.status === 'published'
  const giftUrl = `/us/${slug}`

  return (
    <main className="min-h-dvh bg-parchment">
      {/* Top bar */}
      <header className="sticky top-0 z-sticky border-b border-border bg-surface-raised/90 backdrop-blur-sm">
        <div className="container-fluid flex h-14 items-center justify-between">
          <Link className="text-sm text-ink-muted hover:text-ink" href={`/gift/${slug}/edit`}>
            ← Edit gift
          </Link>
          <span className="text-sm font-medium text-ink">Preview</span>
          {!isPublished ? (
            <form action={publishExperience.bind(null, slug)}>
              <button
                className="rounded-full bg-rose px-4 py-1.5 text-sm font-medium text-white shadow-rose shadow-sm hover:-translate-y-0.5 transition-all"
                type="submit"
              >
                Publish
              </button>
            </form>
          ) : (
            <span className="text-xs text-success font-medium">✓ Published</span>
          )}
        </div>
      </header>

      <div className="container-fluid py-12">
        <div className="mx-auto max-w-lg">
          {/* Gift card preview */}
          <div className="card rounded-3xl overflow-hidden">
            {/* Cover */}
            <div className="flex h-48 items-center justify-center bg-gradient-rose">
              {experience.cover_image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  alt="Gift cover"
                  className="h-full w-full object-cover"
                  src={experience.cover_image}
                />
              ) : (
                <div className="text-center">
                  <div className="mb-2 flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white/40">
                      <svg className="h-8 w-8 text-rose" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                      </svg>
                    </div>
                  </div>
                  <p className="text-xs text-rose/60">No cover image yet</p>
                </div>
              )}
            </div>

            <div className="p-6">
              <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted">
                A gift for you
              </p>
              <h2 className="font-display text-2xl font-medium text-ink">
                {experience.title}
              </h2>

              {experience.welcome_message && (
                <p className="mt-3 text-sm leading-relaxed text-ink-muted">
                  {experience.welcome_message}
                </p>
              )}

              <div className="mt-4 flex items-center gap-2">
                <span className="rounded-full bg-surface px-3 py-1 text-xs text-ink-muted">
                  {experience.theme?.name ?? 'Default'} theme
                </span>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                  isPublished
                    ? 'bg-success-light text-success'
                    : 'bg-warning-light text-warning'
                }`}>
                  {isPublished ? 'Published' : 'Draft'}
                </span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 space-y-3">
            {isPublished && (
              <>
                <Link
                  className="flex w-full items-center justify-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-medium text-white shadow-rose shadow-sm transition-all hover:-translate-y-0.5"
                  href={giftUrl}
                >
                  Open gift as recipient →
                </Link>
                <button
                  className="flex w-full items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-ink-muted transition-all hover:border-rose/30 hover:text-rose"
                  onClick={() => {
                    navigator.clipboard.writeText(
                      `${window.location.origin}${giftUrl}`
                    )
                  }}
                  type="button"
                >
                  Copy link
                </button>
              </>
            )}
            <Link
              className="flex w-full items-center justify-center rounded-full border border-border px-6 py-3 text-sm text-ink-muted transition-all hover:border-rose/30 hover:text-rose"
              href={`/gift/${slug}/edit`}
            >
              Continue editing
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
