export const news = [
  {
    id: 'renovacion-centro',
    slug: 'renovacion-centro-pilar',
    title: 'Así avanza la renovación del centro de Pilar: nuevas obras y cambios en el tránsito',
    excerpt:
      'Las obras en las calles céntricas avanzan con veredas renovadas, nueva señalización y desvíos temporarios. Te contamos qué cambia esta semana y cómo circular.',
    location: 'Pilar',
    timeAgo: '2 horas',
    category: 'Ciudad',
    featured: true,
    image:
      'https://images.unsplash.com/photo-1477959858617-67f85b6b3098?auto=format&fit=crop&w=1400&q=80',
  },
  {
    id: 'gastronomia-del-viso',
    slug: 'nueva-propuesta-gastronomica-del-viso',
    title: 'Nueva propuesta gastronómica abrió sus puertas en Del Viso',
    excerpt:
      'Un espacio de cocina de autor y barra de vinos se suma a la escena local, con foco en productores de la zona norte.',
    location: 'Del Viso',
    timeAgo: '5 horas',
    category: 'Gastronomía',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'agenda-cultural',
    slug: 'agenda-cultural-fin-de-semana',
    title: 'La agenda cultural de Pilar para este fin de semana',
    excerpt:
      'Teatros, ferias, música en vivo y actividades al aire libre para armar el plan perfecto sin salir del partido.',
    location: 'Pilar',
    timeAgo: '8 horas',
    category: 'Cultura',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'cortes-calles',
    slug: 'cortes-de-calles-proximos-dias',
    title: 'Qué calles tendrán cortes durante los próximos días',
    excerpt:
      'Por mantenimiento y obras de infraestructura, hay restricciones parciales en zonas de Derqui, Manzanares y el centro.',
    location: 'Pilar',
    timeAgo: 'Ayer',
    category: 'Tránsito',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'feria-emprendedores',
    slug: 'feria-emprendedores-plaza',
    title: 'La feria de emprendedores vuelve a la Plaza 12 de Octubre',
    excerpt:
      'Más de 80 puestos de diseño, gastronomía y productos locales se encuentran este sábado con música en vivo.',
    location: 'Pilar Centro',
    timeAgo: 'Ayer',
    category: 'Agenda',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1556742049-0cfed4f7a07d?auto=format&fit=crop&w=900&q=80',
  },
  {
    id: 'clubes-deportivos',
    slug: 'clubes-deportivos-inscripciones',
    title: 'Clubes deportivos de Pilar abren inscripciones para la temporada',
    excerpt:
      'Fútbol, hockey, natación y más. Un recorrido por las opciones disponibles en distintos barrios del partido.',
    location: 'Pilar',
    timeAgo: '2 días',
    category: 'Deportes',
    featured: false,
    image:
      'https://images.unsplash.com/photo-1574629810360-7efbbe195018?auto=format&fit=crop&w=900&q=80',
  },
]

export const getFeaturedNews = () => news.find((item) => item.featured) || news[0]
export const getSecondaryNews = () => news.filter((item) => !item.featured).slice(0, 3)
export const getAllNews = () => news
