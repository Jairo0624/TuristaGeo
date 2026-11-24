// Vista 4: categorías. CRUD completo (crear, listar, editar y eliminar).
// Las categorías se usan en los lugares (relación por ObjectId + populate en el backend).
import { useEffect, useState } from 'react';
import Modal from '../components/Modal';
import CategoryForm from '../components/CategoryForm';
import ConfirmDialog from '../components/ConfirmDialog';
import { categoriesApi } from '../api';
import { categoryColor } from '../utils/markerIcon';
import { useToast } from '../context/ToastContext';

const NEW_CATEGORY = { nombre: '', descripcion: '', color: '#0ea5e9' };

export default function CategoriesPage() {
  const toast = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [draft, setDraft] = useState(null); // { category? } al crear o editar
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    categoriesApi.list()
      .then(setCategories)
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [toast]);

  const sortByName = (list) => [...list].sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));

  const saveCategory = async (form) => {
    const datos = { nombre: form.nombre, descripcion: form.descripcion, color: form.color };
    const editing = draft.category;
    const saved = editing ? await categoriesApi.update(editing._id, datos) : await categoriesApi.create(datos);
    setCategories((list) => sortByName(editing ? list.map((c) => (c._id === saved._id ? saved : c)) : [...list, saved]));
    setDraft(null);
    toast.success(editing ? 'Categoría actualizada' : 'Categoría creada');
  };

  const askDelete = (category) => {
    setConfirm({
      title: 'Eliminar categoría',
      message: `¿Seguro que quieres eliminar "${category.nombre}"? Solo se puede si ningún lugar la usa.`,
      onConfirm: async () => {
        try {
          await categoriesApi.remove(category._id);
          setCategories((list) => list.filter((c) => c._id !== category._id));
          toast.success('Categoría eliminada');
        } catch (e) {
          toast.error(e.message); // p. ej. "No se puede eliminar: hay ubicaciones con esta categoría"
        }
      },
    });
  };

  const initial = draft?.category
    ? {
        nombre: draft.category.nombre,
        descripcion: draft.category.descripcion || '',
        color: categoryColor(draft.category),
      }
    : NEW_CATEGORY;

  return (
    <div className="crud-page">
      <div className="crud-head">
        <div>
          <h1>Categorías</h1>
          <p className="muted">Organizan los lugares y definen el color de sus marcadores en el mapa.</p>
        </div>
        <button type="button" className="btn btn-primary" onClick={() => setDraft({})}>+ Nueva categoría</button>
      </div>

      <div className="table-wrapper" role="region" aria-labelledby="tabla-categorias" tabIndex={0}>
        <table className="table">
          <caption id="tabla-categorias">
            Categorías {loading ? '(cargando…)' : `(${categories.length})`}
          </caption>
          <thead>
            <tr>
              <th scope="col">Nombre</th>
              <th scope="col">Descripción</th>
              <th scope="col">Color</th>
              <th scope="col"><span className="visually-hidden">Acciones</span></th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 && !loading && (
              <tr><td colSpan={4} className="empty">Aún no hay categorías.</td></tr>
            )}
            {categories.map((c) => (
              <tr key={c._id}>
                <th scope="row">{c.nombre}</th>
                <td data-label="Descripción" className="cell-desc">{c.descripcion || '—'}</td>
                <td data-label="Color">
                  <span className="swatch" style={{ background: categoryColor(c) }} aria-hidden="true" />
                  {categoryColor(c)}
                </td>
                <td className="cell-actions">
                  <button type="button" className="btn btn-small" onClick={() => setDraft({ category: c })}>Editar</button>
                  <button type="button" className="btn btn-small btn-danger" onClick={() => askDelete(c)}>Eliminar</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        open={Boolean(draft)}
        title={draft?.category ? 'Editar categoría' : 'Nueva categoría'}
        onClose={() => setDraft(null)}
      >
        {draft && (
          <CategoryForm
            initial={initial}
            onSubmit={saveCategory}
            onCancel={() => setDraft(null)}
            submitLabel={draft.category ? 'Guardar cambios' : 'Crear categoría'}
          />
        )}
      </Modal>

      <ConfirmDialog request={confirm} onClose={() => setConfirm(null)} />
    </div>
  );
}
