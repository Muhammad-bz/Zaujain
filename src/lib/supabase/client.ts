/**
 * Supabase Browser Client
 *
 * Use this in Client Components ('use client').
 * Creates a singleton client using @supabase/ssr for cookie-based auth.
 */

import { createBrowserClient } from '@supabase/ssr'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client for use in the browser (Client Components).
 * This uses cookie-based session management via @supabase/ssr.
 *
 * @example
 * const supabase = createClient()
 * const { data } = await supabase.from('experiences').select('*')
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
        'Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.'
    )
  }

  return createBrowserClient<Database>(supabaseUrl, supabaseAnonKey)
}
