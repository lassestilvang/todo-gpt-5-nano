import fs from 'fs'
import path from 'path'

type ListRow = { id: string; name: string; color: string; emoji?: string; created_at?: string }
type TaskRow = {
  id: string
  list_id?: string | null
  name: string
  description?: string | null
  date?: string | null
  deadline?: string | null
  reminders?: string[]
  estimate?: string
  actual_time?: string
  labels?: { name: string; icon?: string }[]
  priority?: string
  subtasks?: { id?: string; name: string; done: boolean }[]
  recurring?: string | null
  attachment?: string | null
  completed?: boolean
  created_at?: string
  updated_at?: string
}
type SubtaskRow = { id: string; task_id: string; name: string; done: boolean; created_at?: string; updated_at?: string }
type LabelRow = { id: string; name: string; icon?: string; color?: string }
type TaskLabelRow = { task_id: string; label_id: string }
type ReminderRow = { id: string; task_id: string; when: string; type?: string }
type LogRow = { id: string; task_id: string; action: string; timestamp?: string; details?: string }
type DataStore = {
  lists: ListRow[]
  tasks: TaskRow[]
  subtasks: SubtaskRow[]
  labels: LabelRow[]
  task_labels: TaskLabelRow[]
  reminders: ReminderRow[]
  logs: LogRow[]
}

export default class JsonDb {
  path: string
  data: DataStore

  constructor(dbPath: string) {
    this.path = path.resolve(dbPath)
    try { this.load() } catch { this.initEmpty() }
  }

  initEmpty(){
    this.data = { lists: [], tasks: [], subtasks: [], labels: [], task_labels: [], reminders: [], logs: [] }
    this.ensureDir()
    this.save()
  }

  ensureDir(){
    const dir = path.dirname(this.path)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  }

  load(){
    if (!fs.existsSync(this.path)) { this.initEmpty(); return }
    const raw = fs.readFileSync(this.path, 'utf8')
    this.data = JSON.parse(raw) as DataStore
  }

  save(){
    fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2))
  }

  exec(sql: string){ /* no-op for compatibility */ }

  prepare(sql: string){
    const self = this
    return {
      run: function(...params: any[]) {
        // Only support the subset we need (INSERT/UPDATE into known tables)
        const s = sql.trim()
        if (s.startsWith('INSERT INTO lists')) {
          const [id, name, color, emoji] = params
          const exists = self.data.lists.find(l => l.id === id)
          if (!exists) self.data.lists.push({ id, name, color, emoji: emoji ?? null, created_at: new Date().toISOString() })
          self.save();
          return
        }
        if (s.startsWith('INSERT INTO tasks')) {
          const [id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at] = params
          self.data.tasks.push({ id, list_id, name, description, date, deadline, reminders: reminders ?? [], estimate, actual_time, labels: labels ?? [], priority: priority ?? 'None', subtasks: subtasks ?? [], recurring: recurring ?? null, attachment: attachment ?? null, completed: !!completed, created_at: created_at ?? new Date().toISOString(), updated_at: updated_at ?? new Date().toISOString() })
          self.save();
          return
        }
        if (s.startsWith('INSERT INTO logs')) {
          const [id, task_id, action, details, timestamp] = params
          self.data.logs.push({ id, task_id, action, timestamp: timestamp ?? new Date().toISOString(), details })
          self.save();
          return
        }
        if (s.startsWith('UPDATE tasks SET')) {
          // naive parse: last param is id
          const id = params[params.length - 1]
          const fields = sql.substring(sql.indexOf('SET') + 3, sql.indexOf('WHERE')).split(',').map(x => x.trim())
          const t = self.data.tasks.find(x => x.id === id)
          if (t) {
            // map each assignment in order
            let idx = 0
            for (const f of fields) {
              const key = f.split('=')[0].trim()
              const val = params[idx]
              // convert some known keys to proper property names
              const prop = key === 'actual_time' ? 'actual_time' : key
              ;(t as any)[prop] = val
              idx++
            }
            t.updated_at = new Date().toISOString()
          }
          self.save();
          return
        }
        if (s.startsWith('INSERT INTO subtasks')) {
          const [id, task_id, name, done] = params
          self.data.subtasks.push({ id: id ?? Math.random().toString(), task_id, name, done: done ? 1 : 0, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })
          self.save();
          return
        }
        if (s.startsWith('INSERT INTO labels')) {
          const [id, name, icon, color] = params
          self.data.labels.push({ id, name, icon, color })
          self.save();
          return
        }
        if (s.startsWith('INSERT INTO task_labels')) {
          const [task_id, label_id] = params
          self.data.task_labels.push({ task_id, label_id })
          self.save();
          return
        }
        if (s.startsWith('INSERT INTO reminders')) {
          const [id, task_id, when, type] = params
          self.data.reminders.push({ id, task_id, when, type })
          self.save();
          return
        }
        // Legacy: ignore unknown inserts
      },
      all: function(...params: any[]) {
        // Very small SQL interpreter for reads
        const s = sql.trim()
        if (s.startsWith('SELECT * FROM lists')) {
          return self.data.lists.map(l => ({ id: l.id, name: l.name, color: l.color, emoji: l.emoji, created_at: l.created_at }))
        }
        if (s.startsWith('SELECT id, name, color, emoji, created_at FROM lists')) {
          return self.data.lists.map(l => ({ id: l.id, name: l.name, color: l.color, emoji: l.emoji, created_at: l.created_at }))
        }
        if (s.startsWith('SELECT * FROM tasks')) {
          // naive where handling using params
          if (sql.includes('WHERE date = ?')) {
            const [d] = params
            return self.data.tasks.filter(t => t.date === d)
          }
          if (sql.includes('WHERE date BETWEEN ? AND ?')) {
            const [start, end] = params
            return self.data.tasks.filter(t => t.date >= start && t.date <= end)
          }
          if (sql.includes('WHERE date IS NOT NULL')) {
            return self.data.tasks.filter(t => t.date != null)
          }
          return self.data.tasks
        }
        if (s.startsWith('SELECT * FROM subtasks')) {
          const [task_id] = params
          return self.data.subtasks.filter(s => s.task_id === task_id)
        }
        if (s.startsWith('SELECT 1 FROM labels WHERE name = ?')) {
          const [name] = params
          const found = self.data.labels.find(l => l.name === name)
          return found ? [{ exists: 1 }] : []
        }
        if (s.startsWith('SELECT * FROM logs')) {
          const [task_id] = params
          return self.data.logs.filter(l => l.task_id === task_id)
        }
        // generic: return empty array
        return []
      },
      get: function(...params: any[]) {
        const rows = this.all(...params)
        return rows[0] ?? null
      }
    }
  }
}
