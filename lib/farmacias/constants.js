export const COLFARMA_TURNO_URL = 'https://colfarma.info/pilar/farmacias-de-turno/'
export const COLFARMA_HOME_URL = 'https://colfarma.info/pilar/'
export const COLFARMA_ATTRIBUTION = 'Datos: Colegio de Farmacéuticos de Pilar'

/** Tras ~30 h sin scrape OK consideramos la data desactualizada (turno típico ~24 h + margen). */
export const SCRAPE_STALE_AFTER_MS = 30 * 60 * 60 * 1000
