# Modelos de MongoDB y relaciones

La base de datos se llama `turistageo` (MongoDB Atlas). Los esquemas están en `backend/src/models/` y se definen con Mongoose. Todos los modelos tienen `timestamps`, así que también guardan `createdAt` y `updatedAt` automáticamente.

Las coordenadas siempre se guardan en formato GeoJSON, en el orden **[longitud, latitud]**. Leaflet usa el orden contrario ([latitud, longitud]); la conversión se hace en un solo lugar: `backend/src/utils/geo.js` y `frontend/src/utils/geo.js`.

## Tecnologías

| Capa | Tecnología | Para qué se usa |
|---|---|---|
| Frontend | React 19 y Vite 8 | Interfaz de usuario creada con Vite; vistas y componentes |
| Mapa | Leaflet 1.9, react-leaflet 5 y Leaflet-Geoman | Mapa, marcadores, popups y dibujo de zonas |
| Backend | Node.js y Express 5 | API REST organizada en capas |
| Base de datos | MongoDB Atlas y Mongoose | Persistencia, GeoJSON e índices 2dsphere |
| Seguridad | bcryptjs, JSON Web Token y CORS | Contraseñas cifradas, sesión y orígenes permitidos |
| Despliegue | Vercel, Render y Atlas | Frontend, backend y base de datos en internet |

## Estructura del backend

```
backend/
├─ src/
│  ├─ config/db.js        conexión a MongoDB Atlas
│  ├─ models/             User, Category, Location, Zone, Route, Review
│  ├─ routes/             auth, categories, locations, zones, routes, reviews
│  ├─ services/           lógica y operaciones con MongoDB (uno por entidad)
│  ├─ middlewares/        auth, validate, notFound, errorHandler
│  ├─ utils/              AppError, catchAsync, geo, ownership
│  ├─ data/ y seed.js     datos de ejemplo de Cancún y usuario de prueba
│  ├─ app.js              CORS, JSON, rutas, 404 y manejo de errores
│  └─ server.js           conecta la base de datos y levanta el servidor
├─ .env.example
└─ package.json
```

| Capa | Responsabilidad |
|---|---|
| routes | Solo reciben la petición y llaman al servicio; responden con el código HTTP correcto |
| services | Toda la lógica y las operaciones con MongoDB; un servicio por entidad |
| models | Esquemas de Mongoose: campos, validaciones, relaciones e índices |
| middlewares | Autenticación (protect), validación de datos, ruta no encontrada (404) y errorHandler |
| utils | Apoyo: AppError, catchAsync, conversión de coordenadas y verificación del autor |
| config | Conexión a la base de datos |

## Modelos

### User

| Campo | Tipo | Descripción |
|---|---|---|
| nombre | String | Obligatorio |
| email | String | Obligatorio, único, en minúsculas |
| password | String | Contraseña cifrada con bcrypt (12 rondas); mínimo 6 caracteres; no se devuelve en las consultas (`select: false`) |
| createdAt, updatedAt | Date | Automáticos (timestamps) |

### Category

| Campo | Tipo | Descripción |
|---|---|---|
| nombre | String | Obligatorio, único |
| descripcion | String | Opcional |
| color | String | Color del marcador en el mapa (por defecto `#0ea5e9`) |
| creadoPor | ObjectId → User | Quién creó la categoría |

### Location (ubicación)

| Campo | Tipo | Descripción |
|---|---|---|
| nombre | String | Obligatorio |
| descripcion | String | Opcional |
| categoria | ObjectId → Category | Obligatoria; se muestra con populate |
| precio | String | `gratis`, `bajo`, `medio` o `alto` (por defecto `medio`) |
| ubicacion | GeoJSON Point | Coordenadas en orden [longitud, latitud]; índice 2dsphere |
| creadoPor | ObjectId → User | Quién registró el lugar |

Ejemplo del campo `ubicacion` guardado en Atlas:

```json
"ubicacion": { "type": "Point", "coordinates": [-86.7735, 21.1360] }
```

### Zone (zona)

| Campo | Tipo | Descripción |
|---|---|---|
| nombre | String | Obligatorio |
| area | GeoJSON Polygon | Vértices [longitud, latitud] con el anillo cerrado (el primer punto se repite al final); índice 2dsphere |
| creadoPor | ObjectId → User | Quién dibujó la zona |

### Route (ruta turística)

| Campo | Tipo | Descripción |
|---|---|---|
| nombre | String | Obligatorio |
| descripcion | String | Opcional |
| duracion | String | Duración estimada, por ejemplo «4 horas» |
| ubicaciones | [ObjectId → Location] | Paradas de la ruta, en orden |
| creadoPor | ObjectId → User | Quién creó la ruta |

### Review (reseña)

| Campo | Tipo | Descripción |
|---|---|---|
| ubicacion | ObjectId → Location | Lugar reseñado; obligatorio |
| usuario | ObjectId → User | Autor de la reseña |
| calificacion | Number | Entero de 1 a 5 |
| comentario | String | Opcional |

## Índices geográficos

| Colección | Índice | Para qué |
|---|---|---|
| locations | `ubicacion_2dsphere` | Consultas geográficas sobre los puntos, como `$geoWithin` |
| zones | `area_2dsphere` | Consultas geográficas sobre los polígonos |

El filtro por zona (`GET /api/locations?zona=<id>`) busca la zona y devuelve las ubicaciones cuyo punto está dentro de su polígono con `$geoWithin`.

## Relaciones entre entidades

Las relaciones se guardan por referencia (un `ObjectId`) y al consultar se reemplazan por el documento relacionado con `populate`.

| Origen | Campo | Destino | Tipo | Se muestra |
|---|---|---|---|---|
| Location | categoria | Category | Muchos a uno | Nombre y color de la categoría |
| Location | creadoPor | User | Muchos a uno | Nombre de quien lo registró |
| Category | creadoPor | User | Muchos a uno | Nombre de quien la creó |
| Zone | creadoPor | User | Muchos a uno | Nombre de quien la dibujó |
| Route | ubicaciones | Location | Muchos a muchos | Paradas con su categoría |
| Route | creadoPor | User | Muchos a uno | Nombre de quien la creó |
| Review | ubicacion | Location | Muchos a uno | Nombre del lugar |
| Review | usuario | User | Muchos a uno | Nombre del autor |

```
User ─┬─< Category
      ├─< Location >── Category
      ├─< Zone
      ├─< Route >──< Location
      └─< Review >── Location
```
