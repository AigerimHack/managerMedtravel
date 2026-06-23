import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession, invoiceToApi } from '@/lib/api-helpers'

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params
  const body = await req.json()
  const invoice = await prisma.invoice.update({
    where: { id },
    data: {
      ...(body.date !== undefined && { date: body.date }),
      ...(body.num !== undefined && { num: body.num }),
      ...(body.clinic !== undefined && { clinic: body.clinic }),
      ...(body.sum !== undefined && { sum: body.sum }),
      ...(body.recv !== undefined && { recv: body.recv }),
      ...(body.note !== undefined && { note: body.note }),
      ...(body.file !== undefined && { file: body.file || null }),
      ...(body.fileName !== undefined && { fileName: body.fileName || null }),
      ...(body.fileType !== undefined && { fileType: body.fileType || null }),
    },
  })
  return NextResponse.json(invoiceToApi(invoice))
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { error } = await requireSession()
  if (error) return error

  const { id } = await params
  await prisma.invoice.delete({ where: { id } })
  return NextResponse.json({ ok: true })
}
