import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/api-helpers'

function toApi(card: any) {
  return {
    id: card.id,
    diagnosis: card.diagnosis,
    notes: card.notes ?? undefined,
    entries: (card.entries ?? []).map((e: any) => ({
      id: e.id, clinicName: e.clinicName, treatment: e.treatment, price: e.price,
    })),
    created: card.createdAt instanceof Date ? card.createdAt.toISOString() : card.createdAt,
    updated: card.updatedAt instanceof Date ? card.updatedAt.toISOString() : card.updatedAt,
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params
  const body = await req.json()

  await prisma.priceEntry.deleteMany({ where: { cardId: id } })

  const card = await prisma.priceCard.update({
    where: { id },
    data: {
      ...(body.diagnosis !== undefined && { diagnosis: body.diagnosis }),
      ...(body.notes !== undefined && { notes: body.notes || null }),
      ...(body.entries !== undefined && {
        entries: {
          create: body.entries.map((e: any) => ({
            id: e.id,
            clinicName: e.clinicName ?? '',
            treatment: e.treatment ?? '',
            price: e.price ?? '',
          })),
        },
      }),
    },
    include: { entries: true },
  })
  return NextResponse.json(toApi(card))
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params
  await prisma.priceCard.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
