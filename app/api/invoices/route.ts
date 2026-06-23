import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireSession, invoiceToApi } from '@/lib/api-helpers'

export async function GET() {
  const { error } = await requireSession()
  if (error) return error

  const invoices = await prisma.invoice.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json(invoices.map(invoiceToApi))
}

export async function POST() {
  const { error } = await requireSession()
  if (error) return error

  const invoice = await prisma.invoice.create({ data: {} })
  return NextResponse.json(invoiceToApi(invoice), { status: 201 })
}
