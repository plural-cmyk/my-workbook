export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const ventureId = req.nextUrl.searchParams.get('ventureId')
  const where = ventureId ? { ventureId } : {}
  const items = await db.meeting.findMany({ where, orderBy: { date: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.meeting.create({ data: { title: body.title, notes: body.notes || '', date: new Date(body.date), ventureId: body.ventureId, attendees: body.attendees || '' } })
  return NextResponse.json(item, { status: 201 })
}
