import { appRouter } from '@/server/api/root'
import { createContext } from '@/server/api/trpc'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const ctx = await createContext()
  const caller = appRouter.createCaller(ctx)
  const form = await req.formData()
  const content = (form.get('content') as string) || ''
  if (content.trim()) {
    await caller.chat.sendMessage({ sessionId: params.id, content: content.trim() })
  }
  const url = new URL(`/s/${params.id}`, req.url)
  return Response.redirect(url, 303)
}
