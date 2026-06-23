'use client'
import { useState } from 'react'
import { Plus, Pencil, Trash2, Building2, Stethoscope, DollarSign, FileText } from 'lucide-react'
import { useStore } from '@/lib/store'
import { Button } from '../ui/Button'
import { Card, PageHeader } from '../ui/Card'
import { PriceModal } from '../ui/PriceModal'
import { useToast } from '../ui/Toast'

export function PricesSection() {
  const { priceCards, deletePriceCard } = useStore()
  const { toast } = useToast()
  const [open, setOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [key, setKey] = useState(0)

  const openModal = (id: string | null) => { setEditId(id); setKey(k => k + 1); setOpen(true) }

  return (
    <div>
      <PriceModal key={key} open={open} onClose={() => setOpen(false)} editId={editId} />

      <PageHeader
        title="Прайс"
        subtitle="Карточки с диагнозами, методами лечения и стоимостью"
        action={
          <Button variant="primary" icon={<Plus size={14} />} onClick={() => openModal(null)}>
            Добавить карточку
          </Button>
        }
      />

      {priceCards.length === 0 && (
        <div style={{ textAlign: 'center', padding: '80px 0', color: '#cbd5e1', fontSize: 14 }}>
          Нет карточек. Добавьте первую →
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
        {priceCards.map(card => (
          <Card key={card.id} padding={0}>
            {/* Card header */}
            <div style={{ padding: '18px 20px 14px', borderBottom: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, minWidth: 0 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, background: '#f0fdfa', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Stethoscope size={16} style={{ color: '#2dd4bf' }} />
                  </div>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: '#1a2332', lineHeight: 1.3 }}>
                    {card.diagnosis}
                  </h3>
                </div>
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <Button variant="ghost" size="sm" iconOnly title="Редактировать" onClick={() => openModal(card.id)}>
                    <Pencil size={12} />
                  </Button>
                  <Button variant="ghost-danger" size="sm" iconOnly title="Удалить"
                    onClick={() => { if (confirm('Удалить карточку?')) { deletePriceCard(card.id); toast('Карточка удалена') } }}>
                    <Trash2 size={12} />
                  </Button>
                </div>
              </div>
              {card.notes && (
                <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                  <FileText size={13} style={{ color: '#cbd5e1', flexShrink: 0, marginTop: 1 }} />
                  <p style={{ fontSize: 12.5, color: '#64748b', lineHeight: 1.5, margin: 0 }}>{card.notes}</p>
                </div>
              )}
            </div>

            {/* Clinic entries */}
            {card.entries.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', color: '#cbd5e1', fontSize: 13 }}>
                Нет данных по клиникам
              </div>
            ) : (
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {card.entries.map((entry, idx) => (
                  <div key={entry.id} style={{
                    borderRadius: 12, border: '1.5px solid #f1f5f9', overflow: 'hidden',
                  }}>
                    {/* Clinic name block */}
                    <div style={{
                      padding: '9px 14px', background: '#f8fafc',
                      borderBottom: '1px solid #f1f5f9',
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <Building2 size={13} style={{ color: '#2dd4bf', flexShrink: 0 }} />
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#1a2332' }}>
                        {entry.clinicName || `Клиника ${idx + 1}`}
                      </span>
                    </div>
                    {/* Treatment + price block */}
                    <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {entry.treatment && (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Stethoscope size={12} style={{ color: '#cbd5e1', flexShrink: 0, marginTop: 2 }} />
                          <span style={{ fontSize: 12.5, color: '#475569', lineHeight: 1.5 }}>{entry.treatment}</span>
                        </div>
                      )}
                      {entry.price && (
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          <DollarSign size={12} style={{ color: '#2dd4bf', flexShrink: 0 }} />
                          <span style={{ fontSize: 13, fontWeight: 600, color: '#0f1923' }}>{entry.price}</span>
                        </div>
                      )}
                      {!entry.treatment && !entry.price && (
                        <span style={{ fontSize: 12, color: '#cbd5e1' }}>—</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  )
}
