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
    <div className="mx-auto flex min-h-dvh w-full max-w-7xl flex-col md:flex-row">
      <AdminNav />
      <div className="min-w-0 w-full flex-1">{children}</div>
    </div>
  )
}
