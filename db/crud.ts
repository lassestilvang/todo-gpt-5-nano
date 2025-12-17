import db from './client'
import { List, Task, Log } from './models'

function rndId(prefix: string = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2,9)}`
}

function ensureLabelExists(name: string, icon?: string, color?: string) {
  // Try to find existing label by name
  const row = db.prepare('SELECT id FROM labels WHERE name = ?').get(name)
  if (row) return row.id
  const id = rndId('label')
  db.prepare('INSERT INTO labels (id, name, icon, color) VALUES (?, ?, ?, ?)').run(id, name, icon ?? null, color ?? null)
  return id
}

export function createList(input: { name: string; color: string; emoji?: string }){
  const id = rndId('list')
  db.prepare('INSERT INTO lists (id, name, color, emoji) VALUES (?, ?, ?, ?)').run(id, input.name, input.color, input.emoji ?? null)
  return { id, ...input }
}

export function getLists(): List[] {
  const rows = db.prepare('SELECT id, name, color, emoji, created_at FROM lists').all()
  return rows.map((r: any) => ({ id: r.id, name: r.name, color: r.color, emoji: r.emoji, created_at: r.created_at }))
}

export function createTask(input: Partial<Task> & { name: string; list_id?: string }){
  const id = rndId('task')
  const fields = [id, input.list_id ?? null, input.name, input.description ?? null, input.date ?? null, input.deadline ?? null, JSON.stringify(input.reminders ?? []), input.estimate ?? null, input.actual_time ?? null, JSON.stringify(input.labels ?? []), input.priority ?? 'None', JSON.stringify(input.subtasks ?? []), input.recurring ?? null, input.attachment ?? null, input.completed ? 1 : 0, new Date().toISOString(), new Date().toISOString()]
  const sql = `INSERT INTO tasks (id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  db.prepare(sql).run(...fields)
  // Normalize may be provided
  if (input.subtasks && Array.isArray(input.subtasks)){
    for (const st of input.subtasks as any[]) {
      const subId = st.id ?? rndId('sub')
      db.prepare('INSERT INTO subtasks (id, task_id, name, done) VALUES (?, ?, ?, ?)').run(subId, id, st.name, st.done ? 1 : 0)
    }
  }
  if (input.labels && Array.isArray(input.labels)){
    for (const lb of input.labels as any[]) {
      // ensure label exists
      const labelId = ensureLabelExists(lb.name, lb.icon, lb.color)
      db.prepare('INSERT OR IGNORE INTO task_labels (task_id, label_id) VALUES (?, ?)').run(id, labelId)
    }
  }
  if (input.reminders && Array.isArray(input.reminders)){
    for (const r of input.reminders as any[]) {
      const remId = rndId('rem')
      db.prepare('INSERT INTO reminders (id, task_id, when, type) VALUES (?, ?, ?, ?)').run(remId, id, r, null)
    }
  }
  return { id, name: input.name }
}

export function getListsAsTasks(){ return [] as any[] }

export function getTasks(whereClause: string = '', params: any[] = []){
  const sql = `SELECT * FROM tasks ${whereClause}`
  const rows = db.prepare(sql).all(...params)
  // Assemble relations (normalize+legacy mix)
  const assembled = rows.map((row: any) => {
    // Legacy JSON fields
    let subtasksFromJson: any[] = []
    try { subtasksFromJson = row.subtasks ? JSON.parse(row.subtasks) : [] } catch {}
    let labelsFromJson: any[] = []
    try { labelsFromJson = row.labels ? JSON.parse(row.labels) : [] } catch {}
    let remindersFromJson: any[] = []
    try { remindersFromJson = row.reminders ? JSON.parse(row.reminders) : [] } catch {}

    // Normalize: fetch from normalized tables
    const subs = db.prepare('SELECT id, name, done FROM subtasks WHERE task_id = ?').all(row.id).map((s: any)=>({ id: s.id, name: s.name, done: !!s.done }))
    const labelRows = db.prepare('SELECT l.id, l.name, l.icon, l.color FROM labels l JOIN task_labels tl ON tl.label_id = l.id WHERE tl.task_id = ?').all(row.id)
    const labels = labelRows.map((l: any)=>({ id: l.id, name: l.name, icon: l.icon, color: l.color }))
    const reminders = db.prepare('SELECT id, when, type FROM reminders WHERE task_id = ?').all(row.id).map((r: any)=>({ id: r.id, when: r.when, type: r.type }))

    // Prefer normalized data when available, otherwise merge legacy JSON
    const finalSubtasks = subs.length ? subs : subtasksFromJson
    const finalLabels = labels.length ? labels : labelsFromJson
    const finalReminders = reminders.length ? reminders : remindersFromJson

    return {
      id: row.id,
      list_id: row.list_id,
      name: row.name,
      description: row.description,
      date: row.date,
      deadline: row.deadline,
      reminders: finalReminders,
      estimate: row.estimate,
      actual_time: row.actual_time,
      labels: finalLabels,
      priority: row.priority,
      subtasks: finalSubtasks,
      recurring: row.recurring,
      attachment: row.attachment,
      completed: !!row.completed,
      created_at: row.created_at,
      updated_at: row.updated_at
    }
  })
  return assembled
}

export function logTaskChange(task_id: string, action: string, details?: string){
  const id = `log_${Math.random().toString(36).slice(2,9)}`
  db.prepare('INSERT INTO logs (id, task_id, action, details, timestamp) VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)').run(id, task_id, action, details ?? null)
  return true
}

export function getLogsForTask(task_id: string): Log[] {
  const rows = db.prepare('SELECT id, task_id, action, timestamp, details FROM logs WHERE task_id = ? ORDER BY timestamp DESC').all(task_id)
  return rows.map((r: any) => ({ id: r.id, task_id: r.task_id, action: r.action, timestamp: r.timestamp, details: r.details }))
}

export function updateTask(id: string, updates: Partial<Task>){
  const fields = [] as string[]
  const values: any[] = []
  if (updates.name !== undefined){ fields.push('name = ?'); values.push(updates.name) }
  if (updates.description !== undefined){ fields.push('description = ?'); values.push(updates.description) }
  if (updates.date !== undefined){ fields.push('date = ?'); values.push(updates.date) }
  if (updates.deadline !== undefined){ fields.push('deadline = ?'); values.push(updates.deadline) }
  if (updates.reminders !== undefined){ fields.push('reminders = ?'); values.push(JSON.stringify(updates.reminders)) }
  if (updates.estimate !== undefined){ fields.push('estimate = ?'); values.push(updates.estimate) }
  if (updates.actual_time !== undefined){ fields.push('actual_time = ?'); values.push(updates.actual_time) }
  if (updates.labels !== undefined){ fields.push('labels = ?'); values.push(JSON.stringify(updates.labels)) }
  if (updates.priority !== undefined){ fields.push('priority = ?'); values.push(updates.priority) }
  if (updates.subtasks !== undefined){ fields.push('subtasks = ?'); values.push(JSON.stringify(updates.subtasks)) }
  if (updates.recurring !== undefined){ fields.push('recurring = ?'); values.push(updates.recurring) }
  if (updates.attachment !== undefined){ fields.push('attachment = ?'); values.push(updates.attachment) }
  if (updates.completed !== undefined){ fields.push('completed = ?'); values.push(updates.completed ? 1 : 0) }
  if (fields.length === 0) return false
  fields.push('updated_at = ?'); values.push(new Date().toISOString())
  const sql = `UPDATE tasks SET ${fields.join(', ')} WHERE id = ?` 
  values.push(id)
  db.prepare(sql).run(...values)
  logTaskChange(id, 'update', JSON.stringify(updates))
  return true
}
