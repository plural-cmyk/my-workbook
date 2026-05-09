export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const items = await db.relationship.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.relationship.create({ data: { name: body.name, type: body.type || 'friend', notes: body.notes || '', birthday: body.birthday ? new Date(body.birthday) : null, lastContact: body.lastContact ? new Date(body.lastContact) : null } })
  return NextResponse.json(item, { status: 201 })
}
