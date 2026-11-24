// Vista 2 (principal): filtros + mapa + tabla.
// Aquí vive el estado compartido: `locations` lo leen el mapa y la tabla,
// así cualquier cambio se ve en los dos al mismo tiempo sin recargar la página.
import { useCallback, useEffect, useRef, useState } from 'react';
import MapView from '../components/MapView';
import LocationsTable from '../components/LocationsTable';
import Filters from '../components/Filters';
import Modal from '../components/Modal';
import LocationForm from '../components/LocationForm';
import ZoneForm from '../components/ZoneForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { categoriesApi, locationsApi, zonesApi } from '../api';
import { latLngsToPolygon, pointToLatLng } from '../utils/geo';
import { useToast } from '../context/ToastContext';

const EMPTY_FILTERS = { category: '', precio: '', zona: '' };
// Si un filtro activo esconde el lugar recién guardado, se avisa para que no parezca que no se guardó
const withHiddenNote = (msg, saved, list) =>
  list && saved?._id && !list.some((l) => l._id === saved._id)
    ? `${msg}, pero los filtros activos lo ocultan. Pulsa "Limpiar" para verlo.`
    : msg;

const BLANK_PLACE = { nombre: '', descripcion: '', categoria: '', precio: 'medio', lat: '', lng: '' };

export default function MainPage() {
  const toast = useToast();

  const [categories, setCategories] = useState([]);
  const [zones, setZones] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filtros. El texto de búsqueda espera 300 ms para no pedir al backend en cada tecla.
  const [searchText, setSearchText] = useState('');
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState(EMPTY_FILTERS);

  // Ventanas: formulario de lugar, nombre de zona y confirmación de borrado
  const [locationDraft, setLocationDraft] = useState(null); // { location?, nombre, descripcion, categoria, precio, lat, lng }
  // Modo "elegir en el mapa": la ventana se oculta y el siguiente clic en el mapa fija las coordenadas.
  // pickingRef existe para que el cierre del modal (evento close) sepa que NO debe descartar el borrador.
  const [picking, setPicking] = useState(false);
  const pickingRef = useRef(false);
  const mapWrapRef = useRef(null);
  const [zoneDraft, setZoneDraft] = useState(null); // vértices dibujados
  const [confirm, setConfirm] = useState(null);
  const [focus, setFocus] = useState(null); // lugar a enfocar en el mapa

  // --- Carga inicial de catálogos (categorías y zonas)
  useEffect(() => {
    categoriesApi.list().then(setCategories).catch((e) => toast.error(e.message));
    zonesApi.list().then(setZones).catch((e) => toast.error(e.message));
  }, [toast]);

  // --- Búsqueda con espera (debounce)
  useEffect(() => {
    const t = setTimeout(() => setSearch(searchText.trim()), 300);
    return () => clearTimeout(t);
  }, [searchText]);

  // --- Pide los lugares al backend con los filtros actuales.
  // requestId evita que una respuesta vieja pise a una más nueva.
  const requestId = useRef(0);
  const reloadLocations = useCallback(async () => {
    const id = ++requestId.current;
    setLoading(true);
    try {
      const data = await locationsApi.list({ search, ...filters });
      if (id === requestId.current) {
        setLocations(data);
        return data;
      }
    } catch (e) {
      if (id === requestId.current) toast.error(e.message);
    } finally {
      if (id === requestId.current) setLoading(false);
    }
    return null;
  }, [search, filters, toast]);

  useEffect(() => {
    reloadLocations();
  }, [reloadLocations]);

  // --- Lugares: crear / editar / eliminar
  // Con coordenadas (clic en el mapa o en una zona) o en blanco (botón de la tabla)
  const openCreate = useCallback((latlng) => setLocationDraft({ ...BLANK_PLACE, lat: latlng.lat, lng: latlng.lng }), []);
  const openCreateBlank = useCallback(() => setLocationDraft({ ...BLANK_PLACE }), []);

  const openEdit = useCallback((loc) => {
    const [lat, lng] = pointToLatLng(loc.ubicacion);
    setLocationDraft({
      location: loc,
      nombre: loc.nombre,
      descripcion: loc.descripcion || '',
      categoria: loc.categoria?._id || '',
      precio: loc.precio || 'medio',
      lat,
      lng,
    });
  }, []);

  // --- Elegir coordenadas en el mapa sin perder lo que ya se escribió en el formulario
  const startPick = (form) => {
    pickingRef.current = true;
    setLocationDraft((d) => ({ ...d, ...form }));
    setPicking(true);
    mapWrapRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const stopPick = () => {
    pickingRef.current = false;
    setPicking(false);
  };

  // Un solo manejador para los clics del mapa: o fija coordenadas, o abre el formulario de nuevo lugar
  const handleMapClick = (latlng) => {
    if (pickingRef.current) {
      setLocationDraft((d) => ({ ...d, lat: latlng.lat, lng: latlng.lng }));
      stopPick();
    } else {
      openCreate(latlng);
    }
  };

  const saveLocation = async (form) => {
    const datos = {
      nombre: form.nombre,
      descripcion: form.descripcion,
      categoria: form.categoria,
      precio: form.precio,
      lat: form.lat,
      lng: form.lng,
    };
    const editing = locationDraft.location;
    const saved = editing ? await locationsApi.update(editing._id, datos) : await locationsApi.create(datos);
    setLocationDraft(null);
    // Se vuelve a pedir la lista con los mismos filtros: así mapa y tabla quedan iguales al backend
    const list = await reloadLocations();
    toast.success(withHiddenNote(editing ? 'Lugar actualizado' : 'Lugar registrado', saved, list));
  };

  // Edición dentro del popup del mapa: solo cambia los datos del formulario (no las coordenadas)
  const saveLocationInline = useCallback(async (loc, form) => {
    const saved = await locationsApi.update(loc._id, {
      nombre: form.nombre,
      descripcion: form.descripcion,
      categoria: form.categoria,
      precio: form.precio,
    });
    const list = await reloadLocations();
    toast.success(withHiddenNote('Lugar actualizado', saved, list));
  }, [reloadLocations, toast]);

  const askDeleteLocation = useCallback((loc) => {
    setConfirm({
      title: 'Eliminar lugar',
      message: `¿Seguro que quieres eliminar "${loc.nombre}"? También se borrarán sus reseñas.`,
      onConfirm: async () => {
        try {
          await locationsApi.remove(loc._id);
          setLocations((list) => list.filter((l) => l._id !== loc._id));
          toast.success('Lugar eliminado');
        } catch (e) {
          toast.error(e.message);
        }
      },
    });
  }, [toast]);

  // --- Zonas: dibujar → nombrar → guardar; eliminar
  const onZoneDrawn = useCallback((vertices) => setZoneDraft(vertices), []);

  const saveZone = async (nombre) => {
    const zone = await zonesApi.create(nombre, latLngsToPolygon(zoneDraft));
    setZones((list) => [zone, ...list]);
    setZoneDraft(null);
    toast.success(`Zona "${zone.nombre}" guardada`);
  };

  const askDeleteZone = useCallback((zone) => {
    setConfirm({
      title: 'Eliminar zona',
      message: `¿Eliminar la zona "${zone.nombre}"? Los lugares dentro de ella no se borran.`,
      onConfirm: async () => {
        try {
          await zonesApi.remove(zone._id);
          setZones((list) => list.filter((z) => z._id !== zone._id));
          // Si estaba filtrando por esa zona, se quita el filtro
          setFilters((f) => (f.zona === zone._id ? { ...f, zona: '' } : f));
          toast.success('Zona eliminada');
        } catch (e) {
          toast.error(e.message);
        }
      },
    });
  }, [toast]);

  const filterByZone = useCallback((zone) => setFilters((f) => ({ ...f, zona: zone._id })), []);

  const clearFilters = () => {
    setSearchText('');
    setSearch('');
    setFilters(EMPTY_FILTERS);
  };

  return (
    <div className="main-page">
      <div className="page-head">
        <h1>Mapa turístico de Cancún</h1>
        <p className="muted">
          Haz <strong>clic en el mapa</strong> (o en una zona, con <em>Registrar lugar aquí</em>) para registrar un lugar.
          Usa los botones de la izquierda del mapa para <strong>dibujar una zona</strong>.
        </p>
      </div>

      <Filters
        searchText={searchText}
        onSearchText={setSearchText}
        filters={filters}
        onChange={setFilters}
        categories={categories}
        zones={zones}
        onClear={clearFilters}
      />

      {picking && (
        <div className="pick-banner" role="status">
          <span>📍 Haz clic en el mapa para elegir la ubicación del lugar.</span>
          <button type="button" className="btn btn-small" onClick={stopPick}>Cancelar</button>
        </div>
      )}

      <div ref={mapWrapRef}>
      <MapView
        picking={picking}
        locations={locations}
        zones={zones}
        focus={focus}
        activeZoneId={filters.zona}
        categories={categories}
        onMapClick={handleMapClick}
        onSave={saveLocationInline}
        onDelete={askDeleteLocation}
        onZoneDrawn={onZoneDrawn}
        onFilterZone={filterByZone}
        onDeleteZone={askDeleteZone}
      />
      </div>

      <ul className="legend" aria-label="Categorías">
        {categories.map((c) => (
          <li key={c._id}>
            <span className="dot" style={{ background: c.color }} aria-hidden="true" />
            {c.nombre}
          </li>
        ))}
      </ul>

      <LocationsTable
        locations={locations}
        loading={loading}
        onShow={(loc) => setFocus({ id: loc._id, t: Date.now() })}
        onEdit={openEdit}
        onDelete={askDeleteLocation}
        onCreate={openCreateBlank}
      />

      <Modal
        open={Boolean(locationDraft) && !picking}
        title={locationDraft?.location ? 'Editar lugar' : 'Registrar lugar'}
        onClose={() => {
          // Mientras se elige en el mapa el modal se cierra, pero el borrador se conserva
          if (!pickingRef.current) setLocationDraft(null);
        }}
      >
        {locationDraft && (
          <LocationForm
            initial={locationDraft}
            categories={categories}
            onSubmit={saveLocation}
            onCancel={() => setLocationDraft(null)}
            onPickOnMap={startPick}
            submitLabel={locationDraft.location ? 'Guardar cambios' : 'Registrar'}
          />
        )}
      </Modal>

      <Modal open={Boolean(zoneDraft)} title="Nueva zona" onClose={() => setZoneDraft(null)}>
        {zoneDraft && (
          <ZoneForm vertexCount={zoneDraft.length} onSubmit={saveZone} onCancel={() => setZoneDraft(null)} />
        )}
      </Modal>

      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}
