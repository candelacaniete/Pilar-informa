export const EMERGENCIAS = [
  {
    id: 'policia',
    categoria: 'Seguridad',
    titulo: 'Policía',
    numero: '911',
    tel: '911',
  },
  {
    id: 'same',
    categoria: 'Salud',
    titulo: 'Ambulancia (SAME)',
    numero: '107',
    tel: '107',
  },
  {
    id: 'bomberos',
    categoria: 'Incendios',
    titulo: 'Bomberos',
    numero: '100',
    tel: '100',
  },
  {
    id: 'violencia-genero',
    categoria: 'Asistencia',
    titulo: 'Violencia de género',
    numero: '144',
    tel: '144',
  },
  {
    id: 'defensa-civil',
    categoria: 'Protección civil',
    titulo: 'Defensa Civil',
    numero: '103',
    tel: '103',
  },
  {
    id: 'monitoreo-pilar',
    categoria: 'Emergencias 24 hs',
    titulo: 'Centro de Monitoreo Pilar',
    numero: '0230 427 6910',
    tel: '02304276910',
  },
  {
    id: 'muni-whatsapp',
    categoria: 'Municipio',
    titulo: 'WhatsApp / Mi Muni',
    numero: '11 5238 6864',
    tel: '1152386864',
    whatsappUrl: 'https://wa.me/5491152386864',
  },
  {
    id: 'muni-gratis',
    categoria: 'Municipio',
    titulo: 'Línea gratuita',
    numero: '0800 345 6864',
    tel: '08003456864',
  },
]

export const ZOONOSIS = {
  id: 'zoonosis',
  titulo: 'Zoonosis',
  subtitulo: 'Trámite municipal (no es emergencia)',
  sede: {
    direccion: 'Ruta 25, Av. Tratado del Pilar 281',
    localidad: 'Pilar Centro',
    horario: 'Lunes a viernes, 8 a 15 hs',
  },
  servicios: [
    {
      nombre: 'Vacunación antirrábica',
      detalle: 'Sin turno, por orden de llegada.',
    },
    {
      nombre: 'Castración',
      detalle: 'Con turno previo.',
    },
  ],
  cronogramaMovil: {
    label: 'Ver cronograma actualizado',
    url: 'https://pilar.gov.ar/tramites/zoonosis/',
    nota: 'Operativos móviles por barrio: consultá la fuente oficial.',
  },
  fuenteUrl: 'https://pilar.gov.ar/tramites/zoonosis/',
}

/** Números cortos para teaser en home */
export const EMERGENCIAS_TEASER = ['911', '107', '100', '144']
