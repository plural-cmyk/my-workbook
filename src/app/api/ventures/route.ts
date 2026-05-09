export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const ventures = await db.venture.findMany({ orderBy: { order: 'asc' }, include: { tasks: true, _count: { select: { tasks: true, decisions: true, meetings: true, contacts: true } } } })
  return NextResponse.json(ventures)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const venture = await db.venture.create({ data: { name: body.name, description: body.description || '', status: body.status || 'active', color: body.color || '#10b981', order: body.order ?? 0, stage: body.stage || 'ideation', monetaryValue: body.monetaryValue ?? 0, valueCurrency: body.valueCurrency || 'USD', valueDescription: body.valueDescription || '', needs: body.needs || '' } })
  return NextResponse.json(venture, { status: 201 })
}
