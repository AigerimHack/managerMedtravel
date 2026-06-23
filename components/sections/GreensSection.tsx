'use client'
import { useState, useMemo } from 'react'
import { MoreVertical, Pencil, Trash2 } from 'lucide-react'
import { useStore, avatarColor, initials } from '@/lib/store'
import { StatusBadge } from '../ui/StatusBadge'
import { PatientModal } from '../ui/PatientModal'
import { useToast } from '../ui/Toast'
import { PageHeader, Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { Input, Select } from '../ui/Input'
import { S } from '@/lib/styles'

export function GreensSection() {
  const { patients, deletePatient, clinics } = useStore()
  const { toast } = useToast()
  const [modalOpen, setModalOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const [filterClinic, setFilterClinic] = useState('')
  const [filterDiag, setFilterDiag] = useState('')
  const [filterFrom, setFilterFrom] = useState('')
  const [filterTo, setFilterTo] = useState('')

  const clinicName = (id: string) => clinics.find(c => c.id === id)?.name ?? id ?? '—'

  const greens = useMemo(() => {
    return patients.filter(p => {
      if (p.status !== 'enrolled') return false
      if (filterClinic && p.clinic !== filterClinic && !(p.visits ?? []).some(v => v.clinic === filterClinic)) return false
      if (filterDiag && !(p.diag ?? '').toLowerCase().includes(filterDiag.toLowerCase())) return false
      if (filterFrom || filterTo) {
        const dates = (p.visits ?? []).map(v => v.date?.slice(0, 10)).filter(Boolean) as string[]
        if (!dates.length) return false
        if (!dates.some(d => (!filterFrom || d >= filterFrom) && (!filterTo || d <= filterTo))) return false
      }
      return true
    })
  }, [patients, filterClinic, filterDiag, filterFrom, filterTo])

  const clearFilters = () => { setFilterClinic(''); setFilterDiag(''); setFilterFrom(''); setFilterTo('') }
  const hasFilters = filterClinic || filterDiag || filterFrom || filterTo

  return (
    <div>
      <PatientModal open={modalOpen} onClose={() => { setModalOpen(false); setEditId(null) }} editId={editId} />

      <PageHeader title="Зелёные" subtitle={`Записанные пациенты · ${greens.length}`} />

      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <Select value={filterClinic} onChange={setFilterClinic} wrapStyle={{ minWidth: 160 }}>
          <option value="">Все клиники</option>
          {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Input value={filterDiag} onChange={setFilterDiag} placeholder="Поиск по диагнозу..." wrapStyle={{ width: 200 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Input type="date" value={filterFrom} onChange={setFilterFrom} wrapStyle={{ width: 160 }} />
          <span style={{ color: '#cbd5e1', fontSize: 16, fontWeight: 300 }}>—</span>
          <Input type="date" value={filterTo} onChange={setFilterTo} wrapStyle={{ width: 160 }} />
        </div>
        {hasFilters && (
          <Button variant="ghost-danger" onClick={clearFilters}>Сбросить</Button>
        )}
      </div>

      {greens.length === 0 ? (
        <div style={{ ...S.empty, padding: '80px 0' }}>
          {hasFilters ? 'Нет пациентов по выбранным фильтрам' : 'Нет записанных пациентов'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {greens.map(p => {
            const col = avatarColor(p.name)
            const ini = initials(p.name)
            const nextVisit = p.visits?.[0]
            return (
              <Card key={p.id} hoverable padding={20} onClick={() => { setEditId(p.id); setModalOpen(true) }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                    {ini}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14.5, fontWeight: 600, color: '#1a2332', marginBottom: 3 }}>{p.name}</p>
                    <p style={{ fontSize: 12, color: '#94a3b8' }}>{clinicName(p.clinic)}</p>
                  </div>
                  <div onClick={e => e.stopPropagation()} style={{ position: 'relative' }}>
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
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <span style={{ fontSize: 12, color: '#94a3b8', minWidth: 60 }}>Диагноз:</span>
                    <span style={{ fontSize: 12, fontWeight: 500, color: '#475569' }}>{p.diag || '—'}</span>
                  </div>
                  {nextVisit?.date && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#94a3b8', minWidth: 60 }}>Визит:</span>
                      <span style={{ fontSize: 12, color: '#475569' }}>
                        {new Date(nextVisit.date).toLocaleDateString('ru-RU')} {new Date(nextVisit.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  {p.regNum && (
                    <div style={{ display: 'flex', gap: 8 }}>
                      <span style={{ fontSize: 12, color: '#94a3b8', minWidth: 60 }}>Рег. №:</span>
                      <span style={{ fontSize: 12, color: '#475569' }}>{p.regNum}</span>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 14, borderTop: '1px solid #f8fafc' }}>
                  <StatusBadge status={p.status} />
                  <span style={{ fontSize: 12, color: '#cbd5e1' }}>{(p.docs ?? []).length} файл(ов)</span>
                </div>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
