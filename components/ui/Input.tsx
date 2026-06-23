import { CSSProperties, ReactNode, forwardRef } from 'react'

interface BaseProps {
  label?: string
  hint?: string
  error?: string
  required?: boolean
  style?: CSSProperties
  wrapStyle?: CSSProperties
}

interface InputProps extends BaseProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
}

interface SelectProps extends BaseProps {
  value: string
  onChange: (v: string) => void
  children: ReactNode
}

interface TextareaProps extends BaseProps {
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}

const fieldStyle: CSSProperties = {
  width: '100%', padding: '10px 14px', fontSize: 13.5,
  border: '1.5px solid #e2e8f0', borderRadius: 10, outline: 'none',
  background: '#fff', color: '#1a2332', fontFamily: 'inherit',
  transition: 'border-color 0.15s, box-shadow 0.15s',
}

const labelStyle: CSSProperties = {
  display: 'block', fontSize: 11.5, fontWeight: 600,
  color: '#64748b', marginBottom: 6,
  textTransform: 'uppercase', letterSpacing: 0.5,
}

function Wrap({ label, hint, error, required, children, style }: { label?: string; hint?: string; error?: string; required?: boolean; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 0, ...style }}>
      {label && <label style={labelStyle}>{label}{required && <span style={{ color: '#ef4444', marginLeft: 3 }}>*</span>}</label>}
      {children}
      {hint && !error && <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 4 }}>{hint}</p>}
      {error && <p style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{error}</p>}
    </div>
  )
}

export function Input({ label, hint, error, required, value, onChange, placeholder, type = 'text', style, wrapStyle }: InputProps) {
  return (
    <Wrap label={label} hint={hint} error={error} required={required} style={wrapStyle}>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{ ...fieldStyle, borderColor: error ? '#fca5a5' : '#e2e8f0', ...style }}
        onFocus={e => { e.target.style.borderColor = '#2dd4bf'; e.target.style.boxShadow = '0 0 0 3px rgba(45,212,191,0.12)' }}
        onBlur={e => { e.target.style.borderColor = error ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
      />
    </Wrap>
  )
}

export function Select({ label, hint, error, required, value, onChange, children, style, wrapStyle }: SelectProps) {
  return (
    <Wrap label={label} hint={hint} error={error} required={required} style={wrapStyle}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{ ...fieldStyle, cursor: 'pointer', borderColor: error ? '#fca5a5' : '#e2e8f0', ...style }}
        onFocus={e => { e.target.style.borderColor = '#2dd4bf'; e.target.style.boxShadow = '0 0 0 3px rgba(45,212,191,0.12)' }}
        onBlur={e => { e.target.style.borderColor = error ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
      >
        {children}
      </select>
    </Wrap>
  )
}

export function Textarea({ label, hint, error, required, value, onChange, placeholder, rows = 3, style, wrapStyle }: TextareaProps) {
  return (
    <Wrap label={label} hint={hint} error={error} required={required} style={wrapStyle}>
      <textarea
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        style={{ ...fieldStyle, resize: 'vertical', borderColor: error ? '#fca5a5' : '#e2e8f0', ...style }}
        onFocus={e => { e.target.style.borderColor = '#2dd4bf'; e.target.style.boxShadow = '0 0 0 3px rgba(45,212,191,0.12)' }}
        onBlur={e => { e.target.style.borderColor = error ? '#fca5a5' : '#e2e8f0'; e.target.style.boxShadow = 'none' }}
      />
    </Wrap>
  )
}
