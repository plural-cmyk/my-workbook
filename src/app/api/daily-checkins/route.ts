export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const items = await db.dailyCheckIn.findMany({ orderBy: { date: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.dailyCheckIn.create({ data: { date: new Date(body.date), focus: body.focus || '', gratitude: body.gratitude || '', challenges: body.challenges || '', notes: body.notes || '' } })
  return NextResponse.json(item, { status: 201 })
}
