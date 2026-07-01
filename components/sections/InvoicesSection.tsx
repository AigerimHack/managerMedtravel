'use client'
import { useRef, useMemo, useState } from 'react'
import { Plus, Trash2, Eye, Upload } from 'lucide-react'
import { useStore, MONTHS } from '@/lib/store'
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

  // Group by invoice date month (YYYY-MM), newest first
  const groups = useMemo(() => {
    const map = new Map<string, typeof invoices>()
    const sorted = [...invoices].sort((a, b) => {
      if (!a.date && !b.date) return 0
      if (!a.date) return 1
      if (!b.date) return -1
      return b.date.localeCompare(a.date)
    })
    sorted.forEach(inv => {
      const key = inv.date ? inv.date.slice(0, 7) : '__none'
      if (!map.has(key)) map.set(key, [])
      map.get(key)!.push(inv)
    })
    return Array.from(map.entries())
      .sort(([a], [b]) => {
        if (a === '__none') return 1
        if (b === '__none') return -1
        return b.localeCompare(a)
      })
      .map(([key, items]) => {
        // Commission month = invoice month - 1
        if (key === '__none') return { key, label: 'Без даты', items }
        const [y, m] = key.split('-').map(Number)
        const cm = m === 1 ? 12 : m - 1
        const cy = m === 1 ? y - 1 : y
        return { key, label: `${MONTHS[cm - 1]} ${cy}`, items }
      })
  }, [invoices])

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
        subtitle={`${invoices.length} документов`}
        action={<Button variant="primary" icon={<Plus size={14} />} onClick={() => addInvoice()}>Добавить инвойс</Button>}
      />

      {invoices.length === 0 && (
        <Card padding={0}>
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#cbd5e1', fontSize: 14 }}>
            Нет инвойсов. Добавьте первый →
          </div>
        </Card>
      )}

      {groups.map(group => (
        <div key={group.key} style={{ marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
            <span style={{ padding: '5px 16px', borderRadius: 20, background: '#ecfdf5', border: '1.5px solid #a7f3d0', fontSize: 13, fontWeight: 700, color: '#059669', whiteSpace: 'nowrap' }}>
              {group.label}
            </span>
            <div style={{ flex: 1, height: 1, background: '#f1f5f9' }} />
          </div>

          <Card padding={0} style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 760 }}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 36 }}>№</th>
                  <th style={S.th}>Дата</th>
                  <th style={S.th}>Номер</th>
                  <th style={S.th}>Клиника</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Сумма (₩)</th>
                  <th style={{ ...S.th, textAlign: 'right' }}>Поступления ($)</th>
                  <th style={S.th}>Заметки</th>
                  <th style={S.th}>Файл</th>
                  <th style={{ ...S.th, width: 40 }} />
                </tr>
              </thead>
              <tbody>
                {group.items.map((inv, idx) => (
                  <tr key={inv.id} {...S.row}>
                    <td style={{ ...S.td, color: '#94a3b8', fontSize: 12 }}>{idx + 1}</td>
                    <td style={S.td}><input key={`d-${inv.id}-${inv.date}`} type="date" defaultValue={inv.date} min="2000-01-01" max="2099-12-31" maxLength={10} onBlur={e => { const v = e.target.value; if (!v || /^\d{4}-\d{2}-\d{2}$/.test(v)) updateInvoice(inv.id, { date: v }) }} style={S.cellInput} /></td>
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
            </table>
          </Card>
        </div>
      ))}
    </div>
  )
}
