import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const DashboardAdmin = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    productos: 0,
    pedidos: 0,
    clientes: 0,
    ventas: 0
  });
  const [actividadReciente, setActividadReciente] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const nombreUsuario = user?.nombre_completo || localStorage.getItem('nombre') || 'Administrador';

  useEffect(() => {
    const cargarDashboard = async () => {
      try {
        setLoading(true);
        setError(null);

        const token = localStorage.getItem('token');
        if (!token) {
          throw new Error('No hay token de autenticación');
        }

        // OBTENER PRODUCTOS (desde inventario)
        try {
          const productosRes = await api.get('/inventario/productos');
          let productosData = productosRes.data;
          if (productosRes.data && productosRes.data.productos) {
            productosData = productosRes.data.productos;
          }
          if (productosRes.data && productosRes.data.data) {
            productosData = productosRes.data.data;
          }
          
          const totalProductos = Array.isArray(productosData) ? productosData.length : 0;
          setStats(prev => ({
            ...prev,
            productos: totalProductos
          }));
        } catch (prodErr) {
        }

        // OBTENER ESTADÍSTICAS (pedidos, ventas, clientes)
        try {
          const statsResponse = await api.get('/pedidos/admin/estadisticas');
          let statsData = statsResponse.data;
          
          if (statsResponse.data && statsResponse.data.data) {
            statsData = statsResponse.data.data;
          }

          setStats(prev => ({
            ...prev,
            pedidos: statsData.pedidos || statsData.total_pedidos || statsData.totalPedidos || 0,
            clientes: statsData.clientes || statsData.total_clientes || statsData.totalClientes || 0,
            ventas: statsData.ventas || statsData.total_ventas || statsData.totalVentas || 0
          }));

        } catch (statsErr) {
          
          // Pedidos desde /pedidos/admin/todos
          try {
            const pedidosRes = await api.get('/pedidos/admin/todos');
            let pedidosData = pedidosRes.data;
            if (pedidosRes.data && pedidosRes.data.data) {
              pedidosData = pedidosRes.data.data;
            }
            if (pedidosRes.data && pedidosRes.data.pedidos) {
              pedidosData = pedidosRes.data.pedidos;
            }
            const totalPedidos = Array.isArray(pedidosData) ? pedidosData.length : 0;
            setStats(prev => ({
              ...prev,
              pedidos: totalPedidos
            }));
          } catch (pedErr) {
          }

          // Clientes desde /usuarios/clientes/count
          try {
            const clientesRes = await api.get('/usuarios/clientes/count');
            let clientesData = clientesRes.data;
            if (clientesRes.data && clientesRes.data.data) {
              clientesData = clientesRes.data.data;
            }
            const totalClientes = clientesData?.total || clientesData?.count || 0;
            setStats(prev => ({
              ...prev,
              clientes: totalClientes
            }));
          } catch (cliErr) {
          }
        }

        // OBTENER ACTIVIDAD RECIENTE
        try {
          const pedidosResponse = await api.get('/pedidos/admin/todos');
          let pedidosData = pedidosResponse.data;
          if (pedidosResponse.data && pedidosResponse.data.data) {
            pedidosData = pedidosResponse.data.data;
          }
          if (pedidosResponse.data && pedidosResponse.data.pedidos) {
            pedidosData = pedidosResponse.data.pedidos;
          }
          if (!Array.isArray(pedidosData)) {
            pedidosData = [];
          }

          const actividad = pedidosData.slice(0, 5).map(p => ({
            usuario: p.Usuario?.nombre_completo || p.cliente || p.nombre_cliente || 'Cliente',
            accion: `Pedido #${p.id_pedido || p.id} - ${p.estado || 'pendiente'}`,
            fecha: p.fecha_pedido ? new Date(p.fecha_pedido).toLocaleDateString('es-CO') : 'Hoy'
          }));

          setActividadReciente(actividad);

        } catch (pedidosErr) {
        }

        // OBTENER CLIENTES
        if (stats.clientes === 0) {
          try {
            const clientesRes = await api.get('/usuarios/clientes/count');
            let clientesData = clientesRes.data;
            if (clientesRes.data && clientesRes.data.data) {
              clientesData = clientesRes.data.data;
            }
            const totalClientes = clientesData?.total || clientesData?.count || 0;
            setStats(prev => ({
              ...prev,
              clientes: totalClientes
            }));
          } catch (cliErr) {
          }
        }

      } catch (err) {
        setError('Error al cargar los datos del dashboard');
      } finally {
        setLoading(false);
      }
    };

    cargarDashboard();
  }, []);

  useEffect(() => {
    if (user?.nombre_completo) {
      localStorage.setItem('nombre', user.nombre_completo);
    }
  }, [user]);

  if (loading) {
    return (
      <main className="py-10 px-20 max-md:px-5">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando dashboard...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="py-10 px-20 max-md:px-5">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="py-10 px-20 max-md:px-5">
      <section className="mb-8">
        <h1 className="text-[35px] max-md:text-2xl text-black">
          Bienvenido, {nombreUsuario}!
        </h1>
        <p className="text-gray-500 mt-1">Gestiona tu Óptica Balamb desde aquí</p>
      </section>

      <section className="flex gap-5 my-[30px] max-md:flex-col">
        <div className="flex-1 bg-white p-5 rounded-xl text-center shadow-md hover:-translate-y-1 transition-all">
          <i className="fa-solid fa-glasses text-2xl text-[#B90F0F] mb-2.5"></i>
          <h3 className="text-sm">Productos</h3>
          <p className="text-xl font-bold">{stats.productos}</p>
        </div>
        <div className="flex-1 bg-white p-5 rounded-xl text-center shadow-md hover:-translate-y-1 transition-all">
          <i className="fa-solid fa-cart-shopping text-2xl text-[#B90F0F] mb-2.5"></i>
          <h3 className="text-sm">Pedidos</h3>
          <p className="text-xl font-bold">{stats.pedidos}</p>
        </div>
        <div className="flex-1 bg-white p-5 rounded-xl text-center shadow-md hover:-translate-y-1 transition-all">
          <i className="fa-solid fa-users text-2xl text-[#B90F0F] mb-2.5"></i>
          <h3 className="text-sm">Clientes</h3>
          <p className="text-xl font-bold">{stats.clientes}</p>
        </div>
        <div className="flex-1 bg-white p-5 rounded-xl text-center shadow-md hover:-translate-y-1 transition-all">
          <i className="fa-solid fa-dollar-sign text-2xl text-[#B90F0F] mb-2.5"></i>
          <h3 className="text-sm">Ventas</h3>
          <p className="text-xl font-bold text-[#B90F0F]">
            ${stats.ventas.toLocaleString('es-CO')}
          </p>
        </div>
      </section>

      <section className="flex gap-[15px] mb-[30px] max-md:flex-col">
        <button className="bg-[#B90F0F] text-white border-none px-5 py-2.5 rounded-lg cursor-pointer hover:bg-[#8a0b0b] transition">
          <a href="/admin/pedidos" className="text-white no-underline">Ver pedidos</a>
        </button>
        <button className="bg-[#B90F0F] text-white border-none px-5 py-2.5 rounded-lg cursor-pointer hover:bg-[#8a0b0b] transition">
          <a href="/admin/reportes" className="text-white no-underline">Generar reporte</a>
        </button>
        <button className="bg-[#B90F0F] text-white border-none px-5 py-2.5 rounded-lg cursor-pointer hover:bg-[#8a0b0b] transition">
          <a href="/admin/formulas" className="text-white no-underline">Gestionar fórmulas</a>
        </button>
      </section>

      <section>
        <h2 className="mb-[15px]">Actividad reciente</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl overflow-hidden shadow-md">
            <thead className="bg-[#f5f5f5]">
              <tr>
                <th className="p-3 text-left">Usuario</th>
                <th className="p-3 text-left">Acción</th>
                <th className="p-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {actividadReciente.length === 0 ? (
                <tr>
                  <td colSpan="3" className="text-center py-8 text-gray-500">
                    No hay actividad reciente
                  </td>
                </tr>
              ) : (
                actividadReciente.map((actividad, index) => (
                  <tr key={index} className="border-b border-[#eeeeee] hover:bg-gray-50 transition">
                    <td className="p-3">{actividad.usuario}</td>
                    <td className="p-3">{actividad.accion}</td>
                    <td className="p-3">{actividad.fecha}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default DashboardAdmin;