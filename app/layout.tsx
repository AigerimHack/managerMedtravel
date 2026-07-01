import type { Metadata } from 'next'
import './globals.css'
import { AppShell } from '@/components/AppShell'

export const metadata: Metadata = {
  title: 'MedTravel CRM',
  description: 'Система управления медицинскими пациентами',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        {/* eslint-disable-next-line @next/next/no-page-custom-font */}
        <link href="https://fonts.googleapis.com/css2?family=Golos+Text:wght@400;500;600&family=Unbounded:wght@400;600&display=swap" rel="stylesheet" />
      </head>
      <body style={{ fontFamily: "'Golos Text', sans-serif" }}>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
