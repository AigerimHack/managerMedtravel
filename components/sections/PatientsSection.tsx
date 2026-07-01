'use client'
import { useState } from 'react'
import { ChevronRight, Folder, FolderOpen, FileText } from 'lucide-react'
import { useStore, MONTHS, fmtDate } from '@/lib/store'
import { StatusBadge } from '../ui/StatusBadge'
import { PatientModal } from '../ui/PatientModal'
import { PageHeader } from '../ui/Card'

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
        <div className="py-20 text-center text-gray-300 text-sm">
          Нет завершённых пациентов. Установите статус «Завершён» для архивирования.
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {years.map(yr => {
            const yearOpen = openYears.has(yr)
            const totalInYear = Object.values(byYear[yr]).flat().length
            return (
              <div key={yr} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
                <button onClick={() => toggleYear(yr)} className="flex items-center gap-3 w-full px-5 py-4 hover:bg-gray-50 transition-colors text-left">
                  {yearOpen ? <FolderOpen size={18} className="text-teal-500" /> : <Folder size={18} className="text-gray-400" />}
                  <span className="font-semibold text-sm flex-1">{yr}</span>
                  <span className="text-xs text-gray-400 mr-2">{totalInYear} пациентов</span>
                  <ChevronRight size={14} className={`text-gray-400 transition-transform ${yearOpen ? 'rotate-90' : ''}`} />
                </button>

                {yearOpen && (
                  <div className="border-t border-gray-50">
                    {Object.keys(byYear[yr]).map(Number).sort((a, b) => a - b).map(mo => {
                      const mk = `${yr}-${mo}`
                      const monthOpen = openMonths.has(mk)
                      const mPatients = byYear[yr][mo]
                      return (
                        <div key={mo}>
                          <button onClick={() => toggleMonth(mk)}
                            className="flex items-center gap-3 w-full px-8 py-3 hover:bg-gray-50 transition-colors text-left border-b border-gray-50">
                            <FileText size={14} className="text-gray-300" />
                            <span className="text-sm text-gray-600 flex-1">{MONTHS[mo]}</span>
                            <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full mr-2">{mPatients.length}</span>
                            <ChevronRight size={13} className={`text-gray-300 transition-transform ${monthOpen ? 'rotate-90' : ''}`} />
                          </button>
                          {monthOpen && (
                            <div className="border-b border-gray-50">
                              {mPatients.map(p => (
                                <div key={p.id} onClick={() => { setEditId(p.id); setModalOpen(true) }}
                                  className="flex items-center gap-4 px-12 py-3 hover:bg-gray-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0">
                                  <div className="flex-1">
                                    <p className="text-sm font-medium">{p.name}</p>
                                    <p className="text-xs text-gray-400">{p.diag || '—'} · {clinicName(p.clinic)}</p>
                                  </div>
                                  <StatusBadge status={p.status} />
                                  <span className="text-xs text-gray-400">{fmtDate(p.visits?.[0]?.date || p.created)}</span>
                                </div>
                              ))}
                            </div>
                          )}
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
