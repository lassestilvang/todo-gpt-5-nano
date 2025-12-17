import db from '../db/client'

function rndId(prefix: string = 'id') {
  return `${prefix}_${Math.random().toString(36).slice(2,9)}`
}

async function main(){
  // Fetch tasks that have legacy JSON fields populated
  const tasks = db.prepare('SELECT id, subtasks, labels, reminders FROM tasks').all()
  for (const t of tasks) {
    const taskId = t.id
    // Subtasks from JSON
    let subtasks: any[] = []
    try { subtasks = t.subtasks ? JSON.parse(t.subtasks) : [] } catch { subtasks = [] }
    for (const s of subtasks) {
      const label = s.name ?? s.id ?? rndId('sub')
      const subName = typeof s.name === 'string' ? s.name : String(label)
      const done = !!s.done
      // prevent duplicates
      const exists = db.prepare('SELECT 1 FROM subtasks WHERE task_id = ? AND name = ?').get(taskId, subName)
      if (!exists) {
        const subId = rndId('sub')
        db.prepare('INSERT INTO subtasks (id, task_id, name, done) VALUES (?, ?, ?, ?)').run(subId, taskId, subName, done ? 1 : 0)
      }
    }
    // Labels from JSON
    let labels: any[] = []
    try { labels = t.labels ? JSON.parse(t.labels) : [] } catch { labels = [] }
    for (const lb of labels) {
      const name = lb.name ?? 'Label'
      const icon = lb.icon ?? ''
      const color = lb.color ?? ''
      const labelId = db.prepare('SELECT id FROM labels WHERE name = ?').get(name)?.id
      let finalLabelId = labelId
      if (!finalLabelId) {
        finalLabelId = rndId('label')
        db.prepare('INSERT INTO labels (id, name, icon, color) VALUES (?, ?, ?, ?)').run(finalLabelId, name, icon, color)
      }
      // link to task if not exists
      const exists = db.prepare('SELECT 1 FROM task_labels WHERE task_id = ? AND label_id = ?').get(taskId, finalLabelId)
      if (!exists) {
        db.prepare('INSERT INTO task_labels (task_id, label_id) VALUES (?, ?)').run(taskId, finalLabelId)
      }
    }
    // Reminders from JSON
    let reminders: any[] = []
    try { reminders = t.reminders ? JSON.parse(t.reminders) : [] } catch { reminders = [] }
    for (const r of reminders) {
      const when = typeof r === 'string' ? r : String(r)
      const exists = db.prepare('SELECT 1 FROM reminders WHERE task_id = ? AND when = ?').get(taskId, when)
      if (!exists) {
        const remId = rndId('rem')
        db.prepare('INSERT INTO reminders (id, task_id, when, type) VALUES (?, ?, ?, ?)').run(remId, taskId, when, null)
      }
    }
    // Optional: clear legacy JSON fields to avoid duplication in reads
    db.prepare('UPDATE tasks SET subtasks = NULL, labels = NULL, reminders = NULL WHERE id = ?').run(taskId)
  }
  console.log('Normalization migration complete')
}

main().catch(e => {
  console.error('Migration failed', e)
  process.exit(1)
})
