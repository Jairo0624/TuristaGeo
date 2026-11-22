// ÚNICO lugar donde se convierten coordenadas.
//   GeoJSON (backend / MongoDB): [longitud, latitud]
//   Leaflet (mapa):              [latitud, longitud]
// Si algo aparece "en el mar" o al revés, el error está aquí.

export const CANCUN_CENTER = [21.135, -86.82]; // [lat, lng] para Leaflet
export const CANCUN_ZOOM = 12;

// GeoJSON Point → [lat, lng] para un Marker de Leaflet
export function pointToLatLng(point) {
  const [lng, lat] = point.coordinates;
  return [lat, lng];
}

// GeoJSON Polygon → lista de [lat, lng] para un Polygon de Leaflet (solo el anillo exterior)
export function polygonToLatLngs(area) {
  return area.coordinates[0].map(([lng, lat]) => [lat, lng]);
}

// Vértices que entrega Leaflet/Geoman (objetos { lat, lng }) → GeoJSON Polygon.
// El backend se encarga de cerrar el anillo (repetir el primer punto al final).
export function latLngsToPolygon(latlngs) {
  return { type: 'Polygon', coordinates: [latlngs.map((p) => [p.lng, p.lat])] };
}

// Texto corto para mostrar coordenadas al usuario
export function formatLatLng(lat, lng) {
  return `${Number(lat).toFixed(5)}, ${Number(lng).toFixed(5)}`;
}
