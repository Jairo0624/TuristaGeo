// Un objeto por recurso del backend. Cada función regresa directamente los datos útiles.
import { api } from './client';

export const authApi = {
  login: (email, password) => api('/auth/login', { method: 'POST', body: { email, password } }),
  register: (nombre, email, password) => api('/auth/register', { method: 'POST', body: { nombre, email, password } }),
  me: () => api('/auth/me').then((r) => r.user),
};

export const categoriesApi = {
  list: () => api('/categories').then((r) => r.data),
};

export const locationsApi = {
  // filtros: { search, category, precio, zona } → se resuelven en el backend
  list: (filtros) => api('/locations', { params: filtros }).then((r) => r.data),
  create: (datos) => api('/locations', { method: 'POST', body: datos }).then((r) => r.data),
  update: (id, datos) => api(`/locations/${id}`, { method: 'PUT', body: datos }).then((r) => r.data),
  remove: (id) => api(`/locations/${id}`, { method: 'DELETE' }),
};

export const zonesApi = {
  list: () => api('/zones').then((r) => r.data),
  create: (nombre, area) => api('/zones', { method: 'POST', body: { nombre, area } }).then((r) => r.data),
  remove: (id) => api(`/zones/${id}`, { method: 'DELETE' }),
};

export const routesApi = {
  list: () => api('/routes').then((r) => r.data),
  create: (datos) => api('/routes', { method: 'POST', body: datos }).then((r) => r.data),
  update: (id, datos) => api(`/routes/${id}`, { method: 'PUT', body: datos }).then((r) => r.data),
  remove: (id) => api(`/routes/${id}`, { method: 'DELETE' }),
};
