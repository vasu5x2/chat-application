import { appRouter } from '@/server/api/root'
import type { Context } from '@/server/api/trpc'
import { cookies } from 'next/headers'
import { getDb } from '@/server/db'

// Server Component-safe caller: reads cookie, does not set or upsert.
export async function getCaller() {
  const uid = cookies().get('uid')?.value || '__no_uid__'
  const ctx: Context = { userId: uid, db: getDb() }
  return appRouter.createCaller(ctx)
}
