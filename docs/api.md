# API de TuristaGeo

Todas las rutas empiezan con `/api`. Todas, salvo `/api/health`, `/api/auth/register` y `/api/auth/login`, exigen el encabezado:

```
Authorization: Bearer <token>
```

El token se obtiene al registrarse o al iniciar sesión (JWT). Para probar la API en local está el archivo `backend/requests.http` (extensión REST Client de VS Code).

## Endpoints

| Método | Ruta | Descripción | Respuestas |
|---|---|---|---|
| GET | /api/health | Comprueba que la API está funcionando | 200 |
| POST | /api/auth/register | Crea una cuenta y devuelve el token | 201, 400 |
| POST | /api/auth/login | Inicia sesión y devuelve el token | 200, 400, 401 |
| GET | /api/auth/me | Datos del usuario de la sesión | 200, 401 |
| GET | /api/locations | Lista ubicaciones; admite `?search=&category=&precio=&zona=` | 200, 400, 401, 404 |
| POST | /api/locations | Registra una ubicación (`lat` y `lng` se guardan como GeoJSON Point) | 201, 400, 401 |
| GET, PUT, DELETE | /api/locations/:id | Consulta, edita o elimina una ubicación; editar y eliminar solo el autor | 200, 400, 401, 403, 404 |
| GET, POST | /api/zones | Lista zonas o guarda una zona (GeoJSON Polygon) | 200, 201, 400, 401 |
| GET | /api/zones/:id/locations | Ubicaciones que caen dentro de la zona | 200, 401, 404 |
| GET, PUT, DELETE | /api/zones/:id | Consulta, edita o elimina una zona | 200, 400, 401, 404 |
| GET, POST | /api/categories | Lista categorías o crea una | 200, 201, 400, 401 |
| GET, PUT, DELETE | /api/categories/:id | Consulta, edita o elimina una categoría; no se puede eliminar si tiene lugares | 200, 400, 401, 403, 404 |
| GET, POST | /api/routes | Lista rutas turísticas o crea una | 200, 201, 400, 401 |
| GET, PUT, DELETE | /api/routes/:id | Consulta, edita o elimina una ruta; editar y eliminar solo el autor | 200, 400, 401, 403, 404 |
| GET, POST | /api/reviews | Lista reseñas (`?ubicacion=`) o crea una | 200, 201, 400, 401, 404 |
| GET, PUT, DELETE | /api/reviews/:id | Consulta, edita o elimina una reseña; editar y eliminar solo el autor | 200, 400, 401, 403, 404 |

## Búsqueda y filtros de ubicaciones

Se resuelven en el backend (`backend/src/services/locationService.js`) y se pueden combinar:

| Parámetro | Ejemplo | Qué hace |
|---|---|---|
| search | `?search=playa` | Búsqueda parcial por nombre, sin importar mayúsculas |
| category | `?category=<id>` | Solo los lugares de esa categoría |
| precio | `?precio=gratis` | `gratis`, `bajo`, `medio` o `alto` |
| zona | `?zona=<id>` | Solo los lugares dentro del polígono de esa zona (`$geoWithin`) |

Ejemplo: `GET /api/locations?search=playa&precio=gratis`

## Ejemplos de cuerpo (body)

Crear una ubicación (las coordenadas se envían como las da Leaflet):

```json
{ "nombre": "Playa Delfines", "descripcion": "Mirador", "categoria": "<id>", "precio": "gratis", "lat": 21.0606, "lng": -86.7803 }
```

Crear una zona (GeoJSON Polygon, `[longitud, latitud]` y anillo cerrado):

```json
{
  "nombre": "Zona Hotelera",
  "area": {
    "type": "Polygon",
    "coordinates": [[[-86.78, 21.15], [-86.74, 21.15], [-86.74, 21.10], [-86.78, 21.10], [-86.78, 21.15]]]
  }
}
```

## Códigos HTTP

| Código | Significado | Cuándo ocurre |
|---|---|---|
| 200 | OK | Consulta, edición o eliminación correcta |
| 201 | Creado | Se registró un usuario, lugar, zona, ruta, categoría o reseña |
| 400 | Petición inválida | Faltan datos, el formato es incorrecto o el correo ya existe |
| 401 | No autenticado | Sin sesión, token vencido o contraseña incorrecta |
| 403 | Prohibido | Intentar editar o eliminar algo que creó otro usuario |
| 404 | No encontrado | Ruta o registro que no existe |
| 500 | Error interno | Fallo inesperado del servidor; el mensaje no revela detalles |

Todas las respuestas tienen la forma `{ ok: true, data }` o `{ ok: false, message }`. Los errores se lanzan con `AppError` (mensaje + código HTTP) y los responde en un solo lugar el middleware `errorHandler`; las rutas que no existen las atrapa `notFound` con un 404.
