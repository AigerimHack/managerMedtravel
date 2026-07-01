import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession, patientToApi } from '@/lib/api-helpers'

interface VisitInput { id: string; type?: string; date?: string; clinic?: string; note?: string }
interface DocInput { id: string; name?: string; date?: string; data?: string; fileType?: string }
interface FlightInput { id: string; label?: string; date?: string }

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params
  const patient = await prisma.patient.findUnique({
    where: { id },
    include: { visits: true, docs: true, flights: true },
  })
  if (!patient) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json(patientToApi(patient))
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params
  const body = await req.json()

  // Delete and recreate visits + docs on update
  await prisma.visit.deleteMany({ where: { patientId: id } })
  await prisma.doc.deleteMany({ where: { patientId: id } })
  await prisma.flight.deleteMany({ where: { patientId: id } })

  const patient = await prisma.patient.update({
    where: { id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.regNum !== undefined && { regNum: body.regNum || null }),
      ...(body.diag !== undefined && { diag: body.diag }),
      ...(body.clinic !== undefined && { clinicId: body.clinic }),
      ...(body.status !== undefined && { status: body.status }),
      ...(body.info !== undefined && { info: body.info || null }),
      ...(body.visits !== undefined && {
        visits: {
          create: body.visits.map((v: VisitInput) => ({
            id: v.id,
            type: v.type ?? '',
            date: v.date ?? '',
            clinicRef: v.clinic ?? '',
            note: v.note || null,
          })),
        },
      }),
      ...(body.docs !== undefined && {
        docs: {
          create: body.docs.map((d: DocInput) => ({
            id: d.id,
            name: d.name ?? '',
            date: d.date ?? '',
            data: d.data ?? '',
            fileType: d.fileType || null,
          })),
        },
      }),
      ...(body.flights !== undefined && {
        flights: {
          create: body.flights.map((f: FlightInput) => ({
            id: f.id,
            label: f.label ?? '',
            date: f.date ?? '',
          })),
        },
      }),
    },
    include: { visits: true, docs: true, flights: true },
  })
  return NextResponse.json(patientToApi(patient))
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params
  await prisma.patient.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
