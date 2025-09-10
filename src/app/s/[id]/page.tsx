import { notFound } from 'next/navigation'
import { getCaller } from '@/server/api/caller'

export default async function SessionPage({ params }: { params: { id: string } }) {
  const caller = await getCaller()
  const data = await caller.chat.getSession({ id: params.id })
  if (!data) return notFound()

  return (
    <>
      <aside className="hidden border-r p-4 md:block">
        <div className="mb-4">
          <a className="text-sm text-primary hover:underline" href="/">
            ← All sessions
          </a>
        </div>
        <div className="text-sm font-medium">{data.title}</div>
      </aside>
      <main className="flex h-dvh flex-col">
        <div className="flex-1 p-4">
          <div className="h-[calc(100dvh-9rem)] pr-2 overflow-auto">
            <div className="mx-auto max-w-2xl space-y-4">
              {data.messages.map(m => (
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
            </div>
          </div>
        </div>
        <div className="border-t p-4">
          <form className="mx-auto flex max-w-2xl items-end gap-2" action={`/s/${data.id}/send`} method="POST">
            <textarea
              name="content"
              className="flex min-h-[60px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              placeholder="Ask for career guidance..."
              rows={3}
            />
            <button
              type="submit"
              className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              Send
            </button>
          </form>
        </div>
      </main>
    </>
  )
}
