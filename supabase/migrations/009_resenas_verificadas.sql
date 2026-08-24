-- =============================================================================
-- Migración 009: reseñas verificadas por código del negocio
-- =============================================================================

alter table public.negocios
  add column if not exists codigo_resena text;

create unique index if not exists negocios_codigo_resena_idx
  on public.negocios (upper(codigo_resena))
  where codigo_resena is not null;

comment on column public.negocios.codigo_resena is
  'Código alfanumérico de 6 caracteres que el negocio comparte con clientes para dejar reseñas.';

create or replace function public.generate_codigo_resena()
returns text
language plpgsql
as $$
declare
  chars constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result text := '';
  i integer;
begin
  for i in 1..6 loop
    result := result || substr(chars, 1 + floor(random() * length(chars))::integer, 1);
  end loop;
  return result;
end;
$$;

create or replace function public.negocios_assign_codigo_resena()
returns trigger
language plpgsql
as $$
declare
  candidate text;
begin
  if new.codigo_resena is null or length(trim(new.codigo_resena)) = 0 then
    loop
      candidate := public.generate_codigo_resena();
      exit when not exists (
        select 1 from public.negocios n
        where upper(n.codigo_resena) = upper(candidate)
      );
    end loop;
    new.codigo_resena := candidate;
  else
    new.codigo_resena := upper(trim(new.codigo_resena));
  end if;
  return new;
end;
$$;

drop trigger if exists negocios_assign_codigo_resena on public.negocios;
create trigger negocios_assign_codigo_resena
before insert on public.negocios
for each row execute function public.negocios_assign_codigo_resena();

do $$
declare
  r record;
  candidate text;
begin
  for r in select id from public.negocios where codigo_resena is null loop
    loop
      candidate := public.generate_codigo_resena();
      exit when not exists (
        select 1 from public.negocios n
        where upper(n.codigo_resena) = upper(candidate)
      );
    end loop;
    update public.negocios set codigo_resena = candidate where id = r.id;
  end loop;
end;
$$;

alter table public.negocios
  alter column codigo_resena set not null;

do $$ begin
  create type public.resena_estado as enum ('publicada', 'oculta');
exception
  when duplicate_object then null;
end $$;

create table if not exists public.resenas (
  id uuid primary key default gen_random_uuid(),
  negocio_id uuid not null references public.negocios (id) on delete cascade,
  calificacion integer not null check (calificacion between 1 and 5),
  texto text,
  estado public.resena_estado not null default 'publicada',
  ip_hash text,
  creado_en timestamptz not null default now()
);

create index if not exists resenas_negocio_idx on public.resenas (negocio_id, creado_en desc);
create index if not exists resenas_ip_negocio_dia_idx on public.resenas (negocio_id, ip_hash, creado_en);

create or replace function public.sync_negocio_rating_from_resenas(p_negocio_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  total integer;
  promedio numeric;
begin
  select count(*), coalesce(round(avg(calificacion)::numeric, 1), 0)
  into total, promedio
  from public.resenas
  where negocio_id = p_negocio_id and estado = 'publicada';

  update public.negocios
  set cantidad_opiniones = total,
      rating = promedio,
      actualizado_en = now()
  where id = p_negocio_id;
end;
$$;

create or replace function public.resenas_after_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.sync_negocio_rating_from_resenas(old.negocio_id);
    return old;
  end if;
  perform public.sync_negocio_rating_from_resenas(new.negocio_id);
  return new;
end;
$$;

drop trigger if exists resenas_sync_rating on public.resenas;
create trigger resenas_sync_rating
after insert or update of calificacion, estado or delete on public.resenas
for each row execute function public.resenas_after_change();

create or replace function public.resena_crear(
  p_negocio_slug text,
  p_codigo text,
  p_calificacion integer,
  p_texto text default null,
  p_ip_hash text default null
)
returns table (ok boolean, mensaje text, resena_id uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_negocio public.negocios%rowtype;
  v_codigo text;
  v_texto text;
  v_hoy date;
  v_count integer;
  v_id uuid;
begin
  v_codigo := upper(trim(coalesce(p_codigo, '')));
  v_texto := nullif(trim(coalesce(p_texto, '')), '');

  if length(v_codigo) < 4 then
    return query select false, 'Ingresá el código que te dio el negocio.'::text, null::uuid;
    return;
  end if;

  if p_calificacion is null or p_calificacion < 1 or p_calificacion > 5 then
    return query select false, 'Elegí una calificación de 1 a 5 estrellas.'::text, null::uuid;
    return;
  end if;

  if v_texto is not null and length(v_texto) > 500 then
    return query select false, 'La reseña es muy larga (máximo 500 caracteres).'::text, null::uuid;
    return;
  end if;

  select * into v_negocio
  from public.negocios n
  where n.slug = p_negocio_slug and n.estado = 'activo'
  limit 1;

  if v_negocio.id is null then
    return query select false, 'No encontramos ese negocio.'::text, null::uuid;
    return;
  end if;

  if upper(v_negocio.codigo_resena) <> v_codigo then
    return query select false, 'El código no coincide con este negocio. Pedilo en el local o por WhatsApp.'::text, null::uuid;
    return;
  end if;

  v_hoy := (now() at time zone 'America/Argentina/Buenos_Aires')::date;

  if p_ip_hash is not null and length(trim(p_ip_hash)) > 0 then
    select count(*) into v_count
    from public.resenas r
    where r.negocio_id = v_negocio.id
      and r.ip_hash = p_ip_hash
      and (r.creado_en at time zone 'America/Argentina/Buenos_Aires')::date = v_hoy;

    if v_count >= 3 then
      return query select false, 'Llegaste al límite de reseñas por hoy para este negocio. Probá mañana.'::text, null::uuid;
      return;
    end if;
  end if;

  insert into public.resenas (negocio_id, calificacion, texto, estado, ip_hash)
  values (v_negocio.id, p_calificacion, v_texto, 'publicada', nullif(trim(p_ip_hash), ''))
  returning id into v_id;

  return query select true, '¡Gracias! Tu reseña ya está publicada.'::text, v_id;
end;
$$;

revoke all on function public.resena_crear(text, text, integer, text, text) from public;
grant execute on function public.resena_crear(text, text, integer, text, text) to anon, authenticated;

alter table public.resenas enable row level security;

drop policy if exists "resenas_public_read" on public.resenas;
create policy "resenas_public_read"
  on public.resenas for select
  to anon, authenticated
  using (
    estado = 'publicada'
    and exists (
      select 1 from public.negocios n
      where n.id = negocio_id and n.estado = 'activo'
    )
  );

drop policy if exists "resenas_admin_all" on public.resenas;
create policy "resenas_admin_all"
  on public.resenas for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());
