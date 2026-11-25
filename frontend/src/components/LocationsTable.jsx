// Tabla de lugares. Recibe el mismo arreglo que el mapa, así que se actualiza
// en cuanto cambia el estado (crear, editar, eliminar o filtrar) sin recargar.
// Muestra todos los datos del lugar excepto el ID; la categoría aparece por nombre
// gracias al populate del backend y las coordenadas salen del GeoJSON Point.
import { categoryColor } from '../utils/markerIcon';
import { precioLabel } from '../utils/constants';
import { pointToLatLng } from '../utils/geo';

const formatDate = (iso) => (iso ? new Date(iso).toLocaleDateString('es-MX', { dateStyle: 'medium' }) : '—');

export default function LocationsTable({ locations, loading, onShow, onEdit, onDelete, onCreate, canModify }) {
  return (
    <>
    <div className="table-toolbar">
      <button type="button" className="btn btn-primary" onClick={onCreate}>+ Nuevo lugar</button>
    </div>
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
            <th scope="col">Latitud</th>
            <th scope="col">Longitud</th>
            <th scope="col">Registrado por</th>
            <th scope="col">Fecha</th>
            <th scope="col"><span className="visually-hidden">Acciones</span></th>
          </tr>
        </thead>
        <tbody>
          {locations.length === 0 && !loading && (
            <tr>
              <td colSpan={9} className="empty">No hay lugares con estos filtros.</td>
            </tr>
          )}
          {locations.map((loc) => {
            const [lat, lng] = pointToLatLng(loc.ubicacion);
            return (
              <tr key={loc._id}>
                <th scope="row">{loc.nombre}</th>
                <td data-label="Categoría">
                  <span className="dot" style={{ background: categoryColor(loc.categoria) }} aria-hidden="true" />
                  {loc.categoria?.nombre || 'Sin categoría'}
                </td>
                <td data-label="Precio">{precioLabel(loc.precio)}</td>
                <td data-label="Descripción" className="cell-desc">{loc.descripcion || '—'}</td>
                <td data-label="Latitud" className="cell-num">{lat.toFixed(5)}</td>
                <td data-label="Longitud" className="cell-num">{lng.toFixed(5)}</td>
                <td data-label="Registrado por">{loc.creadoPor?.nombre || '—'}</td>
                <td data-label="Fecha">{formatDate(loc.createdAt)}</td>
                <td className="cell-actions">
                  <button type="button" className="btn btn-small" onClick={() => onShow(loc)}>Ver en mapa</button>
                  {canModify(loc) && (
                    <>
                      <button type="button" className="btn btn-small" onClick={() => onEdit(loc)}>Editar</button>
                      <button type="button" className="btn btn-small btn-danger" onClick={() => onDelete(loc)}>Eliminar</button>
                    </>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
    </>
  );
}
