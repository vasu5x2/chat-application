import { router } from '@/server/api/trpc'
import { chatRouter } from '@/server/api/routers/chat'

export const appRouter = router({
  chat: chatRouter,
})

export type AppRouter = typeof appRouter

