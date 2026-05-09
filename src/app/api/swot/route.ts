export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const ventureId = req.nextUrl.searchParams.get('ventureId')
  const where = ventureId ? { ventureId } : {}
  const analyses = await db.sWOTAnalysis.findMany({
    where,
    include: { items: { orderBy: { order: 'asc' } }, venture: { select: { id: true, name: true, color: true } } },
    orderBy: { createdAt: 'desc' }
  })
  return NextResponse.json(analyses)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const { title, ventureId, items } = body
  const analysis = await db.sWOTAnalysis.create({
    data: {
      title,
      ventureId: ventureId || null,
      items: {
        create: (items || []).map((item: any, i: number) => ({
          category: item.category,
          content: item.content,
          order: i
        }))
      }
    },
    include: { items: true }
  })
  return NextResponse.json(analysis, { status: 201 })
}
