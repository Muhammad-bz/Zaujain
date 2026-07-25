import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase/server'
import { getDrawings } from '@/features/love-canvas/actions'
import { LoveCanvas } from '@/features/love-canvas/components/LoveCanvas'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CanvasPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: experience } = await supabase
    .from('experiences')
    .select('id, title')
    .eq('slug', slug)
    .eq('owner_id', user.id)
    .single()

  if (!experience) notFound()

  const drawings = await getDrawings(slug)

  return (
    <main className="min-h-dvh bg-parchment">
      <header className="sticky top-0 z-50 border-b border-border bg-surface-raised/90 backdrop-blur-sm">
        <div className="container-fluid flex h-14 items-center justify-between">
          <Link className="text-sm text-ink-muted hover:text-ink" href={`/gift/${slug}/edit`}>
            ← Back to gift
          </Link>
          <span className="font-medium text-ink text-sm">Love Canvas</span>
          <span className="text-xs text-muted">{drawings.length} drawings</span>
        </div>
      </header>

      <div className="container-fluid py-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-medium text-ink">
              Love Canvas
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Draw something from the heart and deliver it inside a beautiful envelope.
            </p>
          </div>
          <LoveCanvas drawings={drawings} experienceSlug={slug} />
        </div>
      </div>
    </main>
  )
}
