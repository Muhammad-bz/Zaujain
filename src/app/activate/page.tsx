import type { Metadata } from 'next'
import { ActivateForm } from '@/features/gift/components/ActivateForm'

export const metadata: Metadata = {
  title: 'Open your gift',
  description: 'Enter your activation key to open or create your Zaujain gift.',
}

export default function ActivatePage() {
  return (
    <main className="min-h-dvh bg-parchment">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(196,113,122,0.12) 0%, transparent 70%)',
        }}
      />

      <div className="container-fluid relative z-10 flex min-h-dvh flex-col items-center justify-center py-16">
        {/* Logo */}
        <a className="mb-12 flex items-center gap-2.5" href="/">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose/10 ring-1 ring-rose/20">
            <span className="font-display text-xl font-semibold italic text-rose">Z</span>
          </div>
          <span className="font-display text-2xl font-medium tracking-tight text-ink">
            Zaujain
          </span>
        </a>

        <div className="w-full max-w-md">
          {/* Envelope icon */}
          <div className="mb-8 flex justify-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-rose/10 ring-2 ring-rose/20">
              <svg
                className="h-10 w-10 text-rose"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
          </div>

          <div className="text-center mb-8">
            <h1 className="font-display text-4xl font-medium text-ink">
              Someone made this
              <span className="block italic text-rose"> for you.</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-muted">
              Enter your activation key to open your gift or begin creating one.
            </p>
          </div>

          <ActivateForm />
        </div>
      </div>
    </main>
  )
}
