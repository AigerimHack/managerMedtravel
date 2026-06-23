'use client'
import { useState, useEffect } from 'react'
import { Plus, Search, LogOut } from 'lucide-react'
import { SessionProvider, useSession, signOut } from 'next-auth/react'
import { ToastProvider } from '@/components/ui/Toast'
import { Sidebar } from '@/components/ui/Sidebar'
import { PatientModal } from '@/components/ui/PatientModal'
import { VisitNotifications } from '@/components/ui/VisitNotifications'
import { useStore } from '@/lib/store'

const SIDEBAR_W = 220

function ShellInner({ children }: { children: React.ReactNode }) {
  const [addOpen, setAddOpen] = useState(false)
  const { patients, initialize, initialized } = useStore()
  const { data: session } = useSession()

  useEffect(() => { initialize() }, [])

  const greenCount = patients.filter(p => p.status === 'enrolled').length
  const reqCount = patients.filter(p => p.status !== 'enrolled' && p.status !== 'done').length

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f4f6f9' }}>
      <Sidebar greenCount={greenCount} reqCount={reqCount} user={session?.user as any} />
      <PatientModal open={addOpen} onClose={() => setAddOpen(false)} />

      <div style={{ marginLeft: SIDEBAR_W, flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh', minWidth: 0 }}>
        <div style={{
          position: 'sticky', top: 0, zIndex: 30, background: '#fff',
          borderBottom: '1px solid #f1f5f9', padding: '0 28px', height: 60,
          display: 'flex', alignItems: 'center', gap: 16,
        }}>
          <div style={{ position: 'relative', flex: 1, maxWidth: 440 }}>
            <Search size={15} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#cbd5e1' }} />
            <input
              placeholder="Поиск по пациентам, клиникам, диагнозам..."
              style={{
                width: '100%', paddingLeft: 36, paddingRight: 16, paddingTop: 8, paddingBottom: 8,
                fontSize: 13.5, border: '1px solid #e2e8f0', borderRadius: 10, outline: 'none',
                background: '#f8fafc', color: '#1a2332', fontFamily: 'inherit',
              }}
            />
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
            <VisitNotifications />
            <button
              onClick={() => setAddOpen(true)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '9px 18px', borderRadius: 10, fontSize: 13.5,
                fontWeight: 500, cursor: 'pointer', border: 'none',
                background: '#2dd4bf', color: '#0f1923', fontFamily: 'inherit',
              }}
            >
              <Plus size={15} /> Добавить пациента
            </button>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              title="Выйти"
              style={{
                width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'none', border: '1.5px solid #e2e8f0', borderRadius: 10,
                cursor: 'pointer', color: '#94a3b8',
              }}
            >
              <LogOut size={15} />
            </button>
          </div>
        </div>

        {!initialized && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 2, background: '#2dd4bf', zIndex: 100,
            animation: 'progress 1.5s ease-in-out infinite' }} />
        )}

        <main style={{ flex: 1, padding: 28 }}>
          {children}
        </main>
      </div>

      <style>{`@keyframes progress { 0%{transform:translateX(-100%)} 100%{transform:translateX(100%)} }`}</style>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <ToastProvider>
        <ShellInner>{children}</ShellInner>
      </ToastProvider>
    </SessionProvider>
  )
}
