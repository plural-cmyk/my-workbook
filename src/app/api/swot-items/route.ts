export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  const body = await req.json()
  const item = await db.sWOTItem.create({
    data: {
      analysisId: body.analysisId,
      category: body.category,
      content: body.content,
      order: body.order ?? 0
    }
  })
  return NextResponse.json(item, { status: 201 })
}
