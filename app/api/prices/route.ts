import { NextRequest, NextResponse } from 'next/server'
import type { PriceCard, PriceEntry } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/api-helpers'

interface EntryInput { id: string; clinicName?: string; treatment?: string; price?: string }

function toApi(card: PriceCard & { entries: PriceEntry[] }) {
  return {
    id: card.id,
    diagnosis: card.diagnosis,
    notes: card.notes ?? undefined,
    entries: card.entries.map((e: PriceEntry) => ({
      id: e.id, clinicName: e.clinicName, treatment: e.treatment, price: e.price,
    })),
    created: card.createdAt instanceof Date ? card.createdAt.toISOString() : card.createdAt,
    updated: card.updatedAt instanceof Date ? card.updatedAt.toISOString() : card.updatedAt,
  }
}

export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  const cards = await prisma.priceCard.findMany({
    include: { entries: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(cards.map(toApi))
}

export async function POST(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const body = await req.json()
  const card = await prisma.priceCard.create({
    data: {
      diagnosis: body.diagnosis ?? '',
      notes: body.notes || null,
      entries: {
        create: (body.entries ?? []).map((e: EntryInput) => ({
          id: e.id,
          clinicName: e.clinicName ?? '',
          treatment: e.treatment ?? '',
          price: e.price ?? '',
        })),
      },
    },
    include: { entries: true },
  })
  return NextResponse.json(toApi(card), { status: 201 })
}
