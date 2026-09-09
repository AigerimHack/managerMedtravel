'use client'
import { ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}

export function Modal({ open, onClose, title, children, footer, wide }: Props) {
  if (!open) return null

  return (
    <div
      style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24, background: 'rgba(15,25,35,0.5)', backdropFilter: 'blur(2px)' }}
    >
      <div style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: wide ? 680 : 500, maxHeight: '88vh', display: 'flex', flexDirection: 'column', boxShadow: '0 24px 64px rgba(0,0,0,0.18)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '20px 28px 18px', borderBottom: '1.5px solid #f1f5f9', flexShrink: 0 }}>
          <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f1923', margin: 0 }}>{title}</h2>
          <button onClick={onClose} style={{ background: '#f8fafc', border: 'none', cursor: 'pointer', color: '#94a3b8', padding: 7, borderRadius: 10, display: 'flex' }}>
            <X size={16} />
          </button>
        </div>
        <div style={{ overflowY: 'auto', flex: 1, padding: '24px 28px' }}>
          {children}
        </div>
        {footer && (
          <div style={{ padding: '16px 28px 20px', borderTop: '1.5px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 10, flexShrink: 0, background: '#fff', borderRadius: '0 0 20px 20px' }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}