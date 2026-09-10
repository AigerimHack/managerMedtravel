'use client'
import { useState } from 'react'
import { Plus, Trash2, Phone, Mail, MapPin, User, FileText, Pencil } from 'lucide-react'
import { useStore, ContactType } from '@/lib/store'
import { Button } from '../ui/Button'
import { Card, PageHeader } from '../ui/Card'
import { ClinicModal } from '../ui/ClinicModal'
import { ContactModal } from '../ui/ContactModal'
import { useToast } from '../ui/Toast'

type Tab = 'clinics' | ContactType

const TABS: { key: Tab; label: string }[] = [
  { key: 'clinics',    label: 'Клиники' },
  { key: 'hotel',      label: 'Отель' },
  { key: 'transfer',   label: 'Трансфер' },
  { key: 'translator', label: 'Переводчики' },
]

const ADD_LABEL: Record<Tab, string> = {
  clinics:    'Добавить клинику',
  hotel:      'Добавить отель',
  transfer:   'Добавить трансфер',
  translator: 'Добавить переводчика',
}

export function ClinicsSection() {
  const { clinics, deleteClinic, contacts, deleteContact } = useStore()
  const { toast } = useToast()
  const [tab, setTab] = useState<Tab>('clinics')

  // Clinic modal state
  const [clinicOpen, setClinicOpen] = useState(false)
  const [clinicEditId, setClinicEditId] = useState<string | null>(null)
  const [clinicKey, setClinicKey] = useState(0)
  const openClinic = (id: string | null) => { setClinicEditId(id); setClinicKey(k => k + 1); setClinicOpen(true) }

  // Contact modal state
  const [contactOpen, setContactOpen] = useState(false)
  const [contactEditId, setContactEditId] = useState<string | null>(null)
  const [contactKey, setContactKey] = useState(0)
  const openContact = (id: string | null) => { setContactEditId(id); setContactKey(k => k + 1); setContactOpen(true) }

  const tabContacts = contacts.filter(c => c.type === tab)

  const handleAdd = () => { if (tab === 'clinics') openClinic(null); else openContact(null) }

  return (
    <div>
      <ClinicModal key={clinicKey} open={clinicOpen} onClose={() => setClinicOpen(false)} editId={clinicEditId} />
      {tab !== 'clinics' && (
        <ContactModal key={contactKey} open={contactOpen} onClose={() => setContactOpen(false)}
          type={tab as ContactType} editId={contactEditId} />
      )}

      <PageHeader
        title="Контакты"
        subtitle="Клиники, отели, трансфер и переводчики"
        action={<Button variant="primary" icon={<Plus size={14} />} onClick={handleAdd}>{ADD_LABEL[tab]}</Button>}
      />

      {/* Tab bar */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 24, borderBottom: '1.5px solid #f1f5f9', paddingBottom: 0, overflowX: 'auto' }}>
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: '8px 18px', fontSize: 13.5, fontWeight: tab === t.key ? 600 : 400,
            color: tab === t.key ? '#0f1923' : '#94a3b8',
            background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
            borderBottom: tab === t.key ? '2px solid #2dd4bf' : '2px solid transparent',
            marginBottom: -1.5, transition: 'color 0.15s', whiteSpace: 'nowrap', flexShrink: 0,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Clinics tab */}
      {tab === 'clinics' && (
        <>
          {clinics.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#cbd5e1', fontSize: 14 }}>
              Нет клиник. Добавьте первую →
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {clinics.map(c => (
              <Card key={c.id} hoverable padding={18} onClick={() => openClinic(c.id)}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: c.color, flexShrink: 0, marginTop: 4 }} />
                    <div style={{ minWidth: 0 }}>
                      <h3 style={{ fontSize: 13.5, fontWeight: 700, color: '#1a2332', marginBottom: 4, lineHeight: 1.3 }}>{c.name}</h3>
                      {c.spec && <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 600, color: '#64748b', background: '#f1f5f9', padding: '2px 7px', borderRadius: 6 }}>{c.spec}</span>}
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0, marginLeft: 12 }} onClick={e => e.stopPropagation()}>
                    <button onClick={() => { if (confirm('Удалить клинику?')) { deleteClinic(c.id); toast('Клиника удалена') } }}
                      style={{ background: 'none', border: '1.5px solid #f1f5f9', borderRadius: 8, cursor: 'pointer', color: '#94a3b8', padding: '5px 7px', display: 'flex' }}
                      title="Удалить">
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
                <div style={{ borderTop: '1px solid #f8fafc', paddingTop: 12, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {c.city && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={12} style={{ color: '#cbd5e1', flexShrink: 0 }} /><span style={{ fontSize: 12.5, color: '#475569' }}>{c.city}</span></div>}
                  {c.coord && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><User size={12} style={{ color: '#cbd5e1', flexShrink: 0 }} /><span style={{ fontSize: 12.5, color: '#475569' }}>{c.coord}</span></div>}
                  {c.email && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Mail size={12} style={{ color: '#cbd5e1', flexShrink: 0 }} /><a href={`mailto:${c.email}`} style={{ fontSize: 12.5, color: '#2dd4bf', textDecoration: 'none' }} onClick={e => e.stopPropagation()}>{c.email}</a></div>}
                  {[c.phone1, c.phone2, c.phone3].filter(Boolean).map((ph, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Phone size={12} style={{ color: '#cbd5e1', flexShrink: 0 }} /><span style={{ fontSize: 12.5, color: '#475569' }}>{ph}</span></div>
                  ))}
                  {c.addr1 && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={12} style={{ color: '#cbd5e1', flexShrink: 0 }} /><span style={{ fontSize: 12.5, color: '#475569' }}>{c.addr1}</span></div>}
                  {c.addr2 && <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><MapPin size={12} style={{ color: '#cbd5e1', flexShrink: 0 }} /><span style={{ fontSize: 12.5, color: '#94a3b8' }}>{c.addr2}</span></div>}
                </div>
                {c.notes && (
                  <div style={{ marginTop: 10, padding: '8px 10px', background: '#f8fafc', borderRadius: 8, display: 'flex', gap: 8 }}>
                    <FileText size={12} style={{ color: '#cbd5e1', flexShrink: 0, marginTop: 1 }} />
                    <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.5, margin: 0 }}>{c.notes}</p>
                  </div>
                )}
              </Card>
            ))}
          </div>
        </>
      )}

      {/* Hotel / Transfer / Translator tabs */}
      {tab !== 'clinics' && (
        <>
          {tabContacts.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#cbd5e1', fontSize: 14 }}>
              Нет записей. Добавьте первую →
            </div>
          )}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {tabContacts.map(c => (
              <Card key={c.id} hoverable padding={20}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      <User size={16} style={{ color: '#2dd4bf' }} />
                    </div>
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: '#1a2332', lineHeight: 1.3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{c.name}</h3>
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexShrink: 0, marginLeft: 8 }}>
                    <Button variant="ghost" size="sm" iconOnly title="Редактировать"
                      onClick={() => openContact(c.id)}>
                      <Pencil size={12} />
                    </Button>
                    <Button variant="ghost-danger" size="sm" iconOnly title="Удалить"
                      onClick={() => { if (confirm('Удалить контакт?')) { deleteContact(c.id); toast('Удалено') } }}>
                      <Trash2 size={12} />
                    </Button>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {c.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Phone size={13} style={{ color: '#cbd5e1', flexShrink: 0 }} />
                      <a href={`tel:${c.phone}`} style={{ fontSize: 13, color: '#475569', textDecoration: 'none' }}
                        onClick={e => e.stopPropagation()}>{c.phone}</a>
                    </div>
                  )}
                  {c.email && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Mail size={13} style={{ color: '#cbd5e1', flexShrink: 0 }} />
                      <a href={`mailto:${c.email}`} style={{ fontSize: 13, color: '#2dd4bf', textDecoration: 'none' }}
                        onClick={e => e.stopPropagation()}>{c.email}</a>
                    </div>
                  )}
                  {c.notes && (
                    <div style={{ marginTop: 6, padding: '8px 10px', background: '#f8fafc', borderRadius: 8, fontSize: 12, color: '#64748b', lineHeight: 1.5 }}>
                      {c.notes}
                    </div>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
