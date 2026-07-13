import type { Metadata } from 'next'
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm'

export const metadata: Metadata = {
  title: 'Choose a new password',
}

export default function ResetPasswordPage() {
  return <ResetPasswordForm />
}
