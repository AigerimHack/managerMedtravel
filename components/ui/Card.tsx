import { ReactNode, CSSProperties } from 'react'

interface Props {
  children: ReactNode
  style?: CSSProperties
  padding?: number | string
  onClick?: () => void
  hoverable?: boolean
}

export function Card({ children, style, padding = 20, onClick, hoverable }: Props) {
  return (
    <div
      onClick={onClick}
      style={{
        background: '#fff',
        border: '1.5px solid #f1f5f9',
        borderRadius: 16,
        padding,
        cursor: onClick ? 'pointer' : undefined,
        transition: 'border-color 0.15s, box-shadow 0.15s',
        ...style,
      }}
      onMouseEnter={hoverable ? e => {
        const el = e.currentTarget
        el.style.borderColor = '#2dd4bf'
        el.style.boxShadow = '0 4px 20px rgba(45,212,191,0.08)'
      } : undefined}
      onMouseLeave={hoverable ? e => {
        const el = e.currentTarget
        el.style.borderColor = '#f1f5f9'
        el.style.boxShadow = 'none'
      } : undefined}
    >
      {children}
    </div>
  )
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', rowGap: 12, marginBottom: 24 }}>
      <div>
        <h1 style={{ fontSize: 20, fontWeight: 700, color: '#0f1923', letterSpacing: -0.3 }}>{title}</h1>
        {subtitle && <p style={{ fontSize: 13, color: '#94a3b8', marginTop: 4 }}>{subtitle}</p>}
      </div>
      {action && <div>{action}</div>}
    </div>
  )
}

export function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <p style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12 }}>
      {children}
    </p>
  )
}
