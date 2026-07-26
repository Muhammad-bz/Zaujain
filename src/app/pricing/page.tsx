import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Pricing',
  description: 'Simple, honest pricing. One gift, one price.',
}

export default function PricingPage() {
  return (
    <main className="min-h-dvh bg-parchment">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(196,113,122,0.10) 0%, transparent 70%)',
        }}
      />

      {/* Header */}
      <header className="container-fluid flex items-center justify-between py-6">
        <Link className="flex items-center gap-2.5" href="/">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose/10 ring-1 ring-rose/20">
            <span className="font-display text-lg font-semibold italic text-rose">Z</span>
          </div>
          <span className="font-display text-xl font-medium text-ink">Zaujain</span>
        </Link>
        <Link className="text-sm text-ink-muted hover:text-ink" href="/sign-in">
          Sign in
        </Link>
      </header>

      <div className="container-fluid relative z-10 py-16">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-rose/70">
            Pricing
          </p>
          <h1 className="mb-4 font-display text-5xl font-medium text-ink">
            Simple, honest pricing.
          </h1>
          <p className="mb-16 text-base leading-relaxed text-ink-muted">
            No subscriptions. No hidden fees. Pay once, gift forever.
          </p>

          {/* Plans */}
          <div className="grid gap-6 sm:grid-cols-2">
            {/* Digital Gift */}
            <div className="card rounded-3xl p-8 text-left">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose/10">
                <span className="text-2xl">🎁</span>
              </div>
              <h2 className="mb-2 font-display text-2xl font-medium text-ink">
                Digital Gift
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-ink-muted">
                A complete personalized experience — memories, games, letters, and surprises in one beautiful gift.
              </p>
              <div className="mb-6">
                <span className="font-display text-5xl font-medium text-ink">$19</span>
                <span className="ml-2 text-sm text-muted">one-time</span>
              </div>
              <ul className="mb-8 space-y-3">
                {[
                  'Personalized gift page',
                  'Memory Vault — photos, letters, voice notes',
                  'Love Canvas — draw and deliver',
                  'Couple games (10 games)',
                  'Custom URL — zaujain.com/us/your-names',
                  '12 beautiful themes',
                  'Time Capsule',
                  'Lifetime access',
                ].map((feature) => (
                  <li className="flex items-start gap-2.5 text-sm text-ink-muted" key={feature}>
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-rose" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                className="flex w-full items-center justify-center rounded-full bg-rose px-6 py-3 text-sm font-medium text-white shadow-rose shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                href="/activate"
              >
                Get started
              </Link>
            </div>

            {/* Time Capsule */}
            <div className="card rounded-3xl p-8 text-left">
              <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold/10">
                <span className="text-2xl">⏳</span>
              </div>
              <h2 className="mb-2 font-display text-2xl font-medium text-ink">
                Time Capsule
              </h2>
              <p className="mb-6 text-sm leading-relaxed text-ink-muted">
                Lock memories today. Unlock them on a future date — an anniversary, a birthday, or whenever the time is right.
              </p>
              <div className="mb-6">
                <span className="font-display text-5xl font-medium text-ink">$12</span>
                <span className="ml-2 text-sm text-muted">one-time</span>
              </div>
              <ul className="mb-8 space-y-3">
                {[
                  'Sealed time capsule',
                  'Photos, videos, letters inside',
                  'Choose your unlock date',
                  'Beautiful unlock animation',
                  'Lifetime access',
                  'Email reminder before unlock',
                ].map((feature) => (
                  <li className="flex items-start gap-2.5 text-sm text-ink-muted" key={feature}>
                    <svg className="mt-0.5 h-4 w-4 shrink-0 text-gold" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                className="flex w-full items-center justify-center rounded-full border border-border px-6 py-3 text-sm font-medium text-ink-muted transition-all hover:border-rose/30 hover:text-rose"
                href="/activate"
              >
                Get started
              </Link>
            </div>
          </div>

          {/* FAQ teaser */}
          <p className="mt-12 text-sm text-ink-muted">
            Have questions?{' '}
            <Link className="font-medium text-rose hover:underline" href="/faq">
              Read our FAQ
            </Link>{' '}
            or{' '}
            <Link className="font-medium text-rose hover:underline" href="/contact">
              get in touch
            </Link>
            .
          </p>
        </div>
      </div>
    </main>
  )
}
