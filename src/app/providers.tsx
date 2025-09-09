"use client"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { trpc } from '@/trpc/client'
import { httpBatchLink } from '@trpc/client'
import superjson from 'superjson'
import React from 'react'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  // Ensure a stable anonymous user id cookie exists before any API calls
  React.useEffect(() => {
    if (typeof document === 'undefined') return
    const hasUid = document.cookie.split('; ').some(c => c.startsWith('uid='))
    if (!hasUid) {
      const uid = (globalThis.crypto?.randomUUID?.() ?? Math.random().toString(36).slice(2)) as string
      const fiveYears = 60 * 60 * 24 * 365 * 5
      document.cookie = `uid=${uid}; Max-Age=${fiveYears}; Path=/; SameSite=Lax`
    }
  }, [])
  const [queryClient] = React.useState(() => new QueryClient())
  const [trpcClient] = React.useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: '/api/trpc',
          transformer: superjson,
          fetch(url, options) {
            return fetch(url, { ...options, credentials: 'include' })
          },
        }),
      ],
    })
  )

  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <trpc.Provider client={trpcClient} queryClient={queryClient}>
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
      </trpc.Provider>
    </ThemeProvider>
  )
}
