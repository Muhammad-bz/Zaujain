/**
 * Supabase Server Client
 *
 * Use this in Server Components, Server Actions, and Route Handlers.
 * Never import this in Client Components — it uses Next.js cookies().
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import type { Database } from '@/types/database'

/**
 * Creates a Supabase client for Server Components and Server Actions.
 * Reads and writes auth cookies via Next.js cookies() API.
 *
 * IMPORTANT: Must be called inside a Server Component or async function
 * that has access to the Next.js request context.
 *
 * @example
 * // In a Server Component:
 * const supabase = await createServerComponentClient()
 * const { data: { user } } = await supabase.auth.getUser()
 */
export async function createServerComponentClient() {
  const cookieStore = await cookies()

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Missing Supabase environment variables. ' +
        'Please add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to your .env.local file.'
    )
  }

  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // The `setAll` method is called from a Server Component.
          // This can be safely ignored if you have middleware refreshing sessions.
        }
      },
    },
  })
}

/**
 * Creates a Supabase client for Route Handlers.
 * Identical to createServerComponentClient but named explicitly for clarity.
 */
export const createRouteHandlerClient = createServerComponentClient

/**
 * Creates a Supabase Admin client using the service role key.
 * ONLY use this in server-side code for admin operations.
 * NEVER expose the service role key to the client.
 *
 * @example
 * // In an admin API route:
 * const supabase = createAdminClient()
 * await supabase.from('activation_keys').insert({ key: '...', ... })
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error(
      'Missing Supabase admin environment variables. ' +
        'Please add NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY to your .env.local file.'
    )
  }

  // Import createClient from supabase-js directly for admin use
  // (bypasses RLS policies — use with extreme care)
  const { createClient } = require('@supabase/supabase-js')

  return createClient<Database>(supabaseUrl, supabaseServiceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
