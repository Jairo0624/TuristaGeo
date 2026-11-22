// Vista 1: inicio de sesión y registro (mismo componente, cambia con `mode`)
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function AuthPage({ mode }) {
  const isLogin = mode === 'login';
  const { login, register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({ nombre: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setSending(true);
    try {
      const u = isLogin
        ? await login(form.email, form.password)
        : await register(form.nombre, form.email, form.password);
      toast.success(isLogin ? `Bienvenido, ${u.nombre}` : 'Cuenta creada con éxito');
      navigate('/');
    } catch (err) {
      // El mensaje viene del backend (p. ej. "Ya existe una cuenta con ese correo")
      setError(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="auth-page">
      <section className="auth-card" aria-labelledby="auth-title">
        <p className="auth-brand"><span aria-hidden="true">◉</span> TuristaGeo · Cancún</p>
        <h1 id="auth-title">{isLogin ? 'Iniciar sesión' : 'Crear cuenta'}</h1>
        <p className="muted">
          {isLogin ? 'Explora playas, cultura y rutas de Cancún en el mapa.' : 'Regístrate para guardar lugares, zonas y rutas.'}
        </p>

        <form onSubmit={submit} className="form">
          {!isLogin && (
            <label>
              Nombre
              <input name="nombre" value={form.nombre} onChange={change} required autoComplete="name" />
            </label>
          )}
          <label>
            Correo
            <input type="email" name="email" value={form.email} onChange={change} required autoComplete="email" />
          </label>
          <label>
            Contraseña
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={change}
              required
              minLength={isLogin ? undefined : 6}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            {!isLogin && <small className="muted">Mínimo 6 caracteres</small>}
          </label>

          {error && <p className="form-error" role="alert">{error}</p>}

          <button type="submit" className="btn btn-primary" disabled={sending}>
            {sending ? 'Enviando…' : isLogin ? 'Entrar' : 'Registrarme'}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? (
            <>¿No tienes cuenta? <Link to="/registro">Regístrate</Link></>
          ) : (
            <>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></>
          )}
        </p>
        {isLogin && <p className="muted small">Usuario de prueba: demo@turistageo.com / demo1234</p>}
      </section>
    </div>
  );
}
