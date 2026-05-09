export const runtime = 'nodejs'
import { db } from '@/lib/db'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const ventureId = req.nextUrl.searchParams.get('ventureId')
  const where = ventureId ? { ventureId } : {}
  const tasks = await db.task.findMany({ where, orderBy: { createdAt: 'desc' } })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  const task = await db.task.create({ data: { title: body.title, description: body.description || '', status: body.status || 'todo', priority: body.priority || 'medium', dueDate: body.dueDate ? new Date(body.dueDate) : null, ventureId: body.ventureId, tags: body.tags || '' } })
  return NextResponse.json(task, { status: 201 })
}
