/**
 * Root Layout
 *
 * The root layout wraps every page in Zaujain.
 * Loads fonts, applies CSS variables, and provides global context.
 */

import type { Metadata, Viewport } from 'next'
import { Cormorant_Garamond, DM_Sans, DM_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import '@/styles/globals.css'

// ─── Font Loading ─────────────────────────────────────────────────────────────

// Display font: elegant, literary, romantic
const cormorantGaramond = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  display: 'swap',
  variable: '--font-display',
  preload: true,
})

// Body/UI font: friendly, clean, modern
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-sans',
  preload: true,
})

// Monospace: for activation keys and code display
const dmMono = DM_Mono({
  subsets: ['latin'],
  weight: ['300', '400', '500'],
  display: 'swap',
  variable: '--font-mono',
  preload: false,
})

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? 'https://zaujain.com'
  ),

  title: {
    default: 'Zaujain — A Gift Made for You',
    template: '%s · Zaujain',
  },

  description:
    'Create unforgettable personalized digital experiences for the people you love. Games, memories, letters, and surprises — all in one beautiful gift.',

  keywords: [
    'digital gift',
    'personalized gift',
    'couple gift',
    'anniversary gift',
    'romantic gift',
    'time capsule',
    'love letter',
    'memory vault',
  ],

  authors: [{ name: 'Zaujain' }],

  creator: 'Zaujain',

  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://zaujain.com',
    siteName: 'Zaujain',
    title: 'Zaujain — A Gift Made for You',
    description:
      'Create unforgettable personalized digital experiences for the people you love.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Zaujain — Digital Gifting Platform',
      },
    ],
  },

  twitter: {
    card: 'summary_large_image',
    title: 'Zaujain — A Gift Made for You',
    description:
      'Create unforgettable personalized digital experiences for the people you love.',
    images: ['/og-image.png'],
  },

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // PWA
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Zaujain',
  },

  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-touch-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#faf8f5' },
    { media: '(prefers-color-scheme: dark)', color: '#0f0d0c' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

// ─── Root Layout ──────────────────────────────────────────────────────────────

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      className={`${cormorantGaramond.variable} ${dmSans.variable} ${dmMono.variable}`}
      lang="en"
      suppressHydrationWarning
    >
      <body className="bg-parchment font-sans text-ink antialiased">
        {/* Toast notifications */}
        <Toaster
          position="top-center"
          toastOptions={{
            duration: 4000,
            style: {
              background: 'var(--color-surface-raised)',
              color: 'var(--color-ink)',
              border: '1px solid var(--color-border)',
              borderRadius: '0.75rem',
              fontFamily: 'var(--font-sans)',
              fontSize: '0.875rem',
              boxShadow:
                '0 10px 15px -3px rgba(28, 25, 23, 0.08), 0 4px 6px -4px rgba(28, 25, 23, 0.04)',
              padding: '0.875rem 1.25rem',
              maxWidth: '380px',
            },
            success: {
              iconTheme: {
                primary: 'var(--color-success)',
                secondary: 'var(--color-success-light)',
              },
            },
            error: {
              iconTheme: {
                primary: 'var(--color-error)',
                secondary: 'var(--color-error-light)',
              },
            },
          }}
        />

        {/* Main content */}
        {children}
      </body>
    </html>
  )
}
