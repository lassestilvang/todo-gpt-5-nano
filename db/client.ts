// JSON fallback DB (no native bindings). Prefer native bindings when available.
import JsonDb from './jsondb'

const DB_PATH = './data/planner.json'
const db = new (JsonDb as any)(DB_PATH) as any

export default db
