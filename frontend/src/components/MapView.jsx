// Mapa de la vista principal: lugares (marcadores), zonas (polígonos),
// clic para registrar un lugar y herramientas para dibujar zonas.
import { useEffect, useRef } from 'react';
import { MapContainer, Marker, Polygon, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import ZoneDrawControl from './ZoneDrawControl';
import { CANCUN_CENTER, CANCUN_ZOOM, pointToLatLng, polygonToLatLngs } from '../utils/geo';
import { categoryColor, markerIcon } from '../utils/markerIcon';
import { precioLabel } from '../utils/constants';

// Clic en el mapa (ignorado mientras se dibuja una zona)
function ClickHandler({ onMapClick }) {
  const map = useMapEvents({
    click(e) {
      if (map.pm?.globalDrawModeEnabled()) return;
      onMapClick(e.latlng);
    },
  });
  return null;
}

// Cuando cambia `focus` (desde la tabla), centra el mapa en ese lugar y abre su popup
function FocusOnLocation({ focus, markerRefs }) {
  const map = useMap();
  useEffect(() => {
    if (!focus) return;
    const marker = markerRefs.current.get(focus.id);
    if (!marker) return;
    map.flyTo(marker.getLatLng(), Math.max(map.getZoom(), 15), { duration: 0.6 });
    map.once('moveend', () => marker.openPopup());
  }, [focus, map, markerRefs]);
  return null;
}

// Contenido del popup de un lugar, con los botones Editar y Eliminar
function LocationPopup({ location, onEdit, onDelete }) {
  const map = useMap();
  return (
    <div className="popup">
      <h3>{location.nombre}</h3>
      <p className="popup-meta">
        <span className="dot" style={{ background: categoryColor(location.categoria) }} aria-hidden="true" />
        {location.categoria?.nombre || 'Sin categoría'} · {precioLabel(location.precio)}
      </p>
      {location.descripcion && <p>{location.descripcion}</p>}
      <div className="popup-actions">
        <button type="button" className="btn btn-small" onClick={() => { map.closePopup(); onEdit(location); }}>
          Editar
        </button>
        <button type="button" className="btn btn-small btn-danger" onClick={() => { map.closePopup(); onDelete(location); }}>
          Eliminar
        </button>
      </div>
    </div>
  );
}

function ZonePopup({ zone, onFilterZone, onDeleteZone }) {
  const map = useMap();
  return (
    <div className="popup">
      <h3>{zone.nombre}</h3>
      <p className="popup-meta">Zona · creada por {zone.creadoPor?.nombre || '—'}</p>
      <div className="popup-actions">
        <button type="button" className="btn btn-small" onClick={() => { map.closePopup(); onFilterZone(zone); }}>
          Ver lugares aquí
        </button>
        <button type="button" className="btn btn-small btn-danger" onClick={() => { map.closePopup(); onDeleteZone(zone); }}>
          Eliminar zona
        </button>
      </div>
    </div>
  );
}

export default function MapView({
  locations, zones, focus, activeZoneId,
  onMapClick, onEdit, onDelete, onZoneDrawn, onFilterZone, onDeleteZone,
}) {
  // Referencias a los marcadores por id, para abrir su popup desde la tabla
  const markerRefs = useRef(new Map());

  return (
    <MapContainer center={CANCUN_CENTER} zoom={CANCUN_ZOOM} className="map" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {zones.map((zone) => (
        <Polygon
          key={zone._id}
          positions={polygonToLatLngs(zone.area)}
          pathOptions={{
            color: zone._id === activeZoneId ? '#f97316' : '#0f766e',
            weight: zone._id === activeZoneId ? 3 : 2,
            fillOpacity: 0.12,
          }}
        >
          <Popup>
            <ZonePopup zone={zone} onFilterZone={onFilterZone} onDeleteZone={onDeleteZone} />
          </Popup>
        </Polygon>
      ))}

      {locations.map((loc) => (
        <Marker
          // updatedAt en la key: al editar, el marcador se vuelve a crear y su título se actualiza
          key={`${loc._id}-${loc.updatedAt}`}
          position={pointToLatLng(loc.ubicacion)}
          icon={markerIcon(categoryColor(loc.categoria))}
          title={loc.nombre}
          ref={(m) => (m ? markerRefs.current.set(loc._id, m) : markerRefs.current.delete(loc._id))}
        >
          <Popup>
            <LocationPopup location={loc} onEdit={onEdit} onDelete={onDelete} />
          </Popup>
        </Marker>
      ))}

      <ClickHandler onMapClick={onMapClick} />
      <ZoneDrawControl onDrawn={onZoneDrawn} />
      <FocusOnLocation focus={focus} markerRefs={markerRefs} />
    </MapContainer>
  );
}
