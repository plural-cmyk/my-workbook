export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const items = await db.insight.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.insight.create({ data: { title: body.title, content: body.content, source: body.source || '', tags: body.tags || '' } })
  return NextResponse.json(item, { status: 201 })
}
