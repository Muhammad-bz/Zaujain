import type { Metadata } from 'next'
import { redirect, notFound } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { GiftEditor } from '@/features/gift/components/GiftEditor'

export const metadata: Metadata = {
  title: 'Edit your gift',
  robots: { index: false, follow: false },
}

interface Props {
  params: Promise<{ slug: string }>
}

export default async function GiftEditPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerComponentClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: experience } = await supabase
    .from('experiences')
    .select(`*, theme:themes(id, name, configuration_json)`)
    .eq('slug', slug)
    .eq('owner_id', user.id)
    .single()

  if (!experience) notFound()

  // Fetch available themes
  const { data: themes } = await supabase
    .from('themes')
    .select('id, name, category, preview_image')
    .eq('active', true)
    .order('name')

  return (
    <main className="min-h-dvh bg-parchment">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(196,113,122,0.07) 0%, transparent 70%)',
        }}
      />

      {/* Top bar */}
      <header className="sticky top-0 z-sticky border-b border-border bg-surface-raised/90 backdrop-blur-sm">
        <div className="container-fluid flex h-14 items-center justify-between">
          <div className="flex items-center gap-3">
            <a className="text-sm text-ink-muted hover:text-ink" href="/dashboard">
              ← Dashboard
            </a>
            <span className="text-border">/</span>
            <span className="text-sm font-medium text-ink truncate max-w-[140px]">
              {experience.title}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <a
              className="text-sm text-ink-muted hover:text-ink"
              href={`/gift/${slug}/preview`}
            >
              Preview
            </a>
            <a
              className="rounded-full bg-rose px-4 py-1.5 text-sm font-medium text-white shadow-rose shadow-sm hover:-translate-y-0.5 transition-all duration-200"
              href={`/gift/${slug}/preview`}
            >
              Publish
            </a>
          </div>
        </div>
      </header>

      <div className="container-fluid relative z-10 py-10">
        <GiftEditor
          experience={experience}
          themes={themes ?? []}
        />
      </div>
    </main>
  )
}
