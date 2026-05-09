export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const items = await db.academicTerm.findMany({ orderBy: { startDate: 'desc' }, include: { units: { include: { unitNotes: true }, orderBy: { name: 'asc' } } } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.academicTerm.create({ data: { name: body.name, startDate: new Date(body.startDate), endDate: body.endDate ? new Date(body.endDate) : null, status: body.status || 'active' } })
  return NextResponse.json(item, { status: 201 })
}
