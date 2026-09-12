# Prospección B2B (piloto Guía Pilar)

Kit **aparte de la plataforma**: no hay UI ni panel admin. Sale a buscar negocios, arma leads scorable y deja archivos **descargables** (CSV/JSON) para cold outreach.

Pensado para escalar a más clientes: cada ICP vive en `clients/<id>.json`.

## Qué obtiene (y qué no)

| Campo | Fuente típica | Notas |
|-------|---------------|--------|
| Nombre del negocio, dirección, rubro, rating | Google **Places API (New)** | Oficial; no scrapea HTML de Maps |
| Teléfono del **negocio** | Places | Celular vs fijo (heurística AR) |
| Website, Maps URL | Places | |
| Email / Instagram | Best-effort desde el website | Si hay sitio público |
| Nombre del **dueño** | Heurística en web (`dueño`, `fundador`…) | Hay que **verificar**; muchas veces vacío |
| Celular **personal** del dueño | Casi nunca público | Columna lista para completar a mano / otra fuente legítima |

**Importante:** Google Maps no publica “dueño + celular personal”. El piloto automatiza el máximo posible; el celular del dueño es trabajo de enriquecimiento humano o herramientas B2B con consentimiento/licencia.

## Setup

1. Google Cloud → habilitar **Places API (New)** → crear API key.
2. En tu entorno (no commitear):

```bash
export GOOGLE_PLACES_API_KEY='…'
# opcional, solo con --llm
export GEMINI_API_KEY='…'
```

También podés agregarla a `.env.local` (ya ignorado por git) y cargarla antes de correr.

## Uso

Desde la raíz del repo:

```bash
# Simulación sin API (fixtures) — genera exports de ejemplo
npm run prospect:dry

# Piloto real Pilar (pocas queries primero)
GOOGLE_PLACES_API_KEY=… node tools/b2b-prospecting/src/cli.js --client guia-pilar --max-queries 3

# Corrida más completa + detalles Places + enrich web
GOOGLE_PLACES_API_KEY=… node tools/b2b-prospecting/src/cli.js --client guia-pilar --details

# Mensajes WhatsApp reescritos con Gemini
GOOGLE_PLACES_API_KEY=… GEMINI_API_KEY=… node tools/b2b-prospecting/src/cli.js --client guia-pilar --max-queries 2 --llm
```

## Salida (descarga)

En `tools/b2b-prospecting/exports/` (gitignored):

- `<client>_<timestamp>.json` — payload completo + meta
- `<client>_<timestamp>.csv` — todos los leads
- `<client>_<timestamp>_hot.csv` — solo `hot` + `warm` (para llamar primero)

Columnas útiles para contactar: `businessPhoneE164`, `businessWhatsappLink`, `msgWhatsapp`, `msgEmailSubject`, `msgEmailBody`, `score`, `ownerName`, `ownerPhone`.

## Escalabilidad a otros clientes

1. Copiá `clients/guia-pilar.json` → `clients/<otro>.json`
2. Cambiá `geo`, `queries`, `scoring`, `offer`, `message`
3. Corré `--client <otro>`

## Tests

```bash
npm run test:prospect
```

## Cumplimiento

- Usá Places API (ToS de Google), no scrapers de Maps.
- Cold outreach: respetá opt-out, horarios y normas locales (spam / datos personales).
- No inventes dueños ni celulares: si el campo está vacío, está vacío.
