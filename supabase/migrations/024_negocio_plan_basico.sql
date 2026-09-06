-- =============================================================================
-- Migración 024: reintroducir plan Básico (solo card en listado, sin perfil)
-- El enum se había reducido a destacado/premium en 017.
-- =============================================================================

alter type public.negocio_plan add value if not exists 'basico';

comment on type public.negocio_plan is
  'Plan comercial: basico (listado sin ficha), destacado, premium.';
