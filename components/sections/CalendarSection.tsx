'use client'
import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore, MONTHS, localDateStr } from '@/lib/store'
import { PatientModal } from '../ui/PatientModal'
import { PageHeader, Card } from '../ui/Card'
import { Button } from '../ui/Button'
import { getKoreanHoliday } from '@/lib/holidays'

export function CalendarSection() {
  const { patients, clinics } = useStore()
  const [calDate, setCalDate] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [editId, setEditId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const year = calDate.getFullYear(), mon = calDate.getMonth()
  const todayStr = localDateStr()
  const now = new Date()
  const [selectedDay, setSelectedDay] = useState<number | null>(
    () => (year === now.getFullYear() && mon === now.getMonth()) ? now.getDate() : null
  )
  const changeMonth = (delta: number) => {
    setCalDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + delta); return n })
    setSelectedDay(null)
  }

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

  const dayEvents = selectedDay ? (eventMap[selectedDay] ?? []) : []
  const selectedDs = selectedDay ? `${year}-${pad(mon + 1)}-${pad(selectedDay)}` : null
  const selectedLabel = selectedDs
    ? new Date(selectedDs + 'T00:00:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })
    : null

  return (
    <div>
      <PatientModal open={modalOpen} onClose={() => { setModalOpen(false); setEditId(null) }} editId={editId} />

      <PageHeader
        title="Календарь"
        action={
          <div className="flex items-center gap-3">
            <Button variant="secondary" iconOnly onClick={() => changeMonth(-1)}>
              <ChevronLeft size={16} />
            </Button>
            <span className="font-semibold text-sm min-w-36 text-center">{MONTHS[mon]} {year}</span>
            <Button variant="secondary" iconOnly onClick={() => changeMonth(1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
        }
      />

      {/* Desktop: full grid with event details in each cell, scrolls if the window gets narrow */}
      <div className="desktop-only overflow-x-auto">
      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden" style={{ minWidth: 640 }}>
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

      {/* Mobile: compact grid (day number + dots) that always fits the screen width, tap a day to see its events below */}
      <div className="mobile-only">
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <div className="grid grid-cols-7 border-b border-gray-100">
            {(['Пн','Вт','Ср','Чт','Пт','Сб','Вс'] as const).map((d, i) => (
              <div key={d} className="py-2 text-center text-xs font-semibold uppercase bg-gray-50"
                style={{ color: i === 5 ? '#93c5fd' : i === 6 ? '#fca5a5' : '#94a3b8' }}>{d}</div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {Array.from({ length: dow - 1 }).map((_, i) => (
              <div key={`e${i}`} className="border-r border-b border-gray-50 bg-gray-50/50" style={{ minHeight: 46 }} />
            ))}
            {Array.from({ length: days }).map((_, i) => {
              const d = i + 1
              const ds = `${year}-${pad(mon + 1)}-${pad(d)}`
              const isToday = ds === todayStr
              const evs = eventMap[d] ?? []
              const holiday = getKoreanHoliday(ds)
              const col = (dow - 1 + i) % 7 // 0=Mon … 5=Sat 6=Sun
              const isSun = col === 6, isSat = col === 5
              const isSelected = d === selectedDay
              const numColor = isToday ? '#0f1923'
                : (holiday || isSun) ? '#ef4444'
                : isSat ? '#3b82f6'
                : '#374151'
              return (
                <button key={d} onClick={() => setSelectedDay(d)}
                  className={`flex flex-col items-center justify-center gap-0.5 border-r border-b last:border-r-0 ${isSelected ? 'border-teal-200' : 'border-gray-50'}`}
                  style={{ minHeight: 46, background: isSelected ? '#f0fdfa' : isToday ? 'rgba(45,212,191,0.08)' : holiday ? 'rgba(239,68,68,0.04)' : 'transparent' }}>
                  <span className="text-xs font-semibold w-6 h-6 flex items-center justify-center rounded-full"
                    style={{ color: isToday ? '#0f1923' : numColor, background: isToday ? '#2dd4bf' : 'transparent' }}>{d}</span>
                  <span style={{ display: 'flex', gap: 2, height: 4 }}>
                    {evs.slice(0, 3).map((e, j) => (
                      <span key={j} style={{ width: 4, height: 4, borderRadius: '50%', background: e.color }} />
                    ))}
                  </span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Agenda for the selected day */}
        <div style={{ marginTop: 16 }}>
          <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1a2332', marginBottom: 10, textTransform: 'capitalize' }}>
            {selectedLabel ?? 'Выберите день'}
          </h2>
          <Card padding={0}>
            {!selectedDay ? (
              <div style={{ padding: '28px 0', textAlign: 'center', color: '#cbd5e1', fontSize: 13.5 }}>Нажмите на день в календаре</div>
            ) : dayEvents.length === 0 ? (
              <div style={{ padding: '28px 0', textAlign: 'center', color: '#cbd5e1', fontSize: 13.5 }}>Нет событий на этот день</div>
            ) : (
              <div style={{ padding: '0 16px' }}>
                {dayEvents.map((e, i) => (
                  <button key={i} onClick={() => { setEditId(e.patientId); setModalOpen(true) }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, width: '100%', textAlign: 'left', padding: '12px 0', borderBottom: i < dayEvents.length - 1 ? '1px solid #f8fafc' : 'none', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a2332', minWidth: 44 }}>{e.time}</span>
                    <span style={{ width: 3, height: 32, borderRadius: 2, background: e.color, flexShrink: 0 }} />
                    <div style={{ minWidth: 0 }}>
                      <p style={{ fontSize: 13.5, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{e.name}</p>
                      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{e.type}</p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
