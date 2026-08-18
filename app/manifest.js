export default function manifest() {
  return {
    name: 'Pilar Informa',
    short_name: 'Pilar Informa',
    description: 'Noticias, guía local, eventos y Pilar, tu asistente de Pilar.',
    start_url: '/',
    display: 'standalone',
    background_color: '#f6f4f0',
    theme_color: '#0e7c75',
    lang: 'es-AR',
    icons: [
      {
        src: '/icons/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
  }
}
