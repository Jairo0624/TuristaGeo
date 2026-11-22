// Tabla de lugares. Recibe el mismo arreglo que el mapa, así que se actualiza
// en cuanto cambia el estado (crear, editar, eliminar o filtrar) sin recargar.
// No muestra IDs; la categoría aparece por nombre gracias al populate del backend.
import { categoryColor } from '../utils/markerIcon';
import { precioLabel } from '../utils/constants';

export default function LocationsTable({ locations, loading, onShow, onEdit, onDelete }) {
  return (
    <div className="table-wrapper" role="region" aria-labelledby="tabla-lugares" tabIndex={0}>
      <table className="table">
        <caption id="tabla-lugares">
          Lugares {loading ? '(cargando…)' : `(${locations.length})`}
        </caption>
        <thead>
          <tr>
            <th scope="col">Nombre</th>
            <th scope="col">Categoría</th>
            <th scope="col">Precio</th>
            <th scope="col">Descripción</th>
            <th scope="col">Registrado por</th>
            <th scope="col"><span className="visually-hidden">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {locations.length === 0 && !loading && (
            <tr>
              <td colSpan={6} className="empty">No hay lugares con estos filtros.</td>
            </tr>
          )}
          {locations.map((loc) => (
            <tr key={loc._id}>
              <th scope="row">{loc.nombre}</th>
              <td data-label="Categoría">
                <span className="dot" style={{ background: categoryColor(loc.categoria) }} aria-hidden="true" />
                {loc.categoria?.nombre || 'Sin categoría'}
              </td>
              <td data-label="Precio">{precioLabel(loc.precio)}</td>
              <td data-label="Descripción" className="cell-desc">{loc.descripcion || '—'}</td>
              <td data-label="Registrado por">{loc.creadoPor?.nombre || '—'}</td>
              <td className="cell-actions">
                <button type="button" className="btn btn-small" onClick={() => onShow(loc)}>Ver en mapa</button>
                <button type="button" className="btn btn-small" onClick={() => onEdit(loc)}>Editar</button>
                <button type="button" className="btn btn-small btn-danger" onClick={() => onDelete(loc)}>Eliminar</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
