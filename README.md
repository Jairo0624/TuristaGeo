# TuristaGeo

Aplicación web georreferenciada de turismo en Cancún: mapa con lugares, zonas dibujadas, rutas y reseñas.

**Stack:** React + Vite + Leaflet · Node.js + Express · MongoDB Atlas (Mongoose) · JWT + bcrypt.

## Ejecutar en local

### 1. Backend
```bash
cd backend
npm install
cp .env.example .env     # edita MONGO_URI y JWT_SECRET
npm run seed             # carga datos de Cancún y el usuario de prueba
npm run dev              # http://localhost:4000
```

### 2. Frontend
```bash
cd frontend
npm install
cp .env.example .env     # VITE_API_URL=http://localhost:4000/api
npm run dev              # http://localhost:5173
```

## Usuario de prueba
Se crea con `npm run seed`: `demo@turistageo.com` / `demo1234`.

## Estructura
- `backend/src`: `config`, `models`, `routes`, `services`, `middlewares`, `utils`.
- `frontend/src`: vistas, componentes y cliente de la API.

> README en construcción: se completará con la liga publicada y capturas.
