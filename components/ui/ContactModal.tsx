'use client'
import { useState } from 'react'
import { Modal } from './Modal'
import { Button } from './Button'
import { Input, Textarea } from './Input'
import { useStore, ContactType } from '@/lib/store'
import { useToast } from './Toast'

const TITLES: Record<ContactType, string> = {
  hotel: 'Отель',
  transfer: 'Трансфер',
  translator: 'Переводчик',
}

const PLACEHOLDERS: Record<ContactType, string> = {
  hotel: 'Lotte Hotel Seoul',
  transfer: 'Korea Transfer Co.',
  translator: 'Ким Мин Чжун',
}

interface Props {
  open: boolean
  onClose: () => void
  type: ContactType
  editId?: string | null
}

export function ContactModal({ open, onClose, type, editId }: Props) {
  const { contacts, addContact, updateContact } = useStore()
  const { toast } = useToast()
  const editing = editId ? contacts.find(c => c.id === editId) : null

  const [form, setForm] = useState(() => editing
    ? { name: editing.name, phone: editing.phone ?? '', email: editing.email ?? '', notes: editing.notes ?? '' }
    : { name: '', phone: '', email: '', notes: '' }
  )

  const set = (k: keyof typeof form) => (v: string) => setForm(f => ({ ...f, [k]: v }))
  const ws = { marginBottom: 14 }
  const title = TITLES[type]

  const save = () => {
    if (!form.name.trim()) { toast('Введите название / имя'); return }
    if (editing) {
      updateContact(editing.id, form)
      toast(`${title} обновлён`)
    } else {
      addContact({ type, ...form })
      toast(`${title} добавлен`)
    }
    onClose()
  }

  return (
    <Modal open={open} onClose={onClose}
      title={editing ? `Редактировать · ${title}` : `Новый · ${title}`}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>Отмена</Button>
          <Button variant="primary" onClick={save}>Сохранить</Button>
        </>
      }>
      <Input label="Название / Имя" required value={form.name} onChange={set('name')}
        placeholder={PLACEHOLDERS[type]} wrapStyle={ws} />
      <Input label="Телефон" value={form.phone} onChange={set('phone')}
        placeholder="+82 2 1234 5678" wrapStyle={ws} />
      <Input label="Email" type="email" value={form.email} onChange={set('email')}
        placeholder="contact@example.com" wrapStyle={ws} />
      <Textarea label="Заметки" value={form.notes} onChange={set('notes')}
        placeholder="Дополнительная информация..." rows={3} />
    </Modal>
  )
}
