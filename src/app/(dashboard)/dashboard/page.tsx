import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createServerComponentClient } from '@/lib/supabase/server'
import { signOut } from '@/features/auth/actions'
import { getMyExperiences } from '@/features/gift/actions'
import { formatDateShort } from '@/utils/dates'

export default async function DashboardPage() {
  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  const experiences = await getMyExperiences()
  const firstName = profile?.name?.split(' ')[0] ?? 'there'

  return (
    <div className="min-h-dvh bg-parchment">
      {/* Header */}
      <header className="border-b border-border bg-surface-raised">
        <div className="container-fluid flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose/10 ring-1 ring-rose/20">
              <span className="font-display text-base font-semibold italic text-rose">Z</span>
            </div>
            <span className="font-display text-lg font-medium text-ink">Zaujain</span>
          </div>
          <form action={signOut}>
            <button className="text-sm text-ink-muted transition-colors hover:text-ink" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="container-fluid py-12">
        {/* Greeting */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-medium text-ink">
            Hello, {firstName}.
          </h1>
          <p className="mt-1 text-sm text-ink-muted">
            {experiences.length === 0
              ? 'Ready to create your first gift?'
              : `You have ${experiences.length} gift${experiences.length > 1 ? 's' : ''}.`}
          </p>
        </div>

        {/* Gift list */}
        {experiences.length > 0 && (
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {experiences.map((exp: {
              id: string
              slug: string
              title: string
              status: string
              experience_type: string
              cover_image: string | null
              created_at: string
              theme?: { name: string } | null
            }) => (
              <Link
                className="card group rounded-2xl overflow-hidden block"
                href={`/gift/${exp.slug}/edit`}
                key={exp.id}
              >
                {/* Cover placeholder */}
                <div className="h-32 bg-gradient-rose flex items-center justify-center">
                  {exp.cover_image ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img alt="" className="h-full w-full object-cover" src={exp.cover_image} />
                  ) : (
                    <svg className="h-8 w-8 text-rose/40" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                    </svg>
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium text-ink truncate">{exp.title}</p>
                  <div className="mt-1.5 flex items-center gap-2">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      exp.status === 'published'
                        ? 'bg-success-light text-success'
                        : 'bg-warning-light text-warning'
                    }`}>
                      {exp.status === 'published' ? 'Published' : 'Draft'}
                    </span>
                    <span className="text-xs text-muted">{formatDateShort(exp.created_at)}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link
          className="inline-flex items-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-medium text-white shadow-rose shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
          href="/activate"
        >
          + Create new gift
        </Link>
      </main>
    </div>
  )
}
