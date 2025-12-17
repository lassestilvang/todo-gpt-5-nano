"use client";

import React, { useEffect, useMemo, useState } from 'react'
import TaskCard from './components/TaskCard'
import Sidebar from './components/Sidebar'
import TaskForm from './components/TaskForm'

type List = { id: string; name: string; color: string; emoji?: string; created_at?: string }
type Task = {
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
  priority?: string
  subtasks?: { id: string; name: string; done: boolean }[]
  recurring?: string
  attachment?: string
  completed?: boolean
  created_at?: string
  updated_at?: string
}

export default function Page() {
  const [lists, setLists] = useState<List[]>([])
  const [tasks, setTasks] = useState<Task[]>([])
  const [view, setView] = useState<'today'|'week'|'upcoming'|'all'>('today')
  const [showCompleted, setShowCompleted] = useState(true)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    fetch('/api/lists')
      .then(r => r.json())
      .then(setLists)
      .catch(()=>{});
  }, [])

  useEffect(() => {
    setLoading(true)
    fetch(`/api/tasks?view=${view}&showCompleted=${showCompleted}`)
      .then(r => r.json())
      .then((data)=>{ setTasks(data); setLoading(false) })
      .catch(()=>setLoading(false))
  }, [view, showCompleted])

  const overdueCount = tasks.filter(t => t.date && new Date(t.date) < new Date() && !(t.completed)).length

  const addTaskFromForm = async (payload: any) => {
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    if (res.ok) {
      const t = await res.json()
      setTasks(ts => [t, ...ts])
    }
  }

  // Simple NLP-ish enhancement: if name contains a pattern like "Lunch with X at 1 PM tomorrow", extract date/time.
  const onSubmitFromForm = (payload: any) => {
    // Very naive parse
    const text = payload.name || ''
    let deducedDate = payload.date
    if (!deducedDate) {
      const m = text.match(/at\s*(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?/i)
      const tomorrowMatch = text.match(/tomorrow/i)
      if (m) {
        // Build a date later: keep as is; for demo we skip complex time parsing
      }
      if (tomorrowMatch) {
        const dt = new Date()
        dt.setDate(dt.getDate() + 1)
        deducedDate = dt.toISOString().slice(0,10)
      }
    }
    const payload = {
      name: text,
      description: payload.description,
      date: deducedDate || '',
      listId: payload.listId,
      priority: payload.priority
    }
    addTaskFromForm(payload)
  }

  return (
    <div className="h-screen w-full flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Sidebar lists={lists} />
      <main className="flex-1 p-6 overflow-auto">
        <section className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-xl font-bold">Tasks</div>
            <span className="px-2 py-1 text-xs rounded bg-slate-200 dark:bg-slate-700">Overdue: {overdueCount}</span>
          </div>
          <div className="flex items-center gap-3">
            {[
              {k:'today', label:'Today'},
              {k:'week', label:'Next 7 Days'},
              {k:'upcoming', label:'Upcoming'},
              {k:'all', label:'All'}
            ].map(v => (
              <button key={v.k} className={`px-2 py-1 rounded hover:bg-slate-200 dark:hover:bg-slate-800 ${view===v.k ? 'bg-slate-200 dark:bg-slate-700' : ''}`} onClick={() => setView(v.k as any)}>
                {v.label}
              </button>
            ))}
            <label className="text-sm">Show Completed</label>
            <input type="checkbox" checked={showCompleted} onChange={(e)=>setShowCompleted(e.target.checked)} />
          </div>
        </section>
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((t)=> (
            <TaskCard key={t.id} task={t as any} />
          ))}
        </section>
        <section className="mt-8 max-w-2xl">
          <form onSubmit={(e)=>{ e.preventDefault(); onSubmitFromForm({ name: (e.target as any).name?.value, description: (e.target as any).description?.value, date: (e.target as any).date?.value, listId: (e.target as any).listId?.value, priority: (e.target as any).priority?.value }); (e.target as any).reset(); }} className="grid grid-cols-1 gap-2">
            <input name="name" placeholder="New task (e.g., Lunch with Sam tomorrow)" className="border rounded px-3 py-2" />
            <textarea name="description" placeholder="Description" className="border rounded px-3 py-2" />
            <input name="date" type="date" className="border rounded px-3 py-2" />
            <select name="listId" className="border rounded px-3 py-2">
              <option value="">Inbox</option>
              {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
            </select>
            <select name="priority" className="border rounded px-3 py-2">
              <option value="None">None</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
            <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded">Add Task</button>
          </form>
        </section>
      </main>
    </div>
  )
}
