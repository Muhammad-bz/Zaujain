import { redirect, notFound } from 'next/navigation'
import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase/server'
import { getCapsules } from '@/features/time-capsule/actions'
import { TimeCapsuleVault } from '@/features/time-capsule/components/TimeCapsuleVault'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function CapsulePage({ params }: Props) {
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

  const capsules = await getCapsules(slug)

  return (
    <main className="min-h-dvh bg-parchment">
      <header className="sticky top-0 z-50 border-b border-border bg-surface-raised/90 backdrop-blur-sm">
        <div className="container-fluid flex h-14 items-center justify-between">
          <Link className="text-sm text-ink-muted hover:text-ink" href={`/gift/${slug}/edit`}>
            ← Back to gift
          </Link>
          <span className="font-medium text-ink text-sm">Time Capsule</span>
          <span className="text-xs text-muted">{capsules.length} capsules</span>
        </div>
      </header>

      <div className="container-fluid py-10">
        <div className="mx-auto max-w-2xl">
          <div className="mb-8">
            <h1 className="font-display text-3xl font-medium text-ink">
              Time Capsule
            </h1>
            <p className="mt-1 text-sm text-ink-muted">
              Lock memories today. Open them when the time is right.
            </p>
          </div>
          <TimeCapsuleVault capsules={capsules} experienceSlug={slug} />
        </div>
      </div>
    </main>
  )
}
