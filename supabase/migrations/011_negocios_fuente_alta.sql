-- =============================================================================
-- Migración 011: fuente_alta en negocios
-- =============================================================================

alter table public.negocios
  add column if not exists fuente_alta text;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'negocios_fuente_alta_check'
  ) then
    alter table public.negocios
      add constraint negocios_fuente_alta_check
      check (
        fuente_alta is null
        or fuente_alta in ('cartera', 'redes', 'organico', 'referido', 'otro')
      );
  end if;
end $$;

comment on column public.negocios.fuente_alta is
  'Origen del alta: cartera | redes | organico | referido | otro. Null = sin registrar (altas previas).';
