-- =============================================================================
-- Migración 016: scrape Colfarma (extiende farmacias_turno) + directorio
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1) Extender farmacias_turno (sin tabla paralela de turnos)
-- -----------------------------------------------------------------------------
alter table public.farmacias_turno
  add column if not exists turno_desde timestamptz,
  add column if not exists turno_hasta timestamptz,
  add column if not exists maps_url text,
  add column if not exists fuente text not null default 'manual',
  add column if not exists scrape_run_id uuid;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'farmacias_turno_fuente_check'
  ) then
    alter table public.farmacias_turno
      add constraint farmacias_turno_fuente_check
      check (fuente in ('colfarma', 'manual'));
  end if;
end $$;

create index if not exists farmacias_turno_fuente_fecha_idx
  on public.farmacias_turno (fuente, fecha);

-- -----------------------------------------------------------------------------
-- 2) Historial de scrapes (admin + cron)
-- -----------------------------------------------------------------------------
create table if not exists public.farmacias_scrape_runs (
  id uuid primary key default gen_random_uuid(),
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  ok boolean,
  farmacias_count integer not null default 0,
  fechas date[] not null default '{}',
  error_message text,
  html_hash text,
  source_url text not null default 'https://colfarma.info/pilar/farmacias-de-turno/',
  creado_en timestamptz not null default now()
);

create index if not exists farmacias_scrape_runs_started_idx
  on public.farmacias_scrape_runs (started_at desc);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'farmacias_turno_scrape_run_id_fkey'
  ) then
    alter table public.farmacias_turno
      add constraint farmacias_turno_scrape_run_id_fkey
      foreign key (scrape_run_id) references public.farmacias_scrape_runs (id)
      on delete set null;
  end if;
end $$;

alter table public.farmacias_scrape_runs enable row level security;

-- Lectura pública: la UI necesita saber si el scrape está stale (sin exponer writes).
drop policy if exists "farmacias_scrape_runs_public_read" on public.farmacias_scrape_runs;
create policy "farmacias_scrape_runs_public_read"
  on public.farmacias_scrape_runs for select
  to anon, authenticated
  using (true);

-- Escritura solo vía service role (cron). Sin policy de write para authenticated.

-- -----------------------------------------------------------------------------
-- 3) Directorio estático de farmacias del partido
-- -----------------------------------------------------------------------------
create table if not exists public.farmacias (
  id uuid primary key default gen_random_uuid(),
  nombre text not null,
  direccion text,
  localidad text not null,
  telefono text,
  maps_url text,
  fuente text not null default 'colfarma',
  activo boolean not null default true,
  creado_en timestamptz not null default now(),
  actualizado_en timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'farmacias_fuente_check'
  ) then
    alter table public.farmacias
      add constraint farmacias_fuente_check
      check (fuente in ('colfarma', 'manual'));
  end if;
end $$;

create index if not exists farmacias_localidad_idx on public.farmacias (localidad);
create index if not exists farmacias_nombre_idx on public.farmacias (nombre);

drop trigger if exists farmacias_set_actualizado_en on public.farmacias;
create trigger farmacias_set_actualizado_en
before update on public.farmacias
for each row execute function public.set_actualizado_en();

alter table public.farmacias enable row level security;

drop policy if exists "farmacias_public_read" on public.farmacias;
create policy "farmacias_public_read"
  on public.farmacias for select
  to anon, authenticated
  using (activo = true);

drop policy if exists "farmacias_admin_write" on public.farmacias;
create policy "farmacias_admin_write"
  on public.farmacias for all
  to authenticated
  using (public.es_admin())
  with check (public.es_admin());

comment on table public.farmacias is
  'Directorio de farmacias del partido (seed Colfarma). No se scrapea a diario.';
comment on table public.farmacias_scrape_runs is
  'Corridas del scrape diario de farmacias de turno (Colfarma).';
comment on column public.farmacias_turno.fuente is
  'colfarma = scrape automático; manual = carga admin. El scrape no borra filas manual.';

-- -----------------------------------------------------------------------------
-- 4) Seed directorio
-- (~70 locales de colfarma.info/pilar/)
-- -----------------------------------------------------------------------------
insert into public.farmacias (nombre, direccion, localidad, telefono, fuente)
select v.nombre, v.direccion, v.localidad, v.telefono, 'colfarma'
from (
  values
    ('ALTOHEY SCS', 'Las Madreselvas 558', 'Pilar', '0230 4385805'),
    ('ANTIGUA POZUELO', 'Rivadavia 600', 'Pilar', '0230 4428619'),
    ('FARMACIA MARQUEZ 1213', 'Av. Tomas Marquez 1213', 'Pilar', '0230 4426024'),
    ('FARMACIA BARILE', 'Estanislao Lopez 663', 'Pilar', '0230 4430291'),
    ('FARMACIA DOMENECH', 'Hipolito Yrigoyen 679', 'Pilar', null),
    ('FARMACIA DEL NUEVO PASEO', 'La Gaviota 350', 'Pilar', '0230 4374470/72'),
    ('DUARTE', 'DUARTE', 'Pilar', '0230 4428047'),
    ('BARETTA', 'Victor Vergani 835', 'Pilar', '0230 4428630'),
    ('BINETTI', 'Fermin Gamboa', 'Pilar', '0230 4420525'),
    ('TRATADO DEL PILAR', '9 de Julio 213', 'Pilar', '0230 4422666'),
    ('MANZONI', '11 de Septiembre 489', 'Pilar', '0230 4429538'),
    ('MIETTA', '11 de Septiembre 995', 'Pilar', '0230 4427565'),
    ('MUTUAL BOMBEROS', 'Bolivar 307', 'Pilar', '0230 4434939'),
    ('PILARICA', 'Ruta 8 Nro 499 E/ Alte Brown', 'Pilar', '0230 4420606'),
    ('NAVARRO', 'Sarratea 15', 'Pilar', '0230 4424836/889'),
    ('CECILIA SORIA SCS', 'Ruta 8 Nro 1910', 'Pilar', '011 15 7893 7410'),
    ('SBFARMA SCS', 'Av. 12 de Octubre Nro 9986', 'Pilar', '011 7143 8188'),
    ('MEAURIO', 'Hernan Cortiz 605', 'Pilar Sur', '11 5701 8490/ 11 55850 0918'),
    ('NUEVA ASTOLFI', 'Las Piedras 2865', 'Astolfi', '0230 4435453'),
    ('NUEVA RIVADAVIA', 'Rivadavia 522', 'Pilar', '0230 4420990'),
    ('SALCEDO', 'O Higgins 1291', 'Pilar Sur', '0230 4427864'),
    ('SANGUINETTI', 'Av Tomas Marquez 1000', 'Pilar', '0230 4427101'),
    ('FARMACIA ZAVAGLIA - EX SMAL SCS', '12 de Octubre Nro 1453', 'Pilar', '011 15 5897 3694'),
    ('TUCUMAN', 'Tucuman 431', 'Pilar', '0230 4431811'),
    ('ZUGASTI', 'Venancio Castro y Rio II', 'Pilar', '0230 4421002'),
    ('DEL CONCORD', 'Valentin Gomez y Panamericana Km 49,5 (edificio Concord UF 211)', 'La Lonja', '0230 433183'),
    ('PARADIÑEIRO', 'Chubut e/ Panamericana Km 50,5', 'Pilar', '0230 4473005'),
    ('PATRED', 'Av Peron e/Storni', 'Pilar', '114949 1600'),
    ('ZONA VITAL PILAR', 'Las Magnolias 754 (Jumbo)', 'Pilar', '0230 4472770/4472790'),
    ('STRINGA', 'Av 12 de Octubre Km 56', 'Pilar', '0230 4227730'),
    ('ROSSI', 'Rafaela y Uriburu', 'Fátima', '0230 4491436'),
    ('EMTM FARMA SCS', 'Av Mitre 475 Local Nros 1/2', 'Fátima', '0230 4443152'),
    ('MANZANARES', 'Rincon de la Patria y Acasusso', 'Manzanares', '0230 4491999'),
    ('JUKIC 405', 'Tte Antonio Jukic Nro 405', 'Manzanares', null),
    ('MISBACK II', 'Caamaño 1175', 'La Lonja', '0230 4666185'),
    ('LA LONJA', 'Santiago Cayetano Beliera Nro 4366', 'La Lonja', '0230 4470004 &#8211; Cel 11-3764 4927'),
    ('FARMACIA KM 47,5 SCS', 'Colectora este ramal Pilar Km 47,5', 'La Lonja', '0230 4384995'),
    ('ALVAREZ', 'Independencia 902', 'Pte Derqui', '0230 4485611'),
    ('RASPO', 'Av. De Mayo e/San Martin', 'Pte Derqui', '0230 4485598'),
    ('ESTACION PILARA', 'Lavalle 995 Local Nro 9', 'San Francisco', '011 7890 4435'),
    ('CIENTIFICA MONTERREY SCS', 'Corrientes 2094', 'Pte Derqui', '01 15 3123 4873'),
    ('NUEVA DERQUI', 'Medrano 218', 'Pte Derqui', '0230 4484375'),
    ('CONTRERAS', 'Av Peron 2510', 'Pte Derqui', '113173 9039'),
    ('DURET', 'Casella 1743', 'Villa Rosa', '0230 4519632'),
    ('SANTA GUADALUPE', 'Caamaño 1090 Local D', 'Villa Rosa', null),
    ('NUEVA RAP', 'Av Juan D. Peron 1024', 'Villa Rosa', '0230 4494548'),
    ('REYNAGA', 'Alte Brown 2099 e/Bertazzoni', 'Villa Rosa', '011 2143 6829'),
    ('LOPEZ GAGO', 'Hipolito Yrigoyen 1360', 'Villa Rosa', '0230 4495841'),
    ('SCHMIDT', 'Moreno 1240', 'Villa Rosa', '0230 4495121'),
    ('LA 25 2080 SCS', 'Ruta prov 25 Nro 2080', 'Villa Rosa', '011 5119 2820'),
    ('CAAMAÑO FARMA SCS', 'Verazzi 1665.', 'Villa Rosa', '011 5115 3823'),
    ('QUINTA 46', 'Sor Teresa 169', 'Pilar', '011 15 3760 9873'),
    ('SCHUBERT 1950 SCS - FARMAPLUS', 'Schubert 1950', 'Villa Rosa', '011 5505 4536'),
    ('VILLANUEVA', 'C. Zelaya 912', 'Zelaya', '0348 460476'),
    ('PIERESKO', 'R. Diesel 1299 Panamericana KM 44', 'Del Viso', '0230 478200'),
    ('BONEL', 'Av Constitucion 1250', 'Del Viso', '0230 473540'),
    ('ALDASORO', 'Ruta 26 Nro 3412', 'Luis Lagomarsino', '0348 4468223'),
    ('DE LA RUTA', 'Av Constitucion 417', 'Del Viso', '02320 400444'),
    ('OROÑO', 'Berutti 1305', 'Del Viso', '02320 476666'),
    ('ACCESO NORTE', 'Ruta 26 e/Pacheco', 'Del Viso', '02320 402222'),
    ('DIE APOTHEKE', 'Av Colectora 12 de Octubre e/Las Camelias Edificio Cibra', 'Del Viso', '02320 409999'),
    ('GUTKIND', 'Independencia 7032', 'Del Viso', '02320 400400 /470171'),
    ('DEL VISO FARMA SCS', 'Berutti 1174', 'Del Viso', '02320 470281'),
    ('DEL SOL DE DEL VISO SCS', 'Av Madero 973 (Ruta 26)', 'Del Viso', '02320 470444/11 64758060'),
    ('WASSERMANN', 'Directorio 507', 'Tortuguitas', '02320 491321'),
    ('DI NARDO', 'Av Hipolito Yrigoyen e/ Santa Rita', 'Manuel Alberti', '02320 471310/407297'),
    ('RICCI', 'Hipolito Yrigoyen 308', 'Manuel Alberti', '02320 621621'),
    ('MISBACK I', 'Golfers Club de Campo 2972', 'Manuel Alberti', '0348 4689069'),
    ('VILA CENTER III S.C.S', 'Los Crisantemos 392', 'Manuel Alberti', '011 3826 -8099'),
    ('VIEMAG SCS', 'Jockey Club 2454', 'Manuel Alberti', '02320 367070')
) as v(nombre, direccion, localidad, telefono)
where not exists (select 1 from public.farmacias limit 1);
