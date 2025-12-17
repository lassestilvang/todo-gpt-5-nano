import { describe, it, expect } from 'bun:test'

describe('SQLite path integration (real adapter) subtasks', () => {
  it('inserts a list, a task, and a subtask; reads back all', async () => {
    // Must have the real adapter installed; fail fast otherwise
    let Real
    try {
      Real = (await import('../db/sqlite_adapter_real.ts')).default
    } catch {
      throw new Error('True SQLite adapter (native bindings) not available in CI environment. Please enable native bindings to run this test.')
    }

    const adapter = new Real('./data/planner-test.sqlite')

    // Insert a list
    const listId = 'sqlite_sub_list'
    const insertList = adapter.prepare("INSERT INTO lists (id, name, color, emoji, created_at) VALUES (?, ?, ?, ?, ?)")
    insertList.run(listId, 'SQLite Sub List', '#00AAFF', '🔷', new Date().toISOString())

    const list = adapter.prepare("SELECT id, name, color, emoji, created_at FROM lists WHERE id = ?").get(listId)
    expect(list).toBeTruthy()
    if (list) {
      expect(list.name).toBe('SQLite Sub List')
    }

    // Insert a task for the list
    const taskId = 'sqlite_sub_task'
    const insertTask = adapter.prepare("INSERT INTO tasks (id, list_id, name, date, deadline, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)")
    insertTask.run(taskId, listId, 'SQLite Task', null, null, 0, new Date().toISOString(), new Date().toISOString())

    // Subtask
    const subId = 'sqlite_subtask'
    const insertSub = adapter.prepare("INSERT INTO subtasks (id, task_id, name, done, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?)")
    insertSub.run(subId, taskId, 'Subtask A', 0, new Date().toISOString(), new Date().toISOString())

    // Read back task and subtasks
    const tRow = adapter.prepare("SELECT id, name, list_id FROM tasks WHERE id = ?").get(taskId)
    const subs = adapter.prepare("SELECT id, name, done FROM subtasks WHERE task_id = ?").all(taskId)

    expect(tRow).toBeTruthy()
    if (tRow) {
      expect(tRow.name).toBe('SQLite Task')
    }
    expect(Array.isArray(subs)).toBe(true)
    expect(subs.find((s:any)=>s.id===subId)).toBeTruthy()
  })
})
