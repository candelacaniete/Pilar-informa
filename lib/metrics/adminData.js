import { createClient } from '@/lib/supabase/server'
import { currentMonthStart } from '@/lib/banners'

export async function getMetricasProyeccion() {
  const supabase = await createClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('metricas_proyeccion')
    .select('id, mes, monto_ars, notas, actualizado_en')
    .order('mes', { ascending: true })
  if (error || !data) return []
  return data
}

export async function getProyeccionMes(mes = currentMonthStart()) {
  const supabase = await createClient()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('metricas_proyeccion')
    .select('id, mes, monto_ars, notas')
    .eq('mes', mes)
    .maybeSingle()
  if (error) return null
  return data
}

export async function getMetricasMetasActivas() {
  const supabase = await createClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('metricas_metas')
    .select('id, periodo, tipo, valor_objetivo, desde, hasta, activo, notas')
    .eq('activo', true)
    .order('desde', { ascending: true })
  if (error || !data) return []
  return data
}

export async function getAllMetricasMetas() {
  const supabase = await createClient()
  if (!supabase) return []
  const { data, error } = await supabase
    .from('metricas_metas')
    .select('id, periodo, tipo, valor_objetivo, desde, hasta, activo, notas')
    .order('desde', { ascending: true })
  if (error || !data) return []
  return data
}
