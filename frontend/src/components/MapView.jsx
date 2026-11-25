// Mapa de la vista principal: lugares (marcadores), zonas (polígonos),
// clic para registrar un lugar y herramientas para dibujar zonas.
import { useEffect, useRef, useState } from 'react';
import { MapContainer, Marker, Polygon, Popup, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import ZoneDrawControl from './ZoneDrawControl';
import { CANCUN_CENTER, CANCUN_ZOOM, pointToLatLng, polygonToLatLngs } from '../utils/geo';
import { categoryColor, markerIcon } from '../utils/markerIcon';
import { PRECIOS, precioLabel } from '../utils/constants';

// Clic en el mapa (ignorado mientras se dibuja una zona)
function ClickHandler({ onMapClick, picking }) {
  const closedAt = useRef(0);
  const map = useMapEvents({
    popupclose() {
      closedAt.current = performance.now();
    },
    click(e) {
      if (map.pm?.globalDrawModeEnabled()) return;
      // El clic que solo cierra un popup abierto no debe abrir el formulario de nuevo lugar
      // (salvo al elegir coordenadas: ahí todo clic cuenta)
      if (!picking && performance.now() - closedAt.current < 150) return;
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

// Leaflet decide si un clic vino de un popup mirando los padres del elemento clicado. Si React ya quitó ese
// elemento del DOM (p. ej. el botón "Editar" que se reemplaza por un formulario), Leaflet lo toma como clic
// en el mapa: cierra el popup y abre "nuevo lugar". Frenar el clic aquí evita que llegue al mapa.
const stopMapClick = (e) => e.stopPropagation();

// Contenido del popup de un lugar. Con "Editar" el mismo popup se convierte en un formulario
// (se edita ahí mismo, sin abrir otra ventana). `onSave(lugar, datos)` guarda en el backend.
function LocationPopup({ location, categories, canModify, onSave, onDelete }) {
  const map = useMap();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const startEdit = () => {
    setForm({
      nombre: location.nombre,
      descripcion: location.descripcion || '',
      categoria: location.categoria?._id || '',
      precio: location.precio,
    });
    setError('');
    setSending(false);
    setEditing(true);
  };

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await onSave(location, { ...form, nombre: form.nombre.trim() });
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  if (editing) {
    return (
      <form className="popup popup-form" onSubmit={submit} onClick={stopMapClick}>
        <h3>Editar lugar</h3>
        <label>
          Nombre *
          <input name="nombre" value={form.nombre} onChange={change} required maxLength={100} autoFocus />
        </label>
        <label>
          Descripción
          <textarea name="descripcion" value={form.descripcion} onChange={change} rows={2} maxLength={500} />
        </label>
        <label>
          Categoría *
          <select name="categoria" value={form.categoria} onChange={change} required>
            <option value="" disabled>Elige una…</option>
            {categories.map((c) => (
              <option key={c._id} value={c._id}>{c.nombre}</option>
            ))}
          </select>
        </label>
        <label>
          Precio
          <select name="precio" value={form.precio} onChange={change}>
            {PRECIOS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </label>
        {error && <p className="popup-error" role="alert">{error}</p>}
        <div className="popup-actions">
          <button type="button" className="btn btn-small" onClick={() => setEditing(false)}>Cancelar</button>
          <button type="submit" className="btn btn-small btn-primary" disabled={sending}>
            {sending ? 'Guardando…' : 'Guardar'}
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="popup" onClick={stopMapClick}>
      <h3>{location.nombre}</h3>
      <p className="popup-meta">
        <span className="dot" style={{ background: categoryColor(location.categoria) }} aria-hidden="true" />
        {location.categoria?.nombre || 'Sin categoría'} · {precioLabel(location.precio)}
      </p>
      {location.descripcion && <p>{location.descripcion}</p>}
      {canModify ? (
        <div className="popup-actions">
          <button type="button" className="btn btn-small" onClick={startEdit}>
            Editar
          </button>
          <button type="button" className="btn btn-small btn-danger" onClick={() => { map.closePopup(); onDelete(location); }}>
            Eliminar
          </button>
        </div>
      ) : (
        <p className="popup-meta">Registrado por {location.creadoPor?.nombre || '—'}. Solo su autor puede editarlo o eliminarlo.</p>
      )}
    </div>
  );
}

function ZonePopup({ zone, onCreateHere, onFilterZone, onDeleteZone }) {
  const map = useMap();
  return (
    <div className="popup" onClick={stopMapClick}>
      <h3>{zone.nombre}</h3>
      <p className="popup-meta">Zona · creada por {zone.creadoPor?.nombre || '—'}</p>
      <div className="popup-actions">
        <button type="button" className="btn btn-small btn-primary" onClick={() => { map.closePopup(); onCreateHere(); }}>
          Registrar lugar aquí
        </button>
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
  locations, zones, categories, focus, activeZoneId, picking, canModify,
  onMapClick, onSave, onDelete, onZoneDrawn, onFilterZone, onDeleteZone,
}) {
  // Referencias a los marcadores por id, para abrir su popup desde la tabla
  const markerRefs = useRef(new Map());
  // Punto exacto donde se hizo clic dentro de una zona (el polígono atrapa el clic, así que se guarda aquí)
  const zoneClick = useRef(null);

  return (
    <MapContainer center={CANCUN_CENTER} zoom={CANCUN_ZOOM} className={picking ? 'map map-picking' : 'map'} scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {zones.map((zone) => (
        <Polygon
          // Al elegir coordenadas las zonas dejan de ser clicables para no estorbar (la key las recrea)
          key={`${zone._id}-${picking ? 'pick' : 'view'}`}
          interactive={!picking}
          eventHandlers={{ click: (e) => { zoneClick.current = e.latlng; } }}
          positions={polygonToLatLngs(zone.area)}
          pathOptions={{
            color: zone._id === activeZoneId ? '#f97316' : '#0f766e',
            weight: zone._id === activeZoneId ? 3 : 2,
            fillOpacity: 0.12,
          }}
        >
          <Popup>
            <ZonePopup
              zone={zone}
              onCreateHere={() => zoneClick.current && onMapClick(zoneClick.current)}
              onFilterZone={onFilterZone}
              onDeleteZone={onDeleteZone}
            />
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
            <LocationPopup location={loc} categories={categories} canModify={canModify(loc)} onSave={onSave} onDelete={onDelete} />
          </Popup>
        </Marker>
      ))}

      <ClickHandler onMapClick={onMapClick} picking={picking} />
      <ZoneDrawControl onDrawn={onZoneDrawn} />
      <FocusOnLocation focus={focus} markerRefs={markerRefs} />
    </MapContainer>
  );
}
