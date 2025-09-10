import { getCaller } from '@/server/api/caller'

export async function POST(req: Request) {
  const caller = await getCaller()
  const form = await req.formData()
  const title = (form.get('title') as string) || 'New Conversation'
  const session = await caller.chat.newSession({ title })
  const url = new URL(`/s/${session.id}`, req.url)
  return Response.redirect(url, 303)
}

