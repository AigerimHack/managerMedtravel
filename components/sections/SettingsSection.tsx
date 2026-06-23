'use client'
import { useState } from 'react'
import { Trash2, Pencil, GripVertical, Eye, EyeOff } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useStore } from '@/lib/store'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, PageHeader, SectionLabel } from '../ui/Card'
import { ClinicModal } from '../ui/ClinicModal'
import { useToast } from '../ui/Toast'

export function SettingsSection() {
  const { clinics, deleteClinic, addClinic, navItems, updateNavItem } = useStore()
  const { data: session } = useSession()
  const { toast } = useToast()
  const user = session?.user as any
  const [editId, setEditId] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [editingNav, setEditingNav] = useState<string | null>(null)
  const [navLabel, setNavLabel] = useState('')

  const quickAdd = () => {
    if (!newName.trim()) return
    addClinic({ name: newName.trim(), color: '#2dd4bf' })
    setNewName(''); toast('Клиника добавлена')
  }

  const startEditNav = (key: string, label: string) => { setEditingNav(key); setNavLabel(label) }
  const saveNavLabel = (key: string) => { updateNavItem(key, { label: navLabel }); setEditingNav(null); toast('Название обновлено') }
  const sorted = [...navItems].sort((a, b) => a.order - b.order)

  return (
    <div style={{ maxWidth: 620, display: 'flex', flexDirection: 'column', gap: 24 }}>
      <ClinicModal open={modalOpen} onClose={() => { setModalOpen(false); setEditId(null) }} editId={editId} />

      <PageHeader title="Настройки" />

      {/* Nav sections */}
      <Card>
        <SectionLabel>Разделы меню</SectionLabel>
        <p style={{ fontSize: 12.5, color: '#94a3b8', marginBottom: 16 }}>Переименовывайте разделы и скрывайте ненужные</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sorted.map(item => (
            <div key={item.key} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '1.5px solid #f1f5f9' }}>
              <GripVertical size={14} style={{ color: '#cbd5e1', flexShrink: 0 }} />
              {editingNav === item.key ? (
                <input value={navLabel} onChange={e => setNavLabel(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveNavLabel(item.key) }}
                  autoFocus
                  style={{ flex: 1, fontSize: 13.5, border: '1.5px solid #2dd4bf', borderRadius: 8, padding: '4px 10px', outline: 'none', fontFamily: 'inherit' }} />
              ) : (
                <span style={{ flex: 1, fontSize: 13.5, color: item.visible ? '#1a2332' : '#94a3b8' }}>{item.label}</span>
              )}
              {editingNav === item.key ? (
                <Button size="sm" variant="primary" onClick={() => saveNavLabel(item.key)}>Сохранить</Button>
              ) : (
                <button onClick={() => startEditNav(item.key, item.label)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', display: 'flex', padding: 4 }}
                  onMouseEnter={e => (e.currentTarget.style.color = '#64748b')}
                  onMouseLeave={e => (e.currentTarget.style.color = '#cbd5e1')}>
                  <Pencil size={13} />
                </button>
              )}
              <button onClick={() => { updateNavItem(item.key, { visible: !item.visible }); toast(item.visible ? 'Раздел скрыт' : 'Раздел показан') }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: item.visible ? '#2dd4bf' : '#cbd5e1', display: 'flex', padding: 4 }}>
                {item.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
            </div>
          ))}
        </div>
      </Card>

      {/* Clinics */}
      <Card>
        <SectionLabel>Клиники</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16 }}>
          {clinics.map(c => (
            <div key={c.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 10, background: '#f8fafc', border: '1.5px solid #f1f5f9' }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: c.color, flexShrink: 0 }} />
              <span style={{ flex: 1, fontSize: 13.5 }}>{c.name}</span>
              <button onClick={() => { setEditId(c.id); setModalOpen(true) }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', display: 'flex', padding: 4 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#64748b')}
                onMouseLeave={e => (e.currentTarget.style.color = '#cbd5e1')}>
                <Pencil size={13} />
              </button>
              <button onClick={() => { if (confirm('Удалить клинику?')) { deleteClinic(c.id); toast('Клиника удалена') } }}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', display: 'flex', padding: 4 }}
                onMouseEnter={e => (e.currentTarget.style.color = '#f87171')}
                onMouseLeave={e => (e.currentTarget.style.color = '#cbd5e1')}>
                <Trash2 size={13} />
              </button>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Input label="" value={newName} onChange={setNewName} placeholder="Название новой клиники..."
            wrapStyle={{ flex: 1 }}
            style={{ borderColor: '#e2e8f0' }} />
          <Button variant="primary" onClick={quickAdd}>Добавить</Button>
        </div>
      </Card>

      {/* Profile */}
      <Card>
        <SectionLabel>Профиль</SectionLabel>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <Input label="Имя" value={user?.name ?? ''} onChange={() => {}} />
          <Input label="Роль" value={user?.role === 'ADMIN' ? 'Администратор' : 'Менеджер'} onChange={() => {}} />
        </div>
        <p style={{ marginTop: 10, fontSize: 12, color: '#94a3b8' }}>Email: {user?.email ?? ''}</p>
      </Card>
    </div>
  )
}
