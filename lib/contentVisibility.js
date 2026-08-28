/** Primera fecha en que se muestra la sección de eventos en la home (carga semanal real). */
export const HOME_EVENTOS_VISIBLE_FROM = '2026-09-01'

/** Oculta "Qué hacer en Pilar" en home hasta el lunes de arranque. */
export function showHomeEventosSection(isoDate = null) {
  const today =
    isoDate ||
    new Date().toLocaleDateString('en-CA', { timeZone: 'America/Argentina/Buenos_Aires' })
  return today >= HOME_EVENTOS_VISIBLE_FROM
}
