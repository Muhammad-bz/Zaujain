import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Answers to common questions about Zaujain.',
}

const FAQS = [
  {
    q: 'What is Zaujain?',
    a: 'Zaujain is a personalized digital gifting platform. You create a beautiful experience for someone you love — with memories, games, letters, drawings, and time capsules — all in one gift.',
  },
  {
    q: 'How does it work?',
    a: 'You purchase an activation key, redeem it on our platform, and then build your gift step by step. When it\'s ready, you share a personalized link with the recipient. They open it and experience everything you created for them.',
  },
  {
    q: 'Do I need to create an account?',
    a: 'Yes. You\'ll need a free Zaujain account to create and manage your gift. The recipient doesn\'t need an account to view the gift.',
  },
  {
    q: 'What\'s included in a Digital Gift?',
    a: 'A Digital Gift includes a personalized memory vault (photos, videos, letters, voice notes, drawings), couple games, a Love Canvas, a Time Capsule, 12 themes, a custom URL, and lifetime access.',
  },
  {
    q: 'Can I edit my gift after publishing?',
    a: 'Yes. You can edit your gift at any time — add new memories, change the theme, update the welcome message. The recipient will see your latest changes the next time they visit.',
  },
  {
    q: 'Is my gift private?',
    a: 'Yes. All gifts are private by default. Only people with the link can view your gift, and the link is not indexed by search engines.',
  },
  {
    q: 'How long does the gift last?',
    a: 'Forever. You pay once and your gift is accessible for as long as Zaujain exists. We don\'t delete gifts or charge recurring fees.',
  },
  {
    q: 'Can I use one key for multiple gifts?',
    a: 'Each activation key unlocks one gift. If you want to create another gift, you\'ll need a new key.',
  },
  {
    q: 'What devices does Zaujain work on?',
    a: 'Zaujain works on any modern smartphone, tablet, or desktop browser. It\'s designed mobile-first, so it looks and feels great on your phone.',
  },
  {
    q: 'Can the recipient add to the gift?',
    a: 'Not yet — right now only the creator can add content. We\'re working on collaborative features for the future.',
  },
  {
    q: 'Do you offer refunds?',
    a: 'If you haven\'t redeemed your activation key yet, please contact us and we\'ll be happy to help. Once a key has been redeemed and a gift created, we\'re unable to offer refunds.',
  },
  {
    q: 'I have a question that\'s not here.',
    a: 'We\'d love to hear from you. Reach out at hello@zaujain.com and we\'ll get back to you as soon as we can.',
  },
]

export default function FAQPage() {
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
            FAQ
          </p>
          <h1 className="mb-12 font-display text-5xl font-medium text-ink">
            Questions & answers.
          </h1>

          <div className="space-y-4">
            {FAQS.map((faq, index) => (
              <FAQItem a={faq.a} key={index} q={faq.q} />
            ))}
          </div>

          <div className="mt-12 rounded-2xl border border-border bg-surface-raised p-6 text-center">
            <p className="mb-1 font-display text-lg font-medium text-ink">
              Still have questions?
            </p>
            <p className="mb-4 text-sm text-ink-muted">
              We're happy to help.
            </p>
            <Link
              className="inline-flex items-center justify-center rounded-full bg-rose px-6 py-2.5 text-sm font-medium text-white shadow-rose shadow-sm transition-all hover:-translate-y-0.5"
              href="/contact"
            >
              Contact us
            </Link>
          </div>
        </div>
      </div>
    </main>
  )
}

function FAQItem({ q, a }: { q: string; a: string }) {
  return (
    <details className="card group rounded-2xl">
      <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 marker:content-none">
        <span className="font-medium text-ink">{q}</span>
        <svg
          className="h-4 w-4 shrink-0 text-muted transition-transform duration-200 group-open:rotate-180"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </summary>
      <div className="border-t border-border px-5 pb-5 pt-4">
        <p className="text-sm leading-relaxed text-ink-muted">{a}</p>
      </div>
    </details>
  )
}
