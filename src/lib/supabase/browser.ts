'use client'

import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseCookieOptions, getSupabasePublicEnv } from '@/src/lib/supabase/env'

let browserClient: SupabaseClient | undefined

export function getSupabaseBrowserClient() {
  if (!browserClient) {
    const { url, anonKey } = getSupabasePublicEnv()

    browserClient = createBrowserClient(url, anonKey, {
      cookieOptions: getSupabaseCookieOptions(),
    })
  }

  return browserClient
}
