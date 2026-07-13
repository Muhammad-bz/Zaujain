/**
 * Theme System Types
 *
 * Types for the Zaujain runtime theme system.
 * Themes are applied by setting CSS variables on the <html> element.
 */

export type ThemeId =
  | 'default'
  | 'sakura'
  | 'galaxy'
  | 'korean-journal'
  | 'luxury-paper'
  | 'glass'
  | 'minimal'
  | 'amoled'
  | 'valentines'
  | 'ramadan'
  | 'eid'
  | 'christmas'

export type ThemeMode = 'light' | 'dark' | 'amoled'

export interface ThemeCSSVariables {
  '--color-ink': string
  '--color-ink-muted': string
  '--color-parchment': string
  '--color-parchment-deep': string
  '--color-surface': string
  '--color-surface-raised': string
  '--color-surface-overlay': string
  '--color-border': string
  '--color-border-strong': string
  '--color-muted': string
  '--color-rose': string
  '--color-rose-light': string
  '--color-rose-dark': string
  '--color-gold': string
  '--color-gold-light': string
}

export interface ThemeDecoration {
  type: 'particle' | 'overlay' | 'pattern' | 'animated'
  component: string // component name to render
  zIndex: number
}

export interface ThemeDefinition {
  id: ThemeId
  name: string
  description: string
  mood: string[]
  mode: ThemeMode
  variables: ThemeCSSVariables
  decorations: ThemeDecoration[]
  previewGradient: string // CSS gradient for preview card
  musicSuggestion?: string // Cloudinary audio URL
}
