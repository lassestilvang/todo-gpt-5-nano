"use client";
import React, { useState } from 'react'
import DatePicker from './DatePicker'

type List = { id: string; name: string }
export default function TaskForm({ lists, onSubmit }: { lists: List[]; onSubmit: (payload: any) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [date, setDate] = useState('')
  const [listId, setListId] = useState<string>(lists[0]?.id ?? '')
  const [priority, setPriority] = useState('None')

  return (
    <form onSubmit={(e)=>{ e.preventDefault(); onSubmit({ name, description, date, listId, priority, subtasks: [] }) }} className="grid grid-cols-1 gap-2">
      <input value={name} onChange={e=>setName(e.target.value)} placeholder="New task" className="border rounded px-3 py-2" required />
      <input value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="border rounded px-3 py-2" />
      <DatePicker value={date} onChange={val=>setDate(val)} />
      <select value={listId} onChange={e=>setListId(e.target.value)} className="border rounded px-3 py-2">
        {lists.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
      </select>
      <select value={priority} onChange={e=>setPriority(e.target.value)} className="border rounded px-3 py-2">
        <option value="None">None</option>
        <option value="Low">Low</option>
        <option value="Medium">Medium</option>
        <option value="High">High</option>
      </select>
      <button type="submit" className="px-4 py-2 bg-brand-500 text-white rounded">Add Task</button>
    </form>
  )
}
