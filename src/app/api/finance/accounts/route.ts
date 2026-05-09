export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const items = await db.financeAccount.findMany({ orderBy: { name: 'asc' }, include: { transactions: { orderBy: { date: 'desc' }, take: 10 }, budgets: true } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.financeAccount.create({ data: { name: body.name, type: body.type || 'personal', ventureId: body.ventureId || null, balance: body.balance ?? 0, currency: body.currency || 'USD', description: body.description || '' } })
  return NextResponse.json(item, { status: 201 })
}
