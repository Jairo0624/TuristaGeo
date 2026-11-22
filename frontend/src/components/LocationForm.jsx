// Formulario para crear o editar un lugar. Las coordenadas vienen del clic en el mapa.
import { useState } from 'react';
import { PRECIOS } from '../utils/constants';
import { formatLatLng } from '../utils/geo';

/**
 * initial: { nombre, descripcion, categoria (id), precio, lat, lng }
 * onSubmit(datos) debe regresar una promesa; si falla, el error se muestra aquí mismo.
 */
export default function LocationForm({ initial, categories, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await onSubmit({ ...form, nombre: form.nombre.trim() });
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="form">
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
      <p className="muted small">Coordenadas: {formatLatLng(form.lat, form.lng)}</p>

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
