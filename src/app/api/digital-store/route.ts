export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const items = await db.digitalItem.findMany({ orderBy: { updatedAt: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.digitalItem.create({ data: { title: body.title, category: body.category || 'note', content: body.content || '', tags: body.tags || '', isProtected: body.isProtected ?? false } })
  return NextResponse.json(item, { status: 201 })
}
