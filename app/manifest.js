export default function manifest() {
  return {
    name: 'Pilar',
    short_name: 'Pilar',
    description: 'Tu asistente de Pilar Informa: farmacias de turno, promos, eventos y locales.',
    start_url: '/pilar',
    scope: '/pilar',
    id: '/pilar',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0e7c75',
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
