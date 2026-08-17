export function loginErrorMessage(signError) {
  const msg = (signError?.message || '').toLowerCase()

  if (msg.includes('invalid login credentials')) {
    return 'Email o contraseña incorrectos. Si olvidaste la contraseña, usá "Recuperar acceso" abajo.'
  }
  if (msg.includes('email not confirmed')) {
    return 'Tenés que confirmar el email antes de ingresar. Revisá tu bandeja de entrada (y spam).'
  }
  if (msg.includes('too many requests')) {
    return 'Demasiados intentos seguidos. Esperá un minuto y probá de nuevo.'
  }

  return 'No pudimos iniciar sesión. Revisá el email y la contraseña.'
}

export function resetErrorMessage(resetError, redirectTo) {
  const msg = (resetError?.message || '').toLowerCase()
  const code = (resetError?.code || '').toLowerCase()

  if (
    msg.includes('rate limit') ||
    msg.includes('too many requests') ||
    msg.includes('over_email_send_rate_limit') ||
    code.includes('over_email_send_rate_limit')
  ) {
    return 'Enviaste muchos pedidos seguidos. Esperá unos minutos antes de pedir otro enlace.'
  }

  if (
    msg.includes('redirect') ||
    msg.includes('not allowed') ||
    msg.includes('invalid redirect') ||
    code.includes('redirect')
  ) {
    return `Supabase no acepta la URL de retorno. En Authentication → URL Configuration agregá esta Redirect URL: ${redirectTo || 'https://tu-dominio.vercel.app/**'}`
  }

  if (msg.includes('email address invalid') || msg.includes('unable to validate email')) {
    return 'El email no tiene un formato válido. Revisá que esté bien escrito.'
  }

  if (msg.includes('user not found') || msg.includes('no user')) {
    return 'Ese email no está registrado en Supabase Auth. Creá el usuario en Authentication → Users (no alcanza con la tabla admins).'
  }

  if (resetError?.message) {
    return `No pudimos enviar el email: ${resetError.message}`
  }

  return 'No pudimos enviar el email. Revisá que el email esté bien escrito e intentá de nuevo.'
}
