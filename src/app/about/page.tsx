import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description: 'Zaujain exists to help people turn love into something beautiful and lasting.',
}

export default function AboutPage() {
  return (
    <main className="min-h-dvh bg-parchment">
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
        <div className="mx-auto max-w-2xl">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-rose/70">
            About
          </p>
          <h1 className="mb-8 font-display text-5xl font-medium text-ink">
            Made with care,<br />
            <span className="italic text-rose">for the people you love.</span>
          </h1>

          <div className="space-y-6 text-base leading-relaxed text-ink-muted">
            <p>
              Zaujain was born from a simple belief — that the most meaningful gifts
              aren't things you can hold. They're memories, words, moments, and feelings.
            </p>
            <p>
              We built Zaujain to help people express what's hard to say out loud.
              A love letter sealed in a digital envelope. A memory locked away until
              the right moment. A drawing delivered from the heart.
            </p>
            <p>
              Every feature in Zaujain exists to answer one question:
              how do we make someone feel truly seen and loved?
            </p>

            <div className="rounded-2xl border border-border bg-surface-raised p-6">
              <p className="font-display text-2xl font-medium italic text-ink">
                &ldquo;Every gift should become a memory.&rdquo;
              </p>
            </div>

            <p>
              We're a small team that cares deeply about quality, privacy, and
              emotional design. We don't build features for the sake of features.
              Every decision we make is guided by whether it makes the gift feel
              more personal.
            </p>
            <p>
              We're just getting started. There's so much more we want to build —
              more experiences, more ways to celebrate, more moments to capture.
              But we're building carefully, one beautiful thing at a time.
            </p>
          </div>

          <div className="mt-12 flex flex-col gap-4 sm:flex-row">
            <Link
              className="flex items-center justify-center gap-2 rounded-full bg-rose px-6 py-3 text-sm font-medium text-white shadow-rose shadow-sm transition-all hover:-translate-y-0.5"
              href="/activate"
            >
              Create a gift
            </Link>
            <Link
              className="flex items-center justify-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium text-ink-muted transition-all hover:border-rose/30 hover:text-rose"
              href="/contact"
            >
              Get in touch
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}
