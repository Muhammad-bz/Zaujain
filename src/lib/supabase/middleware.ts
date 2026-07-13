/**
 * Supabase Middleware Helper
 *
 * Refreshes the user's session in middleware to prevent expiry.
 * Used by src/middleware.ts.
 */

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import type { Database } from '@/types/database'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  const supabase = createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
        supabaseResponse = NextResponse.next({
          request,
        })
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        )
      },
    },
  })

  // Refresh session — do not remove this
  // IMPORTANT: Do not add code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Protect authenticated routes
  const { pathname } = request.nextUrl

  // Routes that require authentication
  const protectedPaths = ['/dashboard', '/gift', '/profile', '/settings']
  const isProtectedPath = protectedPaths.some((path) => pathname.startsWith(path))

  // Admin routes — extra protection
  const adminPaths = ['/admin']
  const isAdminPath = adminPaths.some((path) => pathname.startsWith(path))

  if (isProtectedPath && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/sign-in'
    redirectUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(redirectUrl)
  }

  if (isAdminPath && !user) {
    const redirectUrl = request.nextUrl.clone()
    redirectUrl.pathname = '/sign-in'
    return NextResponse.redirect(redirectUrl)
  }

  return supabaseResponse
}
