import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/api-helpers'

export async function GET() {
  const { session, error } = await requireSession()
  if (error) return error

  const tasks = await prisma.task.findMany({
    where: { userId: session.user.id },
    orderBy: { id: 'asc' },
  })
  return NextResponse.json(tasks)
}

export async function POST(req: NextRequest) {
  const { session, error } = await requireSession()
  if (error) return error

  const body = await req.json()
  const task = await prisma.task.create({
    data: {
      text: body.text ?? '',
      due: body.due || null,
      done: body.done ?? false,
      userId: session!.user.id!,
    },
  })
  return NextResponse.json(task, { status: 201 })
}
