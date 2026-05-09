export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const item = await db.sWOTItem.update({
    where: { id },
    data: { content: body.content, category: body.category, order: body.order }
  })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.sWOTItem.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
