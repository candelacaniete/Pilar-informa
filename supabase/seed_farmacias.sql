-- Turnos de ejemplo (correr DESPUÉS de 002_farmacias_turno.sql)
insert into public.farmacias_turno (nombre, direccion, localidad, telefono, whatsapp, fecha, horario, notas) values
  ('Farmacia Santa Rita', 'Av. Víctor Vergani 850, Pilar Centro', 'Pilar Centro', '+54 230 444-1101', '+54 9 230 444-1101', current_date, '24 horas', 'Guardia completa. Entrega de recetas hasta las 22 hs.'),
  ('Farmacia Del Viso', 'Ruta 8 Km 53.2, Del Viso', 'Del Viso', '+54 230 444-2202', '+54 9 230 444-2202', current_date, '8:00 a 22:00', 'Atención con receta digital.'),
  ('Farmacia Zelaya', 'Calle Principal 120, Zelaya', 'Zelaya', '+54 230 444-3303', '+54 9 230 444-3303', current_date, '8:00 a 21:00', 'Cerca de la estación.'),
  ('Farmacia Derqui Central', 'Av. Hipólito Yrigoyen 450, Derqui', 'Derqui', '+54 230 444-4404', null, current_date + 1, '8:00 a 22:00', 'Turno de mañana y tarde.'),
  ('Farmacia Manzanares', 'Camino Real 980, Manzanares', 'Manzanares', '+54 230 444-5505', '+54 9 230 444-5505', current_date + 1, '9:00 a 21:00', null),
  ('Farmacia La Lonja', 'Av. Caamaño 2100, La Lonja', 'La Lonja', '+54 230 444-6606', null, current_date + 2, '8:30 a 20:30', null),
  ('Farmacia Villa Rosa', 'Ruta 25 y Calle 12, Villa Rosa', 'Villa Rosa', '+54 230 444-7707', '+54 9 230 444-7707', current_date + 3, '8:00 a 22:00', 'Feriados: consultar WhatsApp.'),
  ('Farmacia Fátima', 'Av. Champagnat 340, Fátima', 'Fátima', '+54 230 444-8808', null, current_date + 4, '9:00 a 21:00', null),
  ('Farmacia Santa Rita', 'Av. Víctor Vergani 850, Pilar Centro', 'Pilar Centro', '+54 230 444-1101', '+54 9 230 444-1101', current_date + 5, '24 horas', 'Fin de semana: guardia 24 hs.'),
  ('Farmacia Del Viso', 'Ruta 8 Km 53.2, Del Viso', 'Del Viso', '+54 230 444-2202', '+54 9 230 444-2202', current_date + 6, '8:00 a 22:00', null);
