import fs from 'fs'
import path from 'path'

const plannerPath = path.resolve(process.cwd(), 'data', 'planner.json')
const outPath = path.resolve(process.cwd(), 'data', 'sqlite_migration.sql')

function escape(v: any) {
  if (v === null || v === undefined) return 'NULL'
  if (typeof v === 'number') return String(v)
  const s = String(v).replace(/'/g, "''")
  return `'${s}'`
}

async function main(){
  const raw = fs.readFileSync(plannerPath, 'utf8')
  const data = JSON.parse(raw) as any

  const lines: string[] = []
  lines.push('-- SQLite migration script generated from JSON store')
  lines.push('PRAGMA foreign_keys=OFF;')
  lines.push('\n-- Schema (idempotent)')
  lines.push(`CREATE TABLE IF NOT EXISTS lists (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  emoji TEXT,
  created_at TEXT
);`)
  lines.push(`CREATE TABLE IF NOT EXISTS tasks (
  id TEXT PRIMARY KEY,
  list_id TEXT,
  name TEXT NOT NULL,
  description TEXT,
  date TEXT,
  deadline TEXT,
  reminders TEXT,
  estimate TEXT,
  actual_time TEXT,
  labels TEXT,
  priority TEXT,
  subtasks TEXT,
  recurring TEXT,
  attachment TEXT,
  completed INTEGER,
  created_at TEXT,
  updated_at TEXT
);`)
  lines.push(`CREATE TABLE IF NOT EXISTS subtasks (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  name TEXT NOT NULL,
  done INTEGER,
  created_at TEXT,
  updated_at TEXT
);`)
  lines.push(`CREATE TABLE IF NOT EXISTS labels (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT,
  color TEXT
);`)
  lines.push(`CREATE TABLE IF NOT EXISTS task_labels (
  task_id TEXT NOT NULL,
  label_id TEXT NOT NULL,
  PRIMARY KEY (task_id, label_id)
);`)
  lines.push(`CREATE TABLE IF NOT EXISTS reminders (
  id TEXT PRIMARY KEY,
  task_id TEXT NOT NULL,
  when TEXT NOT NULL,
  type TEXT
);`)
  lines.push(`CREATE TABLE IF NOT EXISTS logs (
  id TEXT PRIMARY KEY,
  task_id TEXT,
  action TEXT,
  timestamp TEXT,
  details TEXT
);`)

  // Insert data by iterating data
  if (data.lists && Array.isArray(data.lists)) {
    for (const l of data.lists) {
      lines.push(`INSERT INTO lists (id, name, color, emoji, created_at) VALUES ('${l.id}','${l.name}','${l.color}','${l.emoji ?? ''}','${l.created_at ?? ''}');`)
    }
  }
  if (data.tasks && Array.isArray(data.tasks)) {
    for (const t of data.tasks) {
      lines.push(`INSERT INTO tasks (id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at) VALUES ('${t.id}','${t.list_id ?? ''}','${t.name}','${t.description ?? ''}','${t.date ?? ''}','${t.deadline ?? ''}','${JSON.stringify(t.reminders ?? [])}','${t.estimate ?? ''}','${t.actual_time ?? ''}','${JSON.stringify(t.labels ?? [])}','${t.priority ?? 'None'}','${JSON.stringify(t.subtasks ?? [])}','${t.recurring ?? ''}','${t.attachment ?? ''}','${t.completed ? 1 : 0}','${t.created_at ?? ''}','${t.updated_at ?? ''}');`)
    }
  }
  if (data.subtasks && Array.isArray(data.subtasks)) {
    for (const s of data.subtasks) {
      lines.push(`INSERT INTO subtasks (id, task_id, name, done, created_at, updated_at) VALUES ('${s.id}','${s.task_id}','${s.name}','${s.done?1:0}','${s.created_at ?? ''}','${s.updated_at ?? ''}');`)
    }
  }
  if (data.labels && Array.isArray(data.labels)) {
    for (const lb of data.labels) {
      lines.push(`INSERT INTO labels (id, name, icon, color) VALUES ('${lb.id}','${lb.name}','${lb.icon ?? ''}','${lb.color ?? ''}');`)
    }
  }
  if (data.task_labels && Array.isArray(data.task_labels)) {
    for (const tl of data.task_labels) {
      lines.push(`INSERT INTO task_labels (task_id, label_id) VALUES ('${tl.task_id}','${tl.label_id}');`)
    }
  }
  if (data.reminders && Array.isArray(data.reminders)) {
    for (const r of data.reminders) {
      lines.push(`INSERT INTO reminders (id, task_id, when, type) VALUES ('${r.id}','${r.task_id}','${r.when}','${r.type ?? ''}');`)
    }
  }
  if (data.logs && Array.isArray(data.logs)) {
    for (const lg of data.logs) {
      lines.push(`INSERT INTO logs (id, task_id, action, timestamp, details) VALUES ('${lg.id}','${lg.task_id}','${lg.action}','${lg.timestamp ?? ''}','${lg.details ?? ''}');`)
    }
  }

  lines.push('\nCOMMIT;')
  fs.writeFileSync(outPath, lines.join('\n'))
  console.log(`SQLite migration SQL written to ${outPath}`)
}

main()
  .catch((e) => { console.error('Migration SQL generation failed', e); process.exit(1) })
