import { getCaller } from '@/server/api/caller'

export default async function HomePage() {
  const caller = await getCaller()
  const { items } = await caller.chat.listSessions({ limit: 20 })

  return (
    <>
      <aside className="hidden border-r p-4 md:block">
        <form action="/s/new" method="POST" className="mb-4 flex gap-2">
          <input
            name="title"
            placeholder="New chat title"
            className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            New
          </button>
        </form>
        <div className="h-[calc(100dvh-5rem)] pr-2 overflow-auto">
          <div className="space-y-1">
            {items.map(s => (
              <a key={s.id} className="block rounded-md px-2 py-2 hover:bg-accent" href={`/s/${s.id}`}>
                <div className="text-sm font-medium">{s.title}</div>
                <div className="text-xs text-muted-foreground">{new Date(s.createdAt as any).toLocaleString()}</div>
              </a>
            ))}
          </div>
        </div>
      </aside>
      <main className="flex flex-col items-center justify-center gap-4 p-6 text-center">
        <h1 className="text-2xl font-semibold">Career Counselor Chat</h1>
        <p className="text-muted-foreground">Start a new conversation or pick one from the sidebar.</p>
        <form action="/s/new" method="POST">
          <button
            type="submit"
            className="inline-flex h-9 items-center justify-center whitespace-nowrap rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Start New Chat
          </button>
        </form>
      </main>
    </>
  )
}
