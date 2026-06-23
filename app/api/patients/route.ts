import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession, patientToApi } from '@/lib/api-helpers'

export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  const patients = await prisma.patient.findMany({
    include: { visits: true, docs: true },
    orderBy: { createdAt: 'desc' },
  })
  return NextResponse.json(patients.map(patientToApi))
}

export async function POST(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const body = await req.json()
  const patient = await prisma.patient.create({
    data: {
      name: body.name ?? '',
      regNum: body.regNum || null,
      diag: body.diag ?? '',
      clinicId: body.clinic ?? '',
      status: body.status ?? 'new',
      info: body.info || null,
      visits: {
        create: (body.visits ?? []).map((v: any) => ({
          id: v.id,
          type: v.type ?? '',
          date: v.date ?? '',
          clinicRef: v.clinic ?? '',
          note: v.note || null,
        })),
      },
      docs: {
        create: (body.docs ?? []).map((d: any) => ({
          id: d.id,
          name: d.name ?? '',
          date: d.date ?? '',
          data: d.data ?? '',
          fileType: d.fileType || null,
        })),
      },
    },
    include: { visits: true, docs: true },
  })
  return NextResponse.json(patientToApi(patient), { status: 201 })
}
