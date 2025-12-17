import db from '../../../db/client'

export async function GET() {
  try {
    const healthFn = (typeof db?.health === 'function') ? db.health.bind(db) : null
    const ok = healthFn ? healthFn() : true
    if (ok) {
      return new Response(JSON.stringify({ status: 'ok' }), { headers: { 'Content-Type': 'application/json' } })
    }
    return new Response(JSON.stringify({ status: 'error', message: 'DB health check failed' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  } catch (e: any) {
    return new Response(JSON.stringify({ status: 'error', message: e?.message ?? 'unknown' }), { status: 500, headers: { 'Content-Type': 'application/json' } })
  }
}
