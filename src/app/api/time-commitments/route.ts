export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const items = await db.timeCommitment.findMany({ orderBy: { date: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.timeCommitment.create({ data: { title: body.title, type: body.type || 'family', date: new Date(body.date), duration: body.duration ?? 60, notes: body.notes || '' } })
  return NextResponse.json(item, { status: 201 })
}
