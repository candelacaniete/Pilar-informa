-- =============================================================================
-- Migración 007: bucket Storage "media" + policies RLS
-- =============================================================================
-- Causa del error en admin: "No se pudo subir la imagen. Revisá el bucket 'media'."
-- El proyecto no tenía ningún bucket; ImageUpload siempre usa storage.from('media').
--
-- Ejecutar en Supabase → SQL Editor (rol postgres del proyecto).

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media',
  'media',
  true,
  5242880,
  array['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Lectura pública (URLs getPublicUrl del admin y del sitio)
drop policy if exists "media_public_read" on storage.objects;
create policy "media_public_read"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'media');

-- Escritura solo admins autenticados (mismo criterio que el resto del panel)
drop policy if exists "media_admin_insert" on storage.objects;
create policy "media_admin_insert"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'media' and public.es_admin());

drop policy if exists "media_admin_update" on storage.objects;
create policy "media_admin_update"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'media' and public.es_admin())
  with check (bucket_id = 'media' and public.es_admin());

drop policy if exists "media_admin_delete" on storage.objects;
create policy "media_admin_delete"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'media' and public.es_admin());

-- Compat: limpia policy "all" vieja si alguien la había descomentado a mano
drop policy if exists "media_admin_write" on storage.objects;
