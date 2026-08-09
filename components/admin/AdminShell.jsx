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
    <div className="mx-auto flex min-h-dvh max-w-7xl">
      <AdminNav />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  )
}
