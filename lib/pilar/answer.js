function joinList(items, mapFn) {
  if (!items?.length) return ''
  return items.map(mapFn).join('\n')
}

export function fallbackAnswer(question, context) {
  const intent = context.intent
  const zona = context.zonaDetectada

  if (intent === 'farmacia') {
    const list = context.farmaciasHoy
    if (!list.length) {
      const oficial = context.farmaciasOficialUrl
        ? ` También podés mirar el listado oficial: ${context.farmaciasOficialUrl}`
        : ''
      return zona
        ? `Hoy no tengo una farmacia de turno cargada en ${zona}. Probá preguntar por otra zona o mirá Farmacias de turno en la guía.${oficial}`
        : `Hoy todavía no hay farmacias de turno cargadas.${oficial}`
    }
    const lines = joinList(
      list,
      (f) =>
        `• ${f.nombre} (${f.localidad}) — ${f.horario}${f.direccion ? ` · ${f.direccion}` : ''}${f.telefono ? ` · ${f.telefono}` : ''}`,
    )
    const staleNote = context.farmaciasStale
      ? `\nOjo: la última actualización automática puede estar desactualizada. Confirmá en ${context.farmaciasOficialUrl || 'Colfarma'}.`
      : ''
    const fuente = context.farmaciasFuente ? `\n(${context.farmaciasFuente})` : ''
    return `Farmacias de turno hoy${zona ? ` en ${zona}` : ''}:\n${lines}${staleNote}${fuente}`
  }

  if (intent === 'promo') {
    if (!context.promociones.length) {
      return 'Ahora no hay promociones vigentes cargadas. Cuando se publiquen, te las cuento acá.'
    }
    const lines = joinList(
      context.promociones,
      (p) => `• ${p.titulo}${p.negocio ? ` — ${p.negocio}` : ''}${p.hasta ? ` (hasta ${p.hasta})` : ''}`,
    )
    return `Promos vigentes en Pilar:\n${lines}`
  }

  if (intent === 'evento') {
    if (!context.eventos.length) {
      return 'No hay eventos cargados de acá en adelante. Revisá la agenda más tarde.'
    }
    const lines = joinList(
      context.eventos,
      (e) => `• ${e.titulo} — ${e.fecha}${e.hora ? ` ${e.hora}` : ''} · ${e.ubicacion || e.localidad || ''}`,
    )
    return `Agenda próxima:\n${lines}`
  }

  if (intent === 'noticia') {
    if (!context.noticias.length) return 'Todavía no hay noticias publicadas.'
    const lines = joinList(context.noticias, (n) => `• ${n.titulo}`)
    return `Lo último que publicamos:\n${lines}`
  }

  if (intent === 'gastro' || intent === 'negocio') {
    if (!context.negocios.length) {
      return zona
        ? `No tengo locales cargados en ${zona} para eso. Probá otra zona o la guía completa.`
        : 'No encontré locales para eso en la guía. Probá con otra búsqueda o mirá la guía.'
    }
    const lines = joinList(
      context.negocios,
      (n) =>
        `• ${n.nombre}${n.categoria ? ` (${n.categoria})` : ''} — ${n.localidad || ''}${n.horarios ? ` · ${n.horarios}` : ''}`,
    )
    return `${zona ? `En ${zona} ` : ''}te recomiendo:\n${lines}`
  }

  return `Soy Pilar, la asistente de Pilar Informa. Puedo decirte farmacias de turno, promociones, eventos, restaurantes y locales de la guía. Preguntame, por ejemplo: “farmacia de turno en Zelaya” o “qué eventos hay esta semana”.`
}

export async function answerWithGemini(question, context) {
  const key = (process.env.GEMINI_API_KEY || '').trim()
  if (!key) return null

  const model = (process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite').trim()
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(key)}`

  const system = `Sos Pilar, asistente de Pilar Informa, la guía local de Pilar (Buenos Aires).
Respondé en español rioplatense, breve (máximo 110 palabras), cálida y concreta.
Usá SOLO el JSON de datos. Si no hay información, decí que todavía no está cargada: nunca inventes locales, teléfonos, horarios ni turnos.
Si farmaciasStale es true, avisá brevemente que conviene confirmar en farmaciasOficialUrl.
Si sirve, mencioná la zona (Del Viso, Zelaya, Pilar Centro, etc.).
No hables de temas fuera de Pilar Informa.`

  const body = {
    systemInstruction: { parts: [{ text: system }] },
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `Pregunta: ${question}\n\nDatos:\n${JSON.stringify(context)}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 350,
    },
  }

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const errText = await res.text()
    console.error('Gemini error', res.status, errText)
    return null
  }

  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || ''
  return text.trim() || null
}

export async function buildPilarReply(question, context) {
  try {
    const ai = await answerWithGemini(question, context)
    if (ai) return ai
  } catch (err) {
    console.error('Pilar Gemini falló, uso respuesta local:', err)
  }
  return fallbackAnswer(question, context)
}
