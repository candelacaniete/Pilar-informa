# Pilar Informa

Prototipo visual de **Pilar Informa** — la plataforma digital local de Pilar, Provincia de Buenos Aires.

> Todo Pilar. En un solo lugar.

Combina medio de información local, guía comercial, directorio de servicios, agenda, promociones y mapa de descubrimiento.

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

## Rutas del prototipo

| Ruta | Pantalla |
|------|----------|
| `/` | Home |
| `/noticias` | Noticias |
| `/guia` | Guía de negocios |
| `/negocio/:slug` | Perfil de negocio |
| `/eventos` | Agenda |
| `/promociones` | Promociones |
| `/mapa` | Mapa mock |

## Datos mock

El contenido vive en archivos locales:

- `src/data/news.js`
- `src/data/businesses.js`
- `src/data/events.js`
- `src/data/categories.js`
- `src/data/promotions.js`

No hay backend, autenticación ni integraciones externas. Es una maqueta navegable para presentar el producto.
