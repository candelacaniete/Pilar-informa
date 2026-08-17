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

export function resetErrorMessage(resetError) {
  const msg = (resetError?.message || '').toLowerCase()

  if (msg.includes('rate limit') || msg.includes('too many requests')) {
    return 'Enviaste muchos pedidos seguidos. Esperá unos minutos antes de pedir otro enlace.'
  }

  return 'No pudimos enviar el email. Revisá que el email esté bien escrito e intentá de nuevo.'
}
