'use client'

import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, type = 'ok') => {
    setToast({ message, type, id: Date.now() })
    window.clearTimeout(window.__piToast)
    window.__piToast = window.setTimeout(() => setToast(null), 3200)
  }, [])

  const value = useMemo(() => ({ showToast }), [showToast])

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast && (
        <div className="fixed bottom-5 right-5 z-[100] max-w-sm animate-[fadeUp_0.25s_ease-out]">
          <div
            className={`flex items-start gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lift ${
              toast.type === 'error' ? 'bg-danger' : 'bg-teal-dark'
            }`}
          >
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <p className="flex-1">{toast.message}</p>
            <button type="button" onClick={() => setToast(null)} aria-label="Cerrar">
              <X className="h-4 w-4 opacity-80" />
            </button>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast debe usarse dentro de ToastProvider')
  return ctx
}
