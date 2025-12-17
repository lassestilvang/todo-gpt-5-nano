import { z } from 'zod'

export const ListInputSchema = z.object({
  name: z.string().min(1),
  color: z.string().min(1),
  emoji: z.string().optional()
})

export const TaskInputSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  date: z.string().optional(),
  listId: z.string().optional(),
  deadline: z.string().optional(),
  reminders: z.array(z.string()).optional(),
  estimate: z.string().optional(),
  actualTime: z.string().optional(),
  labels: z.array(z.object({ name: z.string(), icon: z.string().optional(), color: z.string().optional() })).optional(),
  priority: z.enum(['High','Medium','Low','None']).optional(),
  subtasks: z.array(z.object({ id: z.string().optional(), name: z.string(), done: z.boolean() })).optional(),
  recurring: z.string().optional(),
  attachment: z.string().optional(),
  completed: z.boolean().optional()
})
