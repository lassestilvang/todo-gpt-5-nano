import { createTask, getTasks, logTaskChange } from '../../../db/crud'
import { TaskInputSchema } from '../utils/validation'

export async function GET(req: Request) {
  const url = new URL(req.url)
  const view = url.searchParams.get('view') ?? 'today'
  const showCompleted = url.searchParams.get('showCompleted') !== 'false'

  // Build simple time-bound query based on view
  let where = ''
  const today = new Date();
  const y = today.getFullYear();
  const m = String(today.getMonth()+1).padStart(2, '0');
  const d = String(today.getDate()).padStart(2, '0');
  const todayStr = `${y}-${m}-${d}`

  if (view === 'today') {
    where = ` WHERE date = ?`;
    return new Response(JSON.stringify(getTasks(where, [todayStr])), { headers: { 'Content-Type': 'application/json' } })
  } else if (view === 'week') {
    const next7 = new Date(); next7.setDate(today.getDate()+7)
    const nextStrYear = next7.getFullYear();
    const nextStrMonth = String(next7.getMonth()+1).padStart(2,'0')
    const nextStrDay = String(next7.getDate()).padStart(2,'0')
    const nextStr = `${nextStrYear}-${nextStrMonth}-${nextStrDay}`
    where = ` WHERE date BETWEEN ? AND ?`;
    return new Response(JSON.stringify(getTasks(where, [todayStr, nextStr])), { headers: { 'Content-Type': 'application/json' } })
  } else if (view === 'upcoming') {
    where = ` WHERE date IS NOT NULL`;
    return new Response(JSON.stringify(getTasks(where, [])), { headers: { 'Content-Type': 'application/json' } })
  } else {
    // all
    where = ''
    return new Response(JSON.stringify(getTasks(where, [])), { headers: { 'Content-Type': 'application/json' } })
  }
}

export async function POST(req: Request) {
  const body = await req.json()
  try {
    const valid = TaskInputSchema.parse({
      name: body.name,
      description: body.description,
      date: body.date,
      listId: body.listId,
      deadline: body.deadline,
      reminders: body.reminders,
      estimate: body.estimate,
      actualTime: body.actualTime,
      labels: body.labels,
      priority: body.priority,
      subtasks: body.subtasks,
      recurring: body.recurring,
      attachment: body.attachment,
      completed: body.completed
    })
    const task = createTask({
      name: valid.name,
      list_id: valid.listId,
      description: valid.description,
      date: valid.date,
      deadline: valid.deadline,
      reminders: valid.reminders,
      estimate: valid.estimate,
      actual_time: valid.actualTime,
      labels: valid.labels,
      priority: valid.priority,
      subtasks: valid.subtasks,
      recurring: valid.recurring,
      attachment: valid.attachment,
      completed: valid.completed
    })
    logTaskChange(task.id, 'create', JSON.stringify(body))
    return new Response(JSON.stringify(task), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid input', details: e instanceof Error ? e.message : String(e) }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
}
