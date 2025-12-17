type ListRow = { id: string; name: string; color: string; emoji?: string; created_at?: string }
type SubtaskRow = { id: string; task_id: string; name: string; done: boolean; created_at?: string; updated_at?: string }
type TaskRow = {
  id: string
  list_id?: string | null
  name: string
  description?: string | null
  date?: string | null
  deadline?: string | null
  reminders?: any[]
  estimate?: string
  actual_time?: string
  labels?: { name: string; icon?: string }[]
  priority?: string
  subtasks?: SubtaskRow[]
  recurring?: string | null
  attachment?: string | null
  completed?: boolean
  created_at?: string
  updated_at?: string
}

export default class InMemorySqliteAdapter {
  private data: {
    lists: ListRow[]
    tasks: TaskRow[]
    subtasks: SubtaskRow[]
    labels: { id: string; name: string; icon?: string; color?: string }[]
    task_labels: Array<{ task_id: string; label_id: string }>
    reminders: Array<{ id: string; task_id: string; when: string; type?: string }>
    logs: Array<{ id: string; task_id: string; action: string; timestamp?: string; details?: string }>
  }

  constructor(seedFromJson: boolean = true) {
    this.data = { lists: [], tasks: [], subtasks: [], labels: [], task_labels: [], reminders: [], logs: [] }
    if (seedFromJson) {
      // Minimal seed: read planner.json if present
      try {
        const planner = require('../data/planner.json')
        if (planner?.lists) {
          for (const l of planner.lists) {
            this.data.lists.push({ id: l.id ?? `list_${Math.random()}`, name: l.name, color: l.color ?? '#666', emoji: l.emoji, created_at: l.created_at })
          }
        }
        if (planner?.tasks) {
          for (const t of planner.tasks) {
            this.data.tasks.push({ id: t.id ?? `task_${Math.random()}`, list_id: t.list_id ?? null, name: t.name, description: t.description ?? null, date: t.date ?? null, deadline: t.deadline ?? null, reminders: t.reminders ?? [], estimate: t.estimate ?? null, actual_time: t.actual_time ?? null, labels: t.labels ?? [], priority: t.priority ?? 'None', subtasks: t.subtasks ?? [], recurring: t.recurring ?? null, attachment: t.attachment ?? null, completed: !!t.completed, created_at: t.created_at ?? new Date().toISOString(), updated_at: t.updated_at ?? new Date().toISOString() })
          }
        }
      } catch {
        // ignore
      }
    }
  }

  // Query helpers
  exec(_sql: string) {
    // No-op
  }

  health() { return true }

  prepare(sql: string) {
    const self = this
    return {
      run: function(...params: any[]) {
        const s = sql.trim()
        if (/INSERT INTO lists/.test(s)) {
          const [id, name, color, emoji] = params
          self.data.lists.push({ id, name, color, emoji, created_at: new Date().toISOString() })
          return
        }
        if (/INSERT INTO tasks/.test(s)) {
          const [id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at] = params
          self.data.tasks.push({ id, list_id, name, description, date, deadline, reminders: reminders ?? [], estimate, actual_time, labels: labels ?? [], priority: priority ?? 'None', subtasks: subtasks ?? [], recurring: recurring ?? null, attachment: attachment ?? null, completed: !!completed, created_at, updated_at })
          return
        }
        if (/INSERT INTO logs/.test(s)) {
          const [id, task_id, action, details, timestamp] = params
          self.data.logs.push({ id, task_id, action, timestamp: timestamp ?? new Date().toISOString(), details })
          return
        }
      },
      all: function(...params: any[]) {
        const s = sql.trim()
        if (/SELECT .*FROM lists/.test(s)) {
          return self.data.lists.map(l => ({ id: l.id, name: l.name, color: l.color, emoji: l.emoji, created_at: l.created_at }))
        }
        if (/SELECT \* FROM tasks/.test(s)) {
          return self.data.tasks
        }
        if (/SELECT \* FROM subtasks/.test(s)) {
          const [task_id] = params
          return self.data.subtasks.filter(st => st.task_id === task_id)
        }
        if (/SELECT .*FROM labels/.test(s)) {
          return self.data.labels
        }
        if (/SELECT \* FROM logs/.test(s)) {
          const [task_id] = params
          return self.data.logs.filter(l => l.task_id === task_id)
        }
        return []
      },
      get: function(...params: any[]) {
        const rows = this.all(...params)
        return rows[0] ?? null
      }
    }
  }
}
