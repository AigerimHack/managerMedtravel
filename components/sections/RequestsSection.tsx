'use client'
import { useState } from 'react'
import { Plus, MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useStore, STATUSES, Status, fmtDateTime } from '@/lib/store'
import { Button } from '../ui/Button'
import { Card, PageHeader } from '../ui/Card'
import { PatientModal } from '../ui/PatientModal'
import { useToast } from '../ui/Toast'
import { S } from '@/lib/styles'

export function RequestsSection() {
  const { patients, updatePatient, deletePatient, clinics } = useStore()
  const { toast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)

  const list = patients.filter(p => p.status !== 'enrolled' && p.status !== 'done')
  const clinicName = (id: string) => clinics.find(c => c.id === id)?.name ?? '—'

  return (
    <div>
      <PatientModal open={modalOpen} onClose={() => { setModalOpen(false); setEditId(null) }} editId={editId} defaultStatus="new" />

      <PageHeader
        title="Запросы"
        subtitle={`${list.length} пациентов в обработке`}
        action={<Button variant="primary" icon={<Plus size={14} />} onClick={() => { setEditId(null); setModalOpen(true) }}>Добавить запрос</Button>}
      />

      <Card padding={0}>
        {list.length === 0 ? (
          <div style={S.empty}>Нет запросов. Добавьте первого пациента →</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={S.th}>ФИО</th>
                <th style={S.th}>Клиника</th>
                <th style={S.th}>Диагноз / Цель</th>
                <th style={S.th}>Дата визита</th>
                <th style={S.th}>Статус</th>
                <th style={S.th}>Обновлено</th>
                <th style={{ ...S.th, width: 40 }} />
              </tr>
            </thead>
            <tbody>
              {list.map(p => (
                <tr key={p.id} {...S.row}>
                  <td style={{ ...S.td, fontWeight: 500, cursor: 'pointer', color: '#1a2332' }} onClick={() => { setEditId(p.id); setModalOpen(true) }}>{p.name}</td>
                  <td style={{ ...S.td, color: '#64748b' }}>{clinicName(p.clinic)}</td>
                  <td style={{ ...S.td, color: '#64748b', maxWidth: 180 }}>
                    <span style={S.truncate}>{p.diag || '—'}</span>
                  </td>
                  <td style={{ ...S.td, color: '#94a3b8' }}>{p.visits?.[0]?.date ? new Date(p.visits[0].date).toLocaleDateString('ru-RU') : '—'}</td>
                  <td style={S.td}>
                    <select value={p.status}
                      onChange={e => { updatePatient(p.id, { status: e.target.value as Status }); if (e.target.value === 'enrolled') toast('✅ Перемещён в «Зелёные»') }}
                      style={{ fontSize: 12.5, border: '1.5px solid #e2e8f0', borderRadius: 8, padding: '5px 10px', outline: 'none', background: '#fff', cursor: 'pointer', fontFamily: 'inherit', color: '#1a2332' }}>
                      {STATUSES.filter(s => s.key !== 'done').map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
                    </select>
                  </td>
                  <td style={{ ...S.td, color: '#94a3b8', fontSize: 12 }}>{fmtDateTime(p.updated || p.created)}</td>
                  <td style={{ ...S.td, position: 'relative' }}>
                    <Button variant="ghost" iconOnly size="sm" onClick={() => setOpenMenu(openMenu === p.id ? null : p.id)}>
                      <MoreVertical size={15} />
                    </Button>
                    {openMenu === p.id && (
                      <div style={S.dropdown} onMouseLeave={() => setOpenMenu(null)}>
                        <Button variant="ghost" size="sm" full icon={<Pencil size={13} />}
                          onClick={() => { setEditId(p.id); setModalOpen(true); setOpenMenu(null) }}>
                          Редактировать
                        </Button>
                        <Button variant="ghost-danger" size="sm" full icon={<Trash2 size={13} />}
                          onClick={() => { deletePatient(p.id); setOpenMenu(null); toast('Пациент удалён') }}>
                          Удалить
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </div>
  )
}
