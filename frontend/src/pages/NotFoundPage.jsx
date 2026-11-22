import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="page-message">
      <h1>Página no encontrada</h1>
      <p>La dirección que abriste no existe.</p>
      <Link to="/" className="btn btn-primary">Ir al mapa</Link>
    </div>
  );
}
