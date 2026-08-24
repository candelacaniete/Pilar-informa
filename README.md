# Guía Pilar

Prototipo visual de **Guía Pilar** — la plataforma digital local de Pilar, Provincia de Buenos Aires.

> Todo Pilar. En un solo lugar.

Combina medio de información local, guía comercial, directorio de servicios, agenda y promociones.

## Stack

- React
- Vite
- Tailwind CSS
- Lucide React
- React Router

## Cómo correr

```bash
npm install
npm run dev
```

Abrí la URL que muestre Vite (por defecto `http://localhost:5173`).

`npm run dev` sirve la SPA. Los rewrites de Open Graph para bots (WhatsApp, Facebook, etc.) viven en `vercel.json` y se prueban con `vercel dev` o un deploy de preview.

Vercel tiene que construir esto como **Vite** (`dist/`), no como Next.js. `vercel.json` fija `framework`, `buildCommand` y `outputDirectory` para no heredar el preset viejo del proyecto.

## Rutas

| Ruta | Pantalla |
|------|----------|
| `/` | Home |
| `/noticias` | Listado de noticias |
| `/noticias/:slug` | Nota |
| `/guia` | Guía de negocios (listado general) |
| `/categoria/:slug` | Categoría (p. ej. veterinarias) |
| `/negocio/:slug` | Perfil de negocio |
| `/eventos` | Agenda |
| `/eventos/:slug` | Evento |
| `/promociones` | Promociones |
| `/preguntas-frecuentes` | FAQ |
| `/mapa` | Mapa mock (fuera de la navegación) |

Home y `/guia` usan el OG genérico de `index.html`. Categorías, fichas, noticias y eventos tienen OG propio vía Edge Function cuando entra un bot social.

## Datos mock

El contenido vive en archivos locales:

- `src/data/news.js`
- `src/data/businesses.js`
- `src/data/events.js`
- `src/data/categories.js`
- `src/data/promotions.js`
- `src/data/faqs.js`

La metadata de share (título, descripción AEO, imagen) se resuelve en `src/seo/lookup.js` para la SPA, la Edge Function y el fallback de slug inexistente.

No hay backend, autenticación ni integraciones externas. Es una maqueta navegable para presentar el producto.

Contacto: `hola@pilarinforma.ar`
