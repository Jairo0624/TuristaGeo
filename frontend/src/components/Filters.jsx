// Barra de filtros. No filtra aquí: solo cambia los valores y MainPage vuelve a
// pedir /api/locations con ?search=&category=&precio=&zona= (se resuelve en el backend).
import { PRECIOS } from '../utils/constants';

export default function Filters({ searchText, onSearchText, filters, onChange, categories, zones, onClear }) {
  const set = (key) => (e) => onChange({ ...filters, [key]: e.target.value });
  const hasFilters = searchText || filters.category || filters.precio || filters.zona;

  return (
    <form className="filters" role="search" onSubmit={(e) => e.preventDefault()}>
      <label className="filter-search">
        <span className="visually-hidden">Buscar por nombre</span>
        <input
          type="search"
          placeholder="Buscar lugar por nombre…"
          value={searchText}
          onChange={(e) => onSearchText(e.target.value)}
        />
      </label>
      <label>
        <span className="visually-hidden">Categoría</span>
        <select value={filters.category} onChange={set('category')}>
          <option value="">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c._id} value={c._id}>{c.nombre}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="visually-hidden">Precio</span>
        <select value={filters.precio} onChange={set('precio')}>
          <option value="">Cualquier precio</option>
          {PRECIOS.map((p) => (
            <option key={p.value} value={p.value}>{p.label}</option>
          ))}
        </select>
      </label>
      <label>
        <span className="visually-hidden">Zona</span>
        <select value={filters.zona} onChange={set('zona')}>
          <option value="">Todas las zonas</option>
          {zones.map((z) => (
            <option key={z._id} value={z._id}>{z.nombre}</option>
          ))}
        </select>
      </label>
      <button type="button" className="btn btn-ghost" onClick={onClear} disabled={!hasFilters}>
        Limpiar
      </button>
    </form>
  );
}
