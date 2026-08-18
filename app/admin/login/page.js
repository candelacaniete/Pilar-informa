import { Suspense } from 'react'
import AdminLoginForm from '@/components/admin/AdminLoginForm'

function LoginFallback() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-slate-100 px-4">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center text-sm text-slate-600">
        Cargando…
      </div>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<LoginFallback />}>
      <AdminLoginForm />
    </Suspense>
  )
}
