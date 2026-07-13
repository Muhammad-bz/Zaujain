import type { Metadata } from 'next'
import { Suspense } from 'react'
import { SignInForm } from '@/features/auth/components/SignInForm'

export const metadata: Metadata = {
  title: 'Sign in',
}

export default function SignInPage() {
  return (
    // Suspense needed because SignInForm uses useSearchParams()
    <Suspense>
      <SignInForm />
    </Suspense>
  )
}
