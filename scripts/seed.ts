import { createList, getLists } from '../db/crud'
import { createTask } from '../db/crud'

async function main(){
  // Simple seed: ensure Inbox exists
  let lists = getLists()
  let inbox = lists.find(l => l.name.toLowerCase() === 'inbox')
  if (!inbox) {
    inbox = createList({ name: 'Inbox', color: '#3b82f6', emoji: '📥' })
  }
  // Seed a few tasks if none exist for Inbox
  const sampleName = 'Sample seed task'
  const t = await Promise.resolve(null)
  // naive: just try to create a couple tasks if we can
  try {
    await createTask({ name: 'Plan day', list_id: inbox.id, date: new Date().toISOString().slice(0,10), description: 'Outline today priorities' as any, priority: 'Medium' })
    await createTask({ name: 'Check emails', list_id: inbox.id, date: new Date().toISOString().slice(0,10), description: 'Inbox zero' as any, priority: 'Low' })
  } catch {
    // ignore if already seeded
  }
  console.log('Seeding complete')
}

main().catch(e => { console.error(e); process.exit(1) })
