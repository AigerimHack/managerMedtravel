'use client'
import { createContext, useContext, useState, ReactNode, useCallback } from 'react'
import { CheckCircle } from 'lucide-react'

interface ToastCtx { toast: (msg: string) => void }
const Ctx = createContext<ToastCtx>({ toast: () => {} })
export const useToast = () => useContext(Ctx)

export function ToastProvider({ children }: { children: ReactNode }) {
  const [msg, setMsg] = useState('')
  const [visible, setVisible] = useState(false)

  const toast = useCallback((m: string) => {
    setMsg(m); setVisible(true)
    setTimeout(() => setVisible(false), 2800)
  }, [])

  return (
    <Ctx.Provider value={{ toast }}>
      {children}
      <div className={`fixed bottom-6 right-6 z-[100] flex items-center gap-2 px-4 py-3 rounded-xl text-white text-sm font-medium shadow-lg transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        style={{ background: '#1a2332' }}>
        <CheckCircle size={15} className="text-teal-400 shrink-0" />
        {msg}
      </div>
    </Ctx.Provider>
  )
}
