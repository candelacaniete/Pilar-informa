import { Manrope, Newsreader } from 'next/font/google'
import './globals.css'
import { safeSiteUrl } from '@/lib/supabase/config'
import {
  BRAND,
  BRAND_TAGLINE,
  DEFAULT_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  TITLE_TEMPLATE,
} from '@/lib/seo/site'

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
    default: `${BRAND} — ${BRAND_TAGLINE}`,
    template: TITLE_TEMPLATE,
  },
  description: DEFAULT_DESCRIPTION,
  metadataBase: new URL(safeSiteUrl()),
  openGraph: {
    title: `${BRAND} — ${BRAND_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    siteName: BRAND,
    locale: 'es_AR',
    type: 'website',
    images: [{ url: DEFAULT_OG_IMAGE }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `${BRAND} — ${BRAND_TAGLINE}`,
    description: DEFAULT_DESCRIPTION,
    images: [DEFAULT_OG_IMAGE],
  },
  appleWebApp: {
    capable: true,
    title: BRAND,
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
