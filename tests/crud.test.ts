import { describe, it, expect } from 'bun:test'
import { createList, getLists } from '../db/crud'
import { createTask, getTasks } from '../db/crud'

describe('Lists CRUD', () => {
  it('creates and retrieves a list', () => {
    const l = createList({ name: 'Inbox', color: '#3b82f6', emoji: '📥' })
    expect(l.name).toBe('Inbox')
    const lists = getLists()
    expect(lists.length).toBeGreaterThanOrEqual(1)
  })
})


describe('Tasks CRUD', () => {
  it('creates and retrieves a simple task for today', () => {
    const t = createTask({ name: 'Sample Task', list_id: undefined })
    const today = new Date()
    const y = today.getFullYear(); const m = String(today.getMonth()+1).padStart(2,'0'); const d = String(today.getDate()).padStart(2,'0')
    const todayStr = `${y}-${m}-${d}`
    const tasks = getTasks(`WHERE date = ?`, [todayStr])
    expect(tasks.length).toBeGreaterThanOrEqual(1)
  })
})


describe('Tasks with relations', () => {
  it('creates a task with subtasks, labels and reminders and reads back', () => {
    const l = createList({ name: 'Work', color: '#10b981' })
    const t = createTask({
      name: 'Review Q4 plan',
      list_id: l.id,
      date: new Date().toISOString().slice(0,10),
      subtasks: [
        { name: 'Prepare slides', done: false },
        { name: 'Send invites', done: true }
      ],
      labels: [ { name: 'Review', icon: '📝' }, { name: 'Calendar', icon: '🗓️' } ],
      reminders: [ new Date().toISOString() ]
    } as any)
    // read back by today view
    const today = new Date()
    const y = today.getFullYear(); const m = String(today.getMonth()+1).padStart(2,'0'); const d = String(today.getDate()).padStart(2,'0')
    const todayStr = `${y}-${m}-${d}`
    const tasks = getTasks(`WHERE id = ?`, [t.id])
    expect(tasks.length).toBeGreaterThanOrEqual(1)
  })
})
