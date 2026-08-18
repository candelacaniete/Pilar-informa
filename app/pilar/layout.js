import PwaRegister from '@/components/public/PwaRegister'

export const metadata = {
  title: 'Pilar',
  description: 'Preguntale a Pilar por farmacias de turno, promociones, eventos y locales de Pilar.',
  appleWebApp: {
    capable: true,
    title: 'Pilar',
    statusBarStyle: 'default',
  },
  robots: { index: true, follow: true },
}

export default function PilarLayout({ children }) {
  return (
    <div className="min-h-dvh bg-paper">
      <PwaRegister />
      {children}
    </div>
  )
}
