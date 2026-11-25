// Vista 5: reseñas de los lugares. CRUD completo (crear, listar, editar y eliminar).
// Cada reseña se relaciona con un lugar y con el usuario que la escribió (ObjectId + populate).
// El filtro por lugar se resuelve en el backend: GET /api/reviews?ubicacion=<id>
import { useCallback, useEffect, useState } from 'react';
import Modal from '../components/Modal';
import ReviewForm from '../components/ReviewForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { locationsApi, reviewsApi } from '../api';
import { useToast } from '../context/ToastContext';
import { useAuth } from '../context/AuthContext';

const stars = (n) => '★'.repeat(n) + '☆'.repeat(5 - n);
const formatDate = (iso) => new Date(iso).toLocaleDateString('es-MX', { dateStyle: 'medium' });

export default function ReviewsPage() {
  const toast = useToast();
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [locations, setLocations] = useState([]);
  const [placeFilter, setPlaceFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null); // { review? } al crear o editar
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    locationsApi.list().then(setLocations).catch((e) => toast.error(e.message));
  }, [toast]);

  // Pide las reseñas al backend (con el filtro por lugar, si hay uno elegido)
  const reload = useCallback(async () => {
    setLoading(true);
    try {
      setReviews(await reviewsApi.list({ ubicacion: placeFilter }));
    } catch (e) {
      toast.error(e.message);
    } finally {
      setLoading(false);
    }
  }, [placeFilter, toast]);

  useEffect(() => {
    reload();
  }, [reload]);

  const saveReview = async (form) => {
    const editing = draft.review;
    if (editing) {
      await reviewsApi.update(editing._id, { calificacion: form.calificacion, comentario: form.comentario });
    } else {
      await reviewsApi.create({ ubicacion: form.ubicacion, calificacion: form.calificacion, comentario: form.comentario });
    }
    setDraft(null);
    toast.success(editing ? 'Reseña actualizada' : 'Reseña publicada');
    await reload();
  };

  const askDelete = (review) => {
    setConfirm({
      title: 'Eliminar reseña',
      message: `¿Seguro que quieres eliminar esta reseña de "${review.ubicacion?.nombre || 'un lugar'}"?`,
      onConfirm: async () => {
        try {
          await reviewsApi.remove(review._id);
          setReviews((list) => list.filter((r) => r._id !== review._id));
          toast.success('Reseña eliminada');
        } catch (e) {
          toast.error(e.message);
        }
      },
    });
  };

  const initial = draft?.review
    ? {
        ubicacion: draft.review.ubicacion?._id || '',
        calificacion: draft.review.calificacion,
        comentario: draft.review.comentario || '',
      }
    : { ubicacion: placeFilter, calificacion: 5, comentario: '' };

  return (
    <div className="crud-page">
      <div className="crud-head">
        <div>
          <h1>Reseñas</h1>
          <p className="muted">Opiniones de los visitantes sobre los lugares del mapa.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setDraft({})} disabled={locations.length === 0}>
          + Nueva reseña
        </button>
      </div>

      <div className="filters filters-simple">
        <label>
          <span className="visually-hidden">Filtrar por lugar</span>
          <select value={placeFilter} onChange={(e) => setPlaceFilter(e.target.value)}>
            <option value="">Todos los lugares</option>
            {locations.map((l) => (
              <option key={l._id} value={l._id}>{l.nombre}</option>
            ))}
          </select>
        </label>
        <button type="button" className="btn btn-ghost" onClick={() => setPlaceFilter('')} disabled={!placeFilter}>
          Limpiar
        </button>
      </div>

      <div className="table-wrapper" role="region" aria-labelledby="tabla-resenas" tabIndex={0}>
        <table className="table">
          <caption id="tabla-resenas">
            Reseñas {loading ? '(cargando…)' : `(${reviews.length})`}
          </caption>
          <thead>
            <tr>
              <th scope="col">Lugar</th>
              <th scope="col">Calificación</th>
              <th scope="col">Comentario</th>
              <th scope="col">Autor</th>
              <th scope="col">Fecha</th>
              <th scope="col"><span className="visually-hidden">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {reviews.length === 0 && !loading && (
              <tr><td colSpan={6} className="empty">No hay reseñas con este filtro.</td></tr>
            )}
            {reviews.map((r) => (
              <tr key={r._id}>
                <th scope="row">{r.ubicacion?.nombre || 'Lugar eliminado'}</th>
                <td data-label="Calificación">
                  <span className="stars" role="img" aria-label={`${r.calificacion} de 5`}>{stars(r.calificacion)}</span>
                </td>
                <td data-label="Comentario" className="cell-desc">{r.comentario || '—'}</td>
                <td data-label="Autor">{r.usuario?.nombre || '—'}</td>
                <td data-label="Fecha">{formatDate(r.createdAt)}</td>
                <td className="cell-actions">
                  {r.usuario?._id === user.id && (
                    <>
                      <button type="button" className="btn btn-small" onClick={() => setDraft({ review: r })}>Editar</button>
                      <button type="button" className="btn btn-small btn-danger" onClick={() => askDelete(r)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(draft)}
        title={draft?.review ? 'Editar reseña' : 'Nueva reseña'}
        onClose={() => setDraft(null)}
      >
        {draft && (
          <ReviewForm
            initial={initial}
            locations={locations}
            editing={Boolean(draft.review)}
            onSubmit={saveReview}
            onCancel={() => setDraft(null)}
            submitLabel={draft.review ? 'Guardar cambios' : 'Publicar reseña'}
          />
        )}
      </Modal>

      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}
