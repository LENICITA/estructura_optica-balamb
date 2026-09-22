// src/features/client/pages/DetallePedidoCliente.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PedidoController } from '../../../core/controllers/PedidoController';
import { PagoController } from '../../../core/controllers/PagoController';

const pedidoController = new PedidoController();

const ESTADOS_ACTIVOS = ['Pendiente', 'Abonado', 'Listo', 'Pagado', 'En Proceso', 'Enviado', 'Entregado'];

const DetallePedidoCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);
  const [saldo, setSaldo] = useState(null);

  const cargarPedido = useCallback(async () => {
    if (!id) {
      alert('No se recibió el identificador del pedido.');
      navigate(-1);
      return;
    }

    try {
      setLoading(true);

      const misPedidos = await pedidoController.getMisPedidos();
      const pedidoCliente = misPedidos.find((p) => Number(p.id_pedido) === Number(id));

      if (!pedidoCliente) {
        alert('No puedes consultar este pedido porque no pertenece a tu cuenta.');
        navigate(-1);
        return;
      }

      const detalle = await pedidoController.getPedidoById(Number(id));

      if (!detalle) {
        alert('No fue posible encontrar la información del pedido.');
        navigate(-1);
        return;
      }

      if (!ESTADOS_ACTIVOS.includes(detalle.estado)) {
        alert('Este pedido ya no se encuentra disponible.');
        navigate(-1);
        return;
      }

      try {
        const pagoController = new PagoController();
        const saldoData = await pagoController.verificarSaldo(Number(id));
        setSaldo(saldoData);
      } catch (err) {
        console.error('Error cargando saldo:', err);
        setSaldo(null);
      }

      setPedido(detalle);
    } catch (error) {
      console.error('Error cargando detalle del pedido:', error);
      alert('No fue posible cargar la información del pedido.');
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    cargarPedido();
  }, [cargarPedido]);

  const formatearDinero = (valor) => {
    const numero = Number(valor || 0);
    return numero.toLocaleString('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
  };

  const obtenerNombreProducto = (producto) =>
    producto?.nombre || producto?.nombre_producto || producto?.producto?.nombre || producto?.producto?.nombre_producto || 'Producto';

  const obtenerCantidad = (producto) =>
    Number(producto?.cantidad || producto?.cantidad_producto || producto?.producto?.cantidad || 1);

  const obtenerPrecio = (producto) =>
    Number(producto?.precio || producto?.precio_unitario || producto?.producto?.precio || 0);

  const obtenerImagenProducto = (producto) =>
    producto?.imagen || producto?.imagen_producto || producto?.producto?.imagen || producto?.producto?.imagen_producto || producto?.url_imagen || null;

  const obtenerIconoEstado = () => {
    if (!pedido) return 'fa-circle';
    switch (pedido.estado) {
      case 'Pendiente': return 'fa-clock';
      case 'Abonado': return 'fa-credit-card';
      case 'Listo': return 'fa-circle-check';
      case 'Pagado': return 'fa-check-double';
      case 'En Proceso': return 'fa-wrench';
      case 'Enviado': return 'fa-truck';
      case 'Entregado': return 'fa-circle-check';
      default: return 'fa-clock';
    }
  };

  const obtenerColorEstado = () => {
    if (!pedido) return '#6B7280';
    switch (pedido.estado) {
      case 'Pendiente': return '#D97706';
      case 'Abonado': return '#2563EB';
      case 'Listo': return '#7C3AED';
      case 'Pagado': return '#059669';
      case 'En Proceso': return '#0284C7';
      case 'Enviado': return '#6366F1';
      case 'Entregado': return '#22C55E';
      default: return '#6B7280';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-100">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-600 text-sm">Cargando pedido...</p>
      </div>
    );
  }

  if (!pedido) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-6 bg-gray-100">
        <i className="fa-solid fa-file-lines text-5xl text-gray-400"></i>
        <p className="mt-3 text-[19px] font-bold text-gray-800">Pedido no encontrado</p>
        <button onClick={() => navigate(-1)} className="mt-5 bg-[#B90F0F] text-white px-7 py-2.5 rounded-lg font-bold">
          Volver
        </button>
      </div>
    );
  }

  const colorEstado = obtenerColorEstado();
  const formula = pedido.formula || null;
  const totalPedido = Number(pedido.total ?? 0);
  const abonoPedido = saldo?.total_pagado || 0;
  const saldoRestante = saldo?.saldo_pendiente || totalPedido;

    return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* MODAL IMAGEN */}
        {imagenAmpliada && (
          <div
            className="fixed inset-0 bg-black/90 z-[1000] flex items-center justify-center p-4"
            onClick={() => setImagenAmpliada(null)}
          >
            <button
              className="absolute top-5 right-5 w-11 h-11 rounded-xl bg-white/15 hover:bg-white/25 flex items-center justify-center transition z-10"
              onClick={() => setImagenAmpliada(null)}
            >
              <i className="fa-solid fa-xmark text-white text-2xl"></i>
            </button>

            <img
              src={imagenAmpliada}
              alt="Ampliada"
              className="max-w-full max-h-[85vh] object-contain rounded-xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        )}

        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>

              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-receipt text-2xl text-[#B90F0F]"></i>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Detalle del pedido
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Pedido #{pedido.id_pedido}
                </p>
              </div>
            </div>

            <div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl self-start sm:self-auto"
              style={{ backgroundColor: `${colorEstado}18` }}
            >
              <i
                className={`fa-solid ${obtenerIconoEstado()}`}
                style={{ color: colorEstado }}
              ></i>
              <span
                className="text-sm font-bold"
                style={{ color: colorEstado }}
              >
                {pedido.estado}
              </span>
            </div>
          </div>
        </div>

        {/* ESTADO Y RESUMEN */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${colorEstado}18` }}
              >
                <i
                  className={`fa-solid ${obtenerIconoEstado()} text-xl`}
                  style={{ color: colorEstado }}
                ></i>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">
                  Estado
                </p>
                <p
                  className="text-base font-bold mt-1"
                  style={{ color: colorEstado }}
                >
                  {pedido.estado}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-calendar text-[#B90F0F] text-xl"></i>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">
                  Fecha estimada
                </p>
                <p className="text-sm font-bold text-gray-900 mt-1">
                  {pedido.fechaEstimadaFormateada || 'No disponible'}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-dollar-sign text-[#B90F0F] text-xl"></i>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">
                  Total
                </p>
                <p className="text-lg font-black text-[#B90F0F] mt-1">
                  {pedido.totalFormateado || formatearDinero(totalPedido)}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* INFORMACIÓN DEL PEDIDO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-receipt text-[#B90F0F]"></i>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Información del pedido
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Datos generales de tu pedido.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase">
                Fecha de creación
              </p>
              <p className="text-sm font-bold text-gray-900 mt-1">
                {pedido.fechaFormateada || 'No disponible'}
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase">
                Fecha estimada
              </p>
              <p className="text-sm font-bold text-gray-900 mt-1">
                {pedido.fechaEstimadaFormateada || 'No disponible'}
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase">
                Productos
              </p>
              <p className="text-sm font-bold text-gray-900 mt-1">
                {pedido.productos?.length || 0}
              </p>
            </div>

          </div>
        </div>

        {/* PRODUCTOS */}
        {pedido.productos && pedido.productos.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <i className="fa-solid fa-glasses text-[#B90F0F]"></i>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Productos
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Productos incluidos en este pedido.
                  </p>
                </div>
              </div>

              <span className="min-w-8 h-8 px-2 rounded-xl bg-[#B90F0F] text-white text-xs font-bold flex items-center justify-center">
                {pedido.productos.length}
              </span>
            </div>

            <div className="space-y-3">
              {pedido.productos.map((producto, index) => {
                const nombre = obtenerNombreProducto(producto);
                const cantidad = obtenerCantidad(producto);
                const precio = obtenerPrecio(producto);
                const imagen = obtenerImagenProducto(producto);

                return (
                  <div
                    key={producto?.id_pedido_producto || producto?.id_producto || index}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">

                      {imagen ? (
                        <button
                          onClick={() => setImagenAmpliada(imagen)}
                          className="w-full sm:w-24 h-40 sm:h-24 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex-shrink-0"
                        >
                          <img
                            src={imagen}
                            alt={nombre}
                            className="w-full h-full object-contain hover:scale-105 transition duration-300"
                          />
                        </button>
                      ) : (
                        <div className="w-full sm:w-24 h-40 sm:h-24 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-glasses text-gray-300 text-3xl"></i>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900">
                          {nombre}
                        </h3>

                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            Cantidad: {cantidad}
                          </span>

                          <span className="text-xs text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">
                            {formatearDinero(precio)} c/u
                          </span>
                        </div>
                      </div>

                      <div className="sm:text-right border-t sm:border-t-0 pt-3 sm:pt-0">
                        <p className="text-xs text-gray-400">
                          Total
                        </p>

                        <p className="text-lg font-black text-[#B90F0F] mt-1">
                          {formatearDinero(precio * cantidad)}
                        </p>
                      </div>

                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* DATOS DEL CLIENTE */}
        {pedido.cliente && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-user text-[#B90F0F]"></i>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Datos del cliente
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Información asociada al pedido.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                    <i className="fa-solid fa-user text-[#B90F0F]"></i>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Nombre
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-1 break-words">
                      {pedido.cliente.nombre || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                    <i className="fa-solid fa-phone text-[#B90F0F]"></i>
                  </div>

                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Teléfono
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-1">
                      {pedido.cliente.telefono || 'No especificado'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl p-4">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-gray-50 flex items-center justify-center">
                    <i className="fa-solid fa-envelope text-[#B90F0F]"></i>
                  </div>

                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Correo electrónico
                    </p>
                    <p className="text-sm font-bold text-gray-900 mt-1 break-all">
                      {pedido.cliente.email ||
                        pedido.cliente.correo ||
                        'No especificado'}
                    </p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* ENTREGA */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-location-dot text-[#B90F0F]"></i>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Información de entrega
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Lugar donde recibirás tu pedido.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-location-dot text-[#B90F0F]"></i>
                </div>

                <div className="min-w-0">
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Dirección
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-1 leading-5">
                    {pedido.direccion_entrega || 'No especificada'}
                  </p>
                </div>
              </div>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-building text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Ciudad
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {pedido.ciudad_envio || 'No especificada'}
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* FÓRMULA */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-eye text-[#B90F0F]"></i>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Fórmula óptica
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Fórmula asociada al pedido.
              </p>
            </div>
          </div>

          {formula ? (
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex flex-col sm:flex-row gap-5">

                {formula.imagen_formula ? (
                  <button
                    onClick={() => setImagenAmpliada(formula.imagen_formula)}
                    className="relative w-full sm:w-32 h-44 rounded-xl overflow-hidden bg-gray-50 border border-gray-200 flex-shrink-0"
                  >
                    <img
                      src={formula.imagen_formula}
                      alt="Fórmula"
                      className="w-full h-full object-contain"
                    />

                    <span className="absolute bottom-2 right-2 w-9 h-9 rounded-lg bg-black/60 flex items-center justify-center">
                      <i className="fa-solid fa-expand text-white text-sm"></i>
                    </span>
                  </button>
                ) : (
                  <div className="w-full sm:w-32 h-44 rounded-xl bg-gray-50 border border-gray-200 flex flex-col items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-file-lines text-gray-300 text-3xl"></i>
                    <p className="text-xs text-gray-400 mt-2">
                      Sin imagen
                    </p>
                  </div>
                )}

                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-gray-400 uppercase">
                        Condición
                      </p>

                      <p className="text-lg font-bold text-gray-900 mt-1">
                        {formula.condicion || 'Fórmula óptica'}
                      </p>
                    </div>

                    {formula.costo !== undefined &&
                      formula.costo !== null && (
                        <div className="bg-red-50 rounded-xl px-4 py-3">
                          <p className="text-xs text-gray-500">
                            Costo
                          </p>

                          <p className="text-lg font-black text-[#B90F0F] mt-1">
                            {formatearDinero(formula.costo)}
                          </p>
                        </div>
                      )}
                  </div>

                  <div className="mt-5 bg-gray-50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-gray-400 uppercase">
                      Observaciones
                    </p>

                    <p className="text-sm text-gray-600 leading-6 mt-2">
                      {formula.observaciones ||
                        formula.condicion ||
                        'Fórmula óptica asociada al pedido.'}
                    </p>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl bg-gray-50 p-8 flex flex-col items-center justify-center text-center">
              <div className="w-14 h-14 rounded-xl bg-white flex items-center justify-center">
                <i className="fa-solid fa-file-lines text-gray-300 text-2xl"></i>
              </div>

              <p className="text-sm font-bold text-gray-800 mt-4">
                No hay fórmula asociada
              </p>

              <p className="text-xs text-gray-500 mt-1 max-w-md">
                Este pedido todavía no tiene una fórmula óptica asociada.
              </p>
            </div>
          )}
        </div>

        {/* RESUMEN DE PAGO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-credit-card text-[#B90F0F]"></i>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Resumen de pago
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Estado de los pagos realizados.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase">
                Total del pedido
              </p>

              <p className="text-lg font-bold text-gray-900 mt-1">
                {pedido.totalFormateado || formatearDinero(totalPedido)}
              </p>
            </div>

            <div className="border border-gray-200 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-400 uppercase">
                Abono
              </p>

              <p className="text-lg font-bold text-gray-900 mt-1">
                {formatearDinero(abonoPedido)}
              </p>
            </div>

            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase">
                Saldo restante
              </p>

              <p className="text-xl font-black text-[#B90F0F] mt-1">
                {formatearDinero(saldoRestante)}
              </p>

              <p className="text-[11px] text-gray-500 mt-1">
                Total - Abono
              </p>
            </div>

          </div>
        </div>

        {/* BOTÓN PAGAR */}
        {(pedido.estado === 'Pendiente' || pedido.estado === 'Listo') && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <button
              onClick={() => navigate(`/cliente/pagos/${pedido.id_pedido}`)}
              className={`w-full flex items-center justify-center gap-2.5 py-3.5 rounded-xl text-white font-bold text-sm transition ${
                pedido.estado === 'Listo'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-[#B90F0F] hover:bg-[#9f0d0d]'
              }`}
            >
              <i
                className={`fa-solid ${
                  pedido.estado === 'Listo'
                    ? 'fa-circle-check'
                    : 'fa-credit-card'
                } text-lg`}
              ></i>

              {pedido.estado === 'Listo'
                ? 'Pagar saldo restante'
                : 'Pagar ahora'}
            </button>
          </div>
        )}

        {/* MENSAJES DE ESTADO */}
        {pedido.estado === 'Abonado' && (
          <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                <i className="fa-solid fa-circle-info text-blue-600"></i>
              </div>

              <div>
                <p className="text-sm font-bold text-blue-900">
                  Abono registrado
                </p>

                <p className="text-xs text-blue-800 leading-5 mt-1">
                  Ya realizaste un abono del 50%. Espera a que el pedido esté
                  listo para pagar el saldo restante.
                </p>
              </div>
            </div>
          </div>
        )}

        {pedido.estado === 'Pagado' && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                <i className="fa-solid fa-circle-check text-green-600"></i>
              </div>

              <div>
                <p className="text-sm font-bold text-green-900">
                  Pedido pagado completamente
                </p>

                <p className="text-xs text-green-800 mt-1">
                  El pago total de este pedido ya fue registrado.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* VOLVER */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <button
            onClick={() => navigate(-1)}
            className="w-full border border-gray-300 text-gray-700 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver a mis pedidos
          </button>
        </div>

      </div>
    </div>
  );
};

export default DetallePedidoCliente;