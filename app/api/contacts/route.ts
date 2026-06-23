import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/api-helpers'

export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  const contacts = await prisma.contact.findMany({ orderBy: { name: 'asc' } })
  return NextResponse.json(contacts)
}

export async function POST(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const body = await req.json()
  const contact = await prisma.contact.create({
    data: {
      type: body.type ?? 'hotel',
      name: body.name ?? '',
      phone: body.phone || null,
      email: body.email || null,
      notes: body.notes || null,
    },
  })
  return NextResponse.json(contact, { status: 201 })
}
