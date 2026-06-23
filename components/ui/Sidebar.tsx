'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, AlertCircle, CheckCircle2, Calendar, Building2, Users, CheckSquare, Receipt, Settings, Tag } from 'lucide-react'
import { useStore } from '@/lib/store'

const ICON_MAP: Record<string, React.ElementType> = {
  Home, AlertCircle, CheckCircle2, Calendar, Building2, Users, CheckSquare, Receipt, Settings, Tag
}

const KEY_TO_PATH: Record<string, string> = {
  home:     '/',
  requests: '/requests',
  greens:   '/greens',
  calendar: '/calendar',
  clinics:  '/clinics',
  patients: '/patients',
  tasks:    '/tasks',
  invoices: '/invoices',
  prices:   '/prices',
  settings: '/settings',
}

interface Props { greenCount: number; reqCount: number; user?: { name?: string; email?: string; role?: string } }

export function Sidebar({ greenCount, reqCount, user }: Props) {
  const { navItems } = useStore()
  const pathname = usePathname()
  const badges: Partial<Record<string, number>> = { greens: greenCount, requests: reqCount }
  const visible = [...navItems].filter(n => n.visible).sort((a, b) => a.order - b.order)
  const displayName = user?.name ?? 'Пользователь'
  const displayRole = (user as any)?.role === 'ADMIN' ? 'Администратор' : 'Менеджер'
  const ava = displayName.trim().split(' ').map((p: string) => p[0] ?? '').slice(0, 2).join('').toUpperCase()

  return (
    <nav style={{ position: 'fixed', top: 0, left: 0, height: '100vh', width: 220, display: 'flex', flexDirection: 'column', zIndex: 40, background: '#0f1923' }}>
      <div style={{ padding: '20px 20px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <div style={{ fontWeight: 700, color: '#fff', fontSize: 15 }}>MedTravel</div>
        <div style={{ fontSize: 10, color: '#8a9bb0', letterSpacing: 2, textTransform: 'uppercase', marginTop: 2 }}>CRM</div>
      </div>

      <div style={{ flex: 1, padding: '8px 0', overflowY: 'auto' }}>
        {visible.map(({ key, label, icon }) => {
          const Icon = ICON_MAP[icon] ?? Home
          const path = KEY_TO_PATH[key] ?? '/'
          const isActive = path === '/' ? pathname === '/' : pathname === path || pathname.startsWith(path + '/')
          return (
            <Link key={key} href={path}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '10px 20px', fontSize: 13.5, border: 'none', cursor: 'pointer',
                position: 'relative', fontFamily: 'inherit', transition: 'background 0.15s',
                color: isActive ? '#fff' : '#8a9bb0',
                background: isActive ? 'rgba(45,212,191,0.12)' : 'transparent',
                textDecoration: 'none',
              }}>
              {isActive && <span style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, background: '#2dd4bf', borderRadius: '0 2px 2px 0' }} />}
              <Icon size={17} />
              <span style={{ flex: 1 }}>{label}</span>
              {badges[key] ? <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 7px', borderRadius: 20, background: '#2dd4bf', color: '#0f1923' }}>{badges[key]}</span> : null}
            </Link>
          )
        })}
      </div>

      <div style={{ padding: '14px 20px', borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{ width: 34, height: 34, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, color: '#fff', background: 'linear-gradient(135deg, #2dd4bf, #6366f1)', flexShrink: 0 }}>{ava}</div>
        <div>
          <p style={{ fontSize: 13, color: '#fff', fontWeight: 500 }}>{displayName}</p>
          <p style={{ fontSize: 11, color: '#8a9bb0' }}>{displayRole}</p>
        </div>
      </div>
    </nav>
  )
}
