'use client'
import { useState } from 'react'
import { Plus, Trash2, Check } from 'lucide-react'
import { useStore, localDateStr } from '@/lib/store'
import { Button } from '../ui/Button'
import { Input } from '../ui/Input'
import { Card, PageHeader } from '../ui/Card'
import { useToast } from '../ui/Toast'

type Filter = 'pending' | 'today' | 'done'

export function TasksSection() {
  const { tasks, addTask, toggleTask, deleteTask } = useStore()
  const { toast } = useToast()
  const [filter, setFilter] = useState<Filter>('pending')
  const [newText, setNewText] = useState('')
  const [newDue, setNewDue] = useState('')
  const todayStr = localDateStr()

  const list = tasks.filter(t => {
    if (filter === 'pending') return !t.done
    if (filter === 'today')   return !t.done && t.due === todayStr
    return t.done
  })

  const submit = () => {
    if (!newText.trim()) return
    addTask({ text: newText.trim(), due: newDue || undefined, done: false })
    setNewText(''); setNewDue(''); toast('Задача добавлена')
  }

  const FILTERS: { key: Filter; label: string }[] = [
    { key: 'pending', label: 'Активные' },
    { key: 'today',   label: 'Сегодня' },
    { key: 'done',    label: 'Выполненные' },
  ]

  return (
    <div style={{ maxWidth: 680 }}>
      <PageHeader title="Список дел" subtitle={`${tasks.filter(t => !t.done).length} активных задач`} />

      {/* Add task */}
      <Card style={{ marginBottom: 20, padding: 16 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
          <Input label="" value={newText} onChange={setNewText} placeholder="Новая задача..."
            wrapStyle={{ flex: 1, minWidth: 180 }}
            style={{ borderColor: '#e2e8f0' }} />
          <Input label="" type="date" value={newDue} onChange={setNewDue}
            wrapStyle={{ width: 160 }} />
          <Button variant="primary" icon={<Plus size={14} />} onClick={submit}>Добавить</Button>
        </div>
      </Card>

      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {FILTERS.map(({ key, label }) => (
          <Button key={key} active={filter === key} variant="secondary" onClick={() => setFilter(key)}>
            {label}
          </Button>
        ))}
      </div>

      <Card padding={0}>
        {list.length === 0 ? (
          <div style={{ padding: '48px 0', textAlign: 'center', color: '#cbd5e1', fontSize: 13.5 }}>Нет задач</div>
        ) : list.map((t, i) => {
          const isOverdue = !t.done && t.due && t.due < todayStr
          const isToday = t.due === todayStr
          return (
            <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 20px', borderBottom: i < list.length - 1 ? '1px solid #f8fafc' : 'none' }}>
              <button onClick={() => toggleTask(t.id)}
                style={{ width: 20, height: 20, borderRadius: 6, border: t.done ? 'none' : '2px solid #e2e8f0', background: t.done ? '#10b981' : '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0, transition: 'all 0.15s' }}>
                {t.done && <Check size={11} color="#fff" strokeWidth={3} />}
              </button>
              <span style={{ flex: 1, fontSize: 13.5, color: t.done ? '#cbd5e1' : '#1a2332', textDecoration: t.done ? 'line-through' : 'none' }}>{t.text}</span>
              {t.due && (
                <span style={{ fontSize: 12, fontWeight: 500, padding: '3px 8px', borderRadius: 6, background: isOverdue ? '#fef2f2' : isToday ? '#fff7ed' : '#f8fafc', color: isOverdue ? '#ef4444' : isToday ? '#f97316' : '#94a3b8' }}>
                  {new Date(t.due + 'T00:00:00').toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })}
                </span>
              )}
              <Button variant="ghost" iconOnly size="sm" style={{ color: '#e2e8f0' }} onClick={() => deleteTask(t.id)}>
                <Trash2 size={14} />
              </Button>
            </div>
          )
        })}
      </Card>
    </div>
  )
}
