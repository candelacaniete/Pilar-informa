# Pilar Informa

Plataforma digital local de Pilar (Buenos Aires): noticias + guía comercial + agenda + promociones + mapa.

> Todo Pilar. En un solo lugar.

## Stack

- **Next.js 15** (App Router)
- **React 19**
- **Tailwind CSS 4**
- **Supabase** (Auth, Postgres, Storage)
- Deploy pensado para **Vercel**

## Cómo correr en local

```bash
npm install
cp .env.example .env.local
npm run dev
```

Abrí `http://localhost:3000`.

Sin variables de Supabase, la web y el panel `/admin` funcionan en **modo demo** con datos de ejemplo.

## Configurar Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. En el SQL Editor, ejecutá en orden:
   - `supabase/schema.sql`
   - `supabase/seed.sql`
3. En Storage, creá un bucket público llamado `media`.
4. En Authentication, creá un usuario (email/password).
5. Insertá ese usuario como admin:

```sql
insert into public.admins (id, email, nombre)
values ('UUID-DEL-USUARIO', 'admin@pilarinforma.ar', 'Administrador');
```

6. Completá `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## Panel de administración

Ruta: `/admin`

- Login con email/password (Supabase Auth)
- Solo usuarios en la tabla `admins` pueden escribir
- Carga de negocios, noticias, eventos y promociones
- Indicadores de vencimiento de plan (todos los negocios pagan; no hay plan gratis)
- No hay autogestión pública: el contenido lo carga el administrador

## Rutas públicas

| Ruta | Descripción |
|------|-------------|
| `/` | Home |
| `/guia` | Guía de negocios |
| `/categoria/[slug]` | Negocios por categoría |
| `/negocio/[slug]` | Perfil de negocio + JSON-LD |
| `/noticias` · `/noticias/[slug]` | Medio local |
| `/agenda` · `/eventos/[slug]` | Agenda |
| `/promociones` | Promociones |
| `/mapa` | Mapa mock con pines dinámicos |
| `/sitemap.xml` · `/robots.txt` | SEO |

## Vercel

- Framework Preset: **Next.js**
- Build Command: `npm run build`
- Output: automático (Next.js)
- Agregá las mismas env vars del `.env.example`

## Orden de negocios

Los negocios se ordenan por:

1. Plan (Premium antes que Destacado)
2. Campo `prioridad` (número más bajo = más arriba; `0` es el primer lugar)
3. Nombre

En `/admin/negocios` Pablo puede usar **Subir / Bajar**, o editar el número en el formulario del negocio.

Si la base ya existía, ejecutá también `supabase/migrations/001_prioridad.sql`.
