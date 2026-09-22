// src/routes/AppRoutes.jsx
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '../features/auth/context/AuthContext';

// ===== LAYOUTS =====
import { Layout } from '../shared/components/layout/Layout';
import { UserLayout } from '../shared/components/layout/UserLayout';
import { ClientLayout } from '../shared/components/layout/ClientLayout';

// ===== AUTH PAGES =====
import { Iniciosesion } from '../features/auth/pages/Iniciosesion';
import { AutoRegistro } from '../features/auth/pages/AutoRegistro';
import { RecuperarContraseña } from '../features/auth/pages/RecuperarContraseña';
import { RestablecerContraseña } from '../features/auth/pages/RestablecerContraseña';

// ===== HOME =====
import Home from '../features/home/pages/Home';
import ContactoScreen from '../features/home/pages/ContactoScreen';

// ===== ADMIN PAGES =====
import { PrincipalAdmin } from '../features/admin/pages/PrincipalAdmin';
import { PerfilAdmin } from '../features/admin/pages/PerfilAdmin';
import DashboardRepartidores from '../features/admin/pages/DashboardRepartidores';
import RegistrarRepartidor from '../features/admin/pages/RegistrarRepartidor';
import DetalleRepartidor from '../features/admin/pages/DetalleRepartidor';
import EditarRepartidor from '../features/admin/pages/EditarRepartidor';
import CatalogoAdmin from '../features/admin/pages/CatalogoAdmin';
import CrearProducto from '../features/admin/pages/CrearProducto';
import EditarProducto from '../features/admin/pages/EditarProducto';
import DetalleProductoAdmin from '../features/admin/pages/DetalleProductoAdmin';
import GestionarFormulas from '../features/admin/pages/GestionarFormulas';
import DetalleFormula from '../features/admin/pages/DetalleFormula';
import GestionarPedidosAdmin from '../features/admin/pages/GestionarPedidosAdmin';
import DetallePedidosAdmin from '../features/admin/pages/DetallePedidosAdmin';
import GestionarDistribucionesAdmin from '../features/admin/pages/GestionarDistribucionesAdmin';
import DistribucionesExternas from '../features/admin/pages/DistribucionesExternas';
import ReportesAdmin from '../features/admin/pages/ReportesAdmin';

// ===== CLIENT PAGES =====
import PrincipalCliente from '../features/client/pages/PrincipalCliente';
import PerfilCliente from '../features/client/pages/PerfilCliente';
import CatalogoCliente from '../features/client/pages/CatalogoCliente';
import DetalleProductoCliente from '../features/client/pages/DetalleProductoCliente';
import CarritoCliente from '../features/client/pages/CarritoCliente';
import CrearPedidoCliente from '../features/client/pages/CrearPedidoCliente';
import MisPedidosCliente from '../features/client/pages/MisPedidosCliente';
import DetallePedidoCliente from '../features/client/pages/DetallePedidoCliente';
import PagosCliente from '../features/client/pages/PagosCliente';
import MisFormulasScreen from '../features/client/pages/MisFormulasScreen';
import DetalleFormulaCliente from '../features/client/pages/DetalleFormulaCliente';
import CrearFormulaScreen from '../features/client/pages/CrearFormulaScreen';

// ===== DELIVERY PAGES =====
import PrincipalRepartidor from '../features/delivery/pages/PrincipalRepartidor';
import PerfilRepartidor from '../features/delivery/pages/PerfilRepartidor';
import DetalleEntrega from '../features/delivery/pages/DetalleEntrega';
import HistorialEntregas from '../features/delivery/pages/HistorialEntregas';

// ===== PRIVATE ROUTE =====
const PrivateRoute = ({ children, allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (allowedRoles && !allowedRoles.some((role) => user.hasRole(role))) {
    return <Navigate to="/" />;
  }

  return children;
};

// ===== COMPONENTE PRINCIPAL =====
export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* ============================================ */}
          {/* PÚBLICO - HOME Y CONTACTO */}
          {/* ============================================ */}
          <Route path="/" element={<Layout><Home /></Layout>} />
          <Route path="/home" element={<Layout><Home /></Layout>} />
          <Route path="/contacto" element={<Layout><ContactoScreen /></Layout>} />

          {/* ============================================ */}
          {/* AUTH */}
          {/* ============================================ */}
          <Route path="/login" element={<Layout><Iniciosesion /></Layout>} />
          <Route path="/registro" element={<Layout><AutoRegistro /></Layout>} />
          <Route path="/recuperar-contrasena" element={<Layout><RecuperarContraseña /></Layout>} />
          <Route path="/restablecer-contrasena" element={<Layout><RestablecerContraseña /></Layout>} />

          {/* ============================================ */}
          {/* ADMIN */}
          {/* ============================================ */}
          <Route path="/admin/dashboard" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><PrincipalAdmin /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/perfil" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><PerfilAdmin /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/inventario" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><CatalogoAdmin /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/productos/crear" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><CrearProducto /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/productos/:id" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><DetalleProductoAdmin /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/productos/:id/editar" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><EditarProducto /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/repartidores" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><DashboardRepartidores /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/repartidores/registrar" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><RegistrarRepartidor /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/repartidores/:id" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><DetalleRepartidor /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/repartidores/:id/editar" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><EditarRepartidor /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/formulas" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><GestionarFormulas /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/formulas/:id_formula" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><DetalleFormula /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/pedidos" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><GestionarPedidosAdmin /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/pedidos/:id" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><DetallePedidosAdmin /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/distribuciones" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><GestionarDistribucionesAdmin /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/distribuciones/externas" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><DistribucionesExternas /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/admin/reportes" element={
            <PrivateRoute allowedRoles={['ADMIN']}>
              <UserLayout><ReportesAdmin /></UserLayout>
            </PrivateRoute>
          } />

          {/* ============================================ */}
          {/* CLIENTE */}
          {/* ============================================ */}
          <Route path="/cliente/inicio" element={
            <PrivateRoute allowedRoles={['CLIENTE']}>
              <ClientLayout><PrincipalCliente /></ClientLayout>
            </PrivateRoute>
          } />
          <Route path="/cliente/perfil" element={
            <PrivateRoute allowedRoles={['CLIENTE']}>
              <ClientLayout><PerfilCliente /></ClientLayout>
            </PrivateRoute>
          } />
          <Route path="/cliente/mis-formulas" element={
            <PrivateRoute allowedRoles={['CLIENTE']}>
              <ClientLayout><MisFormulasScreen /></ClientLayout>
            </PrivateRoute>
          } />
          <Route path="/cliente/mis-formulas/:id_formula" element={
            <PrivateRoute allowedRoles={['CLIENTE']}>
              <ClientLayout><DetalleFormulaCliente /></ClientLayout>
            </PrivateRoute>
          } />
          <Route path="/cliente/crear-formula" element={
            <PrivateRoute allowedRoles={['CLIENTE']}>
              <ClientLayout><CrearFormulaScreen /></ClientLayout>
            </PrivateRoute>
          } />
          <Route path="/cliente/mis-pedidos" element={
            <PrivateRoute allowedRoles={['CLIENTE']}>
              <ClientLayout><MisPedidosCliente /></ClientLayout>
            </PrivateRoute>
          } />
          <Route path="/cliente/mis-pedidos/:id" element={
            <PrivateRoute allowedRoles={['CLIENTE']}>
              <ClientLayout><DetallePedidoCliente /></ClientLayout>
            </PrivateRoute>
          } />
          <Route path="/cliente/crear-pedido" element={
            <PrivateRoute allowedRoles={['CLIENTE']}>
              <ClientLayout><CrearPedidoCliente /></ClientLayout>
            </PrivateRoute>
          } />
          <Route path="/cliente/pagos/:id" element={
            <PrivateRoute allowedRoles={['CLIENTE']}>
              <ClientLayout><PagosCliente /></ClientLayout>
            </PrivateRoute>
          } />

          {/* ============================================ */}
          {/* RUTAS PÚBLICAS COMPARTIDAS CON CLIENTE */}
          {/* ============================================ */}
          <Route path="/catalogo" element={<Layout><CatalogoCliente /></Layout>} />
          <Route path="/producto/:id" element={<Layout><DetalleProductoCliente /></Layout>} />
          <Route path="/carrito" element={
            <PrivateRoute allowedRoles={['CLIENTE']}>
              <ClientLayout><CarritoCliente /></ClientLayout>
            </PrivateRoute>
          } />

          {/* ============================================ */}
          {/* REPARTIDOR */}
          {/* ============================================ */}
          <Route path="/repartidor/inicio" element={
            <PrivateRoute allowedRoles={['REPARTIDOR']}>
              <UserLayout><PrincipalRepartidor /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/repartidor/perfil" element={
            <PrivateRoute allowedRoles={['REPARTIDOR']}>
              <UserLayout><PerfilRepartidor /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/repartidor/entrega/:id_distribucion" element={
            <PrivateRoute allowedRoles={['REPARTIDOR', 'ADMIN']}>
              <UserLayout><DetalleEntrega /></UserLayout>
            </PrivateRoute>
          } />
          <Route path="/repartidor/historial" element={
            <PrivateRoute allowedRoles={['REPARTIDOR', 'ADMIN']}>
              <UserLayout><HistorialEntregas /></UserLayout>
            </PrivateRoute>
          } />

          {/* ============================================ */}
          {/* REDIRECCIÓN POR DEFECTO */}
          {/* ============================================ */}
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default AppRoutes;