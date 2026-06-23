import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/api-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const contact = await prisma.contact.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.phone !== undefined && { phone: body.phone || null }),
      ...(body.email !== undefined && { email: body.email || null }),
      ...(body.notes !== undefined && { notes: body.notes || null }),
    },
  })
  return NextResponse.json(contact)
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params
  await prisma.contact.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
