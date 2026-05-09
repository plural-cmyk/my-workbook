export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const accountId = req.nextUrl.searchParams.get('accountId')
  const where = accountId ? { accountId } : {}
  const items = await db.transaction.findMany({ where, orderBy: { date: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.transaction.create({ data: { amount: body.amount, type: body.type, category: body.category || '', description: body.description || '', date: new Date(body.date), accountId: body.accountId, toAccountId: body.toAccountId || null, ventureId: body.ventureId || null, tags: body.tags || '' } })
  // Update account balance
  const delta = body.type === 'income' ? body.amount : -body.amount
  await db.financeAccount.update({ where: { id: body.accountId }, data: { balance: { increment: delta } } })
  return NextResponse.json(item, { status: 201 })
}
