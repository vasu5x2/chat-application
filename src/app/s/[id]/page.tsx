"use client"
import { trpc } from '@/trpc/client'
import { notFound, useRouter } from 'next/navigation'
import { AwaitedReactNode, JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import Link from 'next/link'
import { ScrollArea } from '@/components/ui/scroll-area'

export default function SessionPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const q = trpc.chat.getSession.useQuery({ id: params.id })
  const send = trpc.chat.sendMessage.useMutation({
    onSuccess: async () => {
      await utils.chat.getSession.invalidate({ id: params.id })
    },
  })
  const [text, setText] = useState('')
  const endRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [q.data?.messages.length])

  const onSend = () => {
    if (!text.trim()) return
    send.mutate({ sessionId: params.id, content: text.trim() })
    setText('')
  }

  if (q.isLoading) {
    return <div className="p-6">Loading...</div>
  }
  if (!q.data) return notFound()

  return (
    <>
      <aside className="hidden border-r p-4 md:block">
        <div className="mb-4">
          <Link className="text-sm text-primary hover:underline" href="/">
            ← All sessions
          </Link>
        </div>
        <div className="text-sm font-medium">{q.data.title}</div>
      </aside>
      <main className="flex h-dvh flex-col">
        <div className="flex-1 p-4">
          <ScrollArea className="h-[calc(100dvh-9rem)] pr-2">
            <div className="mx-auto max-w-2xl space-y-4">
              {q.data.messages.map((m: { id: Key | null | undefined; role: string; content: string | number | bigint | boolean | ReactElement<any, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<AwaitedReactNode> | null | undefined }) => (
                <div key={m.id} className={m.role === 'user' ? 'text-right' : 'text-left'}>
                  <div
                    className={
                      'inline-block rounded-lg px-3 py-2 ' +
                      (m.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground')
                    }
                  >
                    {m.content}
                  </div>
                </div>
              ))}
              {send.isPending && (
                <div className="text-left">
                  <div className="inline-block rounded-lg bg-secondary px-3 py-2 text-secondary-foreground opacity-70">
                    Thinking...
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          </ScrollArea>
        </div>
        <div className="border-t p-4">
          <div className="mx-auto flex max-w-2xl items-end gap-2">
            <Textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Ask for career guidance..."
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  onSend()
                }
              }}
              rows={3}
            />
            <Button onClick={onSend} disabled={send.isPending}>
              Send
            </Button>
          </div>
        </div>
      </main>
    </>
  )
}

