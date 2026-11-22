// Pide el nombre de una zona recién dibujada antes de guardarla
import { useState } from 'react';

export default function ZoneForm({ vertexCount, onSubmit, onCancel }) {
  const [nombre, setNombre] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      await onSubmit(nombre.trim());
    } catch (err) {
      setError(err.message);
      setSending(false);
    }
  };

  return (
    <form onSubmit={submit} className="form">
      <label>
        Nombre de la zona *
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} required maxLength={80} autoFocus />
      </label>
      <p className="muted small">Polígono con {vertexCount} vértices.</p>
      {error && <p className="form-error" role="alert">{error}</p>}
      <div className="modal-actions">
        <button type="button" className="btn" onClick={onCancel}>Descartar</button>
        <button type="submit" className="btn btn-primary" disabled={sending}>
          {sending ? 'Guardando…' : 'Guardar zona'}
        </button>
      </div>
    </form>
  );
}
