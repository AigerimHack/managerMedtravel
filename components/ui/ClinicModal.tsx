'use client'
import { useState, useRef } from 'react'
import { Upload, Eye, Download, Trash2, FileText } from 'lucide-react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input, Textarea } from './Input'
import { SectionLabel } from './Card'
import { useStore, Clinic, ClinicDoc } from '@/lib/store'
import { useToast } from './Toast'

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

interface Props { open: boolean; onClose: () => void; editId?: string | null }
const EMPTY: Omit<Clinic, 'id'> = {
  name: '', city: '', spec: '', coord: '', email: '',
  phone1: '', phone2: '', phone3: '', addr1: '', addr2: '',
  notes: '', color: '#3b82f6', brochures: [],
}

export function ClinicModal({ open, onClose, editId }: Props) {
  const { clinics, addClinic, updateClinic } = useStore()
  const { toast } = useToast()
  const editing = editId ? clinics.find(c => c.id === editId) : null

  const initForm = (): Omit<Clinic, 'id'> =>
    editing ? { ...EMPTY, ...editing, brochures: editing.brochures ?? [] } : EMPTY

  const [form, setForm] = useState<Omit<Clinic, 'id'>>(initForm)
  const fileRef = useRef<HTMLInputElement | null>(null)

  const set = (k: keyof typeof EMPTY) => (v: string) => setForm(f => ({ ...f, [k]: v }))
  const ws = { marginBottom: 14 }
  const brochures = form.brochures ?? []

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return
    const r = new FileReader()
    r.onload = ev => {
      const doc: ClinicDoc = {
        id: uid(), name: f.name,
        data: ev.target!.result as string,
        fileType: f.type, date: new Date().toISOString(),
      }
      setForm(prev => ({ ...prev, brochures: [...(prev.brochures ?? []), doc] }))
      toast('Файл загружен')
    }
    r.readAsDataURL(f)
    e.target.value = ''
  }

  const removeBrochure = (id: string) =>
    setForm(f => ({ ...f, brochures: (f.brochures ?? []).filter(d => d.id !== id) }))

  const openInNewTab = (doc: ClinicDoc) => {
    const byteString = atob(doc.data.split(',')[1])
    const mime = doc.data.match(/^data:([^;]+)/)?.[1] ?? 'application/octet-stream'
    const ab = new Uint8Array(byteString.length)
    for (let i = 0; i < byteString.length; i++) ab[i] = byteString.charCodeAt(i)
    const url = URL.createObjectURL(new Blob([ab], { type: mime }))
    window.open(url, '_blank')
  }

  const download = (doc: ClinicDoc) => {
    const a = document.createElement('a')
    a.href = doc.data; a.download = doc.name; a.click()
  }

  const save = () => {
    if (!form.name.trim()) { toast('Введите название'); return }
    if (editing) { updateClinic(editing.id, form); toast('Клиника обновлена') }
    else { addClinic(form); toast('Клиника добавлена') }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose} wide title={editing ? 'Редактировать клинику' : 'Новая клиника'}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button variant="primary" onClick={save}>Сохранить</Button>
        </>
      }>
      <Input label="Название" required value={form.name} onChange={set('name')} placeholder="Asan Medical Center" wrapStyle={ws} />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3.5">
        <Input label="Страна / Город" value={form.city ?? ''} onChange={set('city')} placeholder="Сеул, Корея" />
        <Input label="Специализация" value={form.spec ?? ''} onChange={set('spec')} placeholder="Онкология..." />
      </div>
      <Input label="Координатор" value={form.coord ?? ''} onChange={set('coord')} placeholder="Имя координатора" wrapStyle={ws} />
      <Input label="Email" type="email" value={form.email ?? ''} onChange={set('email')} placeholder="contact@clinic.com" wrapStyle={ws} />

      <SectionLabel>Телефоны</SectionLabel>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 14 }}>
        <Input label="" value={form.phone1 ?? ''} onChange={set('phone1')} placeholder="+82 2 1234 5678" />
        <Input label="" value={form.phone2 ?? ''} onChange={set('phone2')} placeholder="+82 ..." />
        <Input label="" value={form.phone3 ?? ''} onChange={set('phone3')} placeholder="+82 ..." />
      </div>

      <SectionLabel>Адреса</SectionLabel>
      <Input label="" value={form.addr1 ?? ''} onChange={set('addr1')} placeholder="Основной адрес" wrapStyle={{ marginBottom: 10 }} />
      <Input label="" value={form.addr2 ?? ''} onChange={set('addr2')} placeholder="Дополнительный адрес" wrapStyle={{ marginBottom: 14 }} />

      <Textarea label="Заметки" value={form.notes ?? ''} onChange={set('notes')} placeholder="Важная информация о клинике..." wrapStyle={{ marginBottom: 14 }} />

      <SectionLabel>Брошюры / Чек-ап</SectionLabel>
      <div style={{ marginBottom: 14 }}>
        {brochures.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 10 }}>
            {brochures.map(doc => (
              <div key={doc.id} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f8fafc', border: '1px solid #f1f5f9', borderRadius: 10 }}>
                <FileText size={14} style={{ color: '#94a3b8', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: 13, color: '#1a2332', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</span>
                <Button variant="ghost" size="sm" iconOnly title="Открыть" onClick={() => openInNewTab(doc)}>
                  <Eye size={13} />
                </Button>
                <Button variant="ghost" size="sm" iconOnly title="Скачать" onClick={() => download(doc)}>
                  <Download size={13} />
                </Button>
                <Button variant="ghost-danger" size="sm" iconOnly title="Удалить" onClick={() => removeBrochure(doc.id)}>
                  <Trash2 size={13} />
                </Button>
              </div>
            ))}
          </div>
        )}
        <input ref={fileRef} type="file" accept=".pdf,.jpg,.jpeg,.png" style={{ display: 'none' }} onChange={handleUpload} />
        <Button variant="secondary" size="sm" icon={<Upload size={13} />} onClick={() => fileRef.current?.click()}>
          Загрузить брошюру
        </Button>
      </div>

      <div>
        <label style={{ display: 'block', fontSize: 11.5, fontWeight: 600, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: 0.5 }}>Цвет в календаре</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <input type="color" value={form.color} onChange={e => set('color')(e.target.value)}
            style={{ width: 44, height: 44, borderRadius: 10, border: '1.5px solid #e2e8f0', cursor: 'pointer', padding: 3 }} />
          <span style={{ fontSize: 13, color: '#64748b' }}>{form.color}</span>
        </div>
      </div>
    </Modal>
  )
}
