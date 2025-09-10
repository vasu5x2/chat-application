import { getCaller } from '@/server/api/caller'

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const caller = await getCaller()
  const form = await req.formData()
  const content = (form.get('content') as string) || ''
  if (content.trim()) {
    await caller.chat.sendMessage({ sessionId: params.id, content: content.trim() })
  }
  const url = new URL(`/s/${params.id}`, req.url)
  return Response.redirect(url, 303)
}

