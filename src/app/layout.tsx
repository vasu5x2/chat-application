import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Career Counselor Chat',
  description: 'AI-powered career counseling chat with session history',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div className="grid h-dvh grid-cols-1 md:grid-cols-[280px_1fr]">
          {children}
        </div>
      </body>
    </html>
  )
}
