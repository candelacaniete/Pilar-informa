import { Manrope, Newsreader } from 'next/font/google'
import './globals.css'

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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
}

export default function RootLayout({ children }) {
  return (
    <html lang="es-AR">
      <body className={`${manrope.variable} ${newsreader.variable} font-sans antialiased`}>
        {children}
      </body>
    </html>
  )
}
