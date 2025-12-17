import { getLists, createList } from '../../../db/crud'
import { ListInputSchema } from '../utils/validation'

export async function GET() {
  const lists = getLists()
  return new Response(JSON.stringify(lists), { headers: { 'Content-Type': 'application/json' } })
}

export async function POST(req: Request) {
  const body = await req.json()
  try {
    const valid = ListInputSchema.parse(body)
    const list = createList({ name: valid.name, color: valid.color, emoji: valid.emoji })
    return new Response(JSON.stringify(list), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid input', details: e instanceof Error ? e.message : String(e) }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
}
