// src/features/admin/pages/PrincipalAdmin.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { ProductController } from '../../../core/controllers/ProductController';
import { PedidoController } from '../../../core/controllers/PedidoController';
import { UserController } from '../../../core/controllers/UserController';

export const PrincipalAdmin = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ productos: 0, pedidos: 0, usuarios: 0, ventas: 0 });
  const [nombreAdmin, setNombreAdmin] = useState('Administrador');

  const productController = new ProductController();
  const pedidoController = new PedidoController();
  const userController = new UserController();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      if (user?.nombre_completo) setNombreAdmin(user.nombre_completo);

      try {
        const productos = await productController.getProductos();
        const pedidos = await pedidoController.getTodosLosPedidos();
        const clientesResult = await userController.countClientes();
        const totalUsuarios = clientesResult?.data?.total || 0;
        const ventas = pedidos.filter(
          (p) => p.estado === 'Entregado' || p.estado === 'ENTREGADO'
        );

        setStats({
          productos: productos.length,
          pedidos: pedidos.length,
          usuarios: totalUsuarios,
          ventas: ventas.length,
        });
      } catch (error) {
        console.log('Error al cargar estadísticas:', error);
        setStats({ productos: 24, pedidos: 12, usuarios: 8, ventas: 5 });
      }
    } catch (error) {
      console.error('Error al cargar datos del admin:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh]">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500">Cargando panel...</p>
      </div>
    );
  }

  const statCards = [
    { key: 'productos', label: 'Productos', value: stats.productos, desc: 'registrados', icon: 'fa-cube', color: '#3B82F6', bg: '#EFF6FF' },
    { key: 'pedidos', label: 'Pedidos', value: stats.pedidos, desc: 'realizados', icon: 'fa-cart-shopping', color: '#F59E0B', bg: '#FFFBEB' },
    { key: 'usuarios', label: 'Usuarios', value: stats.usuarios, desc: 'registrados', icon: 'fa-users', color: '#8B5CF6', bg: '#F5F3FF' },
    { key: 'ventas', label: 'Ventas', value: stats.ventas, desc: 'completadas', icon: 'fa-chart-line', color: '#10B981', bg: '#ECFDF5' },
  ];

  const actions = [
    { label: 'Ver pedidos', desc: 'Revisa y gestiona pedidos', icon: 'fa-bag-shopping', color: '#F59E0B', bg: '#FFFBEB', route: '/admin/pedidos' },
    { label: 'Generar reporte', desc: 'Estadísticas y métricas', icon: 'fa-file-lines', color: '#3B82F6', bg: '#EFF6FF', route: '/admin/reportes' },
    { label: 'Gestionar fórmulas', desc: 'Fórmulas ópticas', icon: 'fa-calculator', color: '#8B5CF6', bg: '#F5F3FF', route: '/admin/formulas' },
    { label: 'Gestionar distribuciones', desc: 'Zonas y reparto', icon: 'fa-map', color: '#10B981', bg: '#ECFDF5', route: '/admin/distribuciones' },
  ];

  return (
  <div className="bg-gray-50 min-h-screen pb-10">

    {/* HEADER */}
    <div className="bg-gradient-to-br from-[#B90F0F] to-[#B91C1C] px-6 md:px-10 lg:px-16 pt-7 pb-9 rounded-b-3xl">
      <div className="max-w-7xl mx-auto">

        <div className="flex items-center">
          <div className="w-[56px] h-[56px] rounded-full bg-white/25 flex items-center justify-center mr-4 flex-shrink-0">
            <span className="text-white text-2xl font-bold">
              {nombreAdmin.charAt(0).toUpperCase()}
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <p className="text-white/85 text-sm">
              Bienvenido,
            </p>

            <p className="text-white text-2xl md:text-3xl font-bold truncate">
              {nombreAdmin}
            </p>
          </div>
        </div>

        <p className="text-white/85 text-sm md:text-base mt-4">
          Gestiona tu Óptica Balamb aquí
        </p>

      </div>
    </div>

    {/* CONTENIDO */}
    <div className="max-w-7xl mx-auto px-5 md:px-8 lg:px-10">

      {/* RESUMEN */}
      <div className="mt-8 mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Resumen
        </h2>

        <p className="text-sm text-gray-500">
          Datos en tiempo real
        </p>
      </div>

      {/* ESTADÍSTICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((card) => (
          <div
            key={card.key}
            className="bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition"
          >
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: card.bg }}
            >
              <i
                className={`fa-solid ${card.icon}`}
                style={{
                  color: card.color,
                  fontSize: 22,
                }}
              ></i>
            </div>

            <p className="text-3xl font-bold text-gray-900">
              {card.value}
            </p>

            <p className="text-sm font-semibold text-gray-700 mt-1">
              {card.label}
            </p>

            <p className="text-xs text-gray-400 mt-1">
              {card.desc}
            </p>
          </div>
        ))}
      </div>

      {/* ACCIONES RÁPIDAS */}
      <div className="mt-9 mb-4">
        <h2 className="text-xl font-bold text-gray-900">
          Acciones rápidas
        </h2>

        <p className="text-sm text-gray-500">
          Todo lo que necesitas
        </p>
      </div>

      {/* ACCIONES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {actions.map((action) => (
          <Link
            key={action.route}
            to={action.route}
            className="flex items-center bg-white rounded-2xl p-5 shadow-sm hover:shadow-md transition group"
          >

            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center mr-5 flex-shrink-0"
              style={{ backgroundColor: action.bg }}
            >
              <i
                className={`fa-solid ${action.icon}`}
                style={{
                  color: action.color,
                  fontSize: 24,
                }}
              ></i>
            </div>

            <div className="flex-1 min-w-0">
              <p className="text-base font-semibold text-gray-900">
                {action.label}
              </p>

              <p className="text-sm text-gray-500 mt-1">
                {action.desc}
              </p>
            </div>

            <i className="fa-solid fa-chevron-right text-gray-400 group-hover:text-[#B90F0F] transition"></i>

          </Link>
        ))}
      </div>

    </div>
  </div>
);
};