export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  if (body.weekStart) body.weekStart = new Date(body.weekStart)
  const item = await db.weeklyReview.update({ where: { id }, data: body })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.weeklyReview.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
