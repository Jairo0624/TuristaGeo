// Formulario para crear o editar un lugar.
// Las coordenadas se pueden escribir a mano o elegirse en el mapa con "Elegir en el mapa".
import { useState } from 'react';
import { PRECIOS } from '../utils/constants';

const coordToText = (v) => (v === '' || v === null || v === undefined ? '' : Number(v).toFixed(6));
// Acepta coma o punto decimal ("21,16" o "21.16")
const parseCoord = (v) => Number(String(v).trim().replace(',', '.'));

/**
 * initial: { nombre, descripcion, categoria (id), precio, lat, lng }  (lat/lng pueden ir vacíos)
 * onSubmit(datos) recibe lat y lng ya como números y debe regresar una promesa;
 * si falla, el error se muestra aquí mismo.
 * onPickOnMap(form) (opcional): cierra la ventana para que el usuario marque el punto en el mapa.
 */
export default function LocationForm({ initial, categories, onSubmit, onCancel, onPickOnMap, submitLabel }) {
  const [form, setForm] = useState({ ...initial, lat: coordToText(initial.lat), lng: coordToText(initial.lng) });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');

    if (!String(form.lat).trim() || !String(form.lng).trim()) {
      setError('Escribe la latitud y la longitud, o elígelas en el mapa.');
      return;
    }
    const lat = parseCoord(form.lat);
    const lng = parseCoord(form.lng);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90) {
      setError('La latitud debe ser un número entre -90 y 90.');
      return;
    }
    if (!Number.isFinite(lng) || lng < -180 || lng > 180) {
      setError('La longitud debe ser un número entre -180 y 180.');
      return;
    }

    setSending(true);
    try {
      await onSubmit({ ...form, nombre: form.nombre.trim(), lat, lng });
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="form" noValidate>
      <label>
        Nombre *
        <input name="nombre" value={form.nombre} onChange={change} required maxLength={100} autoFocus />
      </label>
      <label>
        Descripción
        <textarea name="descripcion" value={form.descripcion} onChange={change} rows={3} maxLength={500} />
      </label>
      <div className="form-row">
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
      </div>

      <fieldset className="coords-fieldset">
        <legend>Ubicación *</legend>
        <div className="form-row">
          <label>
            Latitud
            <input name="lat" value={form.lat} onChange={change} inputMode="decimal" placeholder="21.161900" />
          </label>
          <label>
            Longitud
            <input name="lng" value={form.lng} onChange={change} inputMode="decimal" placeholder="-86.851500" />
          </label>
        </div>
        {onPickOnMap && (
          <button type="button" className="btn btn-small" onClick={() => onPickOnMap(form)}>
            📍 Elegir en el mapa
          </button>
        )}
      </fieldset>

      {error && <p className="form-error" role="alert">{error}</p>}

      <div className="modal-actions">
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? 'Guardando…' : submitLabel}
        </button>
      </div>
    </form>
  );
}
