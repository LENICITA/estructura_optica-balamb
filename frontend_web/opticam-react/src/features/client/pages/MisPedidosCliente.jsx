// src/features/client/pages/MisPedidosCliente.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PedidoController } from '../../../core/controllers/PedidoController';

export const MisPedidosCliente = () => {
  const navigate = useNavigate();
  const pedidoController = new PedidoController();

  const [pedidos, setPedidos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');
  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState(null);

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setError('');
      const resultado = await pedidoController.getMisPedidos();
      const pedidosActivos = resultado.filter((p) => p.estado !== 'Cancelado');
      setPedidos(pedidosActivos);
    } catch (e) {
      console.error('Error al cargar pedidos:', e);
      setError('No se pudieron cargar tus pedidos.');
    } finally {
      setLoading(false);
      setActualizando(false);
    }
  };

  const actualizarLista = () => {
    setActualizando(true);
    cargarPedidos();
  };

  const irADetalle = (pedido) => {
    if (!pedido?.id_pedido) return alert('No se pudo identificar el pedido.');
    navigate(`/cliente/mis-pedidos/${pedido.id_pedido}`);
  };

  const mostrarMenu = (pedido) => {
    setSelectedPedido(pedido);
    setMenuVisible(true);
  };

  const cerrarMenu = () => {
    setMenuVisible(false);
    setSelectedPedido(null);
  };

  const cancelarPedido = async () => {
    if (!selectedPedido) return;

    if (!window.confirm(`¿Estás seguro de cancelar el pedido #${selectedPedido.id_pedido}?`)) return;

    try {
      const result = await pedidoController.cancelarPedido(selectedPedido.id_pedido);

      if (result.success) {
        alert('Tu pedido ha sido cancelado exitosamente.');
        setPedidos((prev) => prev.filter((p) => p.id_pedido !== selectedPedido.id_pedido));
        cerrarMenu();
      } else {
        alert(result.message || 'No se pudo cancelar el pedido');
      }
    } catch (error) {
      console.error('Error cancelando pedido:', error);
      alert(error.message || 'Error al cancelar el pedido');
    }
  };

  const obtenerColorEstado = (estado) => {
    switch (estado) {
      case 'Pendiente': return '#D97706';
      case 'Abonado': return '#2563EB';
      case 'Listo': return '#7C3AED';
      case 'Pagado': return '#059669';
      case 'En Proceso': return '#0284C7';
      case 'Enviado': return '#6366F1';
      case 'Entregado': return '#22C55E';
      case 'Cancelado': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const obtenerFondoEstado = (estado) => `${obtenerColorEstado(estado)}20`;

  const obtenerIconoEstado = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'fa-clock';
      case 'Abonado': return 'fa-money-bill';
      case 'Listo': return 'fa-circle-check';
      case 'Pagado': return 'fa-credit-card';
      case 'En Proceso': return 'fa-rotate';
      case 'Enviado': return 'fa-rocket';
      case 'Entregado': return 'fa-check-double';
      case 'Cancelado': return 'fa-circle-xmark';
      default: return 'fa-circle-question';
    }
  };

  const obtenerEstadoTexto = (estado) => {
    switch (estado) {
      case 'Pendiente': return 'Pendiente';
      case 'Abonado': return 'Abonado (50%)';
      case 'Listo': return 'Listo para pagar';
      case 'Pagado': return 'Pagado';
      case 'En Proceso': return 'En proceso';
      case 'Enviado': return 'Enviado';
      case 'Entregado': return 'Entregado';
      case 'Cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  const obtenerNombresProductos = (productos) => {
    if (!productos || productos.length === 0) return 'Sin productos';

    const nombres = productos
      .map((p) => p?.nombre || p?.producto?.nombre || p?.nombre_producto || '')
      .filter(Boolean);

    if (nombres.length === 0) return 'Sin productos';
    if (nombres.length === 1) return nombres[0];
    if (nombres.length === 2) return `${nombres[0]} y ${nombres[1]}`;
    return `${nombres.slice(0, 2).join(', ')} y ${nombres.length - 2} más`;
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-50">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-sm">Cargando tus pedidos...</p>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 pb-32">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-receipt text-2xl text-[#B90F0F]"></i>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Mis pedidos
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Consulta y realiza seguimiento a tus compras.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="bg-gray-50 rounded-xl px-4 py-3">
                <p className="text-xs text-gray-500">Pedidos</p>
                <p className="text-lg font-bold text-gray-900">
                  {pedidos.length}
                </p>
              </div>

              <button
                onClick={actualizarLista}
                disabled={actualizando}
                className="w-11 h-11 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
                title="Actualizar"
              >
                <i
                  className={`fa-solid fa-rotate ${
                    actualizando ? 'animate-spin' : ''
                  }`}
                ></i>
              </button>
            </div>
          </div>
        </div>

        {/* ERROR */}
        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-circle-exclamation text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-sm font-bold text-red-900">
                    No fue posible cargar tus pedidos
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    {error}
                  </p>
                </div>
              </div>

              <button
                onClick={cargarPedidos}
                className="text-sm font-bold text-[#B90F0F] border border-[#B90F0F] px-4 py-2.5 rounded-xl hover:bg-white transition"
              >
                Reintentar
              </button>
            </div>
          </div>
        )}

        {/* SIN PEDIDOS */}
        {!error && pedidos.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-8 sm:p-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-2xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-receipt text-[#B90F0F] text-4xl"></i>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-gray-900 mt-5">
                No tienes pedidos
              </h2>

              <p className="text-sm text-gray-500 max-w-md mt-2 leading-6">
                Cuando realices una compra, aparecerá aquí tu historial de
                pedidos para que puedas consultar su estado y detalles.
              </p>

              <button
                onClick={() => navigate('/catalogo')}
                className="mt-6 bg-[#B90F0F] text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-[#9f0d0d] transition flex items-center gap-2"
              >
                <i className="fa-solid fa-glasses"></i>
                Ir al catálogo
              </button>
            </div>
          </div>
        )}

        {/* LISTA DE PEDIDOS */}
        {pedidos.length > 0 && (
          <div className="space-y-5">

            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Historial de pedidos
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Selecciona un pedido para consultar toda su información.
              </p>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
              {pedidos.map((item) => {
                const estadoColor = obtenerColorEstado(item.estado);
                const estadoFondo = obtenerFondoEstado(item.estado);
                const estadoIcono = obtenerIconoEstado(item.estado);
                const puedeCancelar = item.estado === 'Pendiente';
                const puedePagar =
                  item.estado === 'Pendiente' || item.estado === 'Listo';

                return (
                  <div
                    key={item.id_pedido}
                    onClick={() => irADetalle(item)}
                    className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:border-gray-300 transition cursor-pointer relative"
                  >
                    {/* MENÚ */}
                    {puedeCancelar && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          mostrarMenu(item);
                        }}
                        className="absolute top-5 right-5 w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition z-10"
                        title="Opciones"
                      >
                        <i className="fa-solid fa-ellipsis-vertical text-lg"></i>
                      </button>
                    )}

                    {/* CABECERA */}
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pr-8">
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                            <i className="fa-solid fa-receipt text-[#B90F0F] text-sm"></i>
                          </div>

                          <div>
                            <p className="text-base font-bold text-gray-900">
                              Pedido #{item.id_pedido}
                            </p>

                            <p className="text-xs text-gray-500 mt-0.5">
                              {item.fechaFormateada || 'Fecha no disponible'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <span
                        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold self-start"
                        style={{
                          backgroundColor: estadoFondo,
                          color: estadoColor,
                        }}
                      >
                        <i className={`fa-solid ${estadoIcono}`}></i>
                        {obtenerEstadoTexto(item.estado)}
                      </span>
                    </div>

                    {/* PRODUCTOS */}
                    <div className="mt-5 border border-gray-200 rounded-xl p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                          <i className="fa-solid fa-glasses text-[#B90F0F]"></i>
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-gray-400 uppercase">
                            Productos
                          </p>

                          <p className="text-sm font-semibold text-gray-800 mt-1 leading-5">
                            {obtenerNombresProductos(item.productos)}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* INFORMACIÓN */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">

                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-400 uppercase font-semibold">
                          Total
                        </p>

                        <p className="text-lg font-black text-[#B90F0F] mt-1">
                          {item.totalFormateado}
                        </p>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <p className="text-xs text-gray-400 uppercase font-semibold">
                          Estado de pago
                        </p>

                        {item.estado === 'Pendiente' && (
                          <p className="text-sm font-bold text-gray-800 mt-1">
                            Saldo: {item.totalFormateado}
                          </p>
                        )}

                        {item.estado === 'Listo' && (
                          <p className="text-sm font-bold text-gray-800 mt-1">
                            Saldo pendiente: {item.totalFormateado}
                          </p>
                        )}

                        {item.estado === 'Abonado' && (
                          <p className="text-sm font-bold text-blue-600 mt-1">
                            Abonado 50%
                          </p>
                        )}

                        {item.estado === 'Pagado' && (
                          <p className="text-sm font-bold text-green-600 mt-1">
                            <i className="fa-solid fa-circle-check mr-1"></i>
                            Pagado
                          </p>
                        )}

                        {!['Pendiente', 'Listo', 'Abonado', 'Pagado'].includes(
                          item.estado
                        ) && (
                          <p className="text-sm font-semibold text-gray-700 mt-1">
                            {obtenerEstadoTexto(item.estado)}
                          </p>
                        )}
                      </div>

                    </div>

                    {/* ACCIONES */}
                    <div className="mt-4 pt-4 border-t border-gray-100 flex flex-col sm:flex-row gap-3">

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          irADetalle(item);
                        }}
                        className="flex-1 h-11 border border-gray-300 rounded-xl text-gray-700 font-bold text-sm hover:bg-gray-50 transition flex items-center justify-center gap-2"
                      >
                        <i className="fa-solid fa-eye"></i>
                        Ver detalle
                      </button>

                      {puedePagar && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate(`/cliente/pagos/${item.id_pedido}`);
                          }}
                          className={`flex-1 h-11 rounded-xl text-white font-bold text-sm transition flex items-center justify-center gap-2 ${
                            item.estado === 'Listo'
                              ? 'bg-green-600 hover:bg-green-700'
                              : 'bg-[#B90F0F] hover:bg-[#9f0d0d]'
                          }`}
                        >
                          <i
                            className={`fa-solid ${
                              item.estado === 'Listo'
                                ? 'fa-circle-check'
                                : 'fa-credit-card'
                            }`}
                          ></i>

                          {item.estado === 'Listo'
                            ? 'Pagar saldo'
                            : 'Pagar ahora'}
                        </button>
                      )}

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* MODAL MENÚ */}
        {menuVisible && (
          <div
            className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4"
            onClick={cerrarMenu}
          >
            <div
              className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Opciones del pedido
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Pedido #{selectedPedido?.id_pedido}
                  </p>
                </div>

                <button
                  onClick={cerrarMenu}
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-500 hover:bg-gray-100 transition"
                >
                  <i className="fa-solid fa-xmark text-xl"></i>
                </button>
              </div>

              <button
                onClick={() => {
                  cerrarMenu();
                  setTimeout(cancelarPedido, 300);
                }}
                className="w-full flex items-center gap-4 p-4 rounded-xl border border-red-100 text-left hover:bg-red-50 transition"
              >
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                  <i className="fa-solid fa-circle-xmark text-red-500 text-xl"></i>
                </div>

                <div>
                  <p className="text-sm font-bold text-red-600">
                    Cancelar pedido
                  </p>

                  <p className="text-xs text-gray-500 mt-1">
                    Esta acción cancelará el pedido pendiente.
                  </p>
                </div>
              </button>

              <button
                onClick={cerrarMenu}
                className="w-full mt-3 h-11 border border-gray-300 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
              >
                Cerrar
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default MisPedidosCliente;