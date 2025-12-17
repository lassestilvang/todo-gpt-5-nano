"use client";
import React, { useEffect, useState } from 'react'
import ViewLayout from '../../components/ViewLayout'

export default function WeekView() {
  const [lists, setLists] = useState([])
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  useEffect(() => {
    fetch('/api/lists').then(r => r.json()).then(setLists)
    fetch('/api/tasks?view=week').then(r => r.json()).then((data)=>{ setTasks(data); setLoading(false) }).catch(()=>setLoading(false))
  }, [])
  return (
    <ViewLayout title="Next 7 Days" lists={lists} tasks={tasks} loading={loading} />
  )
}
