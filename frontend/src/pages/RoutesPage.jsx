// Vista 3: rutas turísticas. Lista de rutas + mapa con la ruta elegida
// dibujada como línea entre sus paradas numeradas. CRUD completo de rutas.
import { useEffect, useMemo, useState } from 'react';
import { MapContainer, Marker, Polyline, Popup, TileLayer, useMap } from 'react-leaflet';
import Modal from '../components/Modal';
import RouteForm from '../components/RouteForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { locationsApi, routesApi } from '../api';
import { CANCUN_CENTER, CANCUN_ZOOM, pointToLatLng } from '../utils/geo';
import { categoryColor, markerIcon } from '../utils/markerIcon';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

// Ajusta el mapa para que se vean todas las paradas de la ruta elegida
function FitToRoute({ positions }) {
  const map = useMap();
  useEffect(() => {
    if (positions.length > 1) map.fitBounds(positions, { padding: [40, 40], maxZoom: 15 });
    else if (positions.length === 1) map.setView(positions[0], 15);
  }, [positions, map]);
  return null;
}

export default function RoutesPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [routes, setRoutes] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [draft, setDraft] = useState(null); // { route? } al crear o editar
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    Promise.all([routesApi.list(), locationsApi.list()])
      .then(([r, l]) => {
        setRoutes(r);
        setLocations(l);
        if (r.length) setSelectedId(r[0]._id);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [toast]);

  const selected = routes.find((r) => r._id === selectedId) || null;
  // Paradas de la ruta elegida en formato Leaflet [lat, lng]
  const positions = useMemo(
    () => (selected ? selected.ubicaciones.map((u) => pointToLatLng(u.ubicacion)) : []),
    [selected]
  );

  const saveRoute = async (form) => {
    const datos = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      duracion: form.duracion,
      ubicaciones: form.ubicaciones,
    };
    const editing = draft.route;
    const saved = editing ? await routesApi.update(editing._id, datos) : await routesApi.create(datos);
    setRoutes((list) => (editing ? list.map((r) => (r._id === saved._id ? saved : r)) : [saved, ...list]));
    setSelectedId(saved._id);
    setDraft(null);
    toast.success(editing ? 'Ruta actualizada' : 'Ruta creada');
  };

  const askDelete = (route) => {
    setConfirm({
      title: 'Eliminar ruta',
      message: `¿Eliminar la ruta "${route.nombre}"? Los lugares no se borran.`,
      onConfirm: async () => {
        try {
          await routesApi.remove(route._id);
          setRoutes((list) => list.filter((r) => r._id !== route._id));
          if (selectedId === route._id) setSelectedId(null);
          toast.success('Ruta eliminada');
        } catch (e) {
          toast.error(e.message);
        }
      },
    });
  };

  const draftInitial = draft && {
    nombre: draft.route?.nombre || '',
    descripcion: draft.route?.descripcion || '',
    duracion: draft.route?.duracion || '',
    ubicaciones: draft.route ? draft.route.ubicaciones.map((u) => u._id) : [],
  };

  return (
    <div className="routes-page">
      <aside className="routes-list" aria-labelledby="rutas-titulo">
        <div className="routes-head">
          <h1 id="rutas-titulo">Rutas turísticas</h1>
          <button type="button" className="btn btn-primary" onClick={() => setDraft({})}>Nueva ruta</button>
        </div>

        {loading && <p className="muted">Cargando rutas…</p>}
        {!loading && routes.length === 0 && <p className="muted">Todavía no hay rutas. Crea la primera.</p>}

        <ul>
          {routes.map((r) => (
            <li key={r._id} className={`route-card${r._id === selectedId ? ' is-selected' : ''}`}>
              <button type="button" className="route-select" onClick={() => setSelectedId(r._id)} aria-pressed={r._id === selectedId}>
                <strong>{r.nombre}</strong>
                <span className="muted small">
                  {r.ubicaciones.length} paradas{r.duracion ? ` · ${r.duracion}` : ''}
                </span>
              </button>
              {r._id === selectedId && (
                <div className="route-detail">
                  {r.descripcion && <p>{r.descripcion}</p>}
                  <ol className="route-stops">
                    {r.ubicaciones.map((u) => (
                      <li key={u._id}>{u.nombre}</li>
                    ))}
                  </ol>
                  <p className="muted small">Creada por {r.creadoPor?.nombre || '—'}</p>
                  {r.creadoPor?._id === user.id && (
                    <div className="popup-actions">
                      <button type="button" className="btn btn-small" onClick={() => setDraft({ route: r })}>Editar</button>
                      <button type="button" className="btn btn-small btn-danger" onClick={() => askDelete(r)}>Eliminar</button>
                    </div>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      </aside>

      <MapContainer center={CANCUN_CENTER} zoom={CANCUN_ZOOM} className="map map-routes" scrollWheelZoom>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {selected && (
          <>
            <Polyline positions={positions} pathOptions={{ color: '#f97316', weight: 4, dashArray: '8 6' }} />
            {selected.ubicaciones.map((u, i) => (
              <Marker key={u._id} position={positions[i]} icon={markerIcon(categoryColor(u.categoria), i + 1)} title={u.nombre}>
                <Popup>
                  <div className="popup">
                    <h3>{i + 1}. {u.nombre}</h3>
                    {u.categoria?.nombre && <p className="popup-meta">{u.categoria.nombre}</p>}
                    {u.descripcion && <p>{u.descripcion}</p>}
                  </div>
                </Popup>
              </Marker>
            ))}
            <FitToRoute positions={positions} />
          </>
        )}
      </MapContainer>

      <Modal open={Boolean(draft)} title={draft?.route ? 'Editar ruta' : 'Nueva ruta'} onClose={() => setDraft(null)}>
        {draftInitial && (
          <RouteForm
            initial={draftInitial}
            locations={locations}
            onSubmit={saveRoute}
            onCancel={() => setDraft(null)}
            submitLabel={draft.route ? 'Guardar cambios' : 'Crear ruta'}
          />
        )}
      </Modal>

      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}
