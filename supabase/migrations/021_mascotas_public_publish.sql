-- =============================================================================
-- Migración 021: publicación pública de mascotas sin service role
-- =============================================================================
-- Permite que /api/mascotas funcione con NEXT_PUBLIC_SUPABASE_ANON_KEY:
--   - insert de avisos en estado pendiente
--   - upload al folder media/mascotas/
--   - lectura/resolución por resolve_token vía RPC (security definer)
--   - insert de page_views para analytics

-- 1) Insert público solo como pendiente (validación fuerte en API)
drop policy if exists "mascotas_avisos_public_insert" on public.mascotas_avisos;
create policy "mascotas_avisos_public_insert"
  on public.mascotas_avisos for insert
  to anon, authenticated
  with check (
    estado = 'pendiente'
    and aprobado_en is null
    and expira_en is null
    and rechazo_motivo is null
    and char_length(trim(titulo)) between 3 and 60
    and foto_url is not null
    and char_length(trim(foto_url)) > 8
    and whatsapp_e164 ~ '^549[0-9]{8,12}$'
    and resolve_token is not null
    and char_length(resolve_token) >= 16
  );

-- 2) Storage: anon puede subir solo a media/mascotas/*
drop policy if exists "media_mascotas_public_insert" on storage.objects;
create policy "media_mascotas_public_insert"
  on storage.objects for insert
  to anon, authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = 'mascotas'
  );

-- 3) RPC: leer aviso por token de gestión (sin exponer pendientes en SELECT general)
create or replace function public.mascota_aviso_por_token(p_token text)
returns table (
  id uuid,
  slug text,
  titulo text,
  tipo public.mascota_aviso_tipo,
  zona text,
  foto_url text,
  whatsapp_e164 text,
  fecha_hecho date,
  estado public.mascota_aviso_estado,
  rechazo_motivo text,
  aprobado_en timestamptz,
  expira_en timestamptz,
  creado_en timestamptz,
  actualizado_en timestamptz,
  resolve_token text
)
language sql
security definer
set search_path = public
as $$
  select
    a.id, a.slug, a.titulo, a.tipo, a.zona, a.foto_url, a.whatsapp_e164,
    a.fecha_hecho, a.estado, a.rechazo_motivo, a.aprobado_en, a.expira_en,
    a.creado_en, a.actualizado_en, a.resolve_token
  from public.mascotas_avisos a
  where a.resolve_token = nullif(trim(p_token), '')
  limit 1;
$$;

revoke all on function public.mascota_aviso_por_token(text) from public;
grant execute on function public.mascota_aviso_por_token(text) to anon, authenticated;

-- 4) RPC: marcar resuelto con el token
create or replace function public.mascota_aviso_resolver(p_token text)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  row public.mascotas_avisos;
begin
  if p_token is null or char_length(trim(p_token)) < 16 then
    return jsonb_build_object('ok', false, 'mensaje', 'Link inválido.');
  end if;

  select * into row
  from public.mascotas_avisos
  where resolve_token = trim(p_token)
  limit 1;

  if not found then
    return jsonb_build_object('ok', false, 'mensaje', 'No encontramos ese aviso.');
  end if;

  if row.estado = 'resuelto' then
    return jsonb_build_object('ok', true, 'mensaje', 'Este aviso ya estaba marcado como resuelto.');
  end if;

  if row.estado in ('rechazado', 'inactivo') then
    return jsonb_build_object('ok', false, 'mensaje', 'Este aviso ya no está activo.');
  end if;

  update public.mascotas_avisos
  set estado = 'resuelto'
  where id = row.id;

  return jsonb_build_object(
    'ok', true,
    'mensaje', '¡Listo! Marcamos el aviso como resuelto y ya no se muestra en el listado.'
  );
end;
$$;

revoke all on function public.mascota_aviso_resolver(text) from public;
grant execute on function public.mascota_aviso_resolver(text) to anon, authenticated;

-- 5) Analytics: insert público de vistas (solo columnas esperadas)
drop policy if exists "page_views_public_insert" on public.page_views;
create policy "page_views_public_insert"
  on public.page_views for insert
  to anon, authenticated
  with check (
    entity_type in ('negocio', 'mascota')
    and entity_id is not null
    and referrer_source in ('instagram', 'whatsapp', 'google', 'directo', 'otro')
  );

comment on function public.mascota_aviso_por_token is
  'Lee un aviso de mascota por resolve_token (link de gestión del publicador).';
comment on function public.mascota_aviso_resolver is
  'Marca un aviso como resuelto usando el resolve_token del publicador.';
