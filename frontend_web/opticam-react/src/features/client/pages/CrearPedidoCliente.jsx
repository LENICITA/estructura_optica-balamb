// src/features/client/pages/CrearPedidoCliente.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { PedidoController } from '../../../core/controllers/PedidoController';
import { FormulaController } from '../../../core/controllers/FormulaController';
import { UserController } from '../../../core/controllers/UserController';
import { validarFormularioPedido } from '../../../shared/validators/pedidoValidators';

export const CrearPedidoCliente = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [direccion, setDireccion] = useState('');
  const [ciudad, setCiudad] = useState('');

  const [productos, setProductos] = useState([]);
  const [formulas, setFormulas] = useState([]);
  const [formulaSeleccionada, setFormulaSeleccionada] = useState(null);
  const [mostrarSelectorFormula, setMostrarSelectorFormula] = useState(false);

  const [subtotal, setSubtotal] = useState(0);
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [costoFormula, setCostoFormula] = useState(0);
  const [total, setTotal] = useState(0);
  const [fechaEstimada, setFechaEstimada] = useState('');

  const pedidoController = new PedidoController();
  const formulaController = new FormulaController();
  const userController = new UserController();

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      const carritoGuardado = localStorage.getItem('carrito_seleccionado');
      const productosData = carritoGuardado ? JSON.parse(carritoGuardado) : [];

      if (productosData.length === 0) {
        alert('No hay productos seleccionados');
        navigate('/carrito');
        return;
      }

      setProductos(productosData);
      calcularSubtotal(productosData);

      await cargarDireccionUsuario();

      if (user?.id_usuario) {
        const formulasData = await formulaController.getFormulasByUsuario(user.id_usuario);
        const formulasAprobadas = formulasData.filter((f) => f.estado === 'Aprobado');
        setFormulas(formulasAprobadas);
      }

      const fecha = new Date();
      const dias = 8 + Math.floor(Math.random() * 3);
      fecha.setDate(fecha.getDate() + dias);
      setFechaEstimada(fecha.toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' }));
    } catch (error) {
      console.error('Error cargando datos:', error);
      alert('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const cargarDireccionUsuario = async () => {
    try {
      const userProfile = await userController.getProfile();
      if (userProfile) {
        if (userProfile.direccion) setDireccion(userProfile.direccion);
        if (userProfile.ciudad) {
          setCiudad(userProfile.ciudad);
          setCostoEnvio(calcularCostoEnvio(userProfile.ciudad));
        }
      }
    } catch (error) {
      console.error('Error cargando dirección:', error);
    }
  };

  const calcularSubtotal = (items) => {
    const t = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
    setSubtotal(t);
    calcularTotal(t);
  };

  const calcularTotal = (subtotalActual) => {
    const sub = subtotalActual !== undefined ? subtotalActual : subtotal;
    const envio = calcularCostoEnvio(ciudad);
    const formulaCost = formulaSeleccionada
      ? formulas.find((f) => f.id_formula === formulaSeleccionada)?.costo || 0
      : 0;

    setCostoEnvio(envio);
    setCostoFormula(formulaCost);
    setTotal(sub + envio + formulaCost);
  };

  const calcularCostoEnvio = (ciudadParam) => {
    const c = ciudadParam.toLowerCase().trim();
    if (c === 'bogotá' || c === 'bogota') return 0;
    return 10000;
  };

  const handleCiudadChange = (text) => {
    setCiudad(text);
    const envio = calcularCostoEnvio(text);
    setCostoEnvio(envio);
    setTotal(subtotal + envio + costoFormula);
  };

  const seleccionarFormula = (id) => {
    setFormulaSeleccionada(id);
    setMostrarSelectorFormula(false);
    const formulaCost = id ? formulas.find((f) => f.id_formula === id)?.costo || 0 : 0;
    setCostoFormula(formulaCost);
    setTotal(subtotal + costoEnvio + formulaCost);
  };

  const confirmarPedido = async () => {
    const check = validarFormularioPedido({
      direccion_entrega: direccion,
      ciudad_envio: ciudad,
      productos: productos.map((item) => ({ id_producto: item.id_producto, cantidad: item.cantidad })),
    });

    if (!check.valido) return alert(check.mensaje || 'Datos inválidos');

    setEnviando(true);

    try {
      const data = {
        direccion_entrega: direccion.trim(),
        ciudad_envio: ciudad.trim(),
        id_formula: formulaSeleccionada || undefined,
        productos: productos.map((item) => ({ id_producto: item.id_producto, cantidad: item.cantidad })),
      };

      const result = await pedidoController.crearPedido(data);

      if (result.success) {
        localStorage.removeItem('@carrito');
        localStorage.removeItem('carrito_seleccionado');

        const idPedidoCreado = result.data?.id_pedido;
        alert('Tu pedido ha sido creado exitosamente.');
        navigate(`/cliente/mis-pedidos`);
      } else {
        alert(result.message || 'Error al crear el pedido');
      }
    } catch (error) {
      console.error('Error creando pedido:', error);
      alert(error.message || 'Error al crear el pedido');
    } finally {
      setEnviando(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-100">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-sm">Cargando datos...</p>
      </div>
    );
  }

    return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 pb-32">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(-1)}
              className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
            >
              <i className="fa-solid fa-arrow-left"></i>
            </button>

            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-bag-shopping text-2xl text-[#B90F0F]"></i>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Crear pedido
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Completa los datos para confirmar tu pedido.
              </p>
            </div>
          </div>
        </div>

        {/* CONTENIDO */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">

          {/* FORMULARIO */}
          <div className="xl:col-span-2 space-y-6">

            {/* DATOS DEL CLIENTE */}
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
                    Información asociada a tu cuenta.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Nombre
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-1 break-words">
                    {user?.nombre_completo || 'N/A'}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Email
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-1 break-all">
                    {user?.email || 'N/A'}
                  </p>
                </div>

                <div className="border border-gray-200 rounded-xl p-4">
                  <p className="text-xs font-semibold text-gray-400 uppercase">
                    Teléfono
                  </p>
                  <p className="text-sm font-bold text-gray-900 mt-1">
                    {user?.telefono || 'N/A'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 mt-4 bg-gray-50 rounded-xl p-3">
                <i className="fa-solid fa-circle-info text-gray-400 text-sm"></i>
                <p className="text-xs text-gray-500">
                  Estos datos no son editables desde esta sección.
                </p>
              </div>
            </div>

            {/* DIRECCIÓN */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <i className="fa-solid fa-location-dot text-[#B90F0F]"></i>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Dirección de entrega
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Indica dónde deseas recibir tu pedido.
                    </p>
                  </div>
                </div>

                <button
                  onClick={cargarDireccionUsuario}
                  className="flex items-center justify-center gap-2 border border-[#B90F0F] text-[#B90F0F] px-4 py-2.5 rounded-xl text-xs font-bold hover:bg-red-50 transition"
                >
                  <i className="fa-solid fa-rotate"></i>
                  Usar mi dirección guardada
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Dirección *
                  </label>

                  <input
                    type="text"
                    placeholder="Calle, número, barrio..."
                    value={direccion}
                    onChange={(e) => setDireccion(e.target.value)}
                    maxLength={45}
                    className="w-full h-12 border border-gray-300 rounded-xl px-4 text-sm outline-none focus:border-[#B90F0F] transition"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Ciudad de envío *
                  </label>

                  <input
                    type="text"
                    placeholder="Ej: Bogotá, Medellín..."
                    value={ciudad}
                    onChange={(e) => handleCiudadChange(e.target.value)}
                    maxLength={45}
                    className="w-full h-12 border border-gray-300 rounded-xl px-4 text-sm outline-none focus:border-[#B90F0F] transition"
                  />

                  {ciudad.trim() && (
                    <div className="flex items-center gap-2 mt-2">
                      <i
                        className={`fa-solid ${
                          calcularCostoEnvio(ciudad) === 0
                            ? 'fa-circle-check text-green-600'
                            : 'fa-truck text-gray-500'
                        } text-xs`}
                      ></i>

                      <p className="text-xs text-gray-500">
                        {calcularCostoEnvio(ciudad) === 0
                          ? 'Envío gratis en Bogotá'
                          : `Costo de envío: $${calcularCostoEnvio(
                              ciudad
                            ).toLocaleString()}`}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            </div>

            {/* FÓRMULA */}
            {formulas.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <i className="fa-solid fa-file-medical text-[#B90F0F]"></i>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-gray-900">
                      Fórmula óptica
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">
                      Selecciona una fórmula aprobada si deseas utilizarla.
                    </p>
                  </div>
                </div>

                {formulaSeleccionada ? (
                  <div className="border border-[#B90F0F] bg-red-50 rounded-xl p-4">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">
                          <i className="fa-solid fa-file-circle-check text-[#B90F0F]"></i>
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-gray-500 uppercase">
                            Fórmula seleccionada
                          </p>

                          <p className="text-sm font-bold text-gray-900 mt-1">
                            {formulas.find(
                              (f) => f.id_formula === formulaSeleccionada
                            )?.condicion || 'Fórmula'}
                          </p>
                        </div>
                      </div>

                      <button
                        onClick={() => setMostrarSelectorFormula(true)}
                        className="text-sm font-bold text-[#B90F0F] hover:underline"
                      >
                        Cambiar
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setMostrarSelectorFormula(true)}
                    className="w-full flex items-center justify-between border border-gray-300 rounded-xl p-4 hover:border-[#B90F0F] transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center">
                        <i className="fa-solid fa-file-medical text-[#B90F0F]"></i>
                      </div>

                      <div className="text-left">
                        <p className="text-sm font-bold text-gray-800">
                          Seleccionar fórmula
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Opcional
                        </p>
                      </div>
                    </div>

                    <i className="fa-solid fa-chevron-down text-[#B90F0F]"></i>
                  </button>
                )}

                {mostrarSelectorFormula && (
                  <div className="mt-4 border border-gray-200 rounded-xl overflow-hidden">

                    <button
                      onClick={() => seleccionarFormula(null)}
                      className={`w-full flex justify-between items-center p-4 transition ${
                        !formulaSeleccionada
                          ? 'bg-red-50'
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="text-left">
                        <p
                          className={`text-sm font-semibold ${
                            !formulaSeleccionada
                              ? 'text-[#B90F0F]'
                              : 'text-gray-800'
                          }`}
                        >
                          Ninguna
                        </p>

                        <p className="text-xs text-gray-400 mt-1">
                          No utilizar fórmula
                        </p>
                      </div>

                      {!formulaSeleccionada && (
                        <i className="fa-solid fa-check text-[#B90F0F]"></i>
                      )}
                    </button>

                    {formulas.map((f) => (
                      <button
                        key={f.id_formula}
                        onClick={() => seleccionarFormula(f.id_formula)}
                        className={`w-full flex justify-between items-center p-4 border-t border-gray-100 transition ${
                          formulaSeleccionada === f.id_formula
                            ? 'bg-red-50'
                            : 'hover:bg-gray-50'
                        }`}
                      >
                        <div className="text-left">
                          <p
                            className={`text-sm font-semibold ${
                              formulaSeleccionada === f.id_formula
                                ? 'text-[#B90F0F]'
                                : 'text-gray-800'
                            }`}
                          >
                            {f.condicion}
                          </p>

                          <p className="text-xs text-gray-400 mt-1">
                            {f.costo > 0
                              ? `+ $${f.costo.toLocaleString()}`
                              : 'Sin costo'}
                          </p>
                        </div>

                        {formulaSeleccionada === f.id_formula && (
                          <i className="fa-solid fa-check text-[#B90F0F]"></i>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

          {/* RESUMEN */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 xl:sticky xl:top-6">

              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <i className="fa-solid fa-receipt text-[#B90F0F]"></i>
                </div>

                <div>
                  <h2 className="text-lg font-bold text-gray-900">
                    Resumen del pedido
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Revisa los valores antes de confirmar.
                  </p>
                </div>
              </div>

              {/* PRODUCTOS */}
              <div className="space-y-3">
                {productos.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between gap-4"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {item.nombre}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">
                        Cantidad: {item.cantidad}
                      </p>
                    </div>

                    <span className="text-sm font-semibold text-gray-800 whitespace-nowrap">
                      ${(item.precio * item.cantidad).toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>

              <div className="h-px bg-gray-200 my-5"></div>

              {/* VALORES */}
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Subtotal
                  </span>

                  <span className="text-sm font-semibold text-gray-800">
                    ${subtotal.toLocaleString()}
                  </span>
                </div>

                {costoFormula > 0 && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-500">
                      Fórmula
                    </span>

                    <span className="text-sm font-semibold text-gray-800">
                      ${costoFormula.toLocaleString()}
                    </span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span className="text-sm text-gray-500">
                    Envío
                  </span>

                  <span className="text-sm font-semibold text-gray-800">
                    {costoEnvio === 0
                      ? 'Gratis'
                      : `$${costoEnvio.toLocaleString()}`}
                  </span>
                </div>
              </div>

              <div className="h-px bg-gray-200 my-5"></div>

              {/* TOTAL */}
              <div className="flex justify-between items-end gap-3">
                <span className="text-base font-bold text-gray-900">
                  Total
                </span>

                <span className="text-2xl font-black text-[#B90F0F]">
                  ${total.toLocaleString()}
                </span>
              </div>

              {/* FECHA */}
              <div className="mt-5 bg-gray-50 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <i className="fa-solid fa-calendar text-[#B90F0F] mt-0.5"></i>

                  <div>
                    <p className="text-xs font-semibold text-gray-500">
                      Fecha estimada de entrega
                    </p>

                    <p className="text-sm font-bold text-gray-800 mt-1">
                      {fechaEstimada}
                    </p>
                  </div>
                </div>
              </div>

              {/* CONFIRMAR */}
              <button
                onClick={confirmarPedido}
                disabled={enviando}
                className="w-full h-12 mt-5 bg-[#B90F0F] text-white rounded-xl font-bold text-sm hover:bg-[#9f0d0d] transition disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {enviando ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Creando pedido...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-check"></i>
                    Confirmar pedido
                  </>
                )}
              </button>

              <button
                onClick={() => navigate(-1)}
                disabled={enviando}
                className="w-full h-11 mt-3 border border-gray-300 rounded-xl text-gray-700 font-semibold text-sm hover:bg-gray-50 transition"
              >
                Volver al carrito
              </button>

            </div>
          </div>

        </div>

        {/* INFORMACIÓN */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-circle-info text-[#B90F0F]"></i>
            </div>

            <div>
              <h3 className="text-sm font-bold text-gray-900">
                Información importante
              </h3>

              <p className="text-xs text-gray-500 leading-5 mt-1">
                Verifica que la dirección y ciudad de entrega sean correctas
                antes de confirmar tu pedido.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CrearPedidoCliente;