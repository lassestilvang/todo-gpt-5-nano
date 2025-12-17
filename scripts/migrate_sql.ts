#!/usr/bin/env bun tsx
import { readFile, writeFile } from 'fs/promises'
import path from 'path'

async function main() {
  const plannerPath = path.resolve(process.cwd(), 'data/planner.json')
  let plannerRaw: string
  try {
    plannerRaw = await readFile(plannerPath, 'utf8')
  } catch (err) {
    console.error('Failed to read planner.json at', plannerPath)
    process.exit(1)
  }
  let planner: any
  try {
    planner = JSON.parse(plannerRaw)
  } catch (err) {
    console.error('Failed to parse planner.json as JSON')
    process.exit(1)
  }

  // Helper to safely escape and format SQL values
  const sqlValue = (v: any): string => {
    if (v === null || v === undefined) return 'NULL'
    if ( typeof v === 'boolean' ) return v ? '1' : '0'
    if ( typeof v === 'number' ) return String(v)
    const s = String(v).replace(/'/g, "''")
    return `'${s}'`
  }

  const lines: string[] = []

  // Plans for tables: lists, tasks, subtasks, labels, task_labels, reminders, logs
  if (Array.isArray(planner.lists)) {
    for (const l of planner.lists) {
      lines.push(`INSERT INTO lists (id, name, color, emoji, created_at) VALUES (${sqlValue(l.id)}, ${sqlValue(l.name)}, ${sqlValue(l.color)}, ${sqlValue(l.emoji)}, ${sqlValue(l.created_at)});`)
    }
  }

  if (Array.isArray(planner.tasks)) {
    for (const t of planner.tasks) {
      lines.push(`INSERT INTO tasks (id, list_id, name, description, date, deadline, reminders, estimate, actual_time, labels, priority, subtasks, recurring, attachment, completed, created_at, updated_at) VALUES (${sqlValue(t.id)}, ${sqlValue(t.list_id ?? null)}, ${sqlValue(t.name)}, ${sqlValue(t.description ?? null)}, ${sqlValue(t.date ?? null)}, ${sqlValue(t.deadline ?? null)}, ${sqlValue(t.reminders ?? null)}, ${sqlValue(t.estimate ?? null)}, ${sqlValue(t.actual_time ?? null)}, ${sqlValue(t.labels ?? null)}, ${sqlValue(t.priority ?? null)}, ${sqlValue(t.subtasks ?? null)}, ${sqlValue(t.recurring ?? null)}, ${sqlValue(t.attachment ?? null)}, ${sqlValue(!!t.completed)}, ${sqlValue(t.created_at ?? null)}, ${sqlValue(t.updated_at ?? null)});`)
    }
  }

  if (Array.isArray(planner.subtasks)) {
    for (const s of planner.subtasks) {
      lines.push(`INSERT INTO subtasks (id, task_id, name, done, created_at, updated_at) VALUES (${sqlValue(s.id)}, ${sqlValue(s.task_id)}, ${sqlValue(s.name)}, ${sqlValue(!!s.done)}, ${sqlValue(s.created_at ?? null)}, ${sqlValue(s.updated_at ?? null)});`)
    }
  }

  if (Array.isArray(planner.labels)) {
    for (const lb of planner.labels) {
      lines.push(`INSERT INTO labels (id, name, icon, color) VALUES (${sqlValue(lb.id)}, ${sqlValue(lb.name)}, ${sqlValue(lb.icon ?? null)}, ${sqlValue(lb.color ?? null)});`)
    }
  }

  if (Array.isArray(planner.task_labels)) {
    for (const tl of planner.task_labels) {
      // assume fields: task_id, label_id
      lines.push(`INSERT INTO task_labels (task_id, label_id) VALUES (${sqlValue(tl.task_id)}, ${sqlValue(tl.label_id)});`)
    }
  }

  if (Array.isArray(planner.reminders)) {
    for (const r of planner.reminders) {
      lines.push(`INSERT INTO reminders (id, task_id, when, type) VALUES (${sqlValue(r.id)}, ${sqlValue(r.task_id)}, ${sqlValue(r.when)}, ${sqlValue(r.type ?? null)});`)
    }
  }

  if (Array.isArray(planner.logs)) {
    for (const lg of planner.logs) {
      lines.push(`INSERT INTO logs (id, task_id, action, timestamp, details) VALUES (${sqlValue(lg.id)}, ${sqlValue(lg.task_id)}, ${sqlValue(lg.action)}, ${sqlValue(lg.timestamp ?? null)}, ${sqlValue(lg.details ?? null)});`)
    }
  }

  const outPath = path.resolve(process.cwd(), 'data/sqlite_migration.sql')
  const content = lines.join('\n') + (lines.length ? '\n' : '')
  try {
    await writeFile(outPath, content, 'utf8')
    console.log(`Wrote ${outPath} with ${lines.length} statements`)
  } catch (err) {
    console.error('Failed to write migration SQL', err)
    process.exit(1)
  }
}

main()
