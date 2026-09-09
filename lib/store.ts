import { create } from 'zustand'

export type Status = 'new' | 'processing' | 'docs' | 'clinic' | 'waiting' | 'enrolled' | 'done' | 'declined'

export interface Visit {
  id: string; type: string; date: string; clinic: string; note?: string
}
export interface Flight {
  id: string; label: string; date: string
}
export interface Doc {
  id: string; name: string; date: string; data: string; fileType?: string
}
export interface Patient {
  id: string; name: string; regNum?: string; diag: string; clinic: string
  status: Status; info?: string; visits: Visit[]; docs: Doc[]
  flights?: Flight[]
  created: string; updated: string
}
export interface ClinicDoc {
  id: string; name: string; data: string; fileType?: string; date: string
}
export interface Clinic {
  id: string; name: string; city?: string; spec?: string; coord?: string
  email?: string; phone1?: string; phone2?: string; phone3?: string
  addr1?: string; addr2?: string; notes?: string; color: string
  brochures?: ClinicDoc[]
}
export type ContactType = 'hotel' | 'transfer' | 'translator'
export interface Contact {
  id: string; type: ContactType; name: string
  phone?: string; email?: string; notes?: string
}
export interface Task {
  id: string; text: string; due?: string; done: boolean
}
export interface Invoice {
  id: string; period: string; date: string; num: string; clinic: string
  sum: string; recv: string; note: string
  file?: string; fileName?: string; fileType?: string; updated?: string
}
export interface NavItem {
  key: string; label: string; icon: string; visible: boolean; order: number
}
export interface PriceEntry {
  id: string; clinicName: string; treatment: string; price: string
}
export interface PriceCard {
  id: string; diagnosis: string; entries: PriceEntry[]; notes?: string
  created: string; updated: string
}

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }

const DEFAULT_NAV: NavItem[] = [
  { key: 'home',     label: 'Главная',    icon: 'Home',         visible: true, order: 0 },
  { key: 'requests', label: 'Запросы',    icon: 'AlertCircle',  visible: true, order: 1 },
  { key: 'greens',   label: 'Зелёные',    icon: 'CheckCircle2', visible: true, order: 2 },
  { key: 'calendar', label: 'Календарь',  icon: 'Calendar',     visible: true, order: 3 },
  { key: 'clinics',  label: 'Контакты',   icon: 'Building2',    visible: true, order: 4 },
  { key: 'patients', label: 'Пациенты',   icon: 'Users',        visible: true, order: 5 },
  { key: 'tasks',    label: 'Список дел', icon: 'CheckSquare',  visible: true, order: 6 },
  { key: 'invoices', label: 'Инвойсы',    icon: 'Receipt',      visible: true, order: 7 },
  { key: 'prices',   label: 'Прайс',      icon: 'Tag',          visible: true, order: 8 },
  { key: 'settings', label: 'Настройки',  icon: 'Settings',     visible: true, order: 9 },
]

async function api(path: string, options?: RequestInit) {
  const res = await fetch(path, { headers: { 'Content-Type': 'application/json' }, ...options })
  if (!res.ok) throw new Error(`API error ${res.status}`)
  return res.json()
}

interface Store {
  initialized: boolean
  patients: Patient[]
  clinics: Clinic[]
  contacts: Contact[]
  tasks: Task[]
  invoices: Invoice[]
  navItems: NavItem[]
  priceCards: PriceCard[]

  initialize: () => Promise<void>

  addPatient: (p: Omit<Patient, 'id' | 'created' | 'updated'>) => void
  updatePatient: (id: string, p: Partial<Patient>) => void
  deletePatient: (id: string) => void

  addClinic: (c: Omit<Clinic, 'id'>) => void
  updateClinic: (id: string, c: Partial<Clinic>) => void
  deleteClinic: (id: string) => void

  addContact: (c: Omit<Contact, 'id'>) => void
  updateContact: (id: string, c: Partial<Contact>) => void
  deleteContact: (id: string) => void

  addTask: (t: Omit<Task, 'id'>) => void
  toggleTask: (id: string) => void
  deleteTask: (id: string) => void

  addInvoice: () => void
  updateInvoice: (id: string, data: Partial<Invoice>) => void
  deleteInvoice: (id: string) => void

  updateNavItem: (key: string, data: Partial<NavItem>) => void

  addPriceCard: (c: Omit<PriceCard, 'id' | 'created' | 'updated'>) => void
  updatePriceCard: (id: string, c: Partial<PriceCard>) => void
  deletePriceCard: (id: string) => void
}

export const useStore = create<Store>()((set, get) => ({
  initialized: false,
  patients: [], clinics: [], contacts: [], tasks: [], invoices: [], navItems: DEFAULT_NAV, priceCards: [],

  initialize: async () => {
    if (get().initialized) return

    // Migrate from localStorage if present
    try {
      const stored = localStorage.getItem('medtravel-crm-v3')
      if (stored) {
        const localData = JSON.parse(stored)?.state
        const hasData = (localData?.patients?.length ?? 0) > 0 ||
          (localData?.contacts?.length ?? 0) > 0 ||
          (localData?.tasks?.length ?? 0) > 0 ||
          (localData?.invoices?.length ?? 0) > 0
        if (hasData) {
          await fetch('/api/import', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(localData),
          })
          localStorage.removeItem('medtravel-crm-v3')
        }
      }
    } catch {}

    try {
      const [patients, clinics, contacts, tasks, invoices, navItems, priceCards] = await Promise.all([
        api('/api/patients').catch(() => []),
        api('/api/clinics').catch(() => []),
        api('/api/contacts').catch(() => []),
        api('/api/tasks').catch(() => []),
        api('/api/invoices').catch(() => []),
        api('/api/nav').catch(() => DEFAULT_NAV),
        api('/api/prices').catch(() => []),
      ])
      set({ initialized: true, patients, clinics, contacts, tasks, invoices, navItems, priceCards })
    } catch {
      set({ initialized: true })
    }
  },

  // ── Patients ──────────────────────────────────────────────
  addPatient: (p) => {
    const tmp: Patient = { ...p, id: uid(), created: new Date().toISOString(), updated: new Date().toISOString() }
    set(s => ({ patients: [...s.patients, tmp] }))
    api('/api/patients', { method: 'POST', body: JSON.stringify(p) })
      .then(created => set(s => ({ patients: s.patients.map(x => x.id === tmp.id ? created : x) })))
      .catch(() => set(s => ({ patients: s.patients.filter(x => x.id !== tmp.id) })))
  },

  updatePatient: (id, p) => {
    set(s => ({ patients: s.patients.map(x => x.id === id ? { ...x, ...p, updated: new Date().toISOString() } : x) }))
    api(`/api/patients/${id}`, { method: 'PATCH', body: JSON.stringify(p) })
      .then(updated => set(s => ({ patients: s.patients.map(x => x.id === id ? updated : x) })))
      .catch(() => {})
  },

  deletePatient: (id) => {
    set(s => ({ patients: s.patients.filter(p => p.id !== id) }))
    api(`/api/patients/${id}`, { method: 'DELETE' }).catch(() => {})
  },

  // ── Clinics ───────────────────────────────────────────────
  addClinic: (c) => {
    const tmp: Clinic = { ...c, id: uid() }
    set(s => ({ clinics: [...s.clinics, tmp] }))
    api('/api/clinics', { method: 'POST', body: JSON.stringify(c) })
      .then(created => set(s => ({ clinics: s.clinics.map(x => x.id === tmp.id ? created : x) })))
      .catch(() => set(s => ({ clinics: s.clinics.filter(x => x.id !== tmp.id) })))
  },

  updateClinic: (id, c) => {
    set(s => ({ clinics: s.clinics.map(x => x.id === id ? { ...x, ...c } : x) }))
    api(`/api/clinics/${id}`, { method: 'PATCH', body: JSON.stringify(c) })
      .then(updated => set(s => ({ clinics: s.clinics.map(x => x.id === id ? updated : x) })))
      .catch(() => {})
  },

  deleteClinic: (id) => {
    set(s => ({ clinics: s.clinics.filter(c => c.id !== id) }))
    api(`/api/clinics/${id}`, { method: 'DELETE' }).catch(() => {})
  },

  // ── Contacts ──────────────────────────────────────────────
  addContact: (c) => {
    const tmp: Contact = { ...c, id: uid() }
    set(s => ({ contacts: [...s.contacts, tmp] }))
    api('/api/contacts', { method: 'POST', body: JSON.stringify(c) })
      .then(created => set(s => ({ contacts: s.contacts.map(x => x.id === tmp.id ? created : x) })))
      .catch(() => set(s => ({ contacts: s.contacts.filter(x => x.id !== tmp.id) })))
  },

  updateContact: (id, c) => {
    set(s => ({ contacts: s.contacts.map(x => x.id === id ? { ...x, ...c } : x) }))
    api(`/api/contacts/${id}`, { method: 'PATCH', body: JSON.stringify(c) })
      .catch(() => {})
  },

  deleteContact: (id) => {
    set(s => ({ contacts: s.contacts.filter(c => c.id !== id) }))
    api(`/api/contacts/${id}`, { method: 'DELETE' }).catch(() => {})
  },

  // ── Tasks ─────────────────────────────────────────────────
  addTask: (t) => {
    const tmp: Task = { ...t, id: uid() }
    set(s => ({ tasks: [...s.tasks, tmp] }))
    api('/api/tasks', { method: 'POST', body: JSON.stringify(t) })
      .then(created => set(s => ({ tasks: s.tasks.map(x => x.id === tmp.id ? created : x) })))
      .catch(() => set(s => ({ tasks: s.tasks.filter(x => x.id !== tmp.id) })))
  },

  toggleTask: (id) => {
    const task = get().tasks.find(t => t.id === id)
    if (!task) return
    set(s => ({ tasks: s.tasks.map(t => t.id === id ? { ...t, done: !t.done } : t) }))
    api(`/api/tasks/${id}`, { method: 'PATCH', body: JSON.stringify({ done: !task.done }) }).catch(() => {})
  },

  deleteTask: (id) => {
    set(s => ({ tasks: s.tasks.filter(t => t.id !== id) }))
    api(`/api/tasks/${id}`, { method: 'DELETE' }).catch(() => {})
  },

  // ── Invoices ──────────────────────────────────────────────
  addInvoice: () => {
    const tmp: Invoice = { id: uid(), period: '', date: '', num: '', clinic: '', sum: '', recv: '', note: '' }
    set(s => ({ invoices: [tmp, ...s.invoices] }))
    api('/api/invoices', { method: 'POST' })
      .then(created => set(s => ({ invoices: s.invoices.map(x => x.id === tmp.id ? created : x) })))
      .catch(() => set(s => ({ invoices: s.invoices.filter(x => x.id !== tmp.id) })))
  },

  updateInvoice: (id, data) => {
    set(s => ({ invoices: s.invoices.map(i => i.id === id ? { ...i, ...data, updated: new Date().toISOString() } : i) }))
    api(`/api/invoices/${id}`, { method: 'PATCH', body: JSON.stringify(data) }).catch(() => {})
  },

  deleteInvoice: (id) => {
    set(s => ({ invoices: s.invoices.filter(i => i.id !== id) }))
    api(`/api/invoices/${id}`, { method: 'DELETE' }).catch(() => {})
  },

  // ── PriceCards ────────────────────────────────────────
  addPriceCard: (c) => {
    const tmp: PriceCard = { ...c, id: uid(), created: new Date().toISOString(), updated: new Date().toISOString() }
    set(s => ({ priceCards: [tmp, ...s.priceCards] }))
    api('/api/prices', { method: 'POST', body: JSON.stringify(c) })
      .then(created => set(s => ({ priceCards: s.priceCards.map(x => x.id === tmp.id ? created : x) })))
      .catch(() => set(s => ({ priceCards: s.priceCards.filter(x => x.id !== tmp.id) })))
  },

  updatePriceCard: (id, c) => {
    set(s => ({ priceCards: s.priceCards.map(x => x.id === id ? { ...x, ...c, updated: new Date().toISOString() } : x) }))
    api(`/api/prices/${id}`, { method: 'PATCH', body: JSON.stringify(c) })
      .then(updated => set(s => ({ priceCards: s.priceCards.map(x => x.id === id ? updated : x) })))
      .catch(() => {})
  },

  deletePriceCard: (id) => {
    set(s => ({ priceCards: s.priceCards.filter(x => x.id !== id) }))
    api(`/api/prices/${id}`, { method: 'DELETE' }).catch(() => {})
  },

  // ── Nav ───────────────────────────────────────────────────
  updateNavItem: (key, data) => {
    set(s => ({ navItems: s.navItems.map(n => n.key === key ? { ...n, ...data } : n) }))
    api('/api/nav', { method: 'PATCH', body: JSON.stringify({ key, ...data }) }).catch(() => {})
  },
}))

export const STATUSES: { key: Status; label: string; color: string; bg: string }[] = [
  { key: 'new',        label: 'Новый запрос',       color: '#1e40af', bg: '#eff6ff' },
  { key: 'processing', label: 'В обработке',         color: '#92400e', bg: '#fffbeb' },
  { key: 'docs',       label: 'Ожидание документов', color: '#9a3412', bg: '#fff7ed' },
  { key: 'clinic',     label: 'Подбор клиники',      color: '#5b21b6', bg: '#f5f3ff' },
  { key: 'waiting',    label: 'Ожидание ответа',     color: '#991b1b', bg: '#fef2f2' },
  { key: 'enrolled',   label: 'Записан',             color: '#065f46', bg: '#ecfdf5' },
  { key: 'done',       label: 'Завершён',            color: '#475569', bg: '#f1f5f9' },
  { key: 'declined',   label: 'Отказ',               color: '#be123c', bg: '#fff1f2' },
]

export function getStatus(key: Status) { return STATUSES.find(s => s.key === key) ?? STATUSES[0] }

export function localDateStr(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
}

export const MONTHS = ['Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь']
export const AVATAR_COLORS = ['#2dd4bf','#6366f1','#f59e0b','#ef4444','#8b5cf6','#10b981','#f97316']

export function avatarColor(name: string) {
  let h = 0; for (const c of name) h = c.charCodeAt(0) + h * 31
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}
export function initials(name: string) {
  const p = name.trim().split(' ')
  return ((p[0]?.[0] ?? '') + (p[1]?.[0] ?? '')).toUpperCase()
}
export function fmtDate(d?: string) { if (!d) return '—'; return new Date(d).toLocaleDateString('ru-RU') }
export function fmtDateTime(d?: string) {
  if (!d) return '—'
  const x = new Date(d)
  return x.toLocaleDateString('ru-RU') + ', ' + x.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })
}
