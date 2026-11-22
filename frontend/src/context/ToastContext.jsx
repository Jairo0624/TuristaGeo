// Mensajes de éxito y error visibles en toda la app.
// Uso: const toast = useToast(); toast.success('Guardado'); toast.error('Algo falló');
import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);
let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((list) => list.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((message, type) => {
    const id = nextId++;
    setToasts((list) => [...list, { id, message, type }]);
    // Los de éxito se van solos; los de error se quedan hasta que el usuario los cierre
    if (type === 'success') setTimeout(() => dismiss(id), 4000);
  }, [dismiss]);

  const toast = useMemo(() => ({
    success: (msg) => show(msg, 'success'),
    error: (msg) => show(msg, 'error'),
  }), [show]);

  return (
    <ToastContext.Provider value={toast}>
      {children}
      {/* Región fija: los lectores de pantalla anuncian lo que se agregue aquí */}
      <div className="toasts" role="region" aria-label="Notificaciones" aria-live="polite">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`} role={t.type === 'error' ? 'alert' : 'status'}>
            <span>{t.message}</span>
            <button type="button" className="toast-close" onClick={() => dismiss(t.id)} aria-label="Cerrar notificación">
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}
