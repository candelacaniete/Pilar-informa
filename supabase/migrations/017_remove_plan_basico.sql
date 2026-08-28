-- =============================================================================
-- Migración 017: quitar plan Básico del enum (pricing 2026: solo Destacado/Premium)
-- Requiere 0 filas con plan = 'basico' (verificado en producción ago 2026).
-- =============================================================================

alter type public.negocio_plan rename to negocio_plan_old;

create type public.negocio_plan as enum ('destacado', 'premium');

alter table public.negocios
  alter column plan drop default,
  alter column plan type public.negocio_plan using plan::text::public.negocio_plan,
  alter column plan set default 'destacado'::public.negocio_plan;

drop type public.negocio_plan_old;

comment on type public.negocio_plan is
  'Plan comercial: destacado, premium. Todos los negocios en la guía pagan.';
