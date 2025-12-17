"use client";
import React from 'react'

type Label = { name: string; icon?: string }

export type TaskCardProps = {
  task: {
    id: string
    name: string
    description?: string
    date?: string
    deadline?: string
    labels?: Label[]
    completed?: boolean
    priority?: string
  }
}

export default function TaskCard({ task }: TaskCardProps) {
  return (
    <div className="p-4 rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 shadow-sm">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-6 h-6 inline-flex items-center justify-center rounded-full bg-brand-500 text-white text-xs">{task.priority?.startsWith('High') ? '🔥' : '•'}</span>
          <strong>{task.name}</strong>
        </div>
        <span className={`px-2 py-1 text-xs rounded ${task.completed ? 'bg-green-500 text-white' : 'bg-slate-200'}`}>{task.completed ? 'Done' : (task.date ?? 'No date')}</span>
      </div>
      {task.description && <p className="text-sm text-slate-500 mb-2">{task.description}</p>}
      {task.date && <p className="text-xs text-slate-400">Date: {task.date}{task.deadline ? ` • Deadline ${task.deadline}` : ''}</p>}
      {task.labels && task.labels.length>0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {task.labels.map((lb, idx)=> (
            <span key={idx} className="text-xs px-2 py-1 rounded bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-100">{lb.icon ?? '🏷️'} {lb.name}</span>
          ))}
        </div>
      )}
    </div>
  )
}
