'use client'

import { SessionContextProvider } from '@supabase/auth-helpers-react'
import { useState } from 'react'
import { createPagesBrowserClient } from '@supabase/auth-helpers-nextjs'

export function SupabaseProvider({
  children,
  session,
}: {
  children: React.ReactNode
  session: any
}) {
  const [supabaseClient] = useState(() => createPagesBrowserClient  ())

  return (
    <SessionContextProvider
      supabaseClient={supabaseClient}
      initialSession={session}
    >
      {children}
    </SessionContextProvider>
  )
}
