'use client'
import { useState, useEffect, useRef } from 'react'
import { Plus, Trash2, Upload, FileText, Download, X, Plane } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input, Select, Textarea } from './Input'
import { SectionLabel } from './Card'
import { useStore, STATUSES, Doc, Visit, Flight, Status } from '@/lib/store'
import { useToast } from './Toast'

interface Props { open: boolean; onClose: () => void; editId?: string | null; defaultStatus?: Status }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

export function PatientModal({ open, onClose, editId, defaultStatus = 'new' }: Props) {
  const { clinics, addPatient, updatePatient, patients } = useStore()
  const { toast } = useToast()
  const [name, setName] = useState('')
  const [regNum, setRegNum] = useState('')
  const [diag, setDiag] = useState('')
  const [clinic, setClinic] = useState('')
  const [status, setStatus] = useState<Status>(defaultStatus)
  const [info, setInfo] = useState('')
  const [visits, setVisits] = useState<Visit[]>([])
  const [docs, setDocs] = useState<Doc[]>([])
  const [flights, setFlights] = useState<Flight[]>([
    { id: uid(), label: 'Вылет', date: '' },
    { id: uid(), label: 'Прилет', date: '' },
  ])
  const fileRef = useRef<HTMLInputElement>(null)
  const editing = editId ? patients.find(p => p.id === editId) : null

  useEffect(() => {
    if (!open) return
    if (editing) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setName(editing.name); setRegNum(editing.regNum ?? ''); setDiag(editing.diag)
      setClinic(editing.clinic); setStatus(editing.status); setInfo(editing.info ?? '')
      setVisits(JSON.parse(JSON.stringify(editing.visits)))
      setDocs(JSON.parse(JSON.stringify(editing.docs)))
      const ef = editing.flights ?? []
      setFlights([
        { id: ef[0]?.id ?? uid(), label: ef[0]?.label ?? 'Вылет', date: ef[0]?.date ?? '' },
        { id: ef[1]?.id ?? uid(), label: ef[1]?.label ?? 'Прилет', date: ef[1]?.date ?? '' },
      ])
    } else {
      setName(''); setRegNum(''); setDiag(''); setClinic('')
      setStatus(defaultStatus); setInfo(''); setVisits([]); setDocs([])
      setFlights([
        { id: uid(), label: 'Вылет', date: '' },
        { id: uid(), label: 'Прилет', date: '' },
      ])
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editId])

  const addVisit = () => setVisits(v => [...v, { id: uid(), type: 'Консультация', date: '', clinic: '', note: '' }])
  const removeVisit = (id: string) => setVisits(v => v.filter(x => x.id !== id))
  const updateVisit = (id: string, field: keyof Visit, val: string) =>
    setVisits(v => v.map(x => x.id === id ? { ...x, [field]: val } : x))

  const handleDocs = (e: React.ChangeEvent<HTMLInputElement>) => {
    Array.from(e.target.files ?? []).forEach(f => {
      const r = new FileReader()
      r.onload = ev => setDocs(d => [...d, { id: uid(), name: f.name, date: new Date().toISOString().slice(0, 10), data: ev.target!.result as string, fileType: f.type }])
      r.readAsDataURL(f)
    })
    e.target.value = ''
  }

  const save = () => {
    if (!name.trim()) { toast('Введите ФИО'); return }
    const data = { name: name.trim(), regNum, diag, clinic, status, info, visits, docs, flights }
    if (editing) { updatePatient(editing.id, data); toast('Изменения сохранены') }
    else { addPatient(data); toast('Пациент добавлен') }
    onClose()
  }

  const inputStyle = { marginBottom: 16 }

  return (
    <Modal open={open} onClose={onClose} wide
      title={editing ? 'Редактировать пациента' : 'Новый пациент'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button variant="primary" onClick={save}>Сохранить</Button>
        </>
      }>

      <Input label="ФИО" required value={name} onChange={setName} placeholder="Иванова Анна Сергеевна" wrapStyle={inputStyle} />
      <Input label="Регистрационный номер" value={regNum} onChange={setRegNum} placeholder="REG-2024-001" wrapStyle={inputStyle} />
      <Input label="Диагноз / Цель визита" required value={diag} onChange={setDiag} placeholder="Рак молочной железы, Чек-ап, Консультация..." wrapStyle={inputStyle} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Select label="Клиника" value={clinic} onChange={setClinic}>
          <option value="">—</option>
          {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Select>
        <Select label="Статус" value={status} onChange={v => setStatus(v as Status)}>
          {STATUSES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
        </Select>
      </div>

      <Textarea label="Информация о пациенте" value={info} onChange={setInfo}
        placeholder="Возраст, контакты, особенности..." wrapStyle={inputStyle} />

      {/* Visits */}
      <SectionLabel>Визиты в клинику</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 8 }}>
        {visits.map(v => (
          <div key={v.id} style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: 12, background: '#f8fafc', borderRadius: 10, border: '1.5px solid #f1f5f9', alignItems: 'center' }}>
            <input
              type="text"
              value={v.type}
              onChange={e => updateVisit(v.id, 'type', e.target.value)}
              placeholder="Приём гинеколога, МРТ, анализы..."
              style={{ flex: 1, padding: '6px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12.5, fontFamily: 'inherit', outline: 'none' }}
            />
            <input type="datetime-local" value={v.date} min="2000-01-01T00:00" max="2099-12-31T23:59" onChange={e => updateVisit(v.id, 'date', e.target.value)}
              style={{ padding: '6px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12.5, fontFamily: 'inherit', outline: 'none' }} />
            <select value={v.clinic} onChange={e => updateVisit(v.id, 'clinic', e.target.value)}
              style={{ flex: 1, minWidth: 140, padding: '6px 10px', border: '1.5px solid #e2e8f0', borderRadius: 8, fontSize: 12.5, background: '#fff', fontFamily: 'inherit', outline: 'none' }}>
              <option value="">Клиника...</option>
              {clinics.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button onClick={() => removeVisit(v.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', display: 'flex', padding: 4 }}>
              <X size={15} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={addVisit} style={{ display: 'flex', alignItems: 'center', gap: 6, width: '100%', padding: '9px 14px', border: '1.5px dashed #e2e8f0', borderRadius: 10, background: 'none', cursor: 'pointer', fontSize: 13, color: '#94a3b8', fontFamily: 'inherit', marginBottom: 20 }}>
        <Plus size={14} /> Добавить визит
      </button>

      {/* Flights */}
      <SectionLabel>Перелёты</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {flights.map((fl, i) => (
          <div key={fl.id} style={{ display: 'flex', gap: 8, padding: 12, background: '#fffbeb', borderRadius: 10, border: '1.5px solid #fde68a', alignItems: 'center' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: 28, height: 28, borderRadius: 8, background: '#fef3c7', flexShrink: 0 }}>
              <Plane size={13} style={{ color: '#f59e0b', transform: i === 0 ? 'rotate(45deg)' : 'rotate(-45deg)' }} />
            </div>
            <input
              type="text"
              value={fl.label}
              onChange={e => setFlights(fs => fs.map(f => f.id === fl.id ? { ...f, label: e.target.value } : f))}
              placeholder="Вылет / Прилет..."
              style={{ flex: 1, padding: '6px 10px', border: '1.5px solid #fde68a', borderRadius: 8, fontSize: 12.5, fontFamily: 'inherit', outline: 'none', background: '#fff' }}
            />
            <input
              type="datetime-local"
              value={fl.date}
              min="2000-01-01T00:00"
              max="2099-12-31T23:59"
              onChange={e => setFlights(fs => fs.map(f => f.id === fl.id ? { ...f, date: e.target.value } : f))}
              style={{ padding: '6px 10px', border: '1.5px solid #fde68a', borderRadius: 8, fontSize: 12.5, fontFamily: 'inherit', outline: 'none', background: '#fff' }}
            />
          </div>
        ))}
      </div>

      {/* Docs */}
      <div style={{ marginTop: 24 }}>
      <SectionLabel>Документы</SectionLabel>
      <div onClick={() => fileRef.current?.click()} style={{ border: '1.5px dashed #e2e8f0', borderRadius: 12, padding: 24, textAlign: 'center', cursor: 'pointer', background: '#fafbfc', marginBottom: docs.length ? 12 : 0 }}>
        <Upload size={22} style={{ color: '#cbd5e1', margin: '0 auto 8px' }} />
        <p style={{ fontSize: 13, color: '#94a3b8' }}>Нажмите для загрузки</p>
        <p style={{ fontSize: 11.5, color: '#cbd5e1', marginTop: 4 }}>Паспорт, КЕТА, выписки · PDF, JPG, PNG</p>
      </div>
      <input ref={fileRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.doc,.docx" style={{ display: 'none' }} onChange={handleDocs} />
      {docs.map((d, i) => (
        <div key={d.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', border: '1.5px solid #f1f5f9', borderRadius: 10, background: '#fff', marginTop: 8 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <FileText size={14} style={{ color: '#3b82f6' }} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{d.name}</p>
            <p style={{ fontSize: 11, color: '#94a3b8' }}>{d.date}</p>
          </div>
          <a href={d.data} download={d.name} style={{ color: '#94a3b8', display: 'flex', padding: 4 }}><Download size={14} /></a>
          <button onClick={() => setDocs(dd => dd.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', display: 'flex', padding: 4 }}>
            <Trash2 size={14} />
          </button>
        </div>
      ))}
      </div>
    </Modal>
  )
}
