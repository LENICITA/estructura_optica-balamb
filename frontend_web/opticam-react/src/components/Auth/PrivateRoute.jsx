import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const PrivateRoute = ({ allowedRoles = [] }) => {
  const { isAuthenticated, loading, user } = useAuth();

  if (loading) return <p>Cargando...</p>;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  // Si no hay roles permitidos, permitir acceso
  if (allowedRoles.length === 0) {
    return <Outlet />;
  }

  // Obtener roles del usuario
  const userRoles = user?.roles || [];
  
  // Normalizar roles permitidos a mayúsculas
  const normalizedAllowedRoles = allowedRoles.map(role => role.toUpperCase());
  
  // Verificar si el usuario tiene alguno de los roles permitidos
  const hasAccess = userRoles.some(role => 
    normalizedAllowedRoles.includes(role.toUpperCase())
  );

  if (!hasAccess) {
    // Redirigir según el rol del usuario
    if (userRoles.includes('ADMIN')) {
      return <Navigate to="/admin/dashboard" />;
    } else if (userRoles.includes('REPARTIDOR')) {
      return <Navigate to="/repartidor/inicio" />;
    } else {
      return <Navigate to="/inicio-cliente" />;
    }
  }

  return <Outlet />;
};

export default PrivateRoute;