export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const habitId = req.nextUrl.searchParams.get('habitId')
  const where = habitId ? { habitId } : {}
  const items = await db.habitLog.findMany({ where, orderBy: { date: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.habitLog.create({ data: { habitId: body.habitId, date: new Date(body.date), completed: body.completed ?? true, notes: body.notes || '' } })
  return NextResponse.json(item, { status: 201 })
}
