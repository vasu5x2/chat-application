import { z } from 'zod'
import { publicProcedure, router } from '@/server/api/trpc'

const listInput = z
  .object({
    limit: z.number().min(1).max(50).default(20),
    cursor: z.string().nullish(),
    // tRPC useInfiniteQuery may send a direction hint; accept and ignore it
    direction: z.enum(['forward', 'backward']).optional(),
  })

export const chatRouter = router({
  listSessions: publicProcedure.input(listInput).query(async ({ ctx, input }) => {
    const { db, userId } = ctx
    const sessions = await db.chatSession.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      select: { id: true, title: true, createdAt: true, updatedAt: true },
    })
    let nextCursor: string | undefined
    if (sessions.length > input.limit) {
      const next = sessions.pop()!
      nextCursor = next.id
    }
    return { items: sessions, nextCursor }
  }),

  getSession: publicProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    const { db, userId } = ctx
    const session = await db.chatSession.findFirst({
      where: { id: input.id, userId },
      include: { messages: { orderBy: { createdAt: 'asc' } } },
    })
    if (!session) return null
    return session
  }),

  newSession: publicProcedure
    .input(z.object({ title: z.string().min(1).max(100).optional() }).optional())
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx
      const title = input?.title ?? 'New Conversation'
      const session = await db.chatSession.create({ data: { title, userId }, select: { id: true } })
      return session
    }),

  sendMessage: publicProcedure
    .input(
      z.object({
        sessionId: z.string().optional(),
        content: z.string().min(1).max(4000),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const { db, userId } = ctx
      let existing = null as Awaited<ReturnType<typeof db.chatSession.findFirst>>
      if (input.sessionId) {
        existing = await db.chatSession.findFirst({ where: { id: input.sessionId, userId } })
      }
      const session =
        existing ??
        (await db.chatSession.create({
          data: { title: input.content.slice(0, 60), userId },
        }))

      const userMsg = await db.message.create({
        data: { sessionId: session.id, role: 'user', content: input.content },
      })

      // Build context from last N messages
      const history = await db.message.findMany({
        where: { sessionId: session.id },
        orderBy: { createdAt: 'asc' },
        take: 30,
      })

      const assistantText = await generateAssistantReply(
        history.map(m => ({ role: m.role as 'user' | 'assistant' | 'system', content: m.content }))
      )

      const assistantMsg = await db.message.create({
        data: { sessionId: session.id, role: 'assistant', content: assistantText },
      })

      return { sessionId: session.id, user: userMsg, assistant: assistantMsg }
    }),
})

// AI provider
type ChatMessage = { role: 'user' | 'assistant' | 'system'; content: string }

async function generateAssistantReply(messages: ChatMessage[]): Promise<string> {
  const provider = (process.env.AI_PROVIDER || 'openai').toLowerCase()
  const systemPrompt =
    'You are an experienced, friendly career counselor. Give practical, specific, and encouraging guidance. Ask clarifying questions when needed. Keep answers concise.'

  if (provider === 'together') {
    const apiKey = process.env.TOGETHER_API_KEY
    if (!apiKey) return fallbackReply(messages)
    const body = {
      model: 'meta-llama/Meta-Llama-3-8B-Instruct-Turbo',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      max_tokens: 400,
      temperature: 0.5,
    }
    const res = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    })
    if (!res.ok) return fallbackReply(messages)
    const json: any = await res.json()
    const text: string | undefined = json?.choices?.[0]?.message?.content
    return text ?? fallbackReply(messages)
  } else {
    const apiKey = process.env.OPENAI_API_KEY
    if (!apiKey) return fallbackReply(messages)
    const body = {
      model: 'gpt-4o-mini',
      messages: [{ role: 'system', content: systemPrompt }, ...messages],
      temperature: 0.5,
      max_tokens: 400,
    }
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify(body),
    })
    if (!res.ok) return fallbackReply(messages)
    const json: any = await res.json()
    const text: string | undefined = json?.choices?.[0]?.message?.content
    return text ?? fallbackReply(messages)
  }
}

function fallbackReply(messages: ChatMessage[]): string {
  // Simple local heuristic if no API key is configured
  const last = messages.slice().reverse().find(m => m.role === 'user')?.content ?? ''
  return `I’m here to help with career guidance. You said: "${last.slice(0, 120)}". Could you share your goals, skills, and constraints so I can advise on roles, skills to learn, and next steps?`
}
