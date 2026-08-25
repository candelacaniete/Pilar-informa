-- =============================================================================
-- Migración 015: stats del bot Pilar para admin
-- =============================================================================

drop function if exists public.pilar_stats_mes(date);

create or replace function public.pilar_stats_mes(p_mes date)
returns table (consultas bigint, usuarios_unicos bigint)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_mes date;
begin
  if not public.es_admin() then
    raise exception 'Solo admins pueden consultar stats de Pilar';
  end if;

  v_mes := date_trunc('month', coalesce(p_mes, current_date))::date;

  return query
  select
    coalesce(sum(u.mensajes), 0)::bigint as consultas,
    count(*)::bigint as usuarios_unicos
  from public.pilar_uso_mensual u
  where u.mes = v_mes;
end;
$$;

revoke all on function public.pilar_stats_mes(date) from public;
grant execute on function public.pilar_stats_mes(date) to authenticated;

comment on function public.pilar_stats_mes(date) is
  'Admin: SUM(mensajes) y COUNT(clientes) de pilar_uso_mensual para un mes calendario.';
