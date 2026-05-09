export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const ventureId = req.nextUrl.searchParams.get('ventureId')
  const where = ventureId ? { ventureId } : {}
  const items = await db.decision.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.decision.create({ data: { title: body.title, context: body.context || '', decision: body.decision || '', rationale: body.rationale || '', ventureId: body.ventureId } })
  return NextResponse.json(item, { status: 201 })
}
