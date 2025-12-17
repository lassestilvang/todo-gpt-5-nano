// SQLite/JSON backend selector with a hard preference for SQLite when available
import JsonDb from './jsondb'
let InMemoryShimAdapter = null
try { InMemoryShimAdapter = require('./sqlite_adapter_inmem').default } catch {}
import RealSqliteAdapter from './sqlite_adapter_real'
import { DB_BACKEND } from '../app/config'

const jsonDbPath = './data/planner.json'
const useSqlite = DB_BACKEND === 'sqlite'

let db: any
if (useSqlite) {
  console.log('[DB] Attempting to use real SQLite adapter...')
  try {
    // Try to instantiate the real adapter with a file path
    const Real = RealSqliteAdapter
    db = new Real('./data/planner.sqlite')
    console.log('[DB] Real SQLite adapter engaged.')
  } catch (e) {
    // Fall back to in-memory shim if real adapter is unavailable
    if (InMemoryShimAdapter) {
      console.warn('[DB] Real SQLite adapter unavailable; falling back to in-memory SQLite shim.')
      db = new InMemoryShimAdapter(true)
    } else {
      console.error('[DB] No SQLite adapter available and no fallback shim; ensure DB_BACKEND is json or install better-sqlite3 for sqlite.')
      throw e
    }
  }
} else {
  db = new JsonDb(jsonDbPath)
}

export default db
