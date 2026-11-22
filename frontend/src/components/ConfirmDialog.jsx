// Confirmación antes de eliminar. `request` = { title, message, onConfirm } o null.
import { useState } from 'react';
import Modal from './Modal';

export default function ConfirmDialog({ request, onClose }) {
  const [working, setWorking] = useState(false);

  const confirm = async () => {
    setWorking(true);
    try {
      await request.onConfirm();
    } finally {
      setWorking(false);
      onClose();
    }
  };

  return (
    <Modal open={Boolean(request)} title={request?.title || ''} onClose={onClose}>
      <p>{request?.message}</p>
      <div className="modal-actions">
        {/* autoFocus en la opción segura */}
        <button type="button" className="btn" onClick={onClose} autoFocus>Cancelar</button>
        <button type="button" className="btn btn-danger" onClick={confirm} disabled={working}>
          {working ? 'Eliminando…' : 'Eliminar'}
        </button>
      </div>
    </Modal>
  );
}
