// src/features/admin/pages/DetallePedidosAdmin.jsx
import React, { useCallback, useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { PedidoController } from '../../../core/controllers/PedidoController';

const pedidoController = new PedidoController();

const ESTADOS_ACTIVOS = ['Abonado', 'Listo', 'Pagado', 'En Proceso', 'Enviado', 'Entregado'];
const ESTADOS_EDITABLES = ['Abonado', 'Listo', 'Pagado', 'En Proceso'];

const DetallePedidosAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const esAdmin = location.state?.esAdmin ?? true;
  const id_pedido = id;

  const [pedido, setPedido] = useState(null);
  const [loading, setLoading] = useState(true);
  const [marcandoListo, setMarcandoListo] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState(null);

  // FECHA ESTIMADA
  const [modalFechaEstimada, setModalFechaEstimada] = useState(false);
  const [fechaEstimadaInput, setFechaEstimadaInput] = useState('');
  const [mesCalendario, setMesCalendario] = useState(new Date());
  const [guardandoFechaEstimada, setGuardandoFechaEstimada] = useState(false);

  const cargarPedido = useCallback(async () => {
    if (!id_pedido) {
      alert('No se recibió el identificador del pedido.');
      navigate(-1);
      return;
    }

    try {
      setLoading(true);

      if (!esAdmin) {
        const misPedidos = await pedidoController.getMisPedidos();
        const pedidoCliente = misPedidos.find((item) => Number(item.id_pedido) === Number(id_pedido));

        if (!pedidoCliente) {
          alert('No puedes consultar este pedido porque no pertenece a tu cuenta.');
          navigate(-1);
          return;
        }

        const detalle = await pedidoController.getPedidoById(Number(id_pedido));
        if (!detalle) {
          alert('No fue posible encontrar el pedido.');
          navigate(-1);
          return;
        }
        setPedido(detalle);
        return;
      }

      const detalle = await pedidoController.getPedidoById(Number(id_pedido));

      if (!detalle) {
        alert('No fue posible encontrar el pedido.');
        navigate(-1);
        return;
      }

      if (!ESTADOS_ACTIVOS.includes(detalle.estado)) {
        alert('El administrador solo puede consultar pedidos activos.');
        navigate(-1);
        return;
      }

      setPedido(detalle);
    } catch (error) {
      console.error('Error cargando detalle del pedido:', error);
      alert('No fue posible cargar la información del pedido.');
    } finally {
      setLoading(false);
    }
  }, [id_pedido, esAdmin, navigate]);

  useEffect(() => {
    cargarPedido();
  }, [cargarPedido]);

  const marcarComoListo = async () => {
    if (!pedido) return;

    if (pedido.estado !== 'Abonado') {
      alert('El pedido debe estar en estado ABONADO.');
      return;
    }

    if (!window.confirm('¿Estás seguro de que las gafas ya están listas para que el cliente pague el saldo restante?')) return;

    try {
      setMarcandoListo(true);
      const resultado = await pedidoController.marcarPedidoComoListo(Number(pedido.id_pedido));

      if (!resultado.success) {
        alert(resultado.message || 'No fue posible marcar el pedido como LISTO.');
        return;
      }

      alert(resultado.message || 'El pedido ha sido marcado como LISTO.');
      await cargarPedido();
    } catch (error) {
      console.error('Error marcando pedido como LISTO:', error);
      alert(error?.response?.data?.message || error?.message || 'No fue posible marcar el pedido como LISTO.');
    } finally {
      setMarcandoListo(false);
    }
  };

  const abrirModalFechaEstimada = () => {
    if (!pedido) return;

    if (!ESTADOS_EDITABLES.includes(pedido.estado)) {
      alert(
        `El pedido está en estado "${pedido.estadoDisplay}". Solo se puede editar cuando está en: Abonado, Listo, Pagado o En Proceso.`
      );
      return;
    }

    let fechaInicial = '';
    if (pedido.fecha_estimada) {
      const fecha = new Date(pedido.fecha_estimada);
      if (!isNaN(fecha.getTime())) fechaInicial = fecha.toISOString().split('T')[0];
    }

    setFechaEstimadaInput(fechaInicial);
    const fechaCalendario = fechaInicial ? new Date(`${fechaInicial}T00:00:00`) : new Date();
    setMesCalendario(isNaN(fechaCalendario.getTime()) ? new Date() : fechaCalendario);
    setModalFechaEstimada(true);
  };

  const formatearFechaSeleccionada = (fecha) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const seleccionarFechaCalendario = (fecha) => {
    setFechaEstimadaInput(formatearFechaSeleccionada(fecha));
  };

  const cambiarMesCalendario = (cantidad) => {
    setMesCalendario((prev) => {
      const nuevaFecha = new Date(prev);
      nuevaFecha.setMonth(nuevaFecha.getMonth() + cantidad);
      return nuevaFecha;
    });
  };

  const obtenerDiasCalendario = () => {
    const year = mesCalendario.getFullYear();
    const month = mesCalendario.getMonth();
    const primerDia = new Date(year, month, 1).getDay();
    const diasDelMes = new Date(year, month + 1, 0).getDate();
    const diasMesAnterior = new Date(year, month, 0).getDate();
    const dias = [];

    const inicioLunes = primerDia === 0 ? 6 : primerDia - 1;

    for (let i = inicioLunes - 1; i >= 0; i--) {
      dias.push({ fecha: new Date(year, month - 1, diasMesAnterior - i), otroMes: true });
    }

    for (let dia = 1; dia <= diasDelMes; dia++) {
      dias.push({ fecha: new Date(year, month, dia), otroMes: false });
    }

    let siguienteDia = 1;
    while (dias.length < 42) {
      dias.push({ fecha: new Date(year, month + 1, siguienteDia++), otroMes: true });
    }

    return dias;
  };

  const esFechaAnteriorAHoy = (fecha) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaComparar = new Date(fecha);
    fechaComparar.setHours(0, 0, 0, 0);
    return fechaComparar < hoy;
  };

  const esFechaSeleccionada = (fecha) => {
    if (!fechaEstimadaInput) return false;
    return formatearFechaSeleccionada(fecha) === fechaEstimadaInput;
  };

  const guardarFechaEstimada = async () => {
    if (!pedido) return;

    const fecha = fechaEstimadaInput.trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      alert('Selecciona una fecha en el calendario.');
      return;
    }

    const fechaComprobacion = new Date(`${fecha}T00:00:00`);
    if (isNaN(fechaComprobacion.getTime()) || esFechaAnteriorAHoy(fechaComprobacion)) {
      alert('Selecciona hoy o una fecha posterior.');
      return;
    }

    try {
      setGuardandoFechaEstimada(true);
      const resultado = await pedidoController.actualizarFechaEstimada(Number(pedido.id_pedido), fecha);

      if (!resultado.success) {
        alert(resultado.message || 'No fue posible actualizar la fecha estimada.');
        return;
      }

      setModalFechaEstimada(false);
      alert(resultado.message || 'La fecha estimada del pedido fue actualizada correctamente.');
      await cargarPedido();
    } catch (error) {
      console.error('Error actualizando fecha estimada:', error);
      alert(error?.response?.data?.message || error?.message || 'No fue posible actualizar la fecha estimada.');
    } finally {
      setGuardandoFechaEstimada(false);
    }
  };

  // HELPERS
  const formatearDinero = (valor) => `$${Number(valor || 0).toLocaleString('es-CO')}`;

  const obtenerNombreProducto = (producto) =>
    producto?.nombre || producto?.nombre_producto || producto?.producto?.nombre || 'Producto';

  const obtenerCantidad = (producto) =>
    producto?.cantidad || producto?.cantidad_producto || producto?.producto?.cantidad || 1;

  const obtenerPrecio = (producto) =>
    Number(producto?.precio || producto?.precio_unitario || producto?.producto?.precio || 0);

  const obtenerImagen = (producto) =>
    producto?.imagen || producto?.imagen_producto || producto?.producto?.imagen || producto?.url_imagen || null;

  const obtenerIconoEstado = () => {
    if (!pedido) return 'fa-circle';
    switch (pedido.estado) {
      case 'Abonado': return 'fa-credit-card';
      case 'Listo': return 'fa-circle-check';
      case 'Pagado': return 'fa-check-double';
      case 'En Proceso': return 'fa-wrench';
      case 'Enviado': return 'fa-truck';
      case 'Entregado': return 'fa-circle-check';
      case 'Cancelado': return 'fa-circle-xmark';
      case 'Pendiente': return 'fa-clock';
      default: return 'fa-clock';
    }
  };

  const colorEstado = pedido?.estadoColor || '#6B7280';

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
        <button
          onClick={() => navigate(-1)}
          className="mt-5 bg-[#B90F0F] text-white px-7 py-2.5 rounded-lg font-bold"
        >
          Volver
        </button>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      {/* VISOR IMAGEN */}
      {imagenAmpliada && (
        <div
          className="fixed inset-0 bg-black/95 z-[1000] flex items-center justify-center"
          onClick={() => setImagenAmpliada(null)}
        >
          <button className="absolute top-6 right-5 p-2.5 rounded-full bg-white/15 z-10">
            <i className="fa-solid fa-xmark text-white text-3xl"></i>
          </button>

          <img
            src={imagenAmpliada}
            alt="Imagen ampliada"
            className="max-w-[95%] max-h-[85vh] object-contain"
          />

          <p className="absolute bottom-6 text-white text-xs opacity-70">
            Toca × para cerrar
          </p>
        </div>
      )}

      {/* MODAL FECHA */}
      {modalFechaEstimada && (
        <div
          className="fixed inset-0 bg-black/45 z-[1000] flex items-center justify-center px-4 sm:px-6"
          onClick={() => !guardandoFechaEstimada && setModalFechaEstimada(false)}
        >
          <div
            className="w-full max-w-[420px] bg-white rounded-2xl p-[18px] shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-5">
              <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mr-3">
                <i className="fa-solid fa-calendar text-[#B90F0F] text-xl"></i>
              </div>

              <div className="flex-1">
                <p className="text-base font-extrabold text-gray-800">
                  Fecha estimada
                </p>
                <p className="text-[11px] text-gray-500 mt-0.5">
                  Define cuándo estará listo el pedido.
                </p>
              </div>
            </div>

            <p className="text-xs font-bold text-gray-800 mb-1.5">
              Selecciona la fecha
            </p>

            {/* CALENDARIO */}
            <div className="border border-gray-200 rounded-xl p-2.5 bg-gray-50">
              <div className="flex items-center justify-between mb-2.5">
                <button
                  onClick={() => cambiarMesCalendario(-1)}
                  disabled={guardandoFechaEstimada}
                  className="w-[34px] h-[34px] rounded-full flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-100"
                >
                  <i className="fa-solid fa-chevron-left text-gray-700"></i>
                </button>

                <p className="flex-1 text-center text-sm font-extrabold text-gray-800">
                  {mesCalendario
                    .toLocaleDateString('es-CO', {
                      month: 'long',
                      year: 'numeric',
                    })
                    .replace(/^./, (l) => l.toUpperCase())}
                </p>

                <button
                  onClick={() => cambiarMesCalendario(1)}
                  disabled={guardandoFechaEstimada}
                  className="w-[34px] h-[34px] rounded-full flex items-center justify-center bg-white border border-gray-200 hover:bg-gray-100"
                >
                  <i className="fa-solid fa-chevron-right text-gray-700"></i>
                </button>
              </div>

              <div className="flex mb-1">
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((dia, i) => (
                  <span
                    key={`${dia}-${i}`}
                    className="w-[14.2857%] text-center text-[10px] font-extrabold text-gray-500 py-1"
                  >
                    {dia}
                  </span>
                ))}
              </div>

              <div className="flex flex-wrap">
                {obtenerDiasCalendario().map(({ fecha, otroMes }, index) => {
                  const deshabilitada = esFechaAnteriorAHoy(fecha);
                  const seleccionada = esFechaSeleccionada(fecha);

                  return (
                    <button
                      key={`${formatearFechaSeleccionada(fecha)}-${index}`}
                      onClick={() =>
                        !deshabilitada &&
                        !guardandoFechaEstimada &&
                        seleccionarFechaCalendario(fecha)
                      }
                      disabled={deshabilitada || guardandoFechaEstimada}
                      className={`w-[14.2857%] h-[38px] flex items-center justify-center rounded-full text-xs font-semibold transition ${
                        seleccionada
                          ? 'bg-[#B90F0F] text-white font-extrabold'
                          : deshabilitada
                          ? 'text-gray-300'
                          : otroMes
                          ? 'text-gray-400 opacity-35'
                          : 'text-gray-800 hover:bg-red-50'
                      }`}
                    >
                      {fecha.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="flex items-center mt-2.5 px-2.5 min-h-[40px] rounded-lg bg-red-50">
              <i className="fa-solid fa-calendar text-[#B90F0F]"></i>

              <p className="flex-1 ml-2 text-xs font-bold text-gray-800">
                {fechaEstimadaInput
                  ? new Date(
                      `${fechaEstimadaInput}T00:00:00`
                    ).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Selecciona un día'}
              </p>
            </div>

            <div className="flex justify-end mt-5 gap-2">
              <button
                onClick={() => setModalFechaEstimada(false)}
                disabled={guardandoFechaEstimada}
                className="min-h-[44px] px-4 rounded-lg text-gray-500 text-[13px] font-bold hover:bg-gray-100"
              >
                Cancelar
              </button>

              <button
                onClick={guardarFechaEstimada}
                disabled={guardandoFechaEstimada}
                className="min-h-[44px] px-4 rounded-lg bg-[#B90F0F] flex items-center gap-1.5 text-white text-[13px] font-extrabold disabled:opacity-60 hover:bg-[#9f0d0d]"
              >
                {guardandoFechaEstimada ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    Guardar
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        {/* HEADER */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-5">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-file-lines text-[#B90F0F] text-xl"></i>
            </div>

            <div className="flex-1">
              <p className="text-xl sm:text-2xl font-extrabold text-gray-800">
                Detalle del pedido
              </p>
              <p className="text-sm text-gray-500 mt-1">
                Pedido #{pedido.id_pedido}
              </p>
            </div>

            <div
              className="inline-flex items-center gap-2 px-3 py-2 rounded-lg self-start sm:self-center"
              style={{
                backgroundColor: `${colorEstado}15`,
                color: colorEstado,
              }}
            >
              <i className={`fa-solid ${obtenerIconoEstado()}`}></i>
              <span className="text-sm font-bold">
                {pedido.estadoDisplay}
              </span>
            </div>
          </div>
        </div>

        {/* MARCAR COMO LISTO */}
        {esAdmin && pedido.estado === 'Abonado' && (
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center flex-shrink-0">
                <i className="fa-solid fa-circle-check text-[#B90F0F] text-2xl"></i>
              </div>

              <div className="flex-1">
                <p className="text-base font-extrabold text-gray-800 mb-1">
                  Pedido listo para continuar
                </p>

                <p className="text-sm text-gray-500 leading-5">
                  Marca el pedido como LISTO cuando las gafas estén terminadas
                  y el cliente pueda pagar el saldo restante.
                </p>
              </div>

              <button
                onClick={marcarComoListo}
                disabled={marcandoListo}
                className="w-full sm:w-auto min-h-[44px] px-5 rounded-lg bg-[#B90F0F] flex items-center justify-center gap-2 text-white disabled:opacity-60 hover:bg-[#9f0d0d] transition"
              >
                {marcandoListo ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-[13px] font-extrabold">
                      Actualizando...
                    </span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-circle-check"></i>
                    <span className="text-[13px] font-extrabold">
                      Marcar como LISTO
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* INFORMACIÓN DEL PEDIDO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-5">
          <div className="flex items-center gap-2 mb-5">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-circle-info text-[#B90F0F]"></i>
            </div>
            <p className="text-lg font-extrabold text-gray-800">
              Información del pedido
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Fecha</p>
              <p className="text-sm font-bold text-gray-800">
                {pedido.fechaFormateada}
              </p>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Fecha estimada</p>
                  <p className="text-sm font-bold text-gray-800">
                    {pedido.fecha_estimada
                      ? pedido.fechaEstimadaFormateada
                      : 'No establecida'}
                  </p>
                </div>

                {esAdmin && ESTADOS_EDITABLES.includes(pedido.estado) && (
                  <button
                    onClick={abrirModalFechaEstimada}
                    className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0 hover:bg-red-100 transition"
                  >
                    <i className="fa-solid fa-calendar text-[#B90F0F]"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Productos</p>
              <p className="text-sm font-bold text-gray-800">
                {pedido.productos?.length || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* PRODUCTOS */}
          {pedido.productos && pedido.productos.length > 0 && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                    <i className="fa-solid fa-box text-[#B90F0F]"></i>
                  </div>
                  <p className="text-lg font-extrabold text-gray-800">
                    Productos
                  </p>
                </div>

                <span className="min-w-[28px] h-7 rounded-full px-2 bg-[#B90F0F] text-white text-xs font-extrabold flex items-center justify-center">
                  {pedido.productos.length}
                </span>
              </div>

              <div className="space-y-3">
                {pedido.productos.map((producto, index) => {
                  const nombre = obtenerNombreProducto(producto);
                  const cantidad = obtenerCantidad(producto);
                  const precio = obtenerPrecio(producto);
                  const imagen = obtenerImagen(producto);

                  return (
                    <div
                      key={
                        producto?.id_producto ||
                        producto?.producto?.id_producto ||
                        index
                      }
                      className="flex items-center gap-3 p-3 rounded-xl bg-gray-50"
                    >
                      {imagen ? (
                        <button
                          onClick={() => setImagenAmpliada(imagen)}
                          className="flex-shrink-0"
                        >
                          <img
                            src={imagen}
                            alt={nombre}
                            className="w-16 h-16 rounded-lg bg-white object-cover border border-gray-200"
                          />
                        </button>
                      ) : (
                        <div className="w-16 h-16 rounded-lg bg-white border border-gray-200 flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-cube text-gray-400 text-2xl"></i>
                        </div>
                      )}

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-800 truncate">
                          {nombre}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Cantidad: {cantidad}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {formatearDinero(precio)} c/u
                        </p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <p className="text-sm font-extrabold text-[#B90F0F]">
                          {formatearDinero(precio * Number(cantidad))}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* CLIENTE */}
          {pedido.cliente && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                  <i className="fa-solid fa-user text-[#B90F0F]"></i>
                </div>
                <p className="text-lg font-extrabold text-gray-800">
                  Datos del cliente
                </p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-user text-[#B90F0F]"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Nombre</p>
                    <p className="text-sm font-semibold text-gray-800 break-words">
                      {pedido.cliente.nombre}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-phone text-[#B90F0F]"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Teléfono</p>
                    <p className="text-sm font-semibold text-gray-800 break-words">
                      {pedido.cliente.telefono}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                  <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-envelope text-[#B90F0F]"></i>
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-500">Correo electrónico</p>
                    <p className="text-sm font-semibold text-gray-800 break-words">
                      {pedido.cliente.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ENTREGA */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-truck text-[#B90F0F]"></i>
              </div>
              <p className="text-lg font-extrabold text-gray-800">
                Información de entrega
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-location-dot text-[#B90F0F]"></i>
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Dirección</p>
                  <p className="text-sm font-semibold text-gray-800 break-words">
                    {pedido.direccion_entrega || 'No especificada'}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-9 h-9 rounded-full bg-white flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-building text-[#B90F0F]"></i>
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-gray-500 mb-1">Ciudad</p>
                  <p className="text-sm font-semibold text-gray-800">
                    {pedido.ciudad_envio || 'No especificada'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FÓRMULA */}
          {pedido.formula && (
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
                  <i className="fa-solid fa-file-medical text-[#B90F0F]"></i>
                </div>
                <p className="text-lg font-extrabold text-gray-800">
                  Fórmula asociada
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                {pedido.formula.imagen_formula && (
                  <button
                    onClick={() =>
                      setImagenAmpliada(pedido.formula.imagen_formula)
                    }
                    className="flex-shrink-0 self-start"
                  >
                    <img
                      src={pedido.formula.imagen_formula}
                      alt="Fórmula"
                      className="w-[100px] h-[120px] rounded-xl bg-gray-100 object-cover border border-gray-200"
                    />
                  </button>
                )}

                <div className="flex-1 min-w-0">
                  {pedido.formula.condicion && (
                    <p className="text-sm font-extrabold text-gray-800 mb-3">
                      {pedido.formula.condicion}
                    </p>
                  )}

                  {pedido.formula.observaciones && (
                    <div className="p-3 rounded-xl bg-gray-50 mb-3">
                      <p className="text-xs text-gray-500 mb-1">
                        Observaciones
                      </p>
                      <p className="text-sm text-gray-800 leading-5 break-words">
                        {pedido.formula.observaciones}
                      </p>
                    </div>
                  )}

                  <div className="flex justify-between items-center p-3 rounded-xl bg-red-50">
                    <span className="text-xs text-gray-600">
                      Costo de fórmula
                    </span>
                    <span className="text-sm font-extrabold text-[#B90F0F]">
                      {formatearDinero(pedido.formula.costo)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RESUMEN */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mt-5">
          <div className="flex items-center gap-2 mb-4">
            <div className="w-9 h-9 rounded-lg bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-receipt text-[#B90F0F]"></i>
            </div>

            <p className="text-lg font-extrabold text-gray-800">
              Resumen del pedido
            </p>
          </div>

          <div className="flex justify-between items-center py-2">
            <span className="text-sm text-gray-500">Costo de envío</span>
            <span className="text-sm font-semibold text-gray-800">
              {formatearDinero(pedido.costo_envio)}
            </span>
          </div>

          <div className="h-px bg-gray-200 my-2"></div>

          <div className="flex justify-between items-center pt-2">
            <span className="text-xl font-extrabold text-gray-800">
              Total
            </span>

            <span className="text-2xl font-black text-[#B90F0F]">
              {pedido.totalFormateado}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DetallePedidosAdmin;