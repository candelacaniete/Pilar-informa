import { Manrope, Newsreader } from 'next/font/google'
import './globals.css'
import { safeSiteUrl } from '@/lib/supabase/config'

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  display: 'swap',
})

const newsreader = Newsreader({
  subsets: ['latin'],
  variable: '--font-newsreader',
  display: 'swap',
})

export const metadata = {
  title: {
    default: 'Pilar Informa — Todo Pilar. En un solo lugar.',
    template: '%s · Pilar Informa',
  },
  description:
    'Noticias, comercios, servicios, eventos y todo lo que pasa en Pilar, Provincia de Buenos Aires.',
  metadataBase: new URL(safeSiteUrl()),
  appleWebApp: {
    capable: true,
    title: 'Pilar Informa',
    statusBarStyle: 'default',
  },
  icons: {
    icon: [
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: '/icons/apple-touch-icon.png',
  },
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0e7c75',
}

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR" className="overflow-x-hidden">
      <body
        className={`${manrope.variable} ${newsreader.variable} max-w-[100vw] overflow-x-hidden font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  )
}

