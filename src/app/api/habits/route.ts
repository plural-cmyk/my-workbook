export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const items = await db.habit.findMany({ orderBy: { createdAt: 'desc' }, include: { logs: { orderBy: { date: 'desc' }, take: 30 } } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.habit.create({ data: { name: body.name, description: body.description || '', frequency: body.frequency || 'daily' } })
  return NextResponse.json(item, { status: 201 })
}
