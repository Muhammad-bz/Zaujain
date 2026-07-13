/**
 * Validation Schemas
 *
 * Zod schemas for all form inputs and API payloads.
 * Shared between client and server for consistent validation.
 */

import { z } from 'zod'

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const signUpSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be under 50 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

export const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Please enter your password'),
})

export const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
})

export const resetPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  })

// ─── Activation Key ───────────────────────────────────────────────────────────

export const activationKeySchema = z.object({
  key: z
    .string()
    .min(1, 'Please enter your activation key')
    .transform((val) => val.trim().toUpperCase()),
})

// ─── Experience Setup ─────────────────────────────────────────────────────────

export const experienceSetupSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(80, 'Title must be under 80 characters'),
  slug: z
    .string()
    .min(3, 'URL must be at least 3 characters')
    .max(60, 'URL must be under 60 characters')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'URL can only contain lowercase letters, numbers, and hyphens'),
  recipientName: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters'),
  welcomeMessage: z
    .string()
    .max(500, 'Welcome message must be under 500 characters')
    .optional(),
})

// ─── Memory ───────────────────────────────────────────────────────────────────

export const memorySchema = z.object({
  title: z.string().max(100, 'Title must be under 100 characters').optional(),
  description: z.string().max(1000, 'Description must be under 1000 characters').optional(),
  unlock_date: z.string().optional(),
})

// ─── Time Capsule ─────────────────────────────────────────────────────────────

export const timeCapsuleSchema = z.object({
  title: z
    .string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title must be under 100 characters'),
  message: z
    .string()
    .max(2000, 'Message must be under 2000 characters')
    .optional(),
  unlock_date: z
    .string()
    .min(1, 'Please choose an unlock date')
    .refine((val) => {
      const date = new Date(val)
      return date > new Date()
    }, 'Unlock date must be in the future'),
})

// ─── Profile ──────────────────────────────────────────────────────────────────

export const profileSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be under 50 characters'),
  username: z
    .string()
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be under 30 characters')
    .regex(/^[a-z0-9_]+$/, 'Username can only contain lowercase letters, numbers, and underscores')
    .optional(),
  bio: z.string().max(200, 'Bio must be under 200 characters').optional(),
})

// ─── Admin: Key Generation ────────────────────────────────────────────────────

export const generateKeySchema = z.object({
  product_type: z.enum(['digital_gift', 'time_capsule']),
  count: z.number().int().min(1).max(100).default(1),
  expires_at: z.string().optional(),
})

// ─── Type Exports ─────────────────────────────────────────────────────────────

export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>
export type ActivationKeyInput = z.infer<typeof activationKeySchema>
export type ExperienceSetupInput = z.infer<typeof experienceSetupSchema>
export type MemoryInput = z.infer<typeof memorySchema>
export type TimeCapsuleInput = z.infer<typeof timeCapsuleSchema>
export type ProfileInput = z.infer<typeof profileSchema>
export type GenerateKeyInput = z.infer<typeof generateKeySchema>
