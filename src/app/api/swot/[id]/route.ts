export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const analysis = await db.sWOTAnalysis.findUnique({
    where: { id },
    include: { items: { orderBy: { order: 'asc' } }, venture: { select: { id: true, name: true, color: true } } }
  })
  if (!analysis) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(analysis)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()

  // If items are provided, replace all items
  if (body.items) {
    await db.sWOTItem.deleteMany({ where: { analysisId: id } })
    await db.sWOTAnalysis.update({
      where: { id },
      data: {
        title: body.title,
        ventureId: body.ventureId === null ? null : body.ventureId,
        items: {
          create: body.items.map((item: any, i: number) => ({
            category: item.category,
            content: item.content,
            order: i
          }))
        }
      },
      include: { items: true }
    })
  } else {
    await db.sWOTAnalysis.update({
      where: { id },
      data: { title: body.title, ventureId: body.ventureId === null ? null : body.ventureId }
    })
  }

  const updated = await db.sWOTAnalysis.findUnique({
    where: { id },
    include: { items: { orderBy: { order: 'asc' } } }
  })
  return NextResponse.json(updated)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.sWOTAnalysis.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
