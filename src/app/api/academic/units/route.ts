export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const termId = req.nextUrl.searchParams.get('termId')
  const where = termId ? { termId } : {}
  const items = await db.academicUnit.findMany({ where, include: { unitNotes: { orderBy: { createdAt: 'desc' } } }, orderBy: { name: 'asc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.academicUnit.create({ data: { name: body.name, code: body.code || '', hasPracticals: body.hasPracticals ?? false, hasProject: body.hasProject ?? false, hasExams: body.hasExams ?? true, status: body.status || 'in-progress', grade: body.grade || '', notes: body.notes || '', termId: body.termId } })
  return NextResponse.json(item, { status: 201 })
}
