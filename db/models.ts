export type List = {
  id: string
  name: string
  color: string
  emoji?: string
  created_at?: string
}

export type Subtask = { id: string; name: string; done: boolean }

export type Task = {
  id: string
  list_id?: string
  name: string
  description?: string
  date?: string
  deadline?: string
  reminders?: string[]
  estimate?: string
  actual_time?: string
  labels?: { name: string; icon?: string }[]
  priority?: 'High'|'Medium'|'Low'|'None'
  subtasks?: Subtask[]
  recurring?: string
  attachment?: string
  completed?: boolean
  created_at?: string
  updated_at?: string
}

export type Log = {
  id: string
  task_id: string
  action: string
  timestamp?: string
  details?: string
}
