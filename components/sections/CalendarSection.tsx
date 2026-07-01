'use client'
import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore, MONTHS, localDateStr } from '@/lib/store'
import { PatientModal } from '../ui/PatientModal'
import { PageHeader } from '../ui/Card'
import { Button } from '../ui/Button'
import { getKoreanHoliday } from '@/lib/holidays'

export function CalendarSection() {
  const { patients, clinics } = useStore()
  const [calDate, setCalDate] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [editId, setEditId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const year = calDate.getFullYear(), mon = calDate.getMonth()
  const todayStr = localDateStr()

  const eventMap = useMemo(() => {
    const m: Record<number, { name: string; type: string; time: string; color: string; patientId: string }[]> = {}
    patients.forEach(p => {
      (p.visits ?? []).forEach(v => {
        if (!v.date) return
        const d = new Date(v.date)
        if (d.getFullYear() !== year || d.getMonth() !== mon) return
        const day = d.getDate()
        const cl = clinics.find(c => c.id === (v.clinic || p.clinic))
        if (!m[day]) m[day] = []
        m[day].push({ name: p.name, type: v.type || 'Визит', time: d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), color: cl?.color ?? '#3b82f6', patientId: p.id })
      });
      (p.flights ?? []).forEach(fl => {
        if (!fl.date) return
        const d = new Date(fl.date)
        if (d.getFullYear() !== year || d.getMonth() !== mon) return
        const day = d.getDate()
        if (!m[day]) m[day] = []
        m[day].push({ name: p.name, type: fl.label || 'Перелёт', time: d.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), color: '#f59e0b', patientId: p.id })
      })
    })
    return m
  }, [patients, clinics, year, mon])

  const first = new Date(year, mon, 1)
  let dow = first.getDay(); if (dow === 0) dow = 7
  const days = new Date(year, mon + 1, 0).getDate()
  const pad = (n: number) => String(n).padStart(2, '0')

  return (
    <div>
      <PatientModal open={modalOpen} onClose={() => { setModalOpen(false); setEditId(null) }} editId={editId} />

      <PageHeader
        title="Календарь"
        action={
          <div className="flex items-center gap-3">
            <Button variant="secondary" iconOnly onClick={() => setCalDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n })}>
              <ChevronLeft size={16} />
            </Button>
            <span className="font-semibold text-sm min-w-36 text-center">{MONTHS[mon]} {year}</span>
            <Button variant="secondary" iconOnly onClick={() => setCalDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n })}>
              <ChevronRight size={16} />
            </Button>
          </div>
        }
      />

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
        <div className="grid grid-cols-7 border-b border-gray-100">
          {(['Пн','Вт','Ср','Чт','Пт','Сб','Вс'] as const).map((d, i) => (
            <div key={d} className="py-2.5 text-center text-xs font-semibold uppercase tracking-wider bg-gray-50"
              style={{ color: i === 5 ? '#93c5fd' : i === 6 ? '#fca5a5' : '#94a3b8' }}>{d}</div>
          ))}
        </div>
        <div className="grid grid-cols-7">
          {Array.from({ length: dow - 1 }).map((_, i) => (
            <div key={`e${i}`} className="min-h-24 border-r border-b border-gray-50 bg-gray-50/50" />
          ))}
          {Array.from({ length: days }).map((_, i) => {
            const d = i + 1
            const ds = `${year}-${pad(mon + 1)}-${pad(d)}`
            const isToday = ds === todayStr
            const evs = eventMap[d] ?? []
            const holiday = getKoreanHoliday(ds)
            const col = (dow - 1 + i) % 7 // 0=Mon … 5=Sat 6=Sun
            const isSun = col === 6, isSat = col === 5
            const numColor = isToday ? '#0f1923'
              : (holiday || isSun) ? '#ef4444'
              : isSat ? '#3b82f6'
              : '#374151'
            return (
              <div key={d} className={`min-h-24 border-r border-b border-gray-50 p-1.5 last:border-r-0 ${isToday ? 'bg-teal-50/30' : holiday ? 'bg-red-50/20' : ''}`}>
                <div className="flex items-center gap-1 mb-1">
                  <div className={`text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full flex-shrink-0 ${isToday ? 'bg-teal-400' : ''}`}
                    style={{ color: numColor }}>{d}</div>
                  {holiday && (
                    <span className="text-[9px] leading-tight truncate" style={{ color: '#ef4444', maxWidth: 'calc(100% - 28px)' }}>{holiday}</span>
                  )}
                </div>
                {evs.slice(0, 3).map((e, j) => (
                  <button key={j} onClick={() => { setEditId(e.patientId); setModalOpen(true) }}
                    className="w-full text-left text-[10px] px-1.5 py-0.5 rounded mb-0.5 truncate font-medium transition-opacity hover:opacity-80"
                    style={{ background: e.color + '25', color: e.color, borderLeft: `2px solid ${e.color}` }}>
                    {e.time} {e.name}
                  </button>
                ))}
                {evs.length > 3 && <div className="text-[10px] text-gray-400">+{evs.length - 3} ещё</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
