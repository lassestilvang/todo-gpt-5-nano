import { describe, it, expect } from 'bun:test'

describe('SQLite path API (Lists)', () => {
  it('creates and reads a list via API under SQLite path', async () => {
    // enforce sqlite backend in test
    process.env.DB_BACKEND = 'sqlite'
    const { POST: postList, GET: getLists } = await import('../app/api/lists/route')

    const reqPost = new Request('http://localhost/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'SQLite API List', color: '#1e90ff', emoji: '🗂️' })
    })
    const res = await postList(reqPost)
    const created = await res.json()
    expect(created).toHaveProperty('id')

    const reqGet = new Request('http://localhost/api/lists', { method: 'GET' })
    const res2 = await getLists(reqGet)
    const data = await res2.json()
    expect(Array.isArray(data)).toBe(true)
    const found = data.find((l: any) => l.id === created.id)
    expect(found).toBeTruthy()
  })
})
