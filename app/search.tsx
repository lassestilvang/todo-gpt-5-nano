"use client";
import React, { useEffect, useState } from 'react'

export default function SearchBox({ onSearch }: { onSearch: (q: string) => void }) {
  const [q, setQ] = useState('')
  useEffect(() => {
    const id = setTimeout(() => onSearch(q), 200)
    return () => clearTimeout(id)
  }, [q])
  return (
    <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search tasks..." className="border rounded px-3 py-2" />
  )
}
