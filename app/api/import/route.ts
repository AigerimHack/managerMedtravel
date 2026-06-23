import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession } from '@/lib/api-helpers'

export async function POST(req: NextRequest) {
  const { error } = await requireSession()
  if (error) return error

  const data = await req.json()

  // Import patients
  for (const p of data.patients ?? []) {
    await prisma.patient.upsert({
      where: { id: p.id },
      update: {},
      create: {
        id: p.id,
        name: p.name ?? '',
        regNum: p.regNum || null,
        diag: p.diag ?? '',
        clinicId: p.clinic ?? '',
        status: p.status ?? 'new',
        info: p.info || null,
        createdAt: p.created ? new Date(p.created) : new Date(),
        updatedAt: p.updated ? new Date(p.updated) : new Date(),
        visits: {
          create: (p.visits ?? []).map((v: any) => ({
            id: v.id, type: v.type ?? '', date: v.date ?? '',
            clinicRef: v.clinic ?? '', note: v.note || null,
          })),
        },
        docs: {
          create: (p.docs ?? []).map((d: any) => ({
            id: d.id, name: d.name ?? '', date: d.date ?? '',
            data: d.data ?? '', fileType: d.fileType || null,
          })),
        },
      },
    })
  }

  // Import clinics
  for (const c of data.clinics ?? []) {
    await prisma.clinic.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id, name: c.name ?? '', city: c.city || null, spec: c.spec || null,
        coord: c.coord || null, email: c.email || null,
        phone1: c.phone1 || null, phone2: c.phone2 || null, phone3: c.phone3 || null,
        addr1: c.addr1 || null, addr2: c.addr2 || null,
        notes: c.notes || null, color: c.color ?? '#3b82f6',
        brochures: {
          create: (c.brochures ?? []).map((b: any) => ({
            id: b.id, name: b.name ?? '', data: b.data ?? '',
            fileType: b.fileType || null, date: b.date ?? '',
          })),
        },
      },
    })
  }

  // Import contacts
  for (const c of data.contacts ?? []) {
    await prisma.contact.upsert({
      where: { id: c.id },
      update: {},
      create: {
        id: c.id, type: c.type ?? 'hotel', name: c.name ?? '',
        phone: c.phone || null, email: c.email || null, notes: c.notes || null,
      },
    })
  }

  // Import tasks
  for (const t of data.tasks ?? []) {
    await prisma.task.upsert({
      where: { id: t.id },
      update: {},
      create: { id: t.id, text: t.text ?? '', due: t.due || null, done: t.done ?? false },
    })
  }

  // Import invoices
  for (const i of data.invoices ?? []) {
    await prisma.invoice.upsert({
      where: { id: i.id },
      update: {},
      create: {
        id: i.id, date: i.date ?? '', num: i.num ?? '', clinic: i.clinic ?? '',
        sum: i.sum ?? '', recv: i.recv ?? '', note: i.note ?? '',
        file: i.file || null, fileName: i.fileName || null, fileType: i.fileType || null,
      },
    })
  }

  // Import navItems
  for (const n of data.navItems ?? []) {
    await prisma.navItem.upsert({
      where: { key: n.key },
      update: { label: n.label, visible: n.visible, order: n.order },
      create: { key: n.key, label: n.label, icon: n.icon, visible: n.visible, order: n.order },
    })
  }

  return NextResponse.json({ ok: true })
}
