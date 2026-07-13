'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createServerComponentClient } from '@/lib/supabase/server'
import {
  signUpSchema,
  signInSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@/utils/validation'

// ─── Sign Up ──────────────────────────────────────────────────────────────────

export async function signUp(formData: FormData) {
  const raw = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  const result = signUpSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createServerComponentClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.signUp({
    email: result.data.email,
    password: result.data.password,
    options: {
      data: { name: result.data.name },
      emailRedirectTo: `${siteUrl}/auth/callback`,
    },
  })

  if (error) {
    if (error.message.includes('already registered')) {
      return { error: 'An account with this email already exists. Try signing in.' }
    }
    return { error: error.message }
  }

  return {
    success: true,
    message: "We've sent a confirmation email. Please check your inbox to activate your account.",
  }
}

// ─── Sign In ──────────────────────────────────────────────────────────────────

export async function signIn(formData: FormData) {
  const raw = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  }

  const result = signInSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createServerComponentClient()

  const { error } = await supabase.auth.signInWithPassword({
    email: result.data.email,
    password: result.data.password,
  })

  if (error) {
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Incorrect email or password. Please try again.' }
    }
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Please confirm your email address before signing in.' }
    }
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}

// ─── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut() {
  const supabase = await createServerComponentClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  redirect('/')
}

// ─── Forgot Password ──────────────────────────────────────────────────────────

export async function forgotPassword(formData: FormData) {
  const raw = { email: formData.get('email') as string }

  const result = forgotPasswordSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createServerComponentClient()
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'

  const { error } = await supabase.auth.resetPasswordForEmail(result.data.email, {
    redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
  })

  if (error) {
    return { error: error.message }
  }

  // Always return success to prevent email enumeration
  return {
    success: true,
    message: "If an account exists for that email, we've sent a password reset link.",
  }
}

// ─── Reset Password ───────────────────────────────────────────────────────────

export async function resetPassword(formData: FormData) {
  const raw = {
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  }

  const result = resetPasswordSchema.safeParse(raw)
  if (!result.success) {
    return { error: result.error.issues[0].message }
  }

  const supabase = await createServerComponentClient()

  const { error } = await supabase.auth.updateUser({
    password: result.data.password,
  })

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/', 'layout')
  redirect('/dashboard')
}
