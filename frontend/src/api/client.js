// Cliente HTTP único de la app: agrega el token, arma la URL y convierte
// las respuestas del backend ({ ok, data } o { ok: false, message }) en datos o errores.

// Se quitan las barras finales para que "…/api/" y "…/api" funcionen igual (evita /api//auth/login)
const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:4000/api').replace(/\/+$/, '');
const TOKEN_KEY = 'turistageo_token';

// localStorage puede fallar (modo privado, bloqueado), por eso va en try/catch
export const tokenStore = {
  get() {
    try { return localStorage.getItem(TOKEN_KEY); } catch { return null; }
  },
  set(token) {
    try { localStorage.setItem(TOKEN_KEY, token); } catch { /* sin almacenamiento */ }
  },
  clear() {
    try { localStorage.removeItem(TOKEN_KEY); } catch { /* sin almacenamiento */ }
  },
};

// AuthContext registra aquí qué hacer cuando el backend responde 401 (sesión vencida)
let onUnauthorized = () => {};
export function setOnUnauthorized(fn) {
  onUnauthorized = fn;
}

/**
 * Llama a la API.
 * @param {string} path   ruta bajo /api, p. ej. '/locations'
 * @param {object} opts   { method, body, params } — params se convierte en ?clave=valor (omite vacíos)
 * @returns el JSON completo del backend (con ok, data, etc.)
 */
export async function api(path, { method = 'GET', body, params } = {}) {
  const url = new URL(API_URL + path);
  Object.entries(params || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });

  const token = tokenStore.get();
  const headers = {};
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(url, { method, headers, body: body !== undefined ? JSON.stringify(body) : undefined });
  } catch {
    throw new Error('No se pudo conectar con el servidor. Revisa que el backend esté encendido.');
  }

  let json = {};
  try { json = await res.json(); } catch { /* respuesta sin JSON */ }

  if (!res.ok || json.ok === false) {
    // Si había token y el backend lo rechaza, la sesión ya no sirve
    if (res.status === 401 && token) onUnauthorized();
    throw new Error(json.message || `Error ${res.status}`);
  }
  return json;
}
