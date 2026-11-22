// Mapa de vistas de la app. Las internas van dentro de <ProtectedRoute>.
import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import AuthPage from './pages/AuthPage';
import MainPage from './pages/MainPage';
import RoutesPage from './pages/RoutesPage';
import NotFoundPage from './pages/NotFoundPage';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      {/* Si ya hay sesión, login/registro mandan al mapa */}
      <Route path="/login" element={user ? <Navigate to="/" replace /> : <AuthPage mode="login" />} />
      <Route path="/registro" element={user ? <Navigate to="/" replace /> : <AuthPage mode="register" />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/" element={<MainPage />} />
          <Route path="/rutas" element={<RoutesPage />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
