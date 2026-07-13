/**
 * Landing Page
 *
 * The first thing visitors see. Must immediately communicate:
 * - This is a gift, not a tool
 * - It's personal, beautiful, and made with care
 * - The emotional feeling they're about to create
 */

import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Zaujain — A Gift Made for You',
  description:
    'Create unforgettable personalized digital experiences for the people you love. Games, memories, letters, and surprises — beautifully wrapped in one gift.',
}

// ─── Decorative components (server-rendered, no JS) ──────────────────────────

function FloatingPetal({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute select-none opacity-30 ${className ?? ''}`}
    >
      <svg fill="none" height="24" viewBox="0 0 24 24" width="24">
        <ellipse
          cx="12"
          cy="12"
          fill="var(--color-rose)"
          opacity="0.6"
          rx="4"
          ry="11"
          transform="rotate(-30 12 12)"
        />
      </svg>
    </div>
  )
}

function WaxSeal() {
  return (
    <div aria-hidden="true" className="relative inline-flex items-center justify-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-rose shadow-rose shadow-lg ring-2 ring-rose/20">
        <span className="font-display text-xl font-semibold italic text-white/90">Z</span>
      </div>
      {/* Glow */}
      <div className="absolute inset-0 animate-glow rounded-full" />
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <main className="relative min-h-dvh overflow-hidden bg-parchment">
      {/* Background texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%231C1917' fill-opacity='1' fill-rule='evenodd'/%3E%3C/svg%3E")`,
        }}
      />

      {/* Decorative petals */}
      <FloatingPetal className="left-[8%] top-[12%] animate-float" />
      <FloatingPetal className="right-[12%] top-[20%] animate-float [animation-delay:1s]" />
      <FloatingPetal className="left-[15%] top-[55%] animate-float [animation-delay:2s]" />
      <FloatingPetal className="right-[8%] top-[65%] animate-float [animation-delay:0.5s]" />
      <FloatingPetal className="left-[30%] top-[80%] animate-float [animation-delay:1.5s]" />

      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <header className="container-fluid flex items-center justify-between py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose/10 ring-1 ring-rose/20">
            <span className="font-display text-lg font-semibold italic text-rose">Z</span>
          </div>
          <span className="font-display text-xl font-medium tracking-tight text-ink">Zaujain</span>
        </div>

        <nav className="flex items-center gap-2">
          <Link
            className="hidden rounded-lg px-4 py-2 text-sm font-medium text-ink-muted transition-colors duration-200 hover:bg-surface hover:text-ink sm:block"
            href="/sign-in"
          >
            Sign in
          </Link>
          <Link
            className="rounded-full bg-rose px-5 py-2 text-sm font-medium text-white shadow-rose shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md active:translate-y-0"
            href="/activate"
          >
            Open your gift
          </Link>
        </nav>
      </header>

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <section className="container-fluid pb-24 pt-16 text-center md:pb-32 md:pt-24">
        {/* Wax seal entrance */}
        <div className="mb-8 flex justify-center">
          <WaxSeal />
        </div>

        {/* Label */}
        <p className="mb-5 text-sm font-medium uppercase tracking-widest text-rose/70">
          A gift made for you
        </p>

        {/* Headline — Cormorant Garamond at its finest */}
        <h1 className="mx-auto mb-6 max-w-4xl text-balance font-display font-medium leading-tight text-ink">
          <span className="block">Some gifts can't be</span>
          <span className="block text-rose italic">wrapped in paper.</span>
        </h1>

        {/* Subheadline */}
        <p className="mx-auto mb-10 max-w-xl text-pretty text-base leading-relaxed text-ink-muted sm:text-lg">
          Zaujain turns your most meaningful moments into a beautiful digital experience —
          personalized games, memories, love letters, and surprises, all wrapped in one gift.
        </p>

        {/* CTAs */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link
            className="group flex min-w-[200px] items-center justify-center gap-2 rounded-full bg-rose px-8 py-3.5 text-base font-medium text-white shadow-rose shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg active:translate-y-0"
            href="/activate"
          >
            <span>Open your gift</span>
            <svg
              className="transition-transform duration-200 group-hover:translate-x-0.5"
              fill="none"
              height="16"
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              width="16"
            >
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>

          <Link
            className="flex min-w-[200px] items-center justify-center gap-2 rounded-full border border-border px-8 py-3.5 text-base font-medium text-ink-muted transition-all duration-200 hover:border-rose/30 hover:bg-rose-light hover:text-rose"
            href="/create"
          >
            Create a gift
          </Link>
        </div>

        {/* Social proof */}
        <p className="mt-8 text-sm text-muted">
          Beautifully crafted experiences for every love story.
        </p>
      </section>

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section className="container-fluid pb-24">
        <div className="mx-auto max-w-5xl">
          {/* Section label */}
          <p className="mb-12 text-center text-sm font-medium uppercase tracking-widest text-muted">
            Everything inside your gift
          </p>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature) => (
              <FeatureCard key={feature.title} {...feature} />
            ))}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────────────────────── */}
      <section className="container-fluid pb-24">
        <div className="mx-auto max-w-2xl text-center">
          <p className="mb-4 text-sm font-medium uppercase tracking-widest text-muted">
            How it works
          </p>
          <h2 className="mb-16 font-display text-3xl font-medium text-ink sm:text-4xl">
            As simple as wrapping a gift.
          </h2>

          <div className="space-y-8">
            {STEPS.map((step, index) => (
              <StepItem index={index + 1} key={step.title} {...step} />
            ))}
          </div>
        </div>
      </section>

      {/* ── Closing CTA ───────────────────────────────────────────────────── */}
      <section className="container-fluid pb-32">
        <div className="mx-auto max-w-xl rounded-3xl bg-surface p-10 text-center ring-1 ring-border">
          <div className="mb-6 flex justify-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-rose/10">
              <svg
                fill="none"
                height="24"
                stroke="var(--color-rose)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
                width="24"
              >
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </div>
          </div>
          <h2 className="mb-3 font-display text-2xl font-medium text-ink">
            Someone made this for you.
          </h2>
          <p className="mb-8 text-sm leading-relaxed text-ink-muted">
            If you received a Zaujain link, your gift is waiting. Enter your activation key to
            begin.
          </p>
          <Link
            className="inline-flex items-center gap-2 rounded-full bg-rose px-8 py-3 text-sm font-medium text-white shadow-rose shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
            href="/activate"
          >
            Open your gift
          </Link>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="border-t border-border">
        <div className="container-fluid py-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-rose/10 ring-1 ring-rose/20">
                <span className="font-display text-sm font-semibold italic text-rose">Z</span>
              </div>
              <span className="font-display text-base font-medium text-ink">Zaujain</span>
            </div>

            <nav className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
              {FOOTER_LINKS.map((link) => (
                <Link
                  className="text-xs text-muted transition-colors duration-200 hover:text-ink"
                  href={link.href}
                  key={link.label}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <p className="text-xs text-muted">
              Made with care &hearts;
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode
  title: string
  description: string
}) {
  return (
    <div className="card group rounded-2xl p-6 transition-all duration-300">
      <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-rose/10 text-rose transition-transform duration-300 group-hover:scale-110">
        {icon}
      </div>
      <h3 className="mb-2 font-display text-lg font-medium text-ink">{title}</h3>
      <p className="text-sm leading-relaxed text-ink-muted">{description}</p>
    </div>
  )
}

function StepItem({
  index,
  title,
  description,
}: {
  index: number
  title: string
  description: string
}) {
  return (
    <div className="flex items-start gap-5 text-left">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose/10 font-display text-base font-medium text-rose">
        {index}
      </div>
      <div className="pt-1">
        <h3 className="mb-1 font-display text-lg font-medium text-ink">{title}</h3>
        <p className="text-sm leading-relaxed text-ink-muted">{description}</p>
      </div>
    </div>
  )
}

// ─── Data ─────────────────────────────────────────────────────────────────────

const FEATURES = [
  {
    icon: (
      <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="20">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    ),
    title: 'Love Letter',
    description: 'A handcrafted message delivered in an animated envelope — sealed with care.',
  },
  {
    icon: (
      <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="20">
        <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
        <line x1="4" x2="4" y1="22" y2="15" />
      </svg>
    ),
    title: 'Couple Games',
    description: 'Quizzes, challenges, and shared moments designed to bring you closer.',
  },
  {
    icon: (
      <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="20">
        <rect height="11" rx="1" width="18" x="3" y="11" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
      </svg>
    ),
    title: 'Time Capsule',
    description: 'Lock memories today. Open them months or years later, when the time is right.',
  },
  {
    icon: (
      <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="20">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    title: 'Memory Vault',
    description: 'Photos, videos, voice notes, and drawings — all your shared memories in one place.',
  },
  {
    icon: (
      <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="20">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
      </svg>
    ),
    title: 'Love Canvas',
    description: 'Draw something from the heart and deliver it inside a beautiful envelope.',
  },
  {
    icon: (
      <svg fill="none" height="20" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.75" viewBox="0 0 24 24" width="20">
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" x2="9.01" y1="9" y2="9" />
        <line x1="15" x2="15.01" y1="9" y2="9" />
      </svg>
    ),
    title: 'Beautiful Themes',
    description: 'From Sakura to Galaxy to Korean Journal — every theme tells a different story.',
  },
]

const STEPS = [
  {
    title: 'Purchase a gift',
    description:
      'Buy an activation key from zaujain.com. Each key unlocks one personalized experience.',
  },
  {
    title: 'Build it with love',
    description:
      'Add memories, write a letter, choose a theme, and set up games — all in a simple guided flow.',
  },
  {
    title: 'Share the link',
    description:
      'Send your recipient a personalized link like zaujain.com/us/your-names. That&apos;s their gift.',
  },
]

const FOOTER_LINKS = [
  { label: 'About', href: '/about' },
  { label: 'Pricing', href: '/pricing' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
  { label: 'Contact', href: '/contact' },
]
