
# TuristaGeo

Aplicación web georreferenciada para planear visitas a Cancún: mapa con lugares de interés, zonas dibujadas por los usuarios, rutas turísticas y reseñas.

Proyecto final de Aplicación de Sistemas Geo-Referenciados.

## Aplicación publicada

| Servicio | Liga |
|---|---|
| Frontend | https://turistageo.vercel.app |
| API (backend) | https://turistageo-api.onrender.com |
| Repositorio | https://github.com/Jairo0624/TuristaGeo |

**Usuario de prueba:** `demo@turistageo.com`  
**Contraseña:** `demo1234`

> El backend está en un plan gratuito: si estuvo inactivo, la primera petición puede tardar hasta un minuto.

## Qué hace

- Registro e inicio de sesión con contraseñas cifradas (bcrypt) y sesión con JWT.
- Registrar un lugar con un clic en el mapa; editarlo y eliminarlo desde su popup.
- Tabla de lugares que se actualiza sin recargar la página.
- Búsqueda por nombre y filtros por categoría, precio y zona.
- Dibujar zonas con nombre (GeoJSON Polygon) que se guardan y se cargan al abrir la aplicación.
- Rutas turísticas con paradas, categorías y reseñas (CRUD completos).
- Solo el autor de un registro puede editarlo o eliminarlo.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite, react-router |
| Mapa | Leaflet, react-leaflet y Leaflet-Geoman |
| Backend | Node.js + Express 5 |
| Base de datos | MongoDB Atlas + Mongoose |
| Seguridad | bcryptjs, JWT, CORS |
| Despliegue | Vercel, Render y MongoDB Atlas |

## Estructura

```text
backend/src/   config, models, routes, services, middlewares, utils
frontend/src/  pages, components, context, api, utils
docs/          modelos, API y capturas
```

## Ejecutar en local

Requisitos: Node.js 20 o superior y un clúster gratuito de MongoDB Atlas.

```bash
# Backend
cd backend
npm install
cp .env.example .env
# En PowerShell: copy .env.example .env
# Configurar MONGO_URI y JWT_SECRET
npm run seed
npm run dev

# Frontend (otra terminal)
cd frontend
npm install
cp .env.example .env
npm run dev
```

## Variables de entorno

| Variable | Dónde | Para qué |
|---|---|---|
| MONGO_URI | backend | Conexión a MongoDB Atlas |
| JWT_SECRET | backend | Clave para firmar los tokens |
| JWT_EXPIRES_IN | backend | Duración de la sesión |
| CLIENT_URL | backend | Origen del frontend permitido por CORS |
| PORT | backend | Puerto del servidor |
| VITE_API_URL | frontend | URL de la API terminada en /api |

Los valores reales nunca se suben al repositorio: solo existen los archivos `.env.example`.

## Documentación

- [Modelos y relaciones](docs/modelos.md)
- [API: endpoints y códigos HTTP](docs/api.md)
- Capturas de cada requisito: carpeta `docs/capturas/`

## Equipo

| Integrante | Aportación |
|---|---|
| Jairo | Backend, frontend y despliegue |
| Ximena | README, documentación, pruebas de login, registro y CRUD de ubicaciones |
| Grecia | Documentación de modelos, API y pruebas de filtros y zonas |
