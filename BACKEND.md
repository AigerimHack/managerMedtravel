# MedTravel CRM — Backend

## Стек

| Слой | Технология |
|------|-----------|
| Runtime | Node.js 20+ |
| Framework | Next.js 16 API Routes (app/api) |
| База данных | PostgreSQL 16 |
| ORM | Prisma |
| Аутентификация | NextAuth.js (email + password) |
| Хранилище файлов | AWS S3 / Cloudflare R2 |
| Деплой | Vercel + Supabase |

---

## База данных — схема (Prisma)

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String
  password  String
  role      Role     @default(MANAGER)
  createdAt DateTime @default(now())
  patients  Patient[]
}

enum Role {
  ADMIN
  MANAGER
}

model Patient {
  id      String  @id @default(cuid())
  regNum  String?
  name    String
  diag    String
  clinic  String
  status  Status  @default(new)
  info    String?
  visits  Visit[]
  docs    Doc[]
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  createdBy   User   @relation(fields: [createdById], references: [id])
  createdById String
}

enum Status {
  new
  processing
  docs
  clinic
  waiting
  enrolled
  done
}

model Visit {
  id        String  @id @default(cuid())
  type      String
  date      DateTime
  note      String?
  clinic    Clinic  @relation(fields: [clinicId], references: [id])
  clinicId  String
  patient   Patient @relation(fields: [patientId], references: [id], onDelete: Cascade)
  patientId String
}

model Doc {
  id        String   @id @default(cuid())
  name      String
  fileKey   String   // S3/R2 key
  fileType  String
  date      DateTime @default(now())
  patient   Patient  @relation(fields: [patientId], references: [id], onDelete: Cascade)
  patientId String
}

model Clinic {
  id     String  @id @default(cuid())
  name   String
  city   String?
  spec   String?
  coord  String?
  email  String?
  phone1 String?
  phone2 String?
  phone3 String?
  addr1  String?
  addr2  String?
  notes  String?
  color  String  @default("#3b82f6")
  brochures ClinicDoc[]
  visits Visit[]
}

model ClinicDoc {
  id       String  @id @default(cuid())
  name     String
  fileKey  String
  fileType String
  date     DateTime @default(now())
  clinic   Clinic  @relation(fields: [clinicId], references: [id], onDelete: Cascade)
  clinicId String
}

model Contact {
  id    String      @id @default(cuid())
  type  ContactType
  name  String
  phone String?
  email String?
  notes String?
}

enum ContactType {
  hotel
  transfer
  translator
}

model Task {
  id   String   @id @default(cuid())
  text String
  due  DateTime?
  done Boolean  @default(false)
}

model Invoice {
  id       String   @id @default(cuid())
  date     DateTime
  num      String
  clinic   String
  sum      String
  recv     String
  note     String?
  fileKey  String?
  fileName String?
  fileType String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

---

## API — маршруты

Все маршруты под префиксом `/api/`. Требуют заголовок `Authorization: Bearer <token>` (кроме `/api/auth`).

### Пациенты

```
GET    /api/patients              — список (фильтры: status, search, page)
POST   /api/patients              — создать
GET    /api/patients/:id          — один пациент с визитами и документами
PATCH  /api/patients/:id          — обновить поля
DELETE /api/patients/:id          — удалить

POST   /api/patients/:id/visits   — добавить визит
DELETE /api/patients/:id/visits/:visitId

POST   /api/patients/:id/docs     — загрузить документ (multipart/form-data)
DELETE /api/patients/:id/docs/:docId
GET    /api/patients/:id/docs/:docId/download  — presigned URL
```

### Клиники и контакты

```
GET    /api/clinics               — список
POST   /api/clinics               — создать
PATCH  /api/clinics/:id
DELETE /api/clinics/:id

POST   /api/clinics/:id/brochures — загрузить брошюру
DELETE /api/clinics/:id/brochures/:docId

GET    /api/contacts?type=hotel|transfer|translator
POST   /api/contacts
PATCH  /api/contacts/:id
DELETE /api/contacts/:id
```

### Задачи и инвойсы

```
GET    /api/tasks
POST   /api/tasks
PATCH  /api/tasks/:id             — в т.ч. done: true/false
DELETE /api/tasks/:id

GET    /api/invoices
POST   /api/invoices
PATCH  /api/invoices/:id
DELETE /api/invoices/:id
POST   /api/invoices/:id/file     — прикрепить файл
```

### Уведомления

```
GET    /api/notifications/upcoming   — визиты в ближайшие 24 ч
```

### Аутентификация (NextAuth)

```
POST   /api/auth/signin
POST   /api/auth/signout
GET    /api/auth/session
```

---

## Переход с localStorage на API

Сейчас данные хранятся в localStorage (`medtravel-crm-v3`). Миграция в два шага:

1. **Экспорт** — кнопка «Экспортировать данные» в разделе Настройки сохраняет JSON
2. **Импорт** — эндпоинт `POST /api/import` принимает этот JSON и создаёт все записи в БД

После успешного импорта localStorage очищается, Zustand переключается на fetch-вызовы вместо прямой мутации стора.

---

## Хранение файлов (S3 / R2)

```
Загрузка:
  1. Клиент → POST /api/upload/presign { fileName, fileType }
  2. Сервер   → вернуть { uploadUrl, fileKey }
  3. Клиент   → PUT uploadUrl (напрямую в S3/R2)
  4. Клиент   → сохранить fileKey в модели (doc, invoice, brochure)

Скачивание:
  GET /api/upload/download?key=<fileKey>
  Сервер генерирует presigned GET URL (TTL 1 час)
```

---

## Структура файлов (добавляется к текущей)

```
app/api/
  auth/[...nextauth]/route.ts
  patients/
    route.ts                  — GET list, POST create
    [id]/
      route.ts                — GET, PATCH, DELETE
      visits/route.ts
      docs/route.ts
      docs/[docId]/download/route.ts
  clinics/route.ts
  clinics/[id]/route.ts
  contacts/route.ts
  contacts/[id]/route.ts
  tasks/route.ts
  tasks/[id]/route.ts
  invoices/route.ts
  invoices/[id]/route.ts
  notifications/upcoming/route.ts
  upload/
    presign/route.ts
    download/route.ts
  import/route.ts

lib/
  prisma.ts                   — PrismaClient singleton
  auth.ts                     — NextAuth config
  s3.ts                       — S3/R2 helpers
```

---

## Переменные окружения

```env
DATABASE_URL=postgresql://user:password@host:5432/medtravel

NEXTAUTH_SECRET=...
NEXTAUTH_URL=http://localhost:3000

AWS_REGION=auto
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=medtravel-files
S3_ENDPOINT=https://<account>.r2.cloudflarestorage.com   # если R2
```

---

## Локальный запуск с базой данных

```bash
# 1. PostgreSQL через Docker
docker run -d --name medtravel-db \
  -e POSTGRES_DB=medtravel \
  -e POSTGRES_USER=user \
  -e POSTGRES_PASSWORD=password \
  -p 5432:5432 postgres:16

# 2. Prisma
npx prisma generate
npx prisma migrate dev --name init

# 3. Dev-сервер
npm run dev
```
