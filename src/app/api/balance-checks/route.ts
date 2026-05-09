export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET() {
  const items = await db.balanceCheck.findMany({ orderBy: { weekStart: 'desc' } })
  return NextResponse.json(items)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.balanceCheck.create({ data: { weekStart: new Date(body.weekStart), careerScore: body.careerScore ?? 5, healthScore: body.healthScore ?? 5, relationshipsScore: body.relationshipsScore ?? 5, financesScore: body.financesScore ?? 5, educationScore: body.educationScore ?? 5, mentalWellbeingScore: body.mentalWellbeingScore ?? 5, notes: body.notes || '' } })
  return NextResponse.json(item, { status: 201 })
}
