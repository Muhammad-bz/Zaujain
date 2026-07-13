/**
 * Supabase utilities barrel export.
 *
 * Usage:
 *   Client Components:  import { createClient } from '@/lib/supabase/client'
 *   Server Components:  import { createServerComponentClient } from '@/lib/supabase/server'
 *   Middleware:         import { updateSession } from '@/lib/supabase/middleware'
 */

export { createClient } from './client'
export { createServerComponentClient, createRouteHandlerClient, createAdminClient } from './server'
export { updateSession } from './middleware'
