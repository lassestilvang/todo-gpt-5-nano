"use client";
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import TaskCard from './TaskCard'
import Sidebar from './Sidebar'
import SearchBox from '../search'

type List = { id: string; name: string; color: string; emoji?: string }
type Task = {
  id: string
  name: string
  description?: string
  date?: string
  labels?: { name: string; icon?: string }[]
  priority?: string
  completed?: boolean
  list_id?: string
  [key: string]: any
}

export default function ViewLayout({ title, lists, tasks, loading }: { title: string; lists: List[]; tasks: Task[]; loading: boolean }) {
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [query, setQuery] = useState('')

  const onSearch = useCallback(async (q: string) => {
    setQuery(q)
    if (!q || q.trim().length < 2) { setSearchResults([]); return }
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`)
      const data = await res.json()
      setSearchResults(Array.isArray(data.results) ? data.results : [])
    } catch {
      setSearchResults([])
    }
  }, [])

  const hasResults = searchResults && searchResults.length > 0

  const overdueCount = (tasks ?? []).filter((t: any) => t.date && new Date(t.date) < new Date() && !t.completed).length

  return (
    <div className="h-full w-full flex bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
      <Sidebar lists={lists} />
      <main className="flex-1 p-6 overflow-auto">
        <header className="mb-4 flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-4">
          <div className="flex items-center gap-3">
            <div className="text-2xl font-semibold">{title}</div>
            <span className="px-2 py-1 text-xs rounded bg-slate-200 dark:bg-slate-700">Overdue: {overdueCount}</span>
          </div>
          <div className="flex items-center gap-2">
            <SearchBox onSearch={onSearch} />
          </div>
        </header>
        {hasResults ? (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {searchResults.map((t, idx) => (
              <TaskCard key={t.id ?? idx} task={t} />
            ))}
          </section>
        ) : (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? <div>Loading...</div> : tasks.map((t: any, idx: number) => (
              <TaskCard key={t.id ?? idx} task={t} />
            ))}
          </section>
        )}
      </main>
    </div>
  )
}
