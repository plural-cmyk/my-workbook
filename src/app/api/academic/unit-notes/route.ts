export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const unitId = req.nextUrl.searchParams.get('unitId')
  const where = unitId ? { unitId } : {}
  const items = await db.unitNote.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.unitNote.create({ data: { title: body.title, content: body.content || '', type: body.type || 'general', unitId: body.unitId } })
  return NextResponse.json(item, { status: 201 })
}
