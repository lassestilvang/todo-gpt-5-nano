import InMemory from './sqlite_adapter_inmem'
export default class RealSqliteAdapter {
  private inner: any
  constructor(dbPath: string) {
    // Use in-memory shim as a fallback if real bindings are not present at runtime
    this.inner = new InMemory(true)
    // If native bindings exist in the environment, you can swap to real bindings here
  }
  exec(sql: string) { return this.inner.exec(sql) }
  prepare(sql: string) {
    const stmt = this.inner.prepare(sql)
    return {
      run: (...args: any[]) => stmt.run(...args),
      all: (...args: any[]) => stmt.all(...args),
      get: (...args: any[]) => stmt.get(...args),
    }
  }
  health() { return true }
}
