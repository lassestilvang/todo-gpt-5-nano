"use client";
import React, { useEffect, useState } from 'react'

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<'light'|'dark'>('system')

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const systemDark = mq.matches
    const current = theme === 'system' ? (systemDark ? 'dark' : 'light') : theme
    if (current === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div>
      {/* Simple theme toggle for demo */}
      <div className="p-2 text-sm text-slate-500">
        Theme: {theme}
      </div>
      {children}
    </div>
  )
}
