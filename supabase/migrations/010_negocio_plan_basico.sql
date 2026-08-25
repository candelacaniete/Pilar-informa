-- =============================================================================
-- Migración 010: plan Básico en negocios
-- =============================================================================

alter type public.negocio_plan add value if not exists 'basico' before 'destacado';

comment on type public.negocio_plan is
  'Plan comercial: basico, destacado, premium. Todos los negocios en la guía pagan.';
