'use client'
import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useStore, localDateStr, MONTHS, fmtDateTime } from '@/lib/store'
import { getKoreanHoliday } from '@/lib/holidays'
import { StatusBadge } from '../ui/StatusBadge'
import { PatientModal } from '../ui/PatientModal'
import { Card } from '../ui/Card'

function miniCalDays(year: number, mon: number) {
  const first = new Date(year, mon, 1)
  let dow = first.getDay(); if (dow === 0) dow = 7
  const days = new Date(year, mon + 1, 0).getDate()
  return { dow, days }
}

export function HomeSection() {
  const { patients, tasks, clinics } = useStore()
  const [calDate, setCalDate] = useState(() => { const d = new Date(); d.setDate(1); return d })
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editId, setEditId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)

  const todayStr = localDateStr()
  const showDate = selectedDate ?? todayStr
  const isToday = showDate === todayStr

  const scheduleVisits = useMemo(() => {
    const res: { name: string; type: string; time: string; clinicName: string; color: string }[] = []
    patients.forEach(p => {
      ;(p.visits ?? []).forEach(v => {
        if (v.date?.slice(0, 10) === showDate) {
          const cl = clinics.find(c => c.id === (v.clinic || p.clinic))
          res.push({ name: p.name, type: v.type || 'Визит', time: new Date(v.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), clinicName: cl?.name ?? '—', color: cl?.color ?? '#3b82f6' })
        }
      })
      ;(p.flights ?? []).forEach(fl => {
        if (fl.date && fl.date.slice(0, 10) === showDate)
          res.push({ name: p.name, type: fl.label || 'Перелёт', time: new Date(fl.date).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' }), clinicName: '', color: '#f59e0b' })
      })
    })
    return res.sort((a, b) => a.time.localeCompare(b.time))
  }, [patients, clinics, showDate])

  const todayVisitCount = useMemo(() =>
    patients.reduce((a, p) => a + (p.visits ?? []).filter(v => v.date?.slice(0, 10) === todayStr).length, 0),
    [patients, todayStr])

  const recentRequests = useMemo(() => {
    // eslint-disable-next-line react-hooks/purity
    const weekAgo = localDateStr(new Date(Date.now() - 7 * 86400000))
    return patients
      .filter(p => p.status !== 'done' && (p.updated || p.created).slice(0, 10) >= weekAgo)
      .sort((a, b) => (b.updated || b.created).localeCompare(a.updated || a.created))
  }, [patients])

  const year = calDate.getFullYear(), mon = calDate.getMonth()
  const { dow, days } = miniCalDays(year, mon)

  const eventDays = (() => {
    const s = new Set<number>()
    patients.forEach(p => {
      ;(p.visits ?? []).forEach(v => {
        if (v.date) { const d = new Date(v.date); if (d.getFullYear() === year && d.getMonth() === mon) s.add(d.getDate()) }
      })
      ;(p.flights ?? []).forEach(fl => {
        if (fl.date) { const d = new Date(fl.date); if (d.getFullYear() === year && d.getMonth() === mon) s.add(d.getDate()) }
      })
    })
    return s
  })()

  const todayTasks = tasks.filter(t => !t.done && (!t.due || t.due >= todayStr)).slice(0, 4)
  const pad = (n: number) => String(n).padStart(2, '0')

  const selectDay = (d: number) => {
    const ds = `${year}-${pad(mon + 1)}-${pad(d)}`
    setSelectedDate(ds === todayStr ? null : ds)
  }

  const displayLabel = isToday
    ? 'сегодня'
    : new Date(showDate + 'T00:00:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })

  const greens = patients.filter(p => p.status === 'enrolled').length
  const reqs = patients.filter(p => p.status !== 'enrolled' && p.status !== 'done').length

  const miniCalendar = (
    <Card padding={16}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600 }}>{MONTHS[mon]} {year}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <button onClick={() => setCalDate(d => { const n = new Date(d); n.setMonth(n.getMonth() - 1); return n })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6, display: 'flex' }}>
            <ChevronLeft size={14} />
          </button>
          <button onClick={() => setCalDate(d => { const n = new Date(d); n.setMonth(n.getMonth() + 1); return n })}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 4, borderRadius: 6, display: 'flex' }}>
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2 }}>
        {(['Пн','Вт','Ср','Чт','Пт','Сб','Вс'] as const).map((d, i) => (
          <div key={d} style={{ textAlign: 'center', fontSize: 10, fontWeight: 500, padding: '4px 0',
            color: i === 5 ? '#93c5fd' : i === 6 ? '#fca5a5' : '#94a3b8' }}>{d}</div>
        ))}
        {Array.from({ length: dow - 1 }).map((_, i) => <div key={`e${i}`} />)}
        {Array.from({ length: days }).map((_, i) => {
          const d = i + 1
          const ds = `${year}-${pad(mon + 1)}-${pad(d)}`
          const isT = ds === todayStr
          const isSel = ds === selectedDate
          const hasEv = eventDays.has(d)
          const holiday = getKoreanHoliday(ds)
          const col = (dow - 1 + i) % 7 // 0=Mon … 5=Sat 6=Sun
          const isSat = col === 5, isSun = col === 6
          return (
            <button key={d} onClick={() => selectDay(d)} title={holiday ?? undefined} style={{
              position: 'relative', textAlign: 'center', fontSize: 12, padding: '6px 2px',
              borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 500, fontFamily: 'inherit',
              background: isT ? '#2dd4bf' : isSel ? '#eff6ff' : 'none',
              color: isT ? '#0f1923' : isSel ? '#1e40af'
                : (holiday || isSun) ? '#ef4444' : isSat ? '#93c5fd' : '#374151',
            }}>
              {d}
              {(hasEv || holiday) && !isT && (
                <span style={{
                  position: 'absolute', bottom: 2, left: '50%', transform: 'translateX(-50%)',
                  width: 4, height: 4, borderRadius: '50%', display: 'block',
                  background: hasEv ? '#2dd4bf' : '#ef4444',
                }} />
              )}
            </button>
          )
        })}
      </div>
    </Card>
  )

  return (
    <div>
      <PatientModal open={modalOpen} onClose={() => { setModalOpen(false); setEditId(null) }} editId={editId} />

      {/* Stats row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" style={{ marginBottom: 24 }}>
        {[
          { num: greens, label: '🟢 Зелёные (записаны)', color: '#10b981' },
          { num: reqs,   label: '🟡 Запросы (в работе)', color: '#f59e0b' },
          { num: todayVisitCount, label: '📅 Визитов сегодня', color: '#2dd4bf' },
        ].map(({ num, label, color }) => (
          <Card key={label} padding="20px 24px">
            <div style={{ fontSize: 32, fontWeight: 700, color, lineHeight: 1 }}>{num}</div>
            <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 8 }}>{label}</div>
          </Card>
        ))}
      </div>

      {/* Mini calendar — shown here only on mobile, right under the stats */}
      <div className="mobile-only" style={{ marginBottom: 20 }}>
        {miniCalendar}
      </div>

      {/* Main grid */}
      <div className="home-main-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 24, alignItems: 'start' }}>

        {/* LEFT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Schedule */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: '#1a2332' }}>
                  {isToday ? 'Расписание на сегодня' : `Расписание на ${displayLabel}`}
                </h2>
                <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 3 }}>
                  {new Date(showDate + 'T00:00:00').toLocaleDateString('ru-RU', { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
              </div>
              {!isToday && (
                <button onClick={() => setSelectedDate(null)}
                  style={{ fontSize: 12, color: '#14b8a6', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: 500 }}>
                  ← Вернуть сегодня
                </button>
              )}
            </div>
            <Card padding={0}>
              <div style={{ padding: '12px 20px', borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {isToday ? 'Сегодня' : displayLabel}
                </span>
              </div>
              <div style={{ padding: '0 20px' }}>
                {scheduleVisits.length === 0 ? (
                  <div style={{ padding: '32px 0', textAlign: 'center', color: '#cbd5e1', fontSize: 13.5 }}>Нет визитов на этот день</div>
                ) : scheduleVisits.map((v, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: i < scheduleVisits.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a2332', minWidth: 44 }}>{v.time}</span>
                    <span style={{ width: 3, height: 36, borderRadius: 2, background: v.color, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: 13.5, fontWeight: 500 }}>{v.name}</p>
                      <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 2 }}>{v.type} · {v.clinicName}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          {/* Recent requests */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: '#1a2332' }}>Запросы за последние 7 дней</h2>
            </div>
            <Card padding={0}>
              {recentRequests.length === 0 ? (
                <div style={{ padding: '32px 0', textAlign: 'center', color: '#cbd5e1', fontSize: 13.5 }}>Нет новых запросов за неделю</div>
              ) : (
                <>
                  {/* Desktop: table */}
                  <table className="desktop-only" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '1px solid #f1f5f9', background: '#f8fafc' }}>
                        {['ФИО', 'Диагноз', 'Статус', 'Обновлено'].map(h => (
                          <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 0.5 }}>{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {recentRequests.map(p => (
                        <tr key={p.id} onClick={() => { setEditId(p.id); setModalOpen(true) }}
                          style={{ borderBottom: '1px solid #f8fafc', cursor: 'pointer' }}>
                          <td style={{ padding: '12px 16px', fontSize: 13.5, fontWeight: 500 }}>{p.name}</td>
                          <td style={{ padding: '12px 16px', fontSize: 13.5, color: '#64748b' }}>{p.diag || '—'}</td>
                          <td style={{ padding: '12px 16px' }}><StatusBadge status={p.status} /></td>
                          <td style={{ padding: '12px 16px', fontSize: 12, color: '#94a3b8' }}>{fmtDateTime(p.updated || p.created)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Mobile: stacked list, no horizontal scroll */}
                  <div className="mobile-only">
                    {recentRequests.map((p, i) => (
                      <div key={p.id} onClick={() => { setEditId(p.id); setModalOpen(true) }}
                        style={{ padding: '12px 16px', borderBottom: i < recentRequests.length - 1 ? '1px solid #f8fafc' : 'none', cursor: 'pointer' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 13.5, fontWeight: 500 }}>{p.name}</span>
                          <StatusBadge status={p.status} />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                          <span style={{ fontSize: 12, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.diag || '—'}</span>
                          <span style={{ fontSize: 11, color: '#94a3b8', flexShrink: 0 }}>{fmtDateTime(p.updated || p.created)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

          {/* Mini calendar — hidden here on mobile, shown right after stats instead */}
          <div className="desktop-only">{miniCalendar}</div>

          {/* Tasks */}
          <Card padding={16}>
            <div style={{ fontSize: 13.5, fontWeight: 600, marginBottom: 12 }}>Список дел</div>
            {todayTasks.length === 0 ? (
              <div style={{ fontSize: 12, color: '#cbd5e1', padding: '12px 0', textAlign: 'center' }}>Нет задач</div>
            ) : todayTasks.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 0', borderBottom: '1px solid #f8fafc' }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#2dd4bf', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13.5, color: '#374151' }}>{t.text}</span>
                {t.due && <span style={{ fontSize: 11, color: '#94a3b8' }}>{new Date(t.due + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}</span>}
              </div>
            ))}
          </Card>
        </div>
      </div>
    </div>
  )
}
