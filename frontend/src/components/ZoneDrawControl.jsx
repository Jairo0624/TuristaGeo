// Agrega al mapa los botones de Leaflet-Geoman para dibujar zonas (polígono o rectángulo).
// Cuando el usuario termina de dibujar, entregamos los vértices a `onDrawn` y quitamos
// la figura temporal: la zona real se pinta cuando el backend la guarda.
import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import '@geoman-io/leaflet-geoman-free';

export default function ZoneDrawControl({ onDrawn }) {
  const map = useMap();

  useEffect(() => {
    map.pm.setLang('es');
    map.pm.addControls({
      position: 'topleft',
      drawPolygon: true,
      drawRectangle: true,
      // Lo demás no se usa en esta app
      drawMarker: false,
      drawCircleMarker: false,
      drawPolyline: false,
      drawCircle: false,
      drawText: false,
      editMode: false,
      dragMode: false,
      cutPolygon: false,
      removalMode: false,
      rotateMode: false,
    });

    const handleCreate = (e) => {
      const vertices = e.layer.getLatLngs()[0]; // anillo exterior: [{ lat, lng }, ...]
      map.removeLayer(e.layer);
      onDrawn(vertices);
    };
    map.on('pm:create', handleCreate);

    return () => {
      map.off('pm:create', handleCreate);
      map.pm.removeControls();
    };
  }, [map, onDrawn]);

  return null;
}
