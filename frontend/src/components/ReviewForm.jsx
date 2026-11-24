// Formulario de reseña: lugar, calificación de 1 a 5 y comentario.
// Al editar no se puede cambiar el lugar (la reseña pertenece a ese lugar).
import { useState } from 'react';

/**
 * initial: { ubicacion (id), calificacion, comentario }
 * onSubmit(datos) debe regresar una promesa; si falla, el error se muestra aquí mismo.
 */
export default function ReviewForm({ initial, locations, editing, onSubmit, onCancel, submitLabel }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await onSubmit({ ...form, calificacion: Number(form.calificacion), comentario: form.comentario.trim() });
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="form">
      <label>
        Lugar *
        <select name="ubicacion" value={form.ubicacion} onChange={change} required disabled={editing} autoFocus={!editing}>
          <option value="" disabled>Elige un lugar…</option>
          {locations.map((l) => (
            <option key={l._id} value={l._id}>{l.nombre}</option>
          ))}
        </select>
      </label>
      <label>
        Calificación *
        <select name="calificacion" value={form.calificacion} onChange={change} required autoFocus={editing}>
          {[5, 4, 3, 2, 1].map((n) => (
            <option key={n} value={n}>{'★'.repeat(n)}{'☆'.repeat(5 - n)} ({n})</option>
          ))}
        </select>
      </label>
      <label>
        Comentario
        <textarea name="comentario" value={form.comentario} onChange={change} rows={3} maxLength={500} />
      </label>

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
