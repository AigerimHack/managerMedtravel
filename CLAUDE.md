```markdown
# MedTravel CRM

## Стек
Next.js 16, TypeScript, Tailwind CSS v4, Zustand, Lucide React

## Главное правило — Tailwind v4
Никогда не использовать кастомные значения в скобках:
- ❌ `ml-[220px]` `w-[220px]` `grid-cols-[1fr_300px]`
- ✅ `style={{ marginLeft: 220 }}` `style={{ width: 220 }}` `style={{ gridTemplateColumns: '1fr 300px' }}`

Стандартные классы (flex, p-4, text-sm) — можно.

## Переиспользуемые компоненты — использовать везде

| Компонент | Файл | Использование |
|-----------|------|---------------|
| `Button` | `components/ui/Button.tsx` | variant: primary/secondary/danger/ghost, size: sm/md/lg |
| `Input` | `components/ui/Input.tsx` | value, onChange, label, placeholder, required |
| `Select` | `components/ui/Input.tsx` | value, onChange, label + children options |
| `Textarea` | `components/ui/Input.tsx` | value, onChange, label, rows |
| `Card` | `components/ui/Card.tsx` | обёртка с белым фоном и бордером |
| `PageHeader` | `components/ui/Card.tsx` | title, subtitle, action |
| `SectionLabel` | `components/ui/Card.tsx` | заголовок секции внутри формы |
| `StatusBadge` | `components/ui/StatusBadge.tsx` | status: Status |
| `Modal` | `components/ui/Modal.tsx` | open, onClose, title, footer, wide |

## Структура файлов
```
app/page.tsx                      — layout + роутинг
components/ui/Sidebar.tsx         — меню (220px fixed, берёт navItems из store)
components/ui/Button.tsx          — кнопка
components/ui/Input.tsx           — Input, Select, Textarea
components/ui/Card.tsx            — Card, PageHeader, SectionLabel
components/ui/Modal.tsx           — базовый модал
components/ui/PatientModal.tsx    — форма пациента
components/ui/ClinicModal.tsx     — форма клиники
components/ui/FilePreviewModal.tsx — просмотр PDF/картинок
components/ui/StatusBadge.tsx     — бейдж статуса
components/ui/Toast.tsx           — уведомления
components/sections/HomeSection.tsx
components/sections/RequestsSection.tsx
components/sections/GreensSection.tsx
components/sections/CalendarSection.tsx
components/sections/ClinicsSection.tsx
components/sections/PatientsSection.tsx
components/sections/TasksSection.tsx
components/sections/InvoicesSection.tsx
components/sections/SettingsSection.tsx
lib/store.ts                      — Zustand + все типы
```

## Типы данных (store.ts)
```typescript
Patient  { id, name, regNum?, diag, clinic, status, info?, visits, docs, created, updated }
Clinic   { id, name, city?, spec?, coord?, email?, phone1-3?, addr1-2?, notes?, color }
Task     { id, text, due?, done }
Invoice  { id, date, num, clinic, sum, recv, note, file?, fileName?, fileType? }
Visit    { id, type, date, clinic, note? }
NavItem  { key, label, icon, visible, order }
Status   = 'new' | 'processing' | 'docs' | 'clinic' | 'waiting' | 'enrolled' | 'done'
```

## Логика
- Статус `enrolled` → пациент в разделе «Зелёные»
- Статус `done` → пациент в архиве «Пациенты» (по годам/месяцам)
- Визиты пациента → автоматически в Календаре
- `navItems` в store → управляет меню (видимость, название)
- Данные в localStorage: `medtravel-crm-v3`

## Цвета
```
Акцент:      #2dd4bf
Фон:         #f4f6f9
Сайдбар:     #0f1923
Текст:       #1a2332
Граница:     #f1f5f9
Мuted:       #94a3b8
```
```
