const AppError = require('./AppError');

const validPair = (p) =>
  Array.isArray(p) && p.length === 2 && p.every(Number.isFinite) &&
  p[0] >= -180 && p[0] <= 180 && p[1] >= -90 && p[1] <= 90;

// Acepta { lat, lng } (lo que entrega Leaflet) o { ubicacion: { coordinates: [lng, lat] } }
// y siempre regresa un GeoJSON Point con orden [longitud, latitud]. Si no hay coordenadas, null.
exports.toPoint = (body) => {
  let lng;
  let lat;
  if (body.lng !== undefined || body.lat !== undefined) {
    lng = Number(body.lng);
    lat = Number(body.lat);
  } else if (body.ubicacion && Array.isArray(body.ubicacion.coordinates)) {
    [lng, lat] = body.ubicacion.coordinates.map(Number);
  } else {
    return null;
  }
  if (!validPair([lng, lat])) {
    throw new AppError('Coordenadas inválidas: lat entre -90 y 90, lng entre -180 y 180', 400);
  }
  return { type: 'Point', coordinates: [lng, lat] };
};

// Recibe un GeoJSON Polygon { type, coordinates: [[ [lng, lat], ... ]] } y lo valida/cierra
exports.toPolygon = (area) => {
  const rings = area && area.coordinates;
  if (!Array.isArray(rings) || !Array.isArray(rings[0])) {
    throw new AppError('El polígono es obligatorio (GeoJSON Polygon)', 400);
  }
  const ring = rings[0].map((p) => (Array.isArray(p) ? p.map(Number) : p));
  if (!ring.every(validPair)) {
    throw new AppError('El polígono tiene vértices inválidos, usa [longitud, latitud]', 400);
  }
  const first = ring[0];
  const last = ring[ring.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) ring.push([...first]);
  if (ring.length < 4) throw new AppError('El polígono necesita al menos 3 vértices', 400);
  return { type: 'Polygon', coordinates: [ring] };
};

exports.escapeRegex = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
