'use client'
import { useState, useEffect } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input, Textarea } from './Input'
import { SectionLabel } from './Card'
import { useStore, PriceEntry } from '@/lib/store'
import { useToast } from './Toast'

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

interface Props {
  open: boolean
  onClose: () => void
  editId?: string | null
}

const EMPTY_ENTRY = (): PriceEntry => ({ id: uid(), clinicName: '', treatment: '', price: '' })

export function PriceModal({ open, onClose, editId }: Props) {
  const { priceCards, addPriceCard, updatePriceCard } = useStore()
  const { toast } = useToast()
  const editing = editId ? priceCards.find(c => c.id === editId) : null

  const [diagnosis, setDiagnosis] = useState('')
  const [notes, setNotes] = useState('')
  const [entries, setEntries] = useState<PriceEntry[]>([EMPTY_ENTRY()])

  useEffect(() => {
    if (!open) return
    if (editing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setDiagnosis(editing.diagnosis)
      setNotes(editing.notes ?? '')
      setEntries(editing.entries.length > 0
        ? editing.entries.map(e => ({ ...e }))
        : [EMPTY_ENTRY()])
    } else {
      setDiagnosis(''); setNotes(''); setEntries([EMPTY_ENTRY()])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editId])

  const updateEntry = (id: string, field: keyof PriceEntry, val: string) =>
    setEntries(es => es.map(e => e.id === id ? { ...e, [field]: val } : e))

  const removeEntry = (id: string) =>
    setEntries(es => es.length > 1 ? es.filter(e => e.id !== id) : es)

  const save = () => {
    if (!diagnosis.trim()) { toast('Введите диагноз / направление'); return }
    const filledEntries = entries.filter(e => e.clinicName.trim() || e.treatment.trim() || e.price.trim())
    const data = { diagnosis: diagnosis.trim(), notes: notes.trim(), entries: filledEntries }
    if (editing) { updatePriceCard(editing.id, data); toast('Карточка обновлена') }
    else { addPriceCard(data); toast('Карточка добавлена') }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} wide
      title={editing ? 'Редактировать прайс' : 'Новая карточка прайса'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button variant="primary" onClick={save}>Сохранить</Button>
        </>
      }>

      <Input
        label="Диагноз / Направление" required
        value={diagnosis} onChange={setDiagnosis}
        placeholder="Рак молочной железы, Чек-ап, МРТ..."
        wrapStyle={{ marginBottom: 20 }}
      />

      <SectionLabel>Клиники и стоимость лечения</SectionLabel>
      <p style={{ fontSize: 12.5, color: '#94a3b8', marginBottom: 14 }}>
        Добавьте одну или несколько клиник с описанием лечения и ценой
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 12 }}>
        {entries.map((entry, idx) => (
          <div key={entry.id} style={{
            border: '1.5px solid #f1f5f9', borderRadius: 14, overflow: 'hidden',
            background: '#fafbfc',
          }}>
            {/* Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 14px 10px', background: '#f1f5f9',
              borderBottom: '1px solid #e8eef4',
            }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Клиника {idx + 1}
              </span>
              {entries.length > 1 && (
                <button onClick={() => removeEntry(entry.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#f87171', display: 'flex', padding: 2,
                }}>
                  <Trash2 size={13} />
                </button>
              )}
            </div>

            {/* Fields */}
            <div style={{ padding: '14px 14px 4px' }}>
              <Input
                label="Наименование клиники"
                value={entry.clinicName}
                onChange={v => updateEntry(entry.id, 'clinicName', v)}
                placeholder="Asan Medical Center, Samsung Medical..."
                wrapStyle={{ marginBottom: 12 }}
              />
              <Textarea
                label="Методы лечения"
                value={entry.treatment}
                onChange={v => updateEntry(entry.id, 'treatment', v)}
                placeholder="Химиотерапия, таргетная терапия, операция..."
                rows={2}
                wrapStyle={{ marginBottom: 12 }}
              />
              <Input
                label="Стоимость"
                value={entry.price}
                onChange={v => updateEntry(entry.id, 'price', v)}
                placeholder="от $15 000"
                wrapStyle={{ marginBottom: 14 }}
              />
            </div>
          </div>
        ))}
      </div>

      <button onClick={() => setEntries(es => [...es, EMPTY_ENTRY()])} style={{
        display: 'flex', alignItems: 'center', gap: 6, width: '100%',
        padding: '10px 14px', border: '1.5px dashed #e2e8f0', borderRadius: 12,
        background: 'none', cursor: 'pointer', fontSize: 13, color: '#94a3b8',
        fontFamily: 'inherit', marginBottom: 20,
      }}>
        <Plus size={14} /> Добавить клинику
      </button>

      <Textarea
        label="Заметки"
        value={notes}
        onChange={setNotes}
        placeholder="Дополнительная информация по направлению..."
        rows={3}
      />
    </Modal>
  )
}
