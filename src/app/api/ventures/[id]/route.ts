export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const venture = await db.venture.findUnique({ where: { id }, include: { tasks: { orderBy: { createdAt: 'desc' } }, decisions: { orderBy: { createdAt: 'desc' } }, meetings: { orderBy: { date: 'desc' } }, contacts: true } })
  if (!venture) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(venture)
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  const venture = await db.venture.update({ where: { id }, data: body })
  return NextResponse.json(venture)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.venture.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
