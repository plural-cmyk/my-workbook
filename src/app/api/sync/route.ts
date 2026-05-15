export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

// Maps mobile table names to Prisma model accessors
const SYNC_MODELS: Record<string, {
  findMany: (args: any) => Promise<any[]>
  create: (args: any) => Promise<any>
  update: (args: any) => Promise<any>
  delete: (args: any) => Promise<any>
}> = {
  ventures: {
    findMany: (args) => db.venture.findMany(args),
    create: (args) => db.venture.create(args),
    update: (args) => db.venture.update(args),
    delete: (args) => db.venture.delete(args),
  },
  tasks: {
    findMany: (args) => db.task.findMany(args),
    create: (args) => db.task.create(args),
    update: (args) => db.task.update(args),
    delete: (args) => db.task.delete(args),
  },
  decisions: {
    findMany: (args) => db.decision.findMany(args),
    create: (args) => db.decision.create(args),
    update: (args) => db.decision.update(args),
    delete: (args) => db.decision.delete(args),
  },
  meetings: {
    findMany: (args) => db.meeting.findMany(args),
    create: (args) => db.meeting.create(args),
    update: (args) => db.meeting.update(args),
    delete: (args) => db.meeting.delete(args),
  },
  contacts: {
    findMany: (args) => db.contact.findMany(args),
    create: (args) => db.contact.create(args),
    update: (args) => db.contact.update(args),
    delete: (args) => db.contact.delete(args),
  },
  relationships: {
    findMany: (args) => db.relationship.findMany(args),
    create: (args) => db.relationship.create(args),
    update: (args) => db.relationship.update(args),
    delete: (args) => db.relationship.delete(args),
  },
  balance_checks: {
    findMany: (args) => db.balanceCheck.findMany(args),
    create: (args) => db.balanceCheck.create(args),
    update: (args) => db.balanceCheck.update(args),
    delete: (args) => db.balanceCheck.delete(args),
  },
  insights: {
    findMany: (args) => db.insight.findMany(args),
    create: (args) => db.insight.create(args),
    update: (args) => db.insight.update(args),
    delete: (args) => db.insight.delete(args),
  },
  habits: {
    findMany: (args) => db.habit.findMany(args),
    create: (args) => db.habit.create(args),
    update: (args) => db.habit.update(args),
    delete: (args) => db.habit.delete(args),
  },
  habit_logs: {
    findMany: (args) => db.habitLog.findMany(args),
    create: (args) => db.habitLog.create(args),
    update: (args) => db.habitLog.update(args),
    delete: (args) => db.habitLog.delete(args),
  },
  daily_checkins: {
    findMany: (args) => db.dailyCheckIn.findMany(args),
    create: (args) => db.dailyCheckIn.create(args),
    update: (args) => db.dailyCheckIn.update(args),
    delete: (args) => db.dailyCheckIn.delete(args),
  },
  weekly_reviews: {
    findMany: (args) => db.weeklyReview.findMany(args),
    create: (args) => db.weeklyReview.create(args),
    update: (args) => db.weeklyReview.update(args),
    delete: (args) => db.weeklyReview.delete(args),
  },
  brain_dumps: {
    findMany: (args) => db.brainDump.findMany(args),
    create: (args) => db.brainDump.create(args),
    update: (args) => db.brainDump.update(args),
    delete: (args) => db.brainDump.delete(args),
  },
  time_commitments: {
    findMany: (args) => db.timeCommitment.findMany(args),
    create: (args) => db.timeCommitment.create(args),
    update: (args) => db.timeCommitment.update(args),
    delete: (args) => db.timeCommitment.delete(args),
  },
  digital_items: {
    findMany: (args) => db.digitalItem.findMany(args),
    create: (args) => db.digitalItem.create(args),
    update: (args) => db.digitalItem.update(args),
    delete: (args) => db.digitalItem.delete(args),
  },
  swot_analyses: {
    findMany: (args) => db.sWOTAnalysis.findMany(args),
    create: (args) => db.sWOTAnalysis.create(args),
    update: (args) => db.sWOTAnalysis.update(args),
    delete: (args) => db.sWOTAnalysis.delete(args),
  },
  swot_items: {
    findMany: (args) => db.sWOTItem.findMany(args),
    create: (args) => db.sWOTItem.create(args),
    update: (args) => db.sWOTItem.update(args),
    delete: (args) => db.sWOTItem.delete(args),
  },
  academic_terms: {
    findMany: (args) => db.academicTerm.findMany(args),
    create: (args) => db.academicTerm.create(args),
    update: (args) => db.academicTerm.update(args),
    delete: (args) => db.academicTerm.delete(args),
  },
  academic_units: {
    findMany: (args) => db.academicUnit.findMany(args),
    create: (args) => db.academicUnit.create(args),
    update: (args) => db.academicUnit.update(args),
    delete: (args) => db.academicUnit.delete(args),
  },
  unit_notes: {
    findMany: (args) => db.unitNote.findMany(args),
    create: (args) => db.unitNote.create(args),
    update: (args) => db.unitNote.update(args),
    delete: (args) => db.unitNote.delete(args),
  },
  finance_accounts: {
    findMany: (args) => db.financeAccount.findMany(args),
    create: (args) => db.financeAccount.create(args),
    update: (args) => db.financeAccount.update(args),
    delete: (args) => db.financeAccount.delete(args),
  },
  transactions: {
    findMany: (args) => db.transaction.findMany(args),
    create: (args) => db.transaction.create(args),
    update: (args) => db.transaction.update(args),
    delete: (args) => db.transaction.delete(args),
  },
  budgets: {
    findMany: (args) => db.budget.findMany(args),
    create: (args) => db.budget.create(args),
    update: (args) => db.budget.update(args),
    delete: (args) => db.budget.delete(args),
  },
}

// Fields to strip from payloads (relations, internal fields)
const IGNORED_FIELDS = new Set([
  'synced', '_count', '_op', 'tasks', 'decisions', 'meetings', 'contacts',
  'items', 'venture', 'account', 'budgets', 'habitLogs', 'unitNotes',
  'academicUnits', 'swotItems', 'transactions',
  // Mobile-only fields that don't exist in Prisma schema
  'rawMessage', 'provider', 'providerRef', 'lastSynced', 'syncEnabled',
  'remindBefore', 'hasReminder', 'mpesaDate', 'receiptNumber', 'phoneNumber',
])

// Fields that are booleans in Prisma but integers in SQLite
const BOOLEAN_FIELDS = new Set([
  'isProtected', 'hasPracticals', 'hasProject', 'hasExams', 'completed',
])

function cleanItem(item: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {}
  for (const [k, v] of Object.entries(item)) {
    if (IGNORED_FIELDS.has(k)) continue
    if (BOOLEAN_FIELDS.has(k)) {
      cleaned[k] = v === 1 || v === true
    } else if (v instanceof Date) {
      cleaned[k] = v.toISOString()
    } else if (v !== null && v !== undefined) {
      cleaned[k] = v
    }
  }
  return cleaned
}

function stripRelations(item: Record<string, any>): Record<string, any> {
  const cleaned: Record<string, any> = {}
  for (const [k, v] of Object.entries(item)) {
    if (IGNORED_FIELDS.has(k)) continue
    if (v instanceof Date) {
      cleaned[k] = v.toISOString()
    } else if (v === null || v === undefined) {
      // skip nulls
    } else if (typeof v === 'object' && !Array.isArray(v)) {
      // Skip nested relation objects (tasks, decisions, etc.)
      // but allow arrays of primitives
    } else {
      cleaned[k] = v
    }
  }
  return cleaned
}

// GET /api/sync?since=2026-01-01T00:00:00.000Z
// Returns all records modified since the given timestamp (delta sync)
export async function GET(req: NextRequest) {
  try {
    const since = req.nextUrl.searchParams.get('since')
    const sinceDate = since ? new Date(since) : new Date(0)

    if (isNaN(sinceDate.getTime())) {
      return NextResponse.json({ error: 'Invalid since parameter' }, { status: 400 })
    }

    const result: Record<string, any[]> = {}

    for (const [tableKey, model] of Object.entries(SYNC_MODELS)) {
      try {
        const items = await model.findMany({
          where: { updatedAt: { gte: sinceDate } },
          orderBy: { updatedAt: 'asc' },
        })
        result[tableKey] = items.map(stripRelations)
      } catch (e) {
        console.warn(`Sync GET error for ${tableKey}:`, e)
        result[tableKey] = []
      }
    }

    return NextResponse.json({
      since: sinceDate.toISOString(),
      timestamp: new Date().toISOString(),
      data: result,
    })
  } catch (e) {
    console.error('Sync GET error:', e)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}

// POST /api/sync
// Accepts changes from mobile and applies them to the server
// Body: { changes: { tableName: [ { _op: 'upsert'|'delete', ...fields } ] }, lastSyncTimestamp: string }
// Returns: { applied: { tableName: { created, updated, deleted } }, timestamp, serverChanges }
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { changes, lastSyncTimestamp } = body as {
      changes?: Record<string, any[]>
      lastSyncTimestamp?: string
    }

    if (!changes || typeof changes !== 'object') {
      return NextResponse.json({ error: 'Missing changes object' }, { status: 400 })
    }

    const applied: Record<string, { created: number; updated: number; deleted: number }> = {}

    for (const [tableKey, items] of Object.entries(changes)) {
      if (!Array.isArray(items)) continue

      const model = SYNC_MODELS[tableKey]
      if (!model) {
        console.warn(`Sync POST: unknown table ${tableKey}`)
        continue
      }

      let created = 0
      let updated = 0
      let deleted = 0

      for (const item of items) {
        const op = item._op || 'upsert'
        const id = item.id

        if (op === 'delete') {
          try {
            await model.delete({ where: { id } })
            deleted++
          } catch {
            // Record may not exist on server — safe to ignore
          }
          continue
        }

        // upsert: try update first, if not found then create
        try {
          const existing = await model.findMany({ where: { id }, take: 1 })
          const cleanData = cleanItem(item)

          if (existing.length > 0) {
            // Only update if mobile updatedAt is newer than server
            const serverUpdated = new Date(existing[0].updatedAt).getTime()
            const mobileUpdated = cleanData.updatedAt ? new Date(cleanData.updatedAt).getTime() : 0
            if (mobileUpdated >= serverUpdated) {
              const { id: _id, createdAt: _ca, updatedAt: _ua, ...updateData } = cleanData
              await model.update({ where: { id }, data: updateData })
              updated++
            }
          } else {
            await model.create({ data: cleanData })
            created++
          }
        } catch (e) {
          console.warn(`Sync upsert error ${tableKey}/${id}:`, e)
        }
      }

      applied[tableKey] = { created, updated, deleted }
    }

    // After applying changes, return new server data since the client's last sync
    const sinceDate = lastSyncTimestamp ? new Date(lastSyncTimestamp) : new Date(0)
    const serverChanges: Record<string, any[]> = {}

    for (const [tableKey, model] of Object.entries(SYNC_MODELS)) {
      try {
        const items = await model.findMany({
          where: { updatedAt: { gte: sinceDate } },
          orderBy: { updatedAt: 'asc' },
        })
        serverChanges[tableKey] = items.map(stripRelations)
      } catch {
        serverChanges[tableKey] = []
      }
    }

    return NextResponse.json({
      applied,
      timestamp: new Date().toISOString(),
      serverChanges,
    })
  } catch (e) {
    console.error('Sync POST error:', e)
    return NextResponse.json({ error: 'Sync failed' }, { status: 500 })
  }
}
