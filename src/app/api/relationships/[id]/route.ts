export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const body = await req.json()
  if (body.birthday) body.birthday = new Date(body.birthday)
  if (body.lastContact) body.lastContact = new Date(body.lastContact)
  const item = await db.relationship.update({ where: { id }, data: body })
  return NextResponse.json(item)
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  await db.relationship.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
