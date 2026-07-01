import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession, patientToApi } from '@/lib/api-helpers'

interface VisitInput { id: string; type?: string; date?: string; clinic?: string; note?: string }
interface DocInput { id: string; name?: string; date?: string; data?: string; fileType?: string }
interface FlightInput { id: string; label?: string; date?: string }

export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  const patients = await prisma.patient.findMany({
    include: { visits: true, docs: true, flights: true },
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
        create: (body.visits ?? []).map((v: VisitInput) => ({
          id: v.id,
          type: v.type ?? '',
          date: v.date ?? '',
          clinicRef: v.clinic ?? '',
          note: v.note || null,
        })),
      },
      docs: {
        create: (body.docs ?? []).map((d: DocInput) => ({
          id: d.id,
          name: d.name ?? '',
          date: d.date ?? '',
          data: d.data ?? '',
          fileType: d.fileType || null,
        })),
      },
      flights: {
        create: (body.flights ?? []).map((f: FlightInput) => ({
          id: f.id,
          label: f.label ?? '',
          date: f.date ?? '',
        })),
      },
    },
    include: { visits: true, docs: true, flights: true },
  })
  return NextResponse.json(patientToApi(patient), { status: 201 })
}
