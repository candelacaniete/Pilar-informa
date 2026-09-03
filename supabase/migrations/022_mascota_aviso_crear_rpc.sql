-- =============================================================================
-- Migración 022: crear aviso de mascota vía RPC (evita fallos RLS en insert)
-- =============================================================================
-- El insert directo con anon a veces falla aunque exista la policy 021
-- (GRANTs / WITH CHECK). Mismo patrón que resena_crear.

grant usage on schema public to anon, authenticated;

grant select, insert on table public.mascotas_avisos to anon, authenticated;
grant usage, select on all sequences in schema public to anon, authenticated;

-- Policy de insert más simple (por si alguien inserta directo)
drop policy if exists "mascotas_avisos_public_insert" on public.mascotas_avisos;
create policy "mascotas_avisos_public_insert"
  on public.mascotas_avisos for insert
  to anon, authenticated
  with check (estado = 'pendiente'::public.mascota_aviso_estado);

create or replace function public.mascota_aviso_crear(
  p_slug text,
  p_titulo text,
  p_tipo text,
  p_zona text,
  p_foto_url text,
  p_whatsapp_e164 text,
  p_fecha_hecho date,
  p_resolve_token text
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_titulo text := trim(coalesce(p_titulo, ''));
  v_slug text := trim(coalesce(p_slug, ''));
  v_zona text := trim(coalesce(p_zona, ''));
  v_foto text := trim(coalesce(p_foto_url, ''));
  v_wa text := trim(coalesce(p_whatsapp_e164, ''));
  v_token text := trim(coalesce(p_resolve_token, ''));
  v_tipo public.mascota_aviso_tipo;
  v_id uuid;
begin
  if char_length(v_titulo) < 3 or char_length(v_titulo) > 60 then
    return jsonb_build_object('ok', false, 'mensaje', 'Título inválido.');
  end if;

  if p_tipo not in ('perdido', 'encontrado') then
    return jsonb_build_object('ok', false, 'mensaje', 'Tipo inválido.');
  end if;
  v_tipo := p_tipo::public.mascota_aviso_tipo;

  if char_length(v_zona) < 2 then
    return jsonb_build_object('ok', false, 'mensaje', 'Zona inválida.');
  end if;

  if char_length(v_foto) < 8 then
    return jsonb_build_object('ok', false, 'mensaje', 'Foto obligatoria.');
  end if;

  if v_wa !~ '^549[0-9]{8,12}$' then
    return jsonb_build_object('ok', false, 'mensaje', 'WhatsApp inválido.');
  end if;

  if char_length(v_token) < 16 then
    return jsonb_build_object('ok', false, 'mensaje', 'Token inválido.');
  end if;

  if char_length(v_slug) < 3 then
    return jsonb_build_object('ok', false, 'mensaje', 'Slug inválido.');
  end if;

  insert into public.mascotas_avisos (
    slug, titulo, tipo, zona, foto_url, whatsapp_e164,
    fecha_hecho, estado, resolve_token
  ) values (
    v_slug, v_titulo, v_tipo, v_zona, v_foto, v_wa,
    p_fecha_hecho, 'pendiente', v_token
  )
  returning id into v_id;

  return jsonb_build_object(
    'ok', true,
    'id', v_id,
    'slug', v_slug,
    'mensaje', 'Tu aviso está en revisión'
  );
exception
  when unique_violation then
    return jsonb_build_object('ok', false, 'mensaje', 'Ya existe un aviso similar. Probá de nuevo.');
  when others then
    return jsonb_build_object('ok', false, 'mensaje', 'No pudimos guardar el aviso.');
end;
$$;

revoke all on function public.mascota_aviso_crear(
  text, text, text, text, text, text, date, text
) from public;
grant execute on function public.mascota_aviso_crear(
  text, text, text, text, text, text, date, text
) to anon, authenticated;

comment on function public.mascota_aviso_crear is
  'Crea un aviso de mascota en estado pendiente (security definer; validación en API + función).';
