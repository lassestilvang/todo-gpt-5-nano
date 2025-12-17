"use client";
import React from 'react'

export default function DatePicker({ value, onChange }: { value?: string; onChange?: (v: string) => void }) {
  return (
    <input
      type="date"
      className="border rounded px-3 py-2"
      value={value ?? ''}
      onChange={(e) => onChange?.(e.target.value)}
    />
  )
}
