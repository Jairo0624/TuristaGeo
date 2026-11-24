// Formulario para crear o editar una categoría (nombre, descripción y color del marcador)
import { useState } from 'react';

/**
 * initial: { nombre, descripcion, color }
 * onSubmit(datos) debe regresar una promesa; si falla, el error se muestra aquí mismo.
 */
export default function CategoryForm({ initial, onSubmit, onCancel, submitLabel }) {
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
        <input name="nombre" value={form.nombre} onChange={change} required maxLength={60} autoFocus />
      </label>
      <label>
        Descripción
        <textarea name="descripcion" value={form.descripcion} onChange={change} rows={2} maxLength={200} />
      </label>
      <label>
        Color del marcador
        <input type="color" name="color" value={form.color} onChange={change} />
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
