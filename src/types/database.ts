/**
 * Database Types
 *
 * These types directly mirror the Supabase database schema.
 * When the schema changes, update these types to match.
 */

// ─── Enums ───────────────────────────────────────────────────────────────────

export type ExperienceType =
  | 'digital_gift'
  | 'time_capsule'
  | 'proposal'
  | 'anniversary'
  | 'birthday'
  | 'friendship'
  | 'graduation'
  | 'wedding'
  | 'ramadan'
  | 'eid'
  | 'christmas'

export type ExperienceStatus = 'draft' | 'published' | 'archived'

export type ExperienceMemberRole = 'owner' | 'recipient' | 'viewer'

export type MemoryType =
  | 'photo'
  | 'video'
  | 'letter'
  | 'voice_note'
  | 'drawing'
  | 'wallpaper'

export type ActivationKeyStatus = 'active' | 'redeemed' | 'expired' | 'revoked'

export type ProductType = 'digital_gift' | 'time_capsule'

export type GameType =
  | 'couple_quiz'
  | 'guess_my_answer'
  | 'this_or_that'
  | 'would_you_rather'
  | 'never_have_i_ever'
  | 'whos_more_likely'
  | 'love_bingo'
  | 'memory_challenge'
  | 'relationship_boundaries'
  | 'spin_the_wheel'
  | 'moon_match'

export type GameStatus = 'not_started' | 'in_progress' | 'completed'

export type QuestionType = 'text' | 'choice' | 'scale' | 'boolean'

export type NotificationType =
  | 'gift_opened'
  | 'new_memory'
  | 'time_capsule_unlock'
  | 'anniversary_reminder'
  | 'daily_streak'
  | 'achievement_unlocked'
  | 'system'

export type TimeCapsuleStatus = 'locked' | 'unlocked' | 'draft'

// ─── Base Types ───────────────────────────────────────────────────────────────

export interface BaseRecord {
  id: string
  created_at: string
  updated_at: string
}

// ─── Users ───────────────────────────────────────────────────────────────────

export interface User extends BaseRecord {
  name: string
  username: string | null
  email: string
  avatar_url: string | null
  bio: string | null
}

export interface UserProfile extends User {
  // Extended profile with computed fields
  total_experiences: number
  total_memories: number
}

// ─── Activation Keys ──────────────────────────────────────────────────────────

export interface ActivationKey {
  id: string
  key: string
  status: ActivationKeyStatus
  product_type: ProductType
  created_by: string // admin user id
  redeemed_by: string | null
  redeemed_at: string | null
  expires_at: string | null
  created_at: string
}

// ─── Themes ───────────────────────────────────────────────────────────────────

export interface ThemeConfig {
  colors: {
    primary: string
    secondary: string
    accent: string
    background: string
    surface: string
    text: string
    border: string
  }
  decorations: string[]
  motionPreset: 'gentle' | 'playful' | 'elegant' | 'dramatic'
  backgroundStyle: 'solid' | 'gradient' | 'pattern' | 'image'
  fontPair?: {
    display: string
    body: string
  }
}

export interface Theme {
  id: string
  name: string
  category: string
  preview_image: string | null
  configuration_json: ThemeConfig
  premium: boolean
  active: boolean
}

// ─── Experiences ──────────────────────────────────────────────────────────────

export interface Experience extends BaseRecord {
  activation_key_id: string
  owner_id: string
  experience_type: ExperienceType
  title: string
  slug: string
  theme_id: string | null
  cover_image: string | null
  background_music: string | null
  welcome_message: string | null
  is_private: boolean
  status: ExperienceStatus
}

export interface ExperienceWithTheme extends Experience {
  theme: Theme | null
}

export interface ExperienceMember {
  id: string
  experience_id: string
  user_id: string
  role: ExperienceMemberRole
  joined_at: string
}

// ─── Memories ────────────────────────────────────────────────────────────────

export interface Memory extends BaseRecord {
  experience_id: string
  type: MemoryType
  title: string | null
  description: string | null
  media_url: string | null
  unlock_date: string | null
  created_by: string
}

// ─── Quizzes & Questions ──────────────────────────────────────────────────────

export interface Quiz extends BaseRecord {
  experience_id: string
  title: string
  description: string | null
}

export interface Question {
  id: string
  quiz_id: string
  question: string
  type: QuestionType
  order: number
}

export interface Answer {
  id: string
  question_id: string
  user_id: string
  answer: string
  answered_at: string
}

// ─── Games ───────────────────────────────────────────────────────────────────

export interface Game extends BaseRecord {
  experience_id: string
  game_type: GameType
  status: GameStatus
  score: number | null
}

// ─── Drawings ────────────────────────────────────────────────────────────────

export interface Drawing extends BaseRecord {
  experience_id: string
  artist_id: string
  cloudinary_url: string
  note: string | null
  wallpaper_enabled: boolean
}

// ─── Time Capsules ────────────────────────────────────────────────────────────

export interface TimeCapsule extends BaseRecord {
  experience_id: string
  unlock_date: string
  title: string
  message: string | null
  status: TimeCapsuleStatus
}

// ─── Notifications ────────────────────────────────────────────────────────────

export interface Notification {
  id: string
  user_id: string
  title: string
  message: string
  type: NotificationType
  read: boolean
  sent_at: string
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  reward: string | null
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
}

// ─── Streaks ─────────────────────────────────────────────────────────────────

export interface Streak {
  id: string
  experience_id: string
  current_streak: number
  longest_streak: number
  last_active: string
}

// ─── Wallpapers ──────────────────────────────────────────────────────────────

export interface Wallpaper extends BaseRecord {
  experience_id: string
  image_url: string
  source_type: 'photo' | 'drawing' | 'quote' | 'memory'
}

// ─── Admin Logs ───────────────────────────────────────────────────────────────

export interface AdminLog {
  id: string
  admin_id: string
  action: string
  target: string | null
  created_at: string
}

// ─── Supabase Database Shape ──────────────────────────────────────────────────
// This matches the generated types pattern from `supabase gen types typescript`

export interface Database {
  public: {
    Tables: {
      users: {
        Row: User
        Insert: Omit<User, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<User, 'id' | 'created_at'>>
      }
      activation_keys: {
        Row: ActivationKey
        Insert: Omit<ActivationKey, 'id' | 'created_at'>
        Update: Partial<Omit<ActivationKey, 'id' | 'created_at'>>
      }
      experiences: {
        Row: Experience
        Insert: Omit<Experience, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Experience, 'id' | 'created_at'>>
      }
      experience_members: {
        Row: ExperienceMember
        Insert: Omit<ExperienceMember, 'id' | 'joined_at'>
        Update: Partial<Omit<ExperienceMember, 'id'>>
      }
      themes: {
        Row: Theme
        Insert: Omit<Theme, 'id'>
        Update: Partial<Omit<Theme, 'id'>>
      }
      memories: {
        Row: Memory
        Insert: Omit<Memory, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Memory, 'id' | 'created_at'>>
      }
      quizzes: {
        Row: Quiz
        Insert: Omit<Quiz, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Quiz, 'id' | 'created_at'>>
      }
      questions: {
        Row: Question
        Insert: Omit<Question, 'id'>
        Update: Partial<Omit<Question, 'id'>>
      }
      answers: {
        Row: Answer
        Insert: Omit<Answer, 'id'>
        Update: Partial<Omit<Answer, 'id'>>
      }
      games: {
        Row: Game
        Insert: Omit<Game, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Game, 'id' | 'created_at'>>
      }
      drawings: {
        Row: Drawing
        Insert: Omit<Drawing, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Drawing, 'id' | 'created_at'>>
      }
      time_capsules: {
        Row: TimeCapsule
        Insert: Omit<TimeCapsule, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TimeCapsule, 'id' | 'created_at'>>
      }
      notifications: {
        Row: Notification
        Insert: Omit<Notification, 'id'>
        Update: Partial<Omit<Notification, 'id'>>
      }
      achievements: {
        Row: Achievement
        Insert: Omit<Achievement, 'id'>
        Update: Partial<Omit<Achievement, 'id'>>
      }
      user_achievements: {
        Row: UserAchievement
        Insert: Omit<UserAchievement, 'id'>
        Update: never
      }
      streaks: {
        Row: Streak
        Insert: Omit<Streak, 'id'>
        Update: Partial<Omit<Streak, 'id'>>
      }
      wallpapers: {
        Row: Wallpaper
        Insert: Omit<Wallpaper, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Wallpaper, 'id' | 'created_at'>>
      }
      admin_logs: {
        Row: AdminLog
        Insert: Omit<AdminLog, 'id'>
        Update: never
      }
    }
  }
}
