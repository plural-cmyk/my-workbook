export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get('accountId')
  const where = accountId ? { accountId } : {}
  const items = await db.budget.findMany({ where, orderBy: { startDate: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.budget.create({ data: { name: body.name, amount: body.amount, spent: body.spent ?? 0, period: body.period || 'monthly', category: body.category || '', accountId: body.accountId, startDate: new Date(body.startDate), endDate: body.endDate ? new Date(body.endDate) : null } })
  return NextResponse.json(item, { status: 201 })
}
