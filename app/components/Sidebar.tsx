"use client";
import React from 'react'

type List = { id: string; name: string; color: string; emoji?: string }

export default function Sidebar({ lists }: { lists: List[] }) {
  return (
    <aside className="w-60 border-r border-slate-200 dark:border-slate-700 p-3">
      <div className="mb-4 font-semibold">Lists</div>
      <ul>
        <li className="mb-2 p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 cursor-pointer" style={{borderLeft: '4px solid #3b82f6'}}>Inbox</li>
        {lists.map(l => (
          <li key={l.id} className="mb-2 p-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800" style={{borderLeft: `4px solid ${l.color}`}}>
            <span className="mr-2">{l.emoji ?? '🏷️'}</span>{l.name}
          </li>
        ))}
      </ul>
      <div className="mt-6 text-sm text-slate-500">Overdue</div>
    </aside>
  )
}
