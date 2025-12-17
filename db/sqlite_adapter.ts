import JsonDb from './jsondb'

export default class SqliteShimAdapter {
  private inner: any
  constructor() {
    // Use JSON-based store as the internal backend for now
    this.inner = new JsonDb('./data/planner.json')
  }

  exec(sql: string) {
    return this.inner.exec(sql)
  }

  prepare(sql: string) {
    const stmt = this.inner.prepare(sql)
    return {
      run: (...args: any[]) => stmt.run(...args),
      all: (...args: any[]) => stmt.all(...args),
      get: (...args: any[]) => stmt.get(...args),
    }
  }
}
