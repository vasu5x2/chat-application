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
    // Set a long-lived cookie
    store.set('uid', uid, { httpOnly: true, path: '/', sameSite: 'lax', maxAge: 60 * 60 * 24 * 365 * 5 })
  }
  return uid
}

export async function createContext(): Promise<Context> {
  const userId = getOrSetUserIdCookie()
  // Ensure a corresponding User exists for this anonymous cookie id
  await db.user.upsert({
    where: { id: userId },
    create: { id: userId },
    update: {},
  })
  return { userId, db }
}

const t = initTRPC.context<Context>().create({
  transformer: superjson,
})

export const router = t.router
export const publicProcedure = t.procedure
