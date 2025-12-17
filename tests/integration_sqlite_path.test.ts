import { describe, it, expect } from 'bun:test'

describe('SQLite path integration (real adapter)', () => {
  it('basic create/insert/read against real sqlite adapter when available', async () => {
    // Must have the real adapter installed; fail fast otherwise
    let Real;
    try {
      Real = (await import('../db/sqlite_adapter_real.ts')).default
    } catch {
      throw new Error('True SQLite adapter (native bindings) not available in CI environment. Please enable native bindings to run this test.')
    }

    const dbPath = './data/planner-test.sqlite'
    const adapter = new Real(dbPath)

    // Ensure we can perform a basic operation
    const testId = 'sqlite_test_list'
    const insert = adapter.prepare("INSERT INTO lists (id, name, color, emoji, created_at) VALUES (?, ?, ?, ?, ?)")
    insert.run(testId, 'SQLite List', '#00AAFF', '🔷', new Date().toISOString())

    const row = adapter.prepare("SELECT id, name, color, emoji, created_at FROM lists WHERE id = ?").get(testId)
    expect(row).toBeTruthy()
    if (row) {
      expect(row.name).toBe('SQLite List')
    }
  })
})
