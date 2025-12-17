import { getLists, getTasks } from '../../../db/crud'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const q = (url.searchParams.get('q') ?? '').toLowerCase()
  if (!q) return new Response(JSON.stringify({ results: [] }), { headers: { 'Content-Type': 'application/json' } })
  const tasks = getTasks('', []) as any[]
  const results = tasks.filter(t => {
    const hay = `${t.name ?? ''} ${t.description ?? ''}`.toLowerCase()
    return hay.includes(q)
  })
  return new Response(JSON.stringify({ results }), { headers: { 'Content-Type': 'application/json' } })
}
