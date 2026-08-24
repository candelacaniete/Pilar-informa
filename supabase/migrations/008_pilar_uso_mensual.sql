-- =============================================================================
-- Migración 008: cuota mensual del bot Pilar (35 msgs / cliente / mes)
-- =============================================================================

create table if not exists public.pilar_uso_mensual (
  cliente_id text not null,
  mes date not null,
  mensajes integer not null default 0 check (mensajes >= 0),
  actualizado_en timestamptz not null default now(),
  primary key (cliente_id, mes)
);

comment on table public.pilar_uso_mensual is
  'Contador de mensajes del asistente Pilar por cliente (cookie pilar_uid) y mes calendario AR.';

create index if not exists pilar_uso_mensual_mes_idx
  on public.pilar_uso_mensual (mes);

alter table public.pilar_uso_mensual enable row level security;

-- RPC SECURITY DEFINER: el cliente anon no toca la tabla directo.
-- p_piso alinea el contador si la cookie de respaldo quedó por delante (fail-open).

drop function if exists public.pilar_check_and_increment(text, date, integer);
drop function if exists public.pilar_check_and_increment(text, date, integer, integer);

create or replace function public.pilar_check_and_increment(
  p_cliente_id text,
  p_mes date,
  p_limite integer default 35,
  p_piso integer default 0
)
returns table (allowed boolean, mensajes integer, limite integer)
language plpgsql
security definer
set search_path = public
as $$
declare
  current_count integer;
  floor_count integer;
begin
  if p_cliente_id is null or length(trim(p_cliente_id)) < 8 then
    return query select false, 0, p_limite;
    return;
  end if;

  floor_count := greatest(0, coalesce(p_piso, 0));

  insert into public.pilar_uso_mensual (cliente_id, mes, mensajes)
  values (p_cliente_id, p_mes, floor_count)
  on conflict (cliente_id, mes) do nothing;

  select u.mensajes into current_count
  from public.pilar_uso_mensual u
  where u.cliente_id = p_cliente_id and u.mes = p_mes
  for update;

  if current_count < floor_count then
    update public.pilar_uso_mensual
    set mensajes = floor_count,
        actualizado_en = now()
    where cliente_id = p_cliente_id and mes = p_mes;
    current_count := floor_count;
  end if;

  if current_count >= p_limite then
    return query select false, current_count, p_limite;
    return;
  end if;

  update public.pilar_uso_mensual
  set mensajes = mensajes + 1,
      actualizado_en = now()
  where cliente_id = p_cliente_id and mes = p_mes
  returning mensajes into current_count;

  return query select true, current_count, p_limite;
end;
$$;

revoke all on function public.pilar_check_and_increment(text, date, integer, integer) from public;
grant execute on function public.pilar_check_and_increment(text, date, integer, integer) to anon, authenticated;

drop function if exists public.pilar_get_uso(text, date);

create or replace function public.pilar_get_uso(
  p_cliente_id text,
  p_mes date
)
returns integer
language plpgsql
security definer
set search_path = public
as $$
begin
  return coalesce(
    (select u.mensajes from public.pilar_uso_mensual u
     where u.cliente_id = p_cliente_id and u.mes = p_mes),
    0
  );
end;
$$;

revoke all on function public.pilar_get_uso(text, date) from public;
grant execute on function public.pilar_get_uso(text, date) to anon, authenticated;

-- RLS on + sin policies = nadie (anon/authenticated) lee/escribe directo; solo SECURITY DEFINER.
drop policy if exists "pilar_uso_no_direct" on public.pilar_uso_mensual;
