// src/features/client/pages/PagosCliente.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PagoController } from '../../../core/controllers/PagoController';
import { PedidoController } from '../../../core/controllers/PedidoController';

export const PagosCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [pagos, setPagos] = useState([]);
  const [saldo, setSaldo] = useState(null);
  const [pedido, setPedido] = useState(null);
  const [totalPedido, setTotalPedido] = useState(0);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [linkPago, setLinkPago] = useState('');

  const pagoController = new PagoController();
  const pedidoController = new PedidoController();

  useEffect(() => {
    if (!id) {
      alert('No se encontró el ID del pedido');
      navigate(-1);
      return;
    }
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const pedidoData = await pedidoController.getPedidoById(Number(id));
      if (pedidoData) {
        setPedido(pedidoData);
        setTotalPedido(pedidoData.total || 0);
      }

      const saldoData = await pagoController.verificarSaldo(Number(id));
      setSaldo(saldoData);

      const pagosData = await pagoController.obtenerPagosPorPedido(Number(id));
      setPagos(pagosData);
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos del pago');
    } finally {
      setLoading(false);
    }
  };

  const handlePagar = async (eleccion) => {
    try {
      if (!id) return alert('No se encontró el ID del pedido');

      const total = totalPedido;
      const saldoPendiente = saldo?.saldo_pendiente || total;

      if (total <= 0) return alert('El total del pedido no es válido');

      let monto = 0;

      if (eleccion === '50%') {
        if (saldo?.tiene_abono_50) {
          return alert('Ya tienes un abono del 50%. Puedes pagar el saldo restante con "Pagar 100%"');
        }
        monto = Math.round(total / 2);
      } else {
        monto = saldoPendiente;
      }

      if (monto <= 0) return alert(`El monto a pagar debe ser mayor a 0. Total: $${total}`);

      setProcesando(true);

      const result = await pagoController.crearPago({
        id_pedido: Number(id),
        eleccion_pago: eleccion,
        monto: monto,
      });

      if (result.success && result.data?.bold_link) {
        setLinkPago(result.data.bold_link);
        setMostrarModal(true);
      } else {
        alert(result.message || 'Error al crear el pago');
      }
    } catch (error) {
      console.error('Error al pagar:', error);
      alert(error.message || 'Error al procesar el pago');
    } finally {
      setProcesando(false);
    }
  };

  const handleAbrirLink = () => {
    if (linkPago) {
      window.open(linkPago, '_blank');
      setMostrarModal(false);
      setTimeout(cargarDatos, 5000);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-100">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-sm">Cargando información del pago...</p>
      </div>
    );
  }

  const esPedidoPendiente = pedido?.estado === 'Pendiente' || (!saldo?.tiene_abono_50 && !saldo?.tiene_pago_completo);
  const estaPagado = saldo?.estado_pago === 'PAGADO_COMPLETO';
  const tieneAbono = saldo?.tiene_abono_50;

    return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-6">

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
                <i className="fa-solid fa-credit-card text-2xl text-[#B90F0F]"></i>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Pagos del pedido
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  Pedido #{id} · Gestiona el pago de tu compra.
                </p>
              </div>
            </div>

            <div
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold ${
                estaPagado
                  ? 'bg-green-50 text-green-700'
                  : tieneAbono
                  ? 'bg-blue-50 text-blue-700'
                  : 'bg-yellow-50 text-yellow-700'
              }`}
            >
              <i
                className={`fa-solid ${
                  estaPagado
                    ? 'fa-circle-check'
                    : tieneAbono
                    ? 'fa-circle-half-stroke'
                    : 'fa-clock'
                }`}
              ></i>

              {estaPagado
                ? 'Pagado completo'
                : tieneAbono
                ? 'Abonado 50%'
                : 'Pendiente de pago'}
            </div>
          </div>
        </div>

        {/* RESUMEN DEL PEDIDO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-receipt text-[#B90F0F]"></i>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Resumen del pedido
              </h2>
              <p className="text-xs text-gray-500 mt-1">
                Consulta el estado actual de tu pago.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* TOTAL */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                  <i className="fa-solid fa-file-invoice-dollar text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">
                    Total del pedido
                  </p>
                  <p className="text-lg font-bold text-gray-900 mt-1">
                    ${(pedido?.total || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* PAGADO */}
            <div className="border border-gray-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                  <i className="fa-solid fa-circle-check text-green-600"></i>
                </div>

                <div>
                  <p className="text-xs text-gray-400 uppercase font-semibold">
                    Pagado
                  </p>
                  <p className="text-lg font-bold text-green-600 mt-1">
                    ${(saldo?.total_pagado || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            {/* SALDO */}
            <div className="border border-red-100 bg-red-50 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                  <i className="fa-solid fa-wallet text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-xs text-gray-500 uppercase font-semibold">
                    Saldo pendiente
                  </p>
                  <p className="text-lg font-black text-[#B90F0F] mt-1">
                    ${(saldo?.saldo_pendiente || 0).toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ESTADO */}
          <div className="mt-5 p-4 rounded-xl border border-gray-200 bg-gray-50">
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  estaPagado
                    ? 'bg-green-100'
                    : tieneAbono
                    ? 'bg-blue-100'
                    : 'bg-yellow-100'
                }`}
              >
                <i
                  className={`fa-solid ${
                    estaPagado
                      ? 'fa-circle-check text-green-600'
                      : tieneAbono
                      ? 'fa-circle-half-stroke text-blue-600'
                      : 'fa-hourglass-half text-yellow-600'
                  }`}
                ></i>
              </div>

              <div>
                <p className="text-xs text-gray-400 uppercase font-semibold">
                  Estado del pago
                </p>

                <p className="text-sm font-bold text-gray-900 mt-1">
                  {estaPagado
                    ? '✓ Pedido pagado completamente'
                    : tieneAbono
                    ? '✓ Abono del 50% realizado'
                    : '• Sin pagos registrados'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* OPCIONES DE PAGO */}
        {!estaPagado && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-money-check-dollar text-[#B90F0F]"></i>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  {esPedidoPendiente
                    ? 'Elige tu opción de pago'
                    : 'Completa tu pago'}
                </h2>

                <p className="text-xs text-gray-500 mt-1">
                  Selecciona cómo deseas realizar el pago.
                </p>
              </div>
            </div>

            {esPedidoPendiente && (
              <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-circle-info text-blue-600"></i>
                </div>

                <p className="text-xs sm:text-sm text-blue-800 leading-5">
                  Puedes abonar el 50% ahora y pagar el resto cuando el pedido
                  esté listo, o pagar el 100% de una vez.
                </p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              {/* PAGO 50% */}
              <button
                onClick={() => handlePagar('50%')}
                disabled={tieneAbono || procesando}
                className={`text-left rounded-2xl border p-5 transition ${
                  tieneAbono || procesando
                    ? 'opacity-60 cursor-not-allowed border-gray-200'
                    : 'border-gray-200 hover:border-blue-400 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center">
                    <i className="fa-solid fa-hourglass-half text-blue-600 text-xl"></i>
                  </div>

                  {tieneAbono ? (
                    <i className="fa-solid fa-circle-check text-green-600 text-xl"></i>
                  ) : (
                    <i className="fa-solid fa-chevron-right text-gray-400"></i>
                  )}
                </div>

                <h3 className="text-base font-bold text-gray-900 mt-5">
                  {tieneAbono
                    ? 'Abono del 50% realizado'
                    : 'Pagar 50%'}
                </h3>

                <p className="text-xs text-gray-500 mt-2 leading-5">
                  {tieneAbono
                    ? 'Ya realizaste el abono del 50%.'
                    : `Abona el 50% del total ($${Math.round(
                        (pedido?.total || 0) / 2
                      ).toLocaleString()}).`}
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm font-bold text-blue-600">
                    {tieneAbono
                      ? 'Pago realizado'
                      : `$${Math.round(
                          (pedido?.total || 0) / 2
                        ).toLocaleString()}`}
                  </span>
                </div>
              </button>

              {/* PAGO 100% */}
              <button
                onClick={() => handlePagar('100%')}
                disabled={procesando}
                className={`text-left rounded-2xl border border-gray-200 p-5 transition ${
                  procesando
                    ? 'opacity-60 cursor-not-allowed'
                    : 'hover:border-green-400 hover:shadow-sm'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center">
                    <i className="fa-solid fa-money-bill-wave text-green-600 text-xl"></i>
                  </div>

                  <i className="fa-solid fa-chevron-right text-gray-400"></i>
                </div>

                <h3 className="text-base font-bold text-gray-900 mt-5">
                  {tieneAbono
                    ? 'Pagar saldo restante'
                    : 'Pagar 100%'}
                </h3>

                <p className="text-xs text-gray-500 mt-2 leading-5">
                  {tieneAbono
                    ? `Paga el saldo restante ($${(
                        saldo?.saldo_pendiente || 0
                      ).toLocaleString()}).`
                    : `Paga el total ($${(
                        pedido?.total || 0
                      ).toLocaleString()}).`}
                </p>

                <div className="mt-4 pt-4 border-t border-gray-100">
                  <span className="text-sm font-bold text-green-600">
                    $
                    {(tieneAbono
                      ? saldo?.saldo_pendiente || 0
                      : pedido?.total || 0
                    ).toLocaleString()}
                  </span>
                </div>
              </button>

            </div>

            {procesando && (
              <div className="mt-5 flex items-center justify-center gap-3 bg-gray-50 rounded-xl p-4">
                <div className="w-5 h-5 border-2 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
                <span className="text-sm text-gray-500">
                  Generando link de pago...
                </span>
              </div>
            )}
          </div>
        )}

        {/* PEDIDO PAGADO */}
        {estaPagado && (
          <div className="bg-green-50 border border-green-100 rounded-2xl p-5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center">
                <i className="fa-solid fa-circle-check text-green-600 text-2xl"></i>
              </div>

              <div>
                <h3 className="text-base font-bold text-green-900">
                  Pago completado
                </h3>
                <p className="text-xs text-green-700 mt-1">
                  Este pedido ya fue pagado completamente.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* HISTORIAL DE PAGOS */}
        {pagos.length > 0 && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-clock-rotate-left text-[#B90F0F]"></i>
              </div>

              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  Historial de pagos
                </h2>
                <p className="text-xs text-gray-500 mt-1">
                  Registro de los pagos asociados a este pedido.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {pagos.map((pago) => (
                <div
                  key={pago.id_pago}
                  className="border border-gray-200 rounded-xl p-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                    <div
                      className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                        pago.estado === 'Confirmado'
                          ? 'bg-green-50'
                          : pago.estado === 'Rechazado'
                          ? 'bg-red-50'
                          : 'bg-yellow-50'
                      }`}
                    >
                      <i
                        className={`fa-solid ${
                          pago.estado === 'Confirmado'
                            ? 'fa-circle-check text-green-600'
                            : pago.estado === 'Rechazado'
                            ? 'fa-circle-xmark text-red-500'
                            : 'fa-clock text-yellow-600'
                        } text-xl`}
                      ></i>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <p className="text-base font-bold text-gray-900">
                            {pago.montoFormateado}
                          </p>

                          <p className="text-xs text-gray-500 mt-1">
                            {pago.eleccionDisplay} · {pago.fechaFormateada}
                          </p>
                        </div>

                        <span
                          className="inline-flex items-center gap-1.5 w-fit text-xs font-bold px-3 py-1.5 rounded-lg"
                          style={{
                            backgroundColor: `${pago.estadoColor}20`,
                            color: pago.estadoColor,
                          }}
                        >
                          <i className="fa-solid fa-circle text-[7px]"></i>
                          {pago.estadoDisplay}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEGURIDAD */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-shield-halved text-[#B90F0F] text-xl"></i>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Pago seguro
              </h3>

              <p className="text-xs text-gray-500 leading-5 mt-1">
                Serás redirigido a la plataforma de Bold para completar el
                pago de forma segura.
              </p>
            </div>
          </div>
        </div>

        {/* MODAL */}
        {mostrarModal && (
          <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-2xl p-6 w-full max-w-md">
              <div className="flex flex-col items-center text-center">
                <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center">
                  <i className="fa-solid fa-lock-open text-[#B90F0F] text-3xl"></i>
                </div>

                <h3 className="text-xl font-bold text-gray-900 mt-5">
                  ¡Casi listo!
                </h3>

                <p className="text-sm text-gray-500 leading-6 mt-2">
                  Serás redirigido a la plataforma de Bold para completar tu
                  pago de forma segura.
                </p>

                <div className="flex flex-col sm:flex-row gap-3 w-full mt-6">
                  <button
                    onClick={() => setMostrarModal(false)}
                    className="flex-1 h-11 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancelar
                  </button>

                  <button
                    onClick={handleAbrirLink}
                    className="flex-1 h-11 bg-[#B90F0F] text-white rounded-xl font-bold hover:bg-[#9f0d0d] transition flex items-center justify-center gap-2"
                  >
                    Ir a Bold
                    <i className="fa-solid fa-arrow-up-right-from-square"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default PagosCliente;