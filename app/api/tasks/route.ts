import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/api-helpers'

export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  const tasks = await prisma.task.findMany({ orderBy: { id: 'asc' } })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const body = await req.json()
  const task = await prisma.task.create({
    data: { text: body.text ?? '', due: body.due || null, done: body.done ?? false },
  })
  return NextResponse.json(task, { status: 201 })
}
