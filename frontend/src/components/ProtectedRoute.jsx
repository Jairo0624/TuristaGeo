// Sin sesión no se entra a las vistas internas: se redirige a /login
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function ProtectedRoute() {
  const { user, checking } = useAuth();

  if (checking) return <p className="page-message">Verificando sesión…</p>;
  if (!user) return <Navigate to="/login" replace />;
  return <Outlet />;
}
