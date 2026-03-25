import { createClient } from '@supabase/supabase-js'
import { getSupabasePublicEnv, getSupabaseServiceRoleKey } from '@/src/lib/supabase/env'

export function getSupabaseAdminClient() {
  const { url } = getSupabasePublicEnv()
  const serviceRoleKey = getSupabaseServiceRoleKey()

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}
