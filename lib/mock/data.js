export const mockCategorias = [
  { id: '1', nombre: 'Gastronomía', slug: 'gastronomia', icono: '🍽️', orden: 1, cerrada: false },
  { id: '2', nombre: 'Compras', slug: 'compras', icono: '🛍️', orden: 2, cerrada: false },
  { id: '3', nombre: 'Salud', slug: 'salud', icono: '🏥', orden: 3, cerrada: false },
  { id: '4', nombre: 'Servicios', slug: 'servicios', icono: '🔧', orden: 4, cerrada: false },
  { id: '5', nombre: 'Hogar', slug: 'hogar', icono: '🏠', orden: 5, cerrada: false },
  { id: '6', nombre: 'Automotor', slug: 'automotor', icono: '🚗', orden: 6, cerrada: false },
  { id: '7', nombre: 'Profesionales', slug: 'profesionales', icono: '💼', orden: 7, cerrada: false },
  { id: '8', nombre: 'Belleza', slug: 'belleza', icono: '💅', orden: 8, cerrada: false },
  { id: '9', nombre: 'Educación', slug: 'educacion', icono: '📚', orden: 9, cerrada: false },
  { id: '10', nombre: 'Mascotas', slug: 'mascotas', icono: '🐾', orden: 10, cerrada: false },
  { id: '11', nombre: 'Construcción', slug: 'construccion', icono: '🧱', orden: 11, cerrada: false },
  { id: '12', nombre: 'Tecnología', slug: 'tecnologia', icono: '💻', orden: 12, cerrada: true },
  {
    id: '13',
    nombre: 'Community Managers',
    slug: 'community-managers',
    icono: '📱',
    orden: 13,
    cerrada: false,
  },
  { id: '14', nombre: 'Creadores UGC', slug: 'creadores-ugc', icono: '🎬', orden: 14, cerrada: false },
]

const daysFromNow = (n) => {
  const d = new Date()
  d.setDate(d.getDate() + n)
  return d.toISOString()
}

export const mockNegocios = [
  {
    id: 'n-katem',
    nombre: 'Katem',
    slug: 'katem',
    categoria_id: '12',
    categorias: mockCategorias[11],
    subcategoria: 'Desarrollo web y producto digital',
    descripcion_corta: 'Agencia de desarrollo web y producto digital.',
    descripcion_larga:
      'Katem diseña y desarrolla sitios y productos digitales para marcas y emprendimientos de Pilar y la zona norte.',
    direccion: 'Pilar, Buenos Aires',
    localidad: 'Pilar',
    lat: -34.458,
    lng: -58.914,
    telefono: null,
    whatsapp: null,
    instagram: null,
    web: 'https://katem.com.ar/',
    horarios: { texto: 'Consultar' },
    codigo_resena: 'KATEM1',
    rating: 5,
    cantidad_opiniones: 0,
    estado: 'activo',
    plan: 'premium',
    fecha_pago: daysFromNow(-30).slice(0, 10),
    plan_vence: daysFromNow(335),
    prioridad: 0,
    verificado: true,
    negocio_fotos: [
      {
        id: 'f-katem',
        url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80',
        es_principal: true,
        orden: 0,
      },
      {
        id: 'f-katem-2',
        url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80',
        es_principal: false,
        orden: 1,
      },
    ],
  },
]


export const mockNoticias = [
  {
    id: 'news1',
    titulo: 'El Municipio avanza con obras de mejora en escuelas y jardines de Zelaya',
    slug: 'obras-mejoras-escuelas-zelaya',
    bajada:
      'El Municipio de Pilar avanza con trabajos de mejora edilicia en establecimientos educativos de Zelaya.',
    cuerpo:
      'El Municipio de Pilar avanza con trabajos de mejora edilicia en establecimientos educativos de Zelaya.',
    imagen:
      'https://images.unsplash.com/photo-1592066575517-58df903152f2?fm=jpg&q=60&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0',
    categoria: 'Ciudad',
    publicado_en: '2026-08-26T13:00:00.000Z',
    autor: 'Diario Resumen',
    estado: 'publicado',
  },
  {
    id: 'news2',
    titulo: 'Detuvieron a dos hombres tras un intento de robo de moto en Villa Rosa',
    slug: 'detencion-robo-moto-villa-rosa',
    bajada:
      'Dos hombres fueron detenidos en La Lonja luego de intentar robar una motocicleta en Villa Rosa. El seguimiento de cámaras del COM permitió coordinar la interceptación con la Guardia Urbana.',
    cuerpo:
      'Dos hombres fueron detenidos en La Lonja luego de intentar robar una motocicleta en Villa Rosa. El seguimiento de cámaras del COM permitió coordinar la interceptación con la Guardia Urbana.',
    imagen:
      'https://images.unsplash.com/photo-1675430428387-376cabac44dc?fm=jpg&q=60&w=1200&auto=format&fit=crop&ixlib=rb-4.1.0',
    categoria: 'Seguridad',
    publicado_en: '2026-08-26T13:00:00.000Z',
    autor: 'Diario Resumen',
    estado: 'publicado',
  },
]

export const mockEventos = []

export const mockPromociones = []

export const mockFarmaciasTurno = [
  {
    id: 'ft1',
    nombre: 'Farmacia Santa Rita',
    direccion: 'Av. Víctor Vergani 850, Pilar Centro',
    localidad: 'Pilar Centro',
    telefono: '+54 230 444-1101',
    whatsapp: '+54 9 230 444-1101',
    fecha: daysFromNow(0).slice(0, 10),
    horario: '24 horas',
    notas: 'Guardia completa. Entrega de recetas hasta las 22 hs.',
  },
  {
    id: 'ft2',
    nombre: 'Farmacia Del Viso',
    direccion: 'Ruta 8 Km 53.2, Del Viso',
    localidad: 'Del Viso',
    telefono: '+54 230 444-2202',
    whatsapp: '+54 9 230 444-2202',
    fecha: daysFromNow(0).slice(0, 10),
    horario: '8:00 a 22:00',
    notas: 'Atención con receta digital.',
  },
  {
    id: 'ft3',
    nombre: 'Farmacia Zelaya',
    direccion: 'Calle Principal 120, Zelaya',
    localidad: 'Zelaya',
    telefono: '+54 230 444-3303',
    whatsapp: '+54 9 230 444-3303',
    fecha: daysFromNow(0).slice(0, 10),
    horario: '8:00 a 21:00',
    notas: 'Cerca de la estación.',
  },
  {
    id: 'ft4',
    nombre: 'Farmacia Derqui Central',
    direccion: 'Av. Hipólito Yrigoyen 450, Derqui',
    localidad: 'Derqui',
    telefono: '+54 230 444-4404',
    whatsapp: null,
    fecha: daysFromNow(1).slice(0, 10),
    horario: '8:00 a 22:00',
    notas: 'Turno de mañana y tarde.',
  },
  {
    id: 'ft5',
    nombre: 'Farmacia Manzanares',
    direccion: 'Camino Real 980, Manzanares',
    localidad: 'Manzanares',
    telefono: '+54 230 444-5505',
    whatsapp: '+54 9 230 444-5505',
    fecha: daysFromNow(1).slice(0, 10),
    horario: '9:00 a 21:00',
    notas: null,
  },
  {
    id: 'ft6',
    nombre: 'Farmacia La Lonja',
    direccion: 'Av. Caamaño 2100, La Lonja',
    localidad: 'La Lonja',
    telefono: '+54 230 444-6606',
    whatsapp: null,
    fecha: daysFromNow(2).slice(0, 10),
    horario: '8:30 a 20:30',
    notas: null,
  },
  {
    id: 'ft7',
    nombre: 'Farmacia Villa Rosa',
    direccion: 'Ruta 25 y Calle 12, Villa Rosa',
    localidad: 'Villa Rosa',
    telefono: '+54 230 444-7707',
    whatsapp: '+54 9 230 444-7707',
    fecha: daysFromNow(3).slice(0, 10),
    horario: '8:00 a 22:00',
    notas: 'Feriados: consultar WhatsApp.',
  },
  {
    id: 'ft8',
    nombre: 'Farmacia Fátima',
    direccion: 'Av. Champagnat 340, Fátima',
    localidad: 'Fátima',
    telefono: '+54 230 444-8808',
    whatsapp: null,
    fecha: daysFromNow(4).slice(0, 10),
    horario: '9:00 a 21:00',
    notas: null,
  },
  {
    id: 'ft9',
    nombre: 'Farmacia Santa Rita',
    direccion: 'Av. Víctor Vergani 850, Pilar Centro',
    localidad: 'Pilar Centro',
    telefono: '+54 230 444-1101',
    whatsapp: '+54 9 230 444-1101',
    fecha: daysFromNow(5).slice(0, 10),
    horario: '24 horas',
    notas: 'Fin de semana: guardia 24 hs.',
  },
  {
    id: 'ft10',
    nombre: 'Farmacia Del Viso',
    direccion: 'Ruta 8 Km 53.2, Del Viso',
    localidad: 'Del Viso',
    telefono: '+54 230 444-2202',
    whatsapp: '+54 9 230 444-2202',
    fecha: daysFromNow(6).slice(0, 10),
    horario: '8:00 a 22:00',
    notas: null,
  },
]

export const mockBanners = []

export const mockResenas = []

export const mockMascotasAvisos = [
  {
    id: 'm1',
    slug: 'luna-labrador-perdida-pilar-centro',
    titulo: 'Luna, labrador chocolate',
    tipo: 'perdido',
    zona: 'Pilar Centro',
    foto_url: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=800&q=80',
    whatsapp_e164: '5491173739450',
    fecha_hecho: daysFromNow(-2).slice(0, 10),
    estado: 'aprobado',
    resolve_token: 'demo-resolve-luna',
    rechazo_motivo: null,
    aprobado_en: daysFromNow(-1),
    expira_en: daysFromNow(29),
    creado_en: daysFromNow(-2),
    actualizado_en: daysFromNow(-1),
  },
  {
    id: 'm2',
    slug: 'gato-naranja-encontrado-del-viso',
    titulo: 'Gato naranja con collar azul',
    tipo: 'encontrado',
    zona: 'Del Viso',
    foto_url: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=800&q=80',
    whatsapp_e164: '5491173739450',
    fecha_hecho: daysFromNow(-1).slice(0, 10),
    estado: 'aprobado',
    resolve_token: 'demo-resolve-gato',
    rechazo_motivo: null,
    aprobado_en: daysFromNow(-1),
    expira_en: daysFromNow(29),
    creado_en: daysFromNow(-1),
    actualizado_en: daysFromNow(-1),
  },
  {
    id: 'm3',
    slug: 'toby-pendiente-revision',
    titulo: 'Toby, caniche toy',
    tipo: 'perdido',
    zona: 'Manzanares',
    foto_url: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=800&q=80',
    whatsapp_e164: '5491122334455',
    fecha_hecho: null,
    estado: 'pendiente',
    resolve_token: 'demo-resolve-toby',
    rechazo_motivo: null,
    aprobado_en: null,
    expira_en: null,
    creado_en: daysFromNow(0),
    actualizado_en: daysFromNow(0),
  },
]
