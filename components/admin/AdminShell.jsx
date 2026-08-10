'use client'

import { usePathname } from 'next/navigation'
import AdminNav from './AdminNav'

export default function AdminShell({ children }) {
  const pathname = usePathname()
  const isLogin = pathname === '/admin/login'

  if (isLogin) {
    return children
  }

  return (
    <div className="admin-shell">
      <AdminNav />
      <div className="admin-main">
        <div className="admin-main-inner">{children}</div>
      </div>
    </div>
  )
}
