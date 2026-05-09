export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const ventureId = req.nextUrl.searchParams.get('ventureId')
  const where = ventureId ? { ventureId } : {}
  const items = await db.contact.findMany({ where, orderBy: { name: 'asc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.contact.create({ data: { name: body.name, role: body.role || '', email: body.email || '', phone: body.phone || '', notes: body.notes || '', ventureId: body.ventureId, lastInteraction: body.lastInteraction ? new Date(body.lastInteraction) : null } })
  return NextResponse.json(item, { status: 201 })
}
