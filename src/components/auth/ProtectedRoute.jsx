import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../../services/UserContext';
import './ProtectedRoute.css';

// Componente que actúa como middleware para proteger rutas
function ProtectedRoute({ children }) {
  const { user, loading } = useUser();
  
  // Si todavía está cargando, muestra un indicador de carga
  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando...</p>
      </div>
    );
  }
  
  // Si no hay usuario autenticado, redireccionar al login
  if (!user) {
    return <Navigate to="/login" />;
  }
  
  // Si hay usuario autenticado, mostrar el contenido protegido
  return children;
}

export default ProtectedRoute;