import { ReactNode, CSSProperties } from 'react'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'ghost-danger'
type Size = 'sm' | 'md' | 'lg'

interface Props {
  children?: ReactNode
  onClick?: () => void
  variant?: Variant
  size?: Size
  icon?: ReactNode
  disabled?: boolean
  type?: 'button' | 'submit'
  style?: CSSProperties
  iconOnly?: boolean
  full?: boolean
  active?: boolean
  title?: string
}

const VARIANTS: Record<Variant, CSSProperties> = {
  primary:        { background: '#2dd4bf', color: '#0f1923', border: 'none' },
  secondary:      { background: '#fff', color: '#475569', border: '1px solid #e2e8f0' },
  danger:         { background: '#fef2f2', color: '#ef4444', border: '1px solid #fecaca' },
  ghost:          { background: 'transparent', color: '#64748b', border: 'none' },
  'ghost-danger': { background: 'transparent', color: '#ef4444', border: 'none' },
}

const HOVER_BG: Record<Variant, string> = {
  primary:        '#26bba9',
  secondary:      '#f8fafc',
  danger:         '#fee2e2',
  ghost:          '#f1f5f9',
  'ghost-danger': '#fef2f2',
}

const SIZES: Record<Size, CSSProperties> = {
  sm: { padding: '6px 12px', fontSize: 12.5, borderRadius: 8 },
  md: { padding: '9px 18px', fontSize: 13.5, borderRadius: 10 },
  lg: { padding: '11px 24px', fontSize: 14.5, borderRadius: 12 },
}

const ICON_SIZES: Record<Size, CSSProperties> = {
  sm: { padding: 6, fontSize: 12.5, borderRadius: 8 },
  md: { padding: 8, fontSize: 13.5, borderRadius: 9 },
  lg: { padding: 10, fontSize: 14.5, borderRadius: 10 },
}

export function Button({ children, onClick, variant = 'secondary', size = 'md', icon, disabled, type = 'button', style, iconOnly, full, active, title }: Props) {
  const v: Variant = active ? 'primary' : variant
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        fontWeight: 500, cursor: disabled ? 'not-allowed' : 'pointer',
        fontFamily: 'inherit', transition: 'background 0.15s, opacity 0.15s',
        opacity: disabled ? 0.5 : 1, whiteSpace: 'nowrap',
        width: full ? '100%' : undefined,
        ...VARIANTS[v], ...(iconOnly ? ICON_SIZES[size] : SIZES[size]), ...style,
      }}
      onMouseEnter={disabled ? undefined : e => { e.currentTarget.style.background = HOVER_BG[v] }}
      onMouseLeave={disabled ? undefined : e => { e.currentTarget.style.background = String(VARIANTS[v].background) }}
    >
      {icon}
      {children}
    </button>
  )
}
