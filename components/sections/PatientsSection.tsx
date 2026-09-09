'use client'
import { useState } from 'react'
import { ChevronRight, Folder, FolderOpen, FileText } from 'lucide-react'
import { useStore, MONTHS, fmtDate, avatarColor, initials } from '@/lib/store'
import { StatusBadge } from '../ui/StatusBadge'
import { PatientModal } from '../ui/PatientModal'
import { PageHeader, Card } from '../ui/Card'

export function PatientsSection() {
  const { patients, clinics } = useStore()
  const [openYears, setOpenYears] = useState<Set<number>>(new Set())
  const [openMonths, setOpenMonths] = useState<Set<string>>(new Set())
  const [editId, setEditId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const clinicName = (id: string) => clinics.find(c => c.id === id)?.name ?? '—'

  const done = patients.filter(p => p.status === 'done')
  const byYear: Record<number, Record<number, typeof done>> = {}
  done.forEach(p => {
    const d = p.visits?.[0]?.date ? new Date(p.visits[0].date) : new Date(p.created)
    const yr = d.getFullYear(), mo = d.getMonth()
    if (!byYear[yr]) byYear[yr] = {}
    if (!byYear[yr][mo]) byYear[yr][mo] = []
    byYear[yr][mo].push(p)
  })

  const years = Object.keys(byYear).map(Number).sort((a, b) => b - a)
  const toggleYear = (y: number) => setOpenYears(s => { const n = new Set(s); if (n.has(y)) n.delete(y); else n.add(y); return n })
  const toggleMonth = (k: string) => setOpenMonths(s => { const n = new Set(s); if (n.has(k)) n.delete(k); else n.add(k); return n })

  return (
    <div>
      <PatientModal open={modalOpen} onClose={() => { setModalOpen(false); setEditId(null) }} editId={editId} />

      <PageHeader title="Пациенты" subtitle={`Архив завершённых случаев · ${done.length} пациентов`} />

      {years.length === 0 ? (
        <div style={{ padding: '80px 0', textAlign: 'center', color: '#cbd5e1', fontSize: 13 }}>
          Нет завершённых пациентов. Установите статус «Завершён» для архивирования.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {years.map(yr => {
            const yearOpen = openYears.has(yr)
            const totalInYear = Object.values(byYear[yr]).flat().length
            return (
              <div key={yr} style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: 20, overflow: 'hidden' }}>

                {/* Год */}
                <button onClick={() => toggleYear(yr)} style={{
                  display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                  padding: '16px 20px', background: 'none', border: 'none', cursor: 'pointer',
                  fontFamily: 'inherit', textAlign: 'left',
                }}>
                  {yearOpen
                    ? <FolderOpen size={20} style={{ color: '#2dd4bf', flexShrink: 0 }} />
                    : <Folder size={20} style={{ color: '#94a3b8', flexShrink: 0 }} />}
                  <span style={{ fontWeight: 700, fontSize: 16, color: '#1a2332', flex: 1 }}>{yr}</span>
                  <span style={{ fontSize: 12, color: '#94a3b8', marginRight: 8 }}>{totalInYear} пациентов</span>
                  <ChevronRight size={15} style={{ color: '#cbd5e1', transform: yearOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s' }} />
                </button>

                {yearOpen && (
                  <div style={{ borderTop: '1px solid #f8fafc', padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 16 }}>

                    {/* Месяцы — 3 в строку */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                      {Object.keys(byYear[yr]).map(Number).sort((a, b) => a - b).map(mo => {
                        const mk = `${yr}-${mo}`
                        const monthOpen = openMonths.has(mk)
                        const mPatients = byYear[yr][mo]
                        return (
                          <div key={mo} style={{ border: '1.5px solid', borderColor: monthOpen ? '#2dd4bf' : '#f1f5f9', borderRadius: 14, overflow: 'hidden', background: monthOpen ? '#f0fdfa' : '#f8fafc' }}>
                            <button onClick={() => toggleMonth(mk)} style={{
                              display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                              padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer',
                              fontFamily: 'inherit', textAlign: 'left',
                            }}>
                              <FileText size={15} style={{ color: monthOpen ? '#2dd4bf' : '#94a3b8', flexShrink: 0 }} />
                              <span style={{ fontSize: 13.5, fontWeight: 600, color: monthOpen ? '#0f766e' : '#475569', flex: 1 }}>{MONTHS[mo]}</span>
                              <span style={{ fontSize: 11, fontWeight: 600, background: monthOpen ? '#99f6e4' : '#e2e8f0', color: monthOpen ? '#0f766e' : '#64748b', padding: '2px 8px', borderRadius: 20 }}>{mPatients.length}</span>
                              <ChevronRight size={13} style={{ color: monthOpen ? '#2dd4bf' : '#cbd5e1', transform: monthOpen ? 'rotate(90deg)' : 'none', transition: 'transform 0.2s', marginLeft: 4 }} />
                            </button>
                          </div>
                        )
                      })}
                    </div>

                    {/* Карточки открытых месяцев */}
                    {Object.keys(byYear[yr]).map(Number).sort((a, b) => a - b).map(mo => {
                      const mk = `${yr}-${mo}`
                      if (!openMonths.has(mk)) return null
                      const mPatients = byYear[yr][mo]
                      return (
                        <div key={`cards-${mo}`}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: '#0f766e', marginBottom: 10, padding: '0 2px' }}>
                            {MONTHS[mo]} — {mPatients.length} пациентов
                          </div>
                          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
                            {mPatients.map(p => {
                              const col = avatarColor(p.name)
                              const ini = initials(p.name)
                              return (
                                <Card key={p.id} hoverable padding={18} onClick={() => { setEditId(p.id); setModalOpen(true) }}>
                                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 12 }}>
                                    <div style={{ width: 40, height: 40, borderRadius: '50%', background: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0 }}>
                                      {ini}
                                    </div>
                                    <div style={{ flex: 1, minWidth: 0 }}>
                                      <p style={{ fontSize: 14, fontWeight: 600, color: '#1a2332', marginBottom: 2 }}>{p.name}</p>
                                      <p style={{ fontSize: 12, color: '#94a3b8' }}>{clinicName(p.clinic)}</p>
                                    </div>
                                  </div>
                                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5, marginBottom: 12 }}>
                                    {p.diag && (
                                      <div style={{ display: 'flex', gap: 6 }}>
                                        <span style={{ fontSize: 11.5, color: '#94a3b8', minWidth: 52 }}>Диагноз:</span>
                                        <span style={{ fontSize: 11.5, fontWeight: 500, color: '#475569' }}>{p.diag}</span>
                                      </div>
                                    )}
                                    {p.regNum && (
                                      <div style={{ display: 'flex', gap: 6 }}>
                                        <span style={{ fontSize: 11.5, color: '#94a3b8', minWidth: 52 }}>Рег. №:</span>
                                        <span style={{ fontSize: 11.5, color: '#475569' }}>{p.regNum}</span>
                                      </div>
                                    )}
                                  </div>
                                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 12, borderTop: '1px solid #f8fafc' }}>
                                    <StatusBadge status={p.status} />
                                    <span style={{ fontSize: 11.5, color: '#cbd5e1' }}>{fmtDate(p.visits?.[0]?.date || p.created)}</span>
                                  </div>
                                </Card>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
