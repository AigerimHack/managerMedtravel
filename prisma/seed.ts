import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Admin user
  const existing = await prisma.user.findFirst()
  if (!existing) {
    const password = await bcrypt.hash('admin123', 10)
    await prisma.user.create({
      data: { email: 'admin@medtravel.com', name: 'Айгерим', password, role: 'ADMIN' },
    })
    console.log('Created admin: admin@medtravel.com / admin123')
  }

  // Nav items
  const navDefs = [
    { key: 'home',     label: 'Главная',    icon: 'Home',         visible: true, order: 0 },
    { key: 'requests', label: 'Запросы',    icon: 'AlertCircle',  visible: true, order: 1 },
    { key: 'greens',   label: 'Зелёные',    icon: 'CheckCircle2', visible: true, order: 2 },
    { key: 'calendar', label: 'Календарь',  icon: 'Calendar',     visible: true, order: 3 },
    { key: 'clinics',  label: 'Контакты',   icon: 'Building2',    visible: true, order: 4 },
    { key: 'patients', label: 'Пациенты',   icon: 'Users',        visible: true, order: 5 },
    { key: 'tasks',    label: 'Список дел', icon: 'CheckSquare',  visible: true, order: 6 },
    { key: 'invoices', label: 'Инвойсы',    icon: 'Receipt',      visible: true, order: 7 },
    { key: 'settings', label: 'Настройки',  icon: 'Settings',     visible: true, order: 8 },
  ]
  for (const n of navDefs) {
    await prisma.navItem.upsert({ where: { key: n.key }, update: {}, create: n })
  }
}

main().catch(console.error).finally(() => prisma.$disconnect())