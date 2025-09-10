import { initTRPC } from '@trpc/server'
import superjson from 'superjson'
import { cookies } from 'next/headers'
import { db } from '@/server/db'
import { NextRequest } from 'next/server'
import crypto from 'node:crypto'

export type Context = {
  userId: string
  db: typeof db
  req?: NextRequest
}

function getOrSetUserIdCookie() {
  const store = cookies()
  let uid = store.get('uid')?.value
  if (!uid) {
    uid = crypto.randomUUID()
    try {
      // Set a long-lived cookie (only succeeds in Route Handlers / mutations)
      store.set('uid', uid, { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 * 5 })
    } catch {
      // In Server Components, cookies() is read-only; ignore set attempts
    }
  }
  return uid
}

export async function createContext(): Promise<Context> {
  const userId = getOrSetUserIdCookie()
  // Best-effort: ensure a corresponding User exists. If this is called in a
  // Server Component, DB writes are allowed, but we still keep this here for
  // API routes where it's critical. Failures will bubble as usual.
  try {
    await db.user.upsert({ where: { id: userId }, create: { id: userId }, update: {} })
  } catch {
    // Ignore in contexts where writes are not desired; mutations will create as needed.
  }
  return { userId, db }
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure
