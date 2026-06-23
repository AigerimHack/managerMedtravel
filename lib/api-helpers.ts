import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from './auth'

export async function requireSession() {
  const session = await getServerSession(authOptions)
  if (!session) return { session: null, error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  return { session, error: null }
}

export function patientToApi(p: any) {
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
    created: p.createdAt instanceof Date ? p.createdAt.toISOString() : p.createdAt,
    updated: p.updatedAt instanceof Date ? p.updatedAt.toISOString() : p.updatedAt,
  }
}

export function visitToApi(v: any) {
  return { id: v.id, type: v.type, date: v.date, clinic: v.clinicRef, note: v.note ?? undefined }
}

export function docToApi(d: any) {
  return { id: d.id, name: d.name, date: d.date, data: d.data, fileType: d.fileType ?? undefined }
}

export function clinicToApi(c: any) {
  return {
    id: c.id, name: c.name,
    city: c.city ?? undefined, spec: c.spec ?? undefined, coord: c.coord ?? undefined,
    email: c.email ?? undefined,
    phone1: c.phone1 ?? undefined, phone2: c.phone2 ?? undefined, phone3: c.phone3 ?? undefined,
    addr1: c.addr1 ?? undefined, addr2: c.addr2 ?? undefined,
    notes: c.notes ?? undefined, color: c.color,
    brochures: (c.brochures ?? []).map((b: any) => ({
      id: b.id, name: b.name, data: b.data, fileType: b.fileType ?? undefined, date: b.date,
    })),
  }
}

export function invoiceToApi(i: any) {
  return {
    id: i.id, date: i.date, num: i.num, clinic: i.clinic,
    sum: i.sum, recv: i.recv, note: i.note,
    file: i.file ?? undefined, fileName: i.fileName ?? undefined, fileType: i.fileType ?? undefined,
    updated: i.updatedAt instanceof Date ? i.updatedAt.toISOString() : i.updatedAt,
  }
}
