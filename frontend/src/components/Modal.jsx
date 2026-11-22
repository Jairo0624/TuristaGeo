// Ventana modal basada en <dialog> nativo: el navegador ya maneja el foco,
// la tecla Esc y bloquea la página de atrás. Solo la abrimos/cerramos desde React.
import { useEffect, useId, useRef } from 'react';

export default function Modal({ open, title, onClose, children }) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  return (
    // onClose se dispara con Esc, con el botón × o al cerrar desde el código
    <dialog ref={ref} className="modal" aria-labelledby={titleId} onClose={onClose}>
      <header className="modal-header">
        <h2 id={titleId}>{title}</h2>
        <button type="button" className="btn-icon" onClick={onClose} aria-label="Cerrar">×</button>
      </header>
      {/* Solo se renderiza el contenido cuando está abierto, así los formularios empiezan limpios */}
      {open && children}
    </dialog>
  );
}
