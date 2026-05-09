export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const items = await db.weeklyReview.findMany({ orderBy: { weekStart: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.weeklyReview.create({ data: { weekStart: new Date(body.weekStart), wins: body.wins || '', challenges: body.challenges || '', lessons: body.lessons || '', adjustments: body.adjustments || '' } })
  return NextResponse.json(item, { status: 201 })
}
