'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import { Bell } from 'lucide-react'
import { useStore } from '@/lib/store'

export function VisitNotifications() {
  const { patients, clinics } = useStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const upcoming = useMemo(() => {
    const now = new Date()
    const in24 = new Date(now.getTime() + 24 * 60 * 60 * 1000)
    const results: { patientId: string; patientName: string; type: string; date: Date; clinicName: string }[] = []
    patients.forEach(p => {
      ;(p.visits ?? []).forEach(v => {
        if (!v.date) return
        const d = new Date(v.date)
        if (d >= now && d <= in24) {
          const cl = clinics.find(c => c.id === (v.clinic || p.clinic))
          results.push({ patientId: p.id, patientName: p.name, type: v.type || 'Визит', date: d, clinicName: cl?.name ?? '' })
        }
      })
    })
    return results.sort((a, b) => a.date.getTime() - b.date.getTime())
  }, [patients, clinics])

  useEffect(() => {
    if (!open) return
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          position: 'relative', width: 36, height: 36,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: open ? '#f0fdfa' : 'none',
          border: '1.5px solid #e2e8f0', borderRadius: 10,
          cursor: 'pointer', color: '#64748b', transition: 'background 0.15s',
        }}
        title="Уведомления о визитах"
      >
        <Bell size={16} />
        {upcoming.length > 0 && (
          <span style={{
            position: 'absolute', top: -5, right: -5,
            background: '#ef4444', color: '#fff',
            fontSize: 9.5, fontWeight: 700,
            minWidth: 16, height: 16, padding: '0 3px',
            borderRadius: 8,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid #fff',
          }}>
            {upcoming.length > 9 ? '9+' : upcoming.length}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 44, right: 0,
          width: 320, background: '#fff',
          border: '1px solid #f1f5f9', borderRadius: 14,
          boxShadow: '0 8px 32px rgba(15,25,35,0.13)',
          zIndex: 50, overflow: 'hidden',
        }}>
          <div style={{ padding: '13px 16px 10px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#1a2332' }}>Визиты в ближайшие 24 ч</span>
            {upcoming.length > 0 && (
              <span style={{ fontSize: 10.5, fontWeight: 700, background: '#fef2f2', color: '#ef4444', padding: '1px 7px', borderRadius: 10 }}>
                {upcoming.length}
              </span>
            )}
          </div>

          {upcoming.length === 0 ? (
            <div style={{ padding: '28px 16px', textAlign: 'center', color: '#cbd5e1', fontSize: 13 }}>
              Нет предстоящих визитов
            </div>
          ) : (
            <div style={{ maxHeight: 380, overflowY: 'auto' }}>
              {upcoming.map((v, i) => (
                <div key={i} style={{
                  padding: '11px 16px',
                  borderBottom: i < upcoming.length - 1 ? '1px solid #f8fafc' : 'none',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#1a2332' }}>{v.patientName}</span>
                    <span style={{ fontSize: 12, color: '#2dd4bf', fontWeight: 700 }}>
                      {v.date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <span style={{ fontSize: 12, color: '#64748b' }}>
                    {v.type}{v.clinicName ? ` · ${v.clinicName}` : ''}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
