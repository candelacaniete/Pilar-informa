import { ToastProvider } from '@/components/admin/Toast'
import AdminShell from '@/components/admin/AdminShell'

export const metadata = {
  title: 'Panel de administración',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }) {
  return (
    <ToastProvider>
      <div className="min-h-dvh max-w-[100vw] overflow-x-hidden bg-slate-100 text-slate-900">
        <AdminShell>{children}</AdminShell>
      </div>
    </ToastProvider>
  )
}
