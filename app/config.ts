export const DB_BACKEND = (process.env.DB_BACKEND ?? 'json') as 'json' | 'sqlite'
export const SQLITE_MIGRATION_PATH = './data/sqlite_migration.sql'
