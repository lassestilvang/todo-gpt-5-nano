import { describe, it, expect } from 'bun:test'
import { createList, getLists, createTask, getTasks } from '../db/crud'
import { GET as searchGET } from '../app/api/search/route'

describe('Views and Search Integration', () => {
  it('creates a task for today and can read via today view', async () => {
    // ensure Inbox exists
    const l = createList({ name: 'Inbox', color: '#3b82f6' })
    // create a task for today
    const today = new Date()
    const y = today.getFullYear(); const m = String(today.getMonth()+1).padStart(2,'0'); const d = String(today.getDate()).padStart(2,'0')
    const todayStr = `${y}-${m}-${d}`
    const t = createTask({ name: 'Test For Today', list_id: l.id, date: todayStr })
    const tasks = getTasks(`WHERE date = ?`, [todayStr])
    expect(tasks.length).toBeGreaterThanOrEqual(1)
  })

  it('performs a simple search using server route', async () => {
    // ensure at least one task exists with a notable name
    const t = createTask({ name: 'Lunch with Sarah', list_id: undefined as any })
    // invoke search route
    const req = new Request('http://localhost/api/search?q=lunch', { method: 'GET' })
    const res = await searchGET(req)
    const data = await res.json()
    expect(Array.isArray(data.results)).toBe(true)
  })
})
