import Header from '@/components/public/Header'
import Footer from '@/components/public/Footer'

export default function PublicLayout({ children }) {
  return (
    <div className="flex min-h-dvh flex-col bg-paper">
      <div
        className="pointer-events-none fixed inset-0 -z-10"
        style={{
          backgroundImage:
            'radial-gradient(ellipse 80% 50% at 10% -10%, rgba(14, 124, 117, 0.08), transparent 55%), radial-gradient(ellipse 60% 40% at 100% 0%, rgba(201, 133, 42, 0.05), transparent 50%)',
        }}
        aria-hidden
      />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  )
}
