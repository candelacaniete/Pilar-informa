import { ToastProvider } from '@/components/admin/Toast'
import AdminShell from '@/components/admin/AdminShell'
import './admin.css'

export const metadata = {
  title: 'Panel de administración',
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }) {
  return (
    <ToastProvider>
      <div className="admin-root">
        <AdminShell>{children}</AdminShell>
      </div>
    </ToastProvider>
  )
}
