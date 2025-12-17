export default class RealSqliteAdapter {
  private db: any
  constructor(dbPath: string) {
    // Lazy require to avoid crash if not installed in environments without native bindings
    const Database = (global as any).require?.('better-sqlite3') || (typeof require !== 'undefined' ? require('better-sqlite3') : null)
    if (!Database) {
      throw new Error('better-sqlite3 is not installed. Install it to enable the real SQLite backend.')
    }
    this.db = new Database(dbPath)
    this.initialize()
  }

  private initialize() {
    // Create tables if they don't exist; match the existing schema in the JSON path
    this.db.exec(`CREATE TABLE IF NOT EXISTS lists (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      emoji TEXT,
      created_at TEXT
    );`)
    this.db.exec(`CREATE TABLE IF NOT EXISTS tasks (
      id TEXT PRIMARY KEY,
      list_id TEXT,
      name TEXT NOT NULL,
      description TEXT,
      date TEXT,
      deadline TEXT,
      reminders TEXT,
      estimate TEXT,
      actual_time TEXT,
      labels TEXT,
      priority TEXT,
      subtasks TEXT,
      recurring TEXT,
      attachment TEXT,
      completed INTEGER,
      created_at TEXT,
      updated_at TEXT
    );`)
    this.db.exec(`CREATE TABLE IF NOT EXISTS subtasks (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      name TEXT NOT NULL,
      done INTEGER,
      created_at TEXT,
      updated_at TEXT
    );`)
    this.db.exec(`CREATE TABLE IF NOT EXISTS labels (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      icon TEXT,
      color TEXT
    );`)
    this.db.exec(`CREATE TABLE IF NOT EXISTS task_labels (
      task_id TEXT NOT NULL,
      label_id TEXT NOT NULL,
      PRIMARY KEY (task_id, label_id)
    );`)
    this.db.exec(`CREATE TABLE IF NOT EXISTS reminders (
      id TEXT PRIMARY KEY,
      task_id TEXT NOT NULL,
      when TEXT NOT NULL,
      type TEXT
    );`)
    this.db.exec(`CREATE TABLE IF NOT EXISTS logs (
      id TEXT PRIMARY KEY,
      task_id TEXT,
      action TEXT,
      timestamp TEXT,
      details TEXT
    );`)
  }

  exec(sql: string) {
    this.db.exec(sql)
  }

  prepare(sql: string) {
    const stmt = this.db.prepare(sql)
    return {
      run: (...args: any[]) => stmt.run(...args),
      all: (...args: any[]) => stmt.all(...args),
      get: (...args: any[]) => stmt.get(...args),
    }
  }
}
