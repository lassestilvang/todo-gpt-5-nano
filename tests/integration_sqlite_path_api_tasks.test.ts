import { describe, it, expect } from 'bun:test'

describe('SQLite path API (Tasks)', () => {
  it('creates a list and a task via API under SQLite path', async () => {
    process.env.DB_BACKEND = 'sqlite'
    const { POST: postList } = await import('../app/api/lists/route')
    const { POST: postTask } = await import('../app/api/tasks/route')
    // Create a list to attach the task
    const reqList = new Request('http://localhost/api/lists', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'SQLite API List 2', color: '#8b5cf6', emoji: '🗂️' })
    })
    const resList = await postList(reqList)
    const list = await resList.json()

    // Create a task on that list
    const reqTask = new Request('http://localhost/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'SQLite API Task',
        description: 'Task via API on SQLite path',
        date: '',
        listId: list?.id,
        priority: 'Medium',
        subtasks: [],
        reminders: [],
        labels: [],
        completed: false
      })
    })
    const resTask = await postTask(reqTask)
    const task = await resTask.json()
    expect(task).toHaveProperty('id')

    // Read all tasks
    const { GET: getTasks } = await import('../app/api/tasks/route')
    const reqGet = new Request('http://localhost/api/tasks?view=all', { method: 'GET' })
    const resList = await getTasks(reqGet)
    const tasks = await resList.json()
    expect(Array.isArray(tasks)).toBe(true)
  })
})
