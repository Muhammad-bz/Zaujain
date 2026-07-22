import type { Metadata } from 'next'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import { GiftSetupForm } from '@/features/gift/components/GiftSetupForm'

export const metadata: Metadata = {
  title: 'Set up your gift',
  robots: { index: false, follow: false },
}

interface Props {
  searchParams: Promise<{ keyId?: string; type?: string }>
}

export default async function NewGiftPage({ searchParams }: Props) {
  const params = await searchParams
  const { keyId, type } = params

  if (!keyId) redirect('/activate')

  const supabase = await createServerComponentClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/sign-in')

  // Verify the key belongs to this user and is redeemed
  const { data: key } = await supabase
    .from('activation_keys')
    .select('id, product_type, status')
    .eq('id', keyId)
    .eq('redeemed_by', user.id)
    .single()

  if (!key || key.status !== 'redeemed') {
    redirect('/activate')
  }

  return (
    <main className="min-h-dvh bg-parchment">
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(ellipse 60% 40% at 50% 0%, rgba(196,113,122,0.08) 0%, transparent 70%)',
        }}
      />

      <div className="container-fluid relative z-10 py-12">
        {/* Header */}
        <div className="mb-10 text-center">
          <a className="mb-6 inline-flex items-center gap-2" href="/dashboard">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-rose/10 ring-1 ring-rose/20">
              <span className="font-display text-base font-semibold italic text-rose">Z</span>
            </div>
            <span className="font-display text-lg font-medium text-ink">Zaujain</span>
          </a>
          <h1 className="font-display text-4xl font-medium text-ink">
            Let&apos;s build your gift.
          </h1>
          <p className="mt-2 text-sm text-ink-muted">
            A few details to get started. You can change everything later.
          </p>
        </div>

        <GiftSetupForm
          activationKeyId={keyId}
          experienceType={(type as string) || 'digital_gift'}
        />
      </div>
    </main>
  )
}
