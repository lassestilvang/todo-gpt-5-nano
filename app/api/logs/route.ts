import { getLogsForTask, logTaskChange } from '../../../db/crud'
import { TaskInputSchema } from '../utils/validation'

export async function GET(req: Request) {
  // Expect ?taskId=...
  const url = new URL(req.url)
  const taskId = url.searchParams.get('taskId')
  if (!taskId) return new Response(JSON.stringify({ error: 'taskId required' }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  const logs = getLogsForTask(taskId)
  return new Response(JSON.stringify(logs), { headers: { 'Content-Type': 'application/json' } })
}

export async function POST(req: Request) {
  const body = await req.json()
  try {
    const valid = TaskInputSchema.parse({ name: body.name, description: body.description, date: body.date, listId: body.listId, deadline: body.deadline, reminders: body.reminders, estimate: body.estimate, actualTime: body.actualTime, labels: body.labels, priority: body.priority, subtasks: body.subtasks, recurring: body.recurring, attachment: body.attachment, completed: body.completed })
    // Use logTaskChange to create a log entry for a given task (not modifying task here)
    logTaskChange(body.taskId, valid ? 'log' : 'unknown', JSON.stringify(body))
    return new Response(JSON.stringify({ ok: true }), { headers: { 'Content-Type': 'application/json' } })
  } catch (e) {
    return new Response(JSON.stringify({ error: 'Invalid input', details: e instanceof Error ? e.message : String(e) }), { status: 400, headers: { 'Content-Type': 'application/json' } })
  }
}
