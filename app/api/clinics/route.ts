import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession, clinicToApi } from '@/lib/api-helpers'

export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  const clinics = await prisma.clinic.findMany({ include: { brochures: true }, orderBy: { name: 'asc' } })
  return NextResponse.json(clinics.map(clinicToApi))
}

export async function POST(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const body = await req.json()
  const clinic = await prisma.clinic.create({
    data: {
      name: body.name ?? '',
      city: body.city || null, spec: body.spec || null, coord: body.coord || null,
      email: body.email || null,
      phone1: body.phone1 || null, phone2: body.phone2 || null, phone3: body.phone3 || null,
      addr1: body.addr1 || null, addr2: body.addr2 || null,
      notes: body.notes || null, color: body.color ?? '#3b82f6',
    },
    include: { brochures: true },
  })
  return NextResponse.json(clinicToApi(clinic), { status: 201 })
}
