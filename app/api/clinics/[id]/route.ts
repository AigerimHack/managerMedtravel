import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession, clinicToApi } from '@/lib/api-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params
  const body = await req.json()

  // Handle brochures separately
  if (body.brochures !== undefined) {
    await prisma.clinicDoc.deleteMany({ where: { clinicId: id } })
    if (body.brochures.length > 0) {
      await prisma.clinicDoc.createMany({
        data: body.brochures.map((b: any) => ({
          id: b.id, name: b.name, data: b.data ?? '', fileType: b.fileType || null,
          date: b.date ?? '', clinicId: id,
        })),
      })
    }
  }

  const clinic = await prisma.clinic.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.city !== undefined && { city: body.city || null }),
      ...(body.spec !== undefined && { spec: body.spec || null }),
      ...(body.coord !== undefined && { coord: body.coord || null }),
      ...(body.email !== undefined && { email: body.email || null }),
      ...(body.phone1 !== undefined && { phone1: body.phone1 || null }),
      ...(body.phone2 !== undefined && { phone2: body.phone2 || null }),
      ...(body.phone3 !== undefined && { phone3: body.phone3 || null }),
      ...(body.addr1 !== undefined && { addr1: body.addr1 || null }),
      ...(body.addr2 !== undefined && { addr2: body.addr2 || null }),
      ...(body.notes !== undefined && { notes: body.notes || null }),
      ...(body.color !== undefined && { color: body.color }),
    },
    include: { brochures: true },
  })
  return NextResponse.json(clinicToApi(clinic))
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params
  await prisma.clinic.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
