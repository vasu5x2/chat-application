import type { Metadata } from 'next'
import './globals.css'
import { Providers } from './providers'

export const metadata: Metadata = {
  title: 'Career Counselor Chat',
  description: 'AI-powered career counseling chat with session history',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <div className="grid h-dvh grid-cols-1 md:grid-cols-[280px_1fr]">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  )
}

