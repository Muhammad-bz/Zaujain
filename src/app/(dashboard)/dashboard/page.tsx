import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { signOut } from '@/features/auth/actions'

export default async function DashboardPage() {
  const supabase = await createServerComponentClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/sign-in')
  }

  // Fetch profile
  const { data: profile } = await supabase
    .from('users')
    .select('name')
    .eq('id', user.id)
    .single()

  const name = profile?.name ?? user.email ?? 'there'

  return (
    <div className="min-h-dvh bg-parchment">
      <header className="border-b border-border bg-surface-raised">
        <div className="container-fluid flex h-16 items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose/10 ring-1 ring-rose/20">
              <span className="font-display text-base font-semibold italic text-rose">Z</span>
            </div>
            <span className="font-display text-lg font-medium text-ink">Zaujain</span>
          </div>
          <form action={signOut}>
            <button
              className="text-sm text-ink-muted transition-colors hover:text-ink"
              type="submit"
            >
              Sign out
            </button>
          </form>
        </div>
      </header>

      <main className="container-fluid py-16">
        <div className="mx-auto max-w-2xl text-center">
          <div className="mb-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose/10">
              <svg
                className="h-8 w-8 text-rose"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </div>

          <h1 className="mb-3 font-display text-4xl font-medium text-ink">
            Welcome, {name.split(' ')[0]}.
          </h1>
          <p className="text-base leading-relaxed text-ink-muted">
            Your dashboard is being built. The gift system, memory vault, and everything else
            is coming in the next phase.
          </p>

          <div className="mt-10 rounded-2xl border border-border bg-surface p-6 text-left">
            <p className="mb-1 text-xs font-medium uppercase tracking-widest text-muted">
              Phase 1 complete
            </p>
            <p className="text-sm text-ink-muted">
              ✓ Database connected &nbsp;·&nbsp; ✓ Authentication working &nbsp;·&nbsp; ✓ Session active
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
