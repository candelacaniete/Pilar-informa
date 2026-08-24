export const news = [
  {
    id: 'renovacion-centro',
    slug: 'renovacion-centro-pilar',
    title: 'Así avanza la renovación del centro de Pilar: nuevas obras y cambios en el tránsito',
    excerpt:
      'Las obras en las calles céntricas avanzan con veredas renovadas, nueva señalización y desvíos temporarios. Te contamos qué cambia esta semana y cómo circular.',
    location: 'Pilar',
    timeAgo: '2 horas',
    publishedAt: '2026-08-24T12:00:00-03:00',
    category: 'Ciudad',
    featured: true,
    image:
      'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=1400&q=80',
    body: [
      'Las obras en las calles céntricas de Pilar avanzan con veredas renovadas, nueva señalización y desvíos temporarios.',
      'Esta semana hay cambios de circulación en el microcentro. La recomendación es evitar el tramo más afectado en hora pico y usar las alternativas señalizadas.',
      'Guía Pilar va a ir actualizando cortes y desvíos a medida que la Municipalidad confirme el cronograma.',
    ],
  },
  {
    id: 'gastronomia-del-viso',
    slug: 'nueva-propuesta-gastronomica-del-viso',
    title: 'Nueva propuesta gastronómica abrió sus puertas en Del Viso',
    excerpt:
      'Un espacio de cocina de autor y barra de vinos se suma a la escena local, con foco en productores de la zona norte.',
    location: 'Del Viso',
    timeAgo: '5 horas',
    publishedAt: '2026-08-24T09:00:00-03:00',
    category: 'Gastronomía',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
    body: [
      'Del Viso suma un espacio de cocina de autor y barra de vinos, con foco en productores de la zona norte.',
      'La propuesta apunta a cenas y mediodías más pausados, y se suma a la guía gastronómica de Pilar.',
    ],
  },
  {
    id: 'agenda-cultural',
    slug: 'agenda-cultural-fin-de-semana',
    title: 'La agenda cultural de Pilar para este fin de semana',
    excerpt:
      'Teatros, ferias, música en vivo y actividades al aire libre para armar el plan perfecto sin salir del partido.',
    location: 'Pilar',
    timeAgo: '8 horas',
    publishedAt: '2026-08-24T06:00:00-03:00',
    category: 'Cultura',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
    body: [
      'El fin de semana en Pilar combina ferias, música en vivo y actividades al aire libre.',
      'La agenda completa está en Guía Pilar, con horarios y barrios para armar el plan sin salir del partido.',
    ],
  },
  {
    id: 'cortes-calles',
    slug: 'cortes-de-calles-proximos-dias',
    title: 'Qué calles tendrán cortes durante los próximos días',
    excerpt:
      'Por mantenimiento y obras de infraestructura, hay restricciones parciales en zonas de Derqui, Manzanares y el centro.',
    location: 'Pilar',
    timeAgo: 'Ayer',
    publishedAt: '2026-08-23T18:00:00-03:00',
    category: 'Tránsito',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1611348524140-53c9a25263d6?auto=format&fit=crop&w=900&q=80',
    body: [
      'Hay restricciones parciales en Derqui, Manzanares y el centro por mantenimiento y obras de infraestructura.',
      'Si circulás por esas zonas, dejá más tiempo de viaje y seguí la señalización de desvíos.',
    ],
  },
  {
    id: 'feria-emprendedores',
    slug: 'feria-emprendedores-plaza',
    title: 'La feria de emprendedores vuelve a la Plaza 12 de Octubre',
    excerpt:
      'Más de 80 puestos de diseño, gastronomía y productos locales se encuentran este sábado con música en vivo.',
    location: 'Pilar Centro',
    timeAgo: 'Ayer',
    publishedAt: '2026-08-23T12:00:00-03:00',
    category: 'Agenda',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=900&q=80',
    body: [
      'La feria de emprendedores vuelve a la Plaza 12 de Octubre con más de 80 puestos de diseño, gastronomía y productos locales.',
      'Hay música en vivo durante la tarde. El evento también está cargado en la agenda de Guía Pilar.',
    ],
  },
  {
    id: 'clubes-deportivos',
    slug: 'clubes-deportivos-inscripciones',
    title: 'Clubes deportivos de Pilar abren inscripciones para la temporada',
    excerpt:
      'Fútbol, hockey, natación y más. Un recorrido por las opciones disponibles en distintos barrios del partido.',
    location: 'Pilar',
    timeAgo: '2 días',
    publishedAt: '2026-08-22T10:00:00-03:00',
    category: 'Deportes',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80',
    body: [
      'Clubes de Pilar abren inscripciones para fútbol, hockey, natación y otras disciplinas.',
      'Las opciones están repartidas en distintos barrios del partido; conviene consultar cupos y horarios de cada club.',
    ],
  },
]

export const getFeaturedNews = () => news.find((item) => item.featured) || news[0]
export const getSecondaryNews = () => news.filter((item) => !item.featured).slice(0, 3)
export const getAllNews = () => news
export const getNewsBySlug = (slug) => news.find((item) => item.slug === slug)
