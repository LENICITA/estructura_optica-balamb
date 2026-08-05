import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/auth/PrivateRoute';
import Header from './components/layout/Header';
import Footer from './components/layout/Footer';

// Cliente
import InicioCliente from './components/cliente/InicioCliente';
import CatalogoCliente from './components/cliente/CatalogoCliente';
import CarritoCliente from './components/cliente/CarritoCliente';
import Contacto from './components/cliente/Contacto';
import PerfilCliente from './components/cliente/PerfilCliente';
import FormulaCliente from './components/cliente/FormulaCliente';
import PruebaMontura from './components/cliente/PruebaMontura';
import ProductoDetalle from './components/cliente/ProductoDetalle';

// Admin
import DashboardAdmin from './components/admin/DashboardAdmin';
import Inventario from './components/admin/Inventario';
import AgregarProducto from './components/admin/AgregarProducto';
import PedidosAdmin from './components/admin/PedidosAdmin';
import RepartidoresAdmin from './components/admin/RepartidoresAdmin';
import ReportesAdmin from './components/admin/ReportesAdmin';
import FormulasAdmin from './components/admin/FormulasAdmin';
import PerfilAdmin from './components/admin/PerfilAdmin';
import RegistrarRepartidor from './components/admin/RegistrarRepartidor';


// Repartidor
import InicioRepartidor from './components/repartidor/InicioRepartidor';
import HistorialRepartidor from './components/repartidor/HistorialRepartidor';
import DetallesPedido from './components/repartidor/DetallesPedido';
import QrReader from './components/repartidor/QrReader';
import RegistroManual from './components/repartidor/RegistroManual';
import ReporteInconveniente from './components/repartidor/ReporteInconveniente';
import SubirEvidencia from './components/repartidor/SubirEvidencia';
import PerfilRepartidor from './components/repartidor/PerfilRepartidor';

// Auth
import Login from './components/Auth/Login.jsx';
import Register from './components/Auth/Register';
import RecuperarPassword from './components/Auth/RecuperarPassword';

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <div className="flex flex-col min-h-screen">
          <Header />

          <main className="flex-1">
            <Routes>

              {/* ================== CLIENTE PÚBLICO ================== */}
              <Route path="/inicio-cliente" element={<InicioCliente />} />
              <Route path="/catalogo" element={<CatalogoCliente />} />
              <Route path="/contacto" element={<Contacto />} />
              <Route path="/producto/:id" element={<ProductoDetalle />} />
              <Route path="/prueba-montura/:id" element={<PruebaMontura />} />

              {/* ================== CLIENTE PROTEGIDO ================== */}
              <Route element={<PrivateRoute allowedRoles={['cliente']} />}>
                <Route path="/carrito" element={<CarritoCliente />} />
                <Route path="/perfil-cliente" element={<PerfilCliente />} />
                <Route path="/formula" element={<FormulaCliente />} />
              </Route>

              {/* ================== ADMIN ================== */}
              <Route element={<PrivateRoute allowedRoles={['admin']} />}>
                <Route path="/admin/dashboard" element={<DashboardAdmin />} />
                <Route path="/admin/inventario" element={<Inventario />} />
                <Route path="/admin/agregar-producto" element={<AgregarProducto />} />
                <Route path="/admin/pedidos" element={<PedidosAdmin />} />
                <Route path="/admin/repartidores" element={<RepartidoresAdmin />} />
                <Route path="/admin/reportes" element={<ReportesAdmin />} />
                <Route path="/admin/formulas" element={<FormulasAdmin />} />
                <Route path="/admin/perfil" element={<PerfilAdmin />} />
                <Route path="/admin/registrar-repartidor" element={<RegistrarRepartidor />} />
              </Route>

              {/* ================== REPARTIDOR ================== */}
              <Route element={<PrivateRoute allowedRoles={['repartidor']} />}>
                <Route path="/repartidor/inicio" element={<InicioRepartidor />} />
                <Route path="/repartidor/historial" element={<HistorialRepartidor />} />
                <Route path="/detalles-pedido/:id" element={<DetallesPedido />} />
                <Route path="/qr/:id" element={<QrReader />} />
                <Route path="/registro-manual/:id" element={<RegistroManual />} />
                <Route path="/reportar-inconveniente" element={<ReporteInconveniente />} />
                <Route path="/subir-evidencia/:id" element={<SubirEvidencia />} />
                <Route path="/perfil-repartidor" element={<PerfilRepartidor />} />
              </Route>

              {/* ================== AUTH ================== */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recuperar-password" element={<RecuperarPassword />} />

            </Routes>
          </main>

          <Footer />
        </div>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;