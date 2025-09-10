import { appRouter } from '@/server/api/root'
import { createContext } from '@/server/api/trpc'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const ctx = await createContext()
  const caller = appRouter.createCaller(ctx)
  const form = await req.formData()
  const title = (form.get('title') as string) || 'New Conversation'
  const session = await caller.chat.newSession({ title })
  const url = new URL(`/s/${session.id}`, req.url)
  return Response.redirect(url, 303)
}
