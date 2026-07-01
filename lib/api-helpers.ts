import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import type { Patient, Visit, Doc, Clinic, ClinicDoc, Invoice, Flight } from '@prisma/client'
import { authOptions } from './auth'

export async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session) return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  return { session, error: null }
}

export function patientToApi(p: Patient & { visits: Visit[]; docs: Doc[]; flights: Flight[] }) {
  return {
    id: p.id,
    name: p.name,
    regNum: p.regNum ?? undefined,
    diag: p.diag,
    clinic: p.clinicId,
    status: p.status,
    info: p.info ?? undefined,
    visits: (p.visits ?? []).map(visitToApi),
    docs: (p.docs ?? []).map(docToApi),
    flights: (p.flights ?? []).map(flightToApi),
    created: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updated: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  }
}

export function visitToApi(v: Visit) {
  return { id: v.id, type: v.type, date: v.date, clinic: v.clinicRef, note: v.note ?? undefined }
}

export function flightToApi(f: Flight) {
  return { id: f.id, label: f.label, date: f.date }
}

export function docToApi(d: Doc) {
  return { id: d.id, name: d.name, date: d.date, data: d.data, fileType: d.fileType ?? undefined }
}

export function clinicToApi(c: Clinic & { brochures: ClinicDoc[] }) {
  return {
    id: c.id, name: c.name,
    city: c.city ?? undefined, spec: c.spec ?? undefined, coord: c.coord ?? undefined,
    email: c.email ?? undefined,
    phone1: c.phone1 ?? undefined, phone2: c.phone2 ?? undefined, phone3: c.phone3 ?? undefined,
    addr1: c.addr1 ?? undefined, addr2: c.addr2 ?? undefined,
    notes: c.notes ?? undefined, color: c.color,
    brochures: (c.brochures ?? []).map((b: ClinicDoc) => ({
      id: b.id, name: b.name, data: b.data, fileType: b.fileType ?? undefined, date: b.date,
    })),
  }
}

export function invoiceToApi(i: Invoice) {
  return {
    id: i.id, period: i.period ?? '', date: i.date, num: i.num, clinic: i.clinic,
    sum: i.sum, recv: i.recv, note: i.note,
    file: i.file ?? undefined, fileName: i.fileName ?? undefined, fileType: i.fileType ?? undefined,
    updated: i.updatedAt instanceof Date ? i.updatedAt.toISOString() : i.updatedAt,
  }
}
