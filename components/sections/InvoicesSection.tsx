'use client'
import { useState, useRef } from 'react'
import { Plus, Trash2, Eye, Upload } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Button } from '../ui/Button'
import { Card, PageHeader } from '../ui/Card'
import { FilePreviewModal } from '../ui/FilePreviewModal'
import { useToast } from '../ui/Toast'
import { S } from '@/lib/styles'

export function InvoicesSection() {
  const { invoices, clinics, addInvoice, updateInvoice, deleteInvoice } = useStore()
  const { toast } = useToast()
  const [preview, setPreview] = useState<{ fileName?: string; fileData?: string; fileType?: string } | null>(null)
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({})

  const totalSum  = invoices.reduce((a, i) => a + (parseFloat(i.sum)  || 0), 0)
  const totalRecv = invoices.reduce((a, i) => a + (parseFloat(i.recv) || 0), 0)

  const handleFile = (id: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    const r = new FileReader()
    r.onload = ev => { updateInvoice(id, { file: ev.target!.result as string, fileName: f.name, fileType: f.type }); toast('Файл загружен') }
    r.readAsDataURL(f); e.target.value = ''
  }

  return (
    <div style={{ padding: 0 }}>
      <FilePreviewModal open={!!preview} onClose={() => setPreview(null)} fileName={preview?.fileName} fileData={preview?.fileData} fileType={preview?.fileType} />

      <PageHeader
        title="Инвойсы"
        subtitle={`${invoices.length} документов · Итого: ₩${totalSum.toLocaleString('ru-RU')}`}
        action={<Button variant="primary" icon={<Plus size={14} />} onClick={addInvoice}>Добавить инвойс</Button>}
      />

      <Card padding={0} style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 36 }}>№</th>
              <th style={S.th}>Дата</th>
              <th style={S.th}>Номер</th>
              <th style={S.th}>Клиника</th>
              <th style={{ ...S.th, textAlign: 'right' }}>Сумма (₩)</th>
              <th style={{ ...S.th, textAlign: 'right' }}>Поступления (₩)</th>
              <th style={S.th}>Заметки</th>
              <th style={S.th}>Файл</th>
              <th style={{ ...S.th, width: 40 }} />
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 && (
              <tr><td colSpan={9} style={S.empty}>Нет инвойсов. Добавьте первый →</td></tr>
            )}
            {invoices.map((inv, idx) => (
              <tr key={inv.id} {...S.row}>
                <td style={{ ...S.td, color: '#94a3b8', fontSize: 12 }}>{idx + 1}</td>
                <td style={S.td}><input type="date" value={inv.date} onChange={e => updateInvoice(inv.id, { date: e.target.value })} style={S.cellInput} /></td>
                <td style={S.td}><input value={inv.num} onChange={e => updateInvoice(inv.id, { num: e.target.value })} placeholder="INV-001" style={S.cellInput} /></td>
                <td style={S.td}>
                  <select value={inv.clinic} onChange={e => updateInvoice(inv.id, { clinic: e.target.value })}
                    style={{ ...S.cellInput, cursor: 'pointer', maxWidth: 160 }}>
                    <option value="">—</option>
                    {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </td>
                <td style={S.td}><input type="number" value={inv.sum} onChange={e => updateInvoice(inv.id, { sum: e.target.value })} placeholder="0" style={{ ...S.cellInput, textAlign: 'right' }} /></td>
                <td style={S.td}><input type="number" value={inv.recv} onChange={e => updateInvoice(inv.id, { recv: e.target.value })} placeholder="0" style={{ ...S.cellInput, textAlign: 'right' }} /></td>
                <td style={S.td}><input value={inv.note} onChange={e => updateInvoice(inv.id, { note: e.target.value })} placeholder="Заметки..." style={S.cellInput} /></td>
                <td style={{ ...S.td, whiteSpace: 'nowrap' }}>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    {inv.file && (
                      <button onClick={() => setPreview({ fileName: inv.fileName, fileData: inv.file, fileType: inv.fileType })}
                        style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: '#f0fdfa', color: '#14b8a6', border: '1px solid #99f6e4', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                        <Eye size={11} /> Просмотр
                      </button>
                    )}
                    <input ref={el => { fileRefs.current[inv.id] = el }} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={e => handleFile(inv.id, e)} />
                    <button onClick={() => fileRefs.current[inv.id]?.click()}
                      style={{ display: 'flex', alignItems: 'center', gap: 4, padding: '4px 10px', borderRadius: 8, background: '#f8fafc', color: '#64748b', border: '1px solid #e2e8f0', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>
                      <Upload size={11} /> {inv.file ? 'Заменить' : 'Загрузить'}
                    </button>
                  </div>
                </td>
                <td style={S.td}>
                  <button onClick={() => { if (confirm('Удалить?')) { deleteInvoice(inv.id); toast('Удалено') } }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e2e8f0', display: 'flex', padding: 4, borderRadius: 6 }}
                    onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                    onMouseLeave={e => (e.currentTarget.style.color = '#e2e8f0')}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          {invoices.length > 0 && (
            <tfoot>
              <tr style={{ background: '#f8fafc', borderTop: '1.5px solid #f1f5f9' }}>
                <td colSpan={4} style={{ padding: '12px 16px', fontSize: 12, fontWeight: 700, color: '#64748b', textAlign: 'right', textTransform: 'uppercase', letterSpacing: 0.5 }}>Итого</td>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#0f1923', textAlign: 'right' }}>₩{totalSum.toLocaleString('ru-RU')}</td>
                <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 700, color: '#10b981', textAlign: 'right' }}>₩{totalRecv.toLocaleString('ru-RU')}</td>
                <td colSpan={3} />
              </tr>
            </tfoot>
          )}
        </table>
      </Card>
    </div>
  )
}
