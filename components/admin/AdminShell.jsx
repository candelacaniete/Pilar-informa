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
    <div className="admin-shell min-h-dvh w-full max-w-[100vw] overflow-x-hidden">
      <AdminNav />
      {/* En desktop dejamos espacio para el sidebar fijo */}
      <div className="w-full md:pl-64">
        <div className="mx-auto w-full max-w-5xl min-w-0">{children}</div>
      </div>
    </div>
  )
}
