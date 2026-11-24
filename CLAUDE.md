# TuristaGeo — contexto del proyecto

Proyecto final de **Sistemas Geo-Referenciados** (Ingeniería en Software, La Salle Bajío). Equipo de 3; por ahora el desarrollo lo lleva una sola persona y las otras dos se irán sumando (commits, README, pruebas, reporte). **Todo el código debe poder explicarse por cualquier integrante**: prefiere soluciones simples y comenta lo no obvio. Está prohibido copiar código de otros equipos o fuentes externas sin entenderlo.

## Qué es
Aplicación web de **turismo en Cancún**: mapa con lugares de interés (puntos), zonas dibujadas (polígonos), rutas turísticas y reseñas. La ubicación es parte central de la solución, no un adorno.

## Estructura
- `backend/` API REST (Node + Express + Mongoose). **Ya funciona** (auth, CRUD, filtros, seed).
- `frontend/` React + Vite + Leaflet (+ Leaflet-Geoman para dibujar zonas). **Primera versión hecha, en revisión.**
- Repositorio único y público con ambas carpetas, README y `.env.example`.

## Requisitos obligatorios de la rúbrica (si falta uno, no se revisa)
- Frontend con plantilla Angular/React/Vue (Vite o CLI). Nada de HTML/JS suelto.
- Mapa con Leaflet o Mapbox.
- Backend con capas: `config`, `models`, `routes`, `services`, `middlewares`, `utils`.
- MongoDB Atlas + Mongoose. Ubicaciones = GeoJSON **Point**, zonas = GeoJSON **Polygon**, siempre `[longitud, latitud]`, índice `2dsphere`.
- Contraseñas con bcrypt; credenciales solo en `.env`; el repo incluye `.env.example` sin datos reales.
- Despliegue público durante todo el periodo de revisión (frontend Vercel/Netlify, backend Render/Railway, base en Atlas).

## Qué debe hacer la app (puntos)
Login 10 · Registro (sin correos duplicados) 10 · 3 CRUD propios con relación `ObjectId`+`populate` 10 · Registrar ubicación con clic en el mapa (nombre, descripción, categoría, coordenadas, popup) 5 · Editar desde el popup 5 · Eliminar desde el popup 5 · Tabla de ubicaciones en tiempo real, sin ID y con la categoría por nombre, que se actualiza sin recargar 10 · Búsqueda y filtros resueltos en el backend (`?search=&category=` + un tercero) reflejados en mapa y tabla 10 · Dibujar zonas con nombre, guardarlas, recargarlas al abrir y eliminarlas 15 · Interfaz con al menos 3 vistas (login/registro, principal con mapa y tabla, otra relacionada), con mensajes de éxito y error 10 · Estructura del backend con `AppError`, 404 y `errorHandler` y códigos 200/201/400/401/404/500 10.

## Entregables (en Teams, por un integrante; falta uno = cero)
1. Liga de la app publicada. 2. Usuario de prueba con datos (`demo@turistageo.com`, cargado con `npm run seed`). 3. Repo público con frontend, backend, README y `.env.example`. 4. Reporte PDF: portada institucional, problemática, desarrollo (estructura del backend, modelos y relaciones), resultados con capturas de cada requisito, conclusión por integrante.

## Backend (ya hecho)
- Modelos: `User`, `Category`, `Location` (Point), `Zone` (Polygon), `Route`, `Review`.
- Relaciones: Location→Category y →User; Route→[Location]; Review→Location y →User.
- Rutas bajo `/api`; todas, salvo `/health` y `/auth/register|login`, exigen `Authorization: Bearer <token>` (JWT):
  `/auth` · `/categories` · `/locations` · `/zones` (+ `/zones/:id/locations`) · `/routes` · `/reviews`.
- Filtros: `GET /api/locations?search=&category=<id>&precio=&zona=<id>` (la zona usa `$geoWithin`).
- Al crear/editar una ubicación se envían `lat` y `lng` (como los da Leaflet); el backend guarda el GeoJSON en `[lng, lat]`.
- Las zonas se envían como GeoJSON `Polygon` (`area: { type, coordinates }`).
- Respuestas: `{ ok, data }` o `{ ok:false, message }`. Errores con `AppError` + `errorHandler`.
- `npm run dev` (nodemon), `npm run seed` (datos de Cancún, idempotente), `requests.http` para probar con REST Client.
- Variables en `backend/.env` (ver `.env.example`): `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `CLIENT_URL`, `PORT`.
- La base de datos se llama `turistageo` dentro del Cluster0 de Atlas, que **también contiene `incidentes-georef` de otro proyecto: no tocarla**.

## Frontend (primera versión)
- `src/api/client.js` único cliente HTTP (token, `VITE_API_URL`, 401 → cierra sesión); `src/api/index.js` un objeto por recurso.
- `src/utils/geo.js` es el ÚNICO lugar donde se convierte `[lat, lng]` ↔ `[lng, lat]`.
- `context/AuthContext` (sesión) y `context/ToastContext` (mensajes de éxito/error).
- Vistas: `AuthPage` (login/registro) · `MainPage` (filtros + `MapView` + `LocationsTable`, comparten el arreglo `locations`) · `RoutesPage` (CRUD de rutas con polilínea) · `CategoriesPage` (CRUD de categorías) · `ReviewsPage` (CRUD de reseñas, filtro por lugar con `?ubicacion=`) · `NotFoundPage`.
- Los 3 CRUD propios de la rúbrica son rutas, categorías y reseñas (los tres con interfaz completa).
- Los lugares se editan **dentro del popup del mapa** (el popup se vuelve formulario); la tabla también tiene su botón Editar (abre un modal).
- La tabla de lugares muestra todo salvo el ID: nombre, categoría (por nombre), precio, descripción, latitud, longitud, registrado por y fecha.
- Modales con `<dialog>` nativo (`components/Modal.jsx`); confirmación de borrado con `ConfirmDialog`.
- Zonas: `ZoneDrawControl` (Geoman) → se pide el nombre → `POST /zones`; se eliminan desde su popup.

## Convenciones
- Español en textos de UI, mensajes y comentarios; código y nombres técnicos en la convención ya usada.
- Coordenadas: **GeoJSON es `[lng, lat]`; Leaflet usa `[lat, lng]`**. Convertir siempre en un solo lugar.
- Rutas solo reciben la petición y llaman al servicio; la lógica va en `services/`.
- Nunca subir `.env`, contraseñas ni cadenas de conexión. No cambiar la rúbrica ni quitar requisitos.
- Cambios pequeños y commits claros (todos los integrantes deben aparecer en el historial).

## Datos de ejemplo
Los lugares/zonas del seed están en `backend/src/data/cancunData.js`. Las coordenadas de los lugares se contrastaron con fuentes públicas; los polígonos de zonas son aproximados.

## Estado actual
Backend probado contra Atlas. Frontend con las 5 vistas internas (mapa, rutas, categorías, reseñas) y edición en popup; los cambios de categorías, reseñas, columnas de coordenadas y popup se revisaron solo por sintaxis/imports: **falta probarlos en el navegador y correr `npm run build` y `npm run lint`**. Falta: desplegar (y poner la URL del frontend en `CLIENT_URL`), README final con liga y capturas, reporte PDF.
