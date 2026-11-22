// Íconos de marcador hechos con HTML/CSS (L.divIcon), coloreados según la categoría.
// Así no dependemos de las imágenes PNG de Leaflet, que Vite no resuelve bien por defecto.
import L from 'leaflet';

const DEFAULT_COLOR = '#0ea5e9';
// El color viene de la base de datos: solo aceptamos hexadecimales para no inyectar HTML
const safeColor = (c) => (/^#[0-9a-f]{3,8}$/i.test(c || '') ? c : DEFAULT_COLOR);

const cache = new Map();

/** @param color color de la categoría  @param label texto corto opcional (p. ej. número de parada) */
export function markerIcon(color, label = '') {
  const c = safeColor(color);
  const text = String(label).replace(/[^0-9]/g, ''); // solo números
  const key = `${c}|${text}`;
  if (!cache.has(key)) {
    cache.set(
      key,
      L.divIcon({
        className: 'pin',
        html: `<span class="pin-body" style="--pin:${c}"><span class="pin-label">${text}</span></span>`,
        iconSize: [28, 36],
        iconAnchor: [14, 34],
        popupAnchor: [0, -30],
      })
    );
  }
  return cache.get(key);
}

export const categoryColor = (categoria) => safeColor(categoria?.color);
