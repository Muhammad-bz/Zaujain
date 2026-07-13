/**
 * Experience Types
 *
 * Types for the gift/experience creation and viewing flows.
 */

import type { ExperienceType, ExperienceStatus } from './database'

// ─── Creation Wizard ──────────────────────────────────────────────────────────

export interface ExperienceSetupStep {
  id: string
  title: string
  description: string
  completed: boolean
  optional: boolean
}

export interface ExperienceSetupState {
  activationKey: string
  productType: string
  recipientName: string
  recipientAvatar: string | null
  creatorName: string
  title: string
  slug: string
  coverImage: string | null
  themeId: string | null
  backgroundMusic: string | null
  welcomeMessage: string
  currentStep: number
}

// ─── Recipient View ───────────────────────────────────────────────────────────

export interface RecipientExperienceData {
  id: string
  type: ExperienceType
  title: string
  slug: string
  status: ExperienceStatus
  owner: {
    name: string
    avatar_url: string | null
  }
  theme: {
    id: string
    name: string
    configuration_json: Record<string, unknown>
  } | null
  cover_image: string | null
  background_music: string | null
  welcome_message: string | null
  created_at: string
}

// ─── Experience Card (list view) ──────────────────────────────────────────────

export interface ExperienceCardData {
  id: string
  type: ExperienceType
  title: string
  slug: string
  status: ExperienceStatus
  cover_image: string | null
  theme_name: string | null
  created_at: string
  memory_count: number
  recipient_name: string | null
}
