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

type LabelRow = { id: string; name: string; icon?: string; color?: string }

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
        // ignore seed from json if not present
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
        // Insert into lists
        if (/INSERT INTO lists/.test(s)) {
          const vals = params
          // expect [id, name, color, emoji]
          const [id, name, color, emoji] = vals
          self.data.lists.push({ id, name, color, emoji, created_at: new Date().toISOString() })
          return
        }
        // Insert into tasks
        if (/INSERT INTO tasks/.test(s)) {
          const [id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at] = params
          self.data.tasks.push({ id, list_id, name, description, date, deadline, reminders: typeof reminders === 'string' ? JSON.parse(reminders) : reminders ?? [], estimate, actual_time, labels: typeof labels === 'string' ? JSON.parse(labels) : labels ?? [], priority, subtasks: typeof subtasks === 'string' ? JSON.parse(subtasks) : subtasks ?? [], recurring, attachment, completed: !!completed, created_at, updated_at })
          return
        }
        // Insert into logs
        if (/INSERT INTO logs/.test(s)) {
          const [id, task_id, action, details, timestamp] = params
          self.data.logs.push({ id, task_id, action, timestamp: timestamp ?? new Date().toISOString(), details })
          return
        }
        // Subtasks direct insert (legacy path)
        if (/INSERT INTO subtasks/.test(s)) {
          const [id, task_id, name, done] = params
          self.data.subtasks.push({ id: id ?? `sub_${Math.random()}`, task_id, name, done: !!done, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          return
        }
        // Labels direct insert
        if (/INSERT INTO labels/.test(s)) {
          const [id, name, icon, color] = params
          self.data.labels.push({ id, name, icon, color })
          return
        }
        if (/INSERT INTO task_labels/.test(s)) {
          const [task_id, label_id] = params
          self.data.task_labels.push({ task_id, label_id })
          return
        }
        if (/INSERT INTO reminders/.test(s)) {
          const [id, task_id, when, type] = params
          self.data.reminders.push({ id, task_id, when, type })
          return
        }
      },
      all: function(...params: any[]) {
        const s = sql.trim()
        // Read lists
        if (/SELECT .*FROM lists/.test(s)) {
          return self.data.lists.map(l => ({ id: l.id, name: l.name, color: l.color, emoji: l.emoji, created_at: l.created_at }))
        }
        if (/SELECT id, name, color, emoji, created_at FROM lists/.test(s)) {
          return self.data.lists.map(l => ({ id: l.id, name: l.name, color: l.color, emoji: l.emoji, created_at: l.created_at }))
        }
        // Read all tasks
        if (/SELECT \* FROM tasks/.test(s) || /SELECT .*FROM tasks/.test(s)) {
          // naive WHERE handling
          if (s.includes('WHERE date = ?')) {
            const [d] = params
            return self.data.tasks.filter(t => t.date === d)
          }
          if (s.includes('WHERE date BETWEEN ? AND ?')) {
            const [start, end] = params
            return self.data.tasks.filter(t => t.date >= start && t.date <= end)
          }
          if (s.includes('WHERE date IS NOT NULL')) {
            return self.data.tasks.filter(t => t.date != null)
          }
          return self.data.tasks
        }
        // Subtasks for a task
        if (/SELECT \* FROM subtasks/.test(s)) {
          // expect WHERE task_id = ? or no clause
          if (s.includes('WHERE')) {
            const [task_id] = params
            return self.data.subtasks.filter(st => st.task_id === task_id)
          }
          return self.data.subtasks
        }
        if (/SELECT 1 FROM labels/.test(s)) {
          const [name] = params
          const found = self.data.labels.find(l => l.name === name)
          return found ? [{ exists: 1 }] : []
        }
        if (/SELECT \* FROM logs/.test(s)) {
          const [task_id] = params
          return self.data.logs.filter(l => l.task_id === task_id)
        }
        return []
      },
      get: function(...params: any[]) {
        const rows = this.all(...params)
        return rows && rows.length ? rows[0] : null
      }
    }
  }
}
