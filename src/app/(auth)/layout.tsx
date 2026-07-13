import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-dvh bg-parchment">
      {/* Subtle background texture */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 opacity-[0.015]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, var(--color-rose-light) 0%, transparent 50%),
            radial-gradient(circle at 80% 80%, var(--color-gold-light) 0%, transparent 50%)`,
        }}
      />

      {/* Header */}
      <header className="relative z-10 flex items-center justify-center py-8">
        <Link className="flex items-center gap-2.5 group" href="/">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-rose/10 ring-1 ring-rose/20 transition-all duration-200 group-hover:bg-rose/15">
            <span className="font-display text-lg font-semibold italic text-rose">Z</span>
          </div>
          <span className="font-display text-xl font-medium tracking-tight text-ink">
            Zaujain
          </span>
        </Link>
      </header>

      {/* Page content */}
      <main className="relative z-10 flex min-h-[calc(100dvh-8rem)] items-center justify-center px-4 pb-16">
        {children}
      </main>
    </div>
  )
}
