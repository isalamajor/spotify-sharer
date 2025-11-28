export function pathToFileURL(p) {
  // Normaliza separadores Windows -> POSIX
  const normalized = p.replace(/\\/g, '/')
  // Asegura que empiece con slash para formar file:///
  const prefix = normalized.startsWith('/') ? '' : '/'
  return new URL('file://' + prefix + normalized)
}