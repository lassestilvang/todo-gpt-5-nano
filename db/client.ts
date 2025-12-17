// SQLite/JSON backend selector with a feature flag
import JsonDb from './jsondb'
import SqliteShim from './sqlite_adapter'
import { DB_BACKEND } from '../app/config'

const jsonDbPath = './data/planner.json'
const useSqlite = DB_BACKEND === 'sqlite'

let db: any
if (useSqlite) {
  console.log('[DB] Using SQLite shim adapter (JSON backend under the hood).')
  db = new SqliteShim()
} else {
  db = new JsonDb(jsonDbPath)
}

export default db
