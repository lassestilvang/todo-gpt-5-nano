import React from 'react'
import { ThemeProvider } from './theme-provider'
import './globals.css'

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head />
      <body>
        <ThemeProvider>
          <div className="h-screen w-full flex">
            <aside className="w-60 border-r border-slate-200 dark:border-slate-700 p-4">
              <div className="text-sm text-slate-500 mb-2">Inbox</div>
              <div className="text-sm">Navigation</div>
            </aside>
            <main className="flex-1 overflow-auto">
              {children}
            </main>
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}
