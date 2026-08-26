export function detectIntent(question) {
  const q = question.toLowerCase()
  if (/farmacia|turno|guardia/.test(q)) return 'farmacia'
  if (/promo|descuento|oferta|2x1|cup[oó]n/.test(q)) return 'promo'
  if (/evento|agenda|feria|festival|cine|qu[eé] hacer|finde|fin de semana/.test(q)) return 'evento'
  if (/noticia|pas[oó]|tr[aá]nsito|obras/.test(q)) return 'noticia'
  // Gastronomía antes del catch-all "dónde/local" (ej. "dónde puedo merendar").
  if (
    /restau|comer|parrilla|caf[eé]|bar|gastronom|pizza|almorz|cenar|brunch|meriend|merendar|desayun|confiter|pasteler|tomar algo/.test(
      q,
    )
  ) {
    return 'gastro'
  }
  if (/pelu|belleza|est[eé]tica/.test(q)) return 'negocio'
  if (/vet|veterinari|mascot|perro|gato/.test(q)) return 'mascotas'
  if (/mecan|taller|auto/.test(q)) return 'negocio'
  if (/local|negocio|comercio|d[oó]nde|donde/.test(q)) return 'negocio'
  return 'general'
}
