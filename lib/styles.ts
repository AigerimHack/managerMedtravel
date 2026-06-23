import type { CSSProperties, MouseEvent } from 'react'

export const S = {
  // Table header cell
  th: {
    padding: '12px 16px',
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 700,
    color: '#94a3b8',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
    background: '#f8fafc',
    borderBottom: '1.5px solid #f1f5f9',
    whiteSpace: 'nowrap',
  } as CSSProperties,

  // Table data cell
  td: {
    padding: '12px 16px',
    borderBottom: '1px solid #f8fafc',
    fontSize: 13.5,
    verticalAlign: 'middle',
  } as CSSProperties,

  // Spread onto <tr> for hover highlight
  row: {
    style: { transition: 'background 0.1s' } as CSSProperties,
    onMouseEnter: (e: MouseEvent<HTMLElement>) => { e.currentTarget.style.background = '#fafbfc' },
    onMouseLeave: (e: MouseEvent<HTMLElement>) => { e.currentTarget.style.background = 'transparent' },
  },

  // Absolute dropdown menu container
  dropdown: {
    position: 'absolute',
    right: 0,
    top: '100%',
    background: '#fff',
    border: '1.5px solid #f1f5f9',
    borderRadius: 12,
    boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
    zIndex: 20,
    padding: 6,
    minWidth: 160,
  } as CSSProperties,

  // Empty / placeholder text inside a card
  empty: {
    padding: '48px 0',
    textAlign: 'center',
    color: '#cbd5e1',
    fontSize: 13.5,
  } as CSSProperties,

  // Transparent inline input for table cell editing
  cellInput: {
    border: 'none',
    background: 'none',
    fontSize: 13.5,
    fontFamily: 'inherit',
    color: '#1a2332',
    width: '100%',
    outline: 'none',
    padding: '4px 0',
  } as CSSProperties,

  // Single-line text truncation
  truncate: {
    display: 'block',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  } as CSSProperties,
}
