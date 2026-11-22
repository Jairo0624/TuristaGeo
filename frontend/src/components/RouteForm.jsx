// Formulario de ruta turística: datos generales + paradas en orden.
// Las paradas se guardan como lista de ObjectId de ubicaciones (el backend hace populate).
import { useState } from 'react';

export default function RouteForm({ initial, locations, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const byId = new Map(locations.map((l) => [l._id, l]));
  const available = locations.filter((l) => !form.ubicaciones.includes(l._id));

  const addStop = (e) => {
    const id = e.target.value;
    if (id) setForm({ ...form, ubicaciones: [...form.ubicaciones, id] });
  };
  const removeStop = (i) => setForm({ ...form, ubicaciones: form.ubicaciones.filter((_, j) => j !== i) });
  // Mueve una parada hacia arriba (-1) o hacia abajo (+1)
  const moveStop = (i, dir) => {
    const list = [...form.ubicaciones];
    [list[i], list[i + dir]] = [list[i + dir], list[i]];
    setForm({ ...form, ubicaciones: list });
  };

  const submit = async (e) => {
    e.preventDefault();
    if (form.ubicaciones.length < 2) {
      setError('Una ruta necesita al menos 2 paradas');
      return;
    }
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
        <textarea name="descripcion" value={form.descripcion} onChange={change} rows={2} maxLength={500} />
      </label>
      <label>
        Duración aproximada
        <input name="duracion" value={form.duracion} onChange={change} placeholder="p. ej. 4 horas" maxLength={40} />
      </label>

      <fieldset className="stops">
        <legend>Paradas (en orden) *</legend>
        {form.ubicaciones.length === 0 && <p className="muted small">Aún no hay paradas.</p>}
        <ol>
          {form.ubicaciones.map((id, i) => (
            <li key={id}>
              <span className="stop-num">{i + 1}.</span>
              <span className="stop-name">{byId.get(id)?.nombre || 'Lugar eliminado'}</span>
              <button type="button" className="btn-icon" onClick={() => moveStop(i, -1)} disabled={i === 0} aria-label="Subir parada">↑</button>
              <button type="button" className="btn-icon" onClick={() => moveStop(i, 1)} disabled={i === form.ubicaciones.length - 1} aria-label="Bajar parada">↓</button>
              <button type="button" className="btn-icon" onClick={() => removeStop(i)} aria-label="Quitar parada">×</button>
            </li>
          ))}
        </ol>
        <label>
          <span className="visually-hidden">Agregar parada</span>
          <select value="" onChange={addStop} disabled={available.length === 0}>
            <option value="">+ Agregar parada…</option>
            {available.map((l) => (
              <option key={l._id} value={l._id}>{l.nombre}</option>
            ))}
          </select>
        </label>
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
