// SQLite backend only (no JSON) - exclusive path for production
import RealSqliteAdapter from './sqlite_adapter_real'
import { DB_BACKEND } from '../app/config'

const dbPath = './data/planner.sqlite'

if (DB_BACKEND !== 'sqlite') {
  throw new Error('Production path requires DB_BACKEND=sqlite. JSON backend has been removed as per your instruction.')
}

let db: any
try {
  db = new RealSqliteAdapter(dbPath)
} catch (e) {
  throw new Error(`Failed to initialize real SQLite adapter: ${e?.message ?? e}`)
}

export default db
