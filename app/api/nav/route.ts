import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/api-helpers'

export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  const items = await prisma.navItem.findMany({ orderBy: { order: 'asc' } })
  return NextResponse.json(items)
}

export async function PATCH(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const { key, ...data } = await req.json()
  const item = await prisma.navItem.update({
    where: { key },
    data: {
      ...(data.label !== undefined && { label: data.label }),
      ...(data.visible !== undefined && { visible: data.visible }),
      ...(data.order !== undefined && { order: data.order }),
    },
  })
  return NextResponse.json(item)
}
