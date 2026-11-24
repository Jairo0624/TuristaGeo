// Estructura de las vistas internas: barra de navegación + contenido de la vista
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Layout() {
  const { user, logout } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Sesión cerrada');
    navigate('/login');
  };

  return (
    <div className="app">
      <header className="navbar">
        <NavLink to="/" className="brand">
          <span className="brand-mark" aria-hidden="true">◉</span> TuristaGeo
        </NavLink>
        <nav aria-label="Principal">
          <NavLink to="/" end>Mapa</NavLink>
          <NavLink to="/rutas">Rutas</NavLink>
          <NavLink to="/categorias">Categorías</NavLink>
          <NavLink to="/resenas">Reseñas</NavLink>
        </nav>
        <div className="navbar-user">
          <span className="user-name">{user.nombre}</span>
          <button type="button" className="btn btn-ghost" onClick={handleLogout}>
            Cerrar sesión
          </button>
        </div>
      </header>
      <main className="content">
        <Outlet />
      </main>
    </div>
  );
}
