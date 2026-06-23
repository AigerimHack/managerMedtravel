import { getStatus, Status } from '@/lib/store'

export function StatusBadge({ status }: { status: Status }) {
  const s = getStatus(status)
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ background: s.bg, color: s.color }}>
      <span className="w-1.5 h-1.5 rounded-full" style={{ background: s.color }} />
      {s.label}
    </span>
  )
}
