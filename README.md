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
   Si el proyecto ya existía: las migraciones en `supabase/migrations/` (001…007).
   **Importante para fotos del admin:** corré `007_storage_media_bucket.sql`
   (crea el bucket público `media` + policies RLS). Sin eso, al subir una imagen
   vas a ver: “No se pudo subir la imagen. Revisá el bucket 'media'.”
3. En Storage debería aparecer el bucket público `media` (lo crea la migración 007;
   también se puede crear a mano en Storage → New bucket → public).
4. En Authentication, creá un usuario (email/password).
5. Insertá ese usuario como admin:

```sql
insert into public.admins (id, email, nombre)
values ('UUID-DEL-USUARIO', 'admin@pilarinforma.ar', 'Administrador');
```

6. Completá `.env.local` (y las mismas variables en Vercel):

```env
NEXT_PUBLIC_SUPABASE_URL=https://TU-PROYECTO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Importante:** `NEXT_PUBLIC_SUPABASE_URL` es el **Project URL** de Supabase → Settings → API.  
No uses la URL de la web (`vercel.app`), ni `/rest/v1`, ni barra final al final.

### URLs de Auth en Supabase (importante para producción)

En Supabase → **Authentication** → **URL Configuration**:

| Campo | Valor en producción |
|-------|---------------------|
| **Site URL** | `https://pilar-informa-eosin.vercel.app` (tu dominio real) |
| **Redirect URLs** | `https://pilar-informa-eosin.vercel.app/**` y `http://localhost:3000/**` |

Si **Site URL** sigue en `http://localhost:3000`, los emails de reset de contraseña te mandan a localhost y fallan.

En la app, usá **Recuperar acceso** en `/admin/recuperar` (no el botón de reset del panel de Supabase) para que el enlace apunte a tu dominio.

En Vercel, `NEXT_PUBLIC_SITE_URL` tiene que ser la misma URL pública (`https://pilar-informa-eosin.vercel.app`). Si falta, la app igual usa el dominio actual en el navegador al pedir recuperación.

**Si falla "No pudimos enviar el email":**

1. El usuario tiene que existir en **Authentication → Users** (la fila en `admins` sola no alcanza).
2. En **Redirect URLs** tiene que estar permitido `https://tu-dominio.vercel.app/**`.
3. Supabase limita cuántos emails envía por hora; esperá unos minutos si probaste muchas veces.

## Panel de administración

Ruta: `/admin`

- Login con email/password (Supabase Auth)
- Solo usuarios en la tabla `admins` pueden escribir
- Carga de negocios, noticias, eventos, promociones y **farmacias de turno**
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
| `/farmacias` | Farmacias de turno |
| `/pilar` | App de la asistente Pilar (PWA) |
| `/mapa` | Mapa mock con pines dinámicos |
| `/sitemap.xml` · `/robots.txt` | SEO |

## Pilar (asistente)

Botón flotante en la web pública. Responde en lenguaje natural **solo con datos de la base** (negocios, promos, eventos, noticias, farmacias de turno). Anónimo, sin historial, **12 consultas por día** por navegador.

Opcional: `GEMINI_API_KEY` en Vercel (Google AI Studio, modelo `gemini-2.0-flash`). Sin la key, Pilar igual responde con las mismas reglas usando los datos cargados.

## PWA (app Pilar)

La PWA **no es la web completa**: al instalarla se abre `/pilar` (pantalla de bienvenida + chat a pantalla completa).

En iPhone: entrar a `/pilar` desde Safari → Compartir → Agregar a pantalla de inicio. En la home de Pilar Informa hay una sección **Instalá a Pilar** con el paso a paso.

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

Si la base ya existía, ejecutá también `supabase/migrations/001_prioridad.sql` y `supabase/migrations/002_farmacias_turno.sql`.

Después del migration 002, ejecutá `supabase/seed_farmacias.sql` para cargar turnos de ejemplo.
