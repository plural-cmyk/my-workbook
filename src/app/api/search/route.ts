export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get('q') || ''
  if (!q || q.length < 2) return NextResponse.json({ ventures: [], tasks: [], brainDumps: [], insights: [], digitalItems: [] })
  const contains = { contains: q, mode: 'insensitive' as const }
  const [ventures, tasks, brainDumps, insights, digitalItems] = await Promise.all([
    db.venture.findMany({ where: { OR: [{ name: contains }, { description: contains }] }, take: 5 }),
    db.task.findMany({ where: { OR: [{ title: contains }, { description: contains }] }, take: 5 }),
    db.brainDump.findMany({ where: { content: contains }, take: 5 }),
    db.insight.findMany({ where: { OR: [{ title: contains }, { content: contains }] }, take: 5 }),
    db.digitalItem.findMany({ where: { OR: [{ title: contains }, { content: contains }] }, take: 5 }),
  ])
  return NextResponse.json({ ventures, tasks, brainDumps, insights, digitalItems })
}
