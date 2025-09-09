"use client"
import Link from 'next/link'
import { trpc } from '@/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function HomePage() {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const utils = trpc.useUtils()
  const list = trpc.chat.listSessions.useInfiniteQuery(
    { limit: 20 },
    { getNextPageParam: last => last?.nextCursor }
  )
  const create = trpc.chat.newSession.useMutation({
    onSuccess: async () => {
      await utils.chat.listSessions.invalidate()
      setTitle('')
    },
  })

  const items = list.data?.pages.flatMap(p => p.items) ?? []

  return (
    <>
      <aside className="hidden border-r p-4 md:block">
        <div className="mb-4 flex gap-2">
          <Input
            placeholder="New chat title"
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') {
                ;(async () => {
                  const session = await create.mutateAsync({ title: title || undefined })
                  if (session?.id) router.push(`/s/${session.id}`)
                })()
              }
            }}
          />
          <Button
            onClick={async () => {
              const session = await create.mutateAsync({ title: title || undefined })
              if (session?.id) router.push(`/s/${session.id}`)
            }}
          >
            New
          </Button>
        </div>
        <ScrollArea className="h-[calc(100dvh-5rem)] pr-2">
          <div className="space-y-1">
            {items.map(s => (
              <Link key={s.id} className="block rounded-md px-2 py-2 hover:bg-accent" href={`/s/${s.id}`}>
                <div className="text-sm font-medium">{s.title}</div>
                <div className="text-xs text-muted-foreground">{new Date(s.createdAt as any).toLocaleString()}</div>
              </Link>
            ))}
            {list.hasNextPage && (
              <div className="py-2">
                <Button variant="outline" size="sm" onClick={() => list.fetchNextPage()} disabled={list.isFetchingNextPage}>
                  Load more
                </Button>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
      <main className="flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Career Counselor Chat</h1>
        <p className="text-muted-foreground">Start a new conversation or pick one from the sidebar.</p>
        <Button
          onClick={async () => {
            const session = await create.mutateAsync({ title: title || 'New Conversation' })
            if (session?.id) router.push(`/s/${session.id}`)
          }}
        >
          Start New Chat
        </Button>
      </main>
    </>
  )
}
