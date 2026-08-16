import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Checkout = () => {
  const navigate = useNavigate();
  const [carrito, setCarrito] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [envio, setEnvio] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true); // ✅ Iniciar en true
  const [error, setError] = useState(null);
  const [metodoPago, setMetodoPago] = useState('tarjeta');
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    cedula: '',
    direccion: '',
    ciudad: '',
    notas: ''
  });
  const [tarjetaData, setTarjetaData] = useState({
    numero: '',
    expiracion: '',
    cvv: ''
  });
  const [nequiPhone, setNequiPhone] = useState('');
  const [pseBank, setPseBank] = useState('');
  const [showBoldModal, setShowBoldModal] = useState(false);
  const [pagoProcesando, setPagoProcesando] = useState(false);

  // Cargar carrito al montar con mejor manejo
  useEffect(() => {
    cargarCarrito();
  }, []);

  // CARGAR CARRITO - CORREGIDO
  const cargarCarrito = () => {
    try {      
      // Intentar cargar desde carrito_compra (productos seleccionados)
      let productos = JSON.parse(localStorage.getItem('carrito_compra') || '[]');
      
      // Si no hay productos en carrito_compra, intentar desde carrito normal
      if (productos.length === 0) {
        const carritoCompleto = JSON.parse(localStorage.getItem('carrito') || '[]');
        // Filtrar solo seleccionados
        productos = carritoCompleto.filter(item => item.seleccionado);
      }
      
      
      if (productos.length === 0) {
        setError('No hay productos seleccionados para comprar');
        setLoading(false);
        return;
      }
      
      setCarrito(productos);
      setError(null);
      
      // Calcular totales inmediatamente
      calcularTotales(productos);
      setLoading(false);
      
    } catch (err) {
      console.error('Error al cargar carrito:', err);
      setError('Error al cargar el carrito');
      setLoading(false);
    }
  };


  // CALCULAR TOTALES
  const calcularTotales = (items) => {
    const productos = items || carrito;
    
    const subtotalCalculado = productos.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    setSubtotal(subtotalCalculado);
    
    // Envío gratis en compras mayores a $200,000
    const envioCalculado = subtotalCalculado > 200000 ? 0 : 10000;
    setEnvio(envioCalculado);
    
    const totalCalculado = subtotalCalculado + envioCalculado;
    
    setTotal(totalCalculado);
  };


  // VALIDACIONES
  const validarFormularioEnvio = () => {
    if (!formData.nombre.trim()) {
      alert('Ingresa tu nombre completo');
      return false;
    }
    if (!formData.email.trim()) {
      alert('Ingresa tu email');
      return false;
    }
    if (!formData.telefono.trim()) {
      alert('Ingresa tu teléfono');
      return false;
    }
    if (!formData.cedula.trim()) {
      alert('Ingresa tu cédula');
      return false;
    }
    if (!formData.direccion.trim()) {
      alert('Ingresa tu dirección de entrega');
      return false;
    }
    if (!formData.ciudad.trim()) {
      alert('Ingresa tu ciudad');
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      alert('Ingresa un email válido');
      return false;
    }
    
    return true;
  };

  const validarTarjeta = () => {
    const numeroLimpio = tarjetaData.numero.replace(/\s/g, '');
    if (numeroLimpio.length !== 16) {
      alert('Número de tarjeta inválido (debe tener 16 dígitos)');
      return false;
    }
    if (tarjetaData.cvv.length !== 3) {
      alert('CVV inválido (debe tener 3 dígitos)');
      return false;
    }
    if (!tarjetaData.expiracion) {
      alert('Ingresa la fecha de expiración');
      return false;
    }
    return true;
  };

  const validarNequi = () => {
    const telefonoLimpio = nequiPhone.replace(/\s/g, '');
    if (telefonoLimpio.length < 10) {
      alert('Número de Nequi inválido');
      return false;
    }
    return true;
  };


  // PROCESAR PAGO CON BOLD (SIMULADO)
  const procesarPagoBold = async () => {
    return new Promise((resolve) => {
      setShowBoldModal(true);
      
      setTimeout(() => {
        setShowBoldModal(false);
        const exito = Math.random() < 0.9;
        resolve({
          success: exito,
          transactionId: exito ? 'BOLD-' + Date.now() : null,
          message: exito ? 'Pago aprobado' : 'Pago rechazado'
        });
      }, 5000);
    });
  };


  // CREAR PEDIDO EN LA API
  const crearPedido = async (datosEnvio, resultadoPago) => {
    try {
      
      const pedidoData = {
        direccion_entrega: datosEnvio.direccion,
        productos: carrito.map(item => ({
          id_producto: item.id || item.id_producto,
          cantidad: item.cantidad
        }))
      };
            
      const response = await api.post('/pedidos', pedidoData);
      
      let pedido = response.data;
      if (response.data && response.data.data) {
        pedido = response.data.data;
      }
      
      // Limpiar carrito
      localStorage.removeItem('carrito_compra');
      localStorage.removeItem('carrito');
      
      return pedido;
      
    } catch (err) {
      console.error('Error al crear pedido:', err);
      throw new Error(err.response?.data?.message || 'Error al crear el pedido');
    }
  };


  // ENVIAR FORMULARIO
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validarFormularioEnvio()) return;
    
    if (metodoPago === 'tarjeta') {
      if (!validarTarjeta()) return;
    } else if (metodoPago === 'nequi') {
      if (!validarNequi()) return;
    }
    
    if (carrito.length === 0) {
      alert('No hay productos en tu carrito');
      return;
    }
    
    setLoading(true);
    setError(null);
    setPagoProcesando(true);
    
    try {
      const datosEnvio = {
        ...formData,
        notas: formData.notas || ''
      };
      
      const resultadoPago = await procesarPagoBold();
      
      if (!resultadoPago.success) {
        alert('Pago rechazado. Intenta con otro método de pago.');
        setPagoProcesando(false);
        setLoading(false);
        return;
      }
      
      const pedido = await crearPedido(datosEnvio, resultadoPago);
      
      alert(`¡Pago exitoso!\n\nNúmero de pedido: #${pedido.id_pedido || pedido.id}\nTotal pagado: $${total.toLocaleString('es-CO')}\n\nRecibirás un correo de confirmación en ${formData.email}`);
      
      navigate(`/control-pedido`);
      
    } catch (err) {
      console.error('Error en el checkout:', err);
      setError(err.message || 'Error al procesar la compra');
      alert(`${err.message || 'Error al procesar la compra'}`);
    } finally {
      setLoading(false);
      setPagoProcesando(false);
    }
  };


  // RENDERIZADO CONDICIONAL
  
  // Mostrar loading mientras se carga el carrito
  if (loading) {
    return (
      <div className="checkout-container max-w-[1200px] mx-auto p-5">
        <h1 className="text-2xl font-bold mb-5">💳 Finalizar Compra</h1>
        <div className="flex justify-center items-center h-64 bg-white rounded-2xl shadow-md">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando tu carrito...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && carrito.length === 0) {
    return (
      <div className="checkout-container max-w-[1200px] mx-auto p-5">
        <h1 className="text-2xl font-bold mb-5">💳 Finalizar Compra</h1>
        <div className="text-center py-16 bg-white rounded-2xl shadow-md">
          <i className="fa-solid fa-cart-shopping text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">{error}</p>
          <button 
            onClick={() => navigate('/catalogo')}
            className="mt-4 bg-[#B90F0F] text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <i className="fa-solid fa-store"></i> Ir al catálogo
          </button>
        </div>
      </div>
    );
  }

  if (carrito.length === 0 && !error) {
    return (
      <div className="checkout-container max-w-[1200px] mx-auto p-5">
        <h1 className="text-2xl font-bold mb-5">Finalizar Compra</h1>
        <div className="text-center py-16 bg-white rounded-2xl shadow-md">
          <i className="fa-solid fa-cart-shopping text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">No hay productos seleccionados para comprar</p>
          <button 
            onClick={() => navigate('/catalogo')}
            className="mt-4 bg-[#B90F0F] text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            <i className="fa-solid fa-store"></i> Ir al catálogo
          </button>
        </div>
      </div>
    );
  }


  // RENDER PRINCIPAL

  return (
    <>
      <div className="checkout-container max-w-[1200px] mx-auto p-5">
        <h1 className="text-2xl font-bold mb-5">Finalizar Compra</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
            <p>{error}</p>
          </div>
        )}
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* FORMULARIO - 2 columnas */}
          <div className="lg:col-span-2">
            <form id="checkout-form" className="bg-white rounded-2xl shadow-md p-6" onSubmit={handleSubmit}>
              <h2 className="text-xl font-bold mb-4">📋 Datos de envío</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-semibold text-sm mb-1">Nombre completo *</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#B90F0F]"
                    placeholder="Tu nombre completo"
                    value={formData.nombre}
                    onChange={(e) => setFormData({...formData, nombre: e.target.value})}
                    required
                    disabled={loading || pagoProcesando}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-sm mb-1">Email *</label>
                  <input
                    type="email"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#B90F0F]"
                    placeholder="tucorreo@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    disabled={loading || pagoProcesando}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-sm mb-1">Teléfono *</label>
                  <input
                    type="tel"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#B90F0F]"
                    placeholder="3001234567"
                    value={formData.telefono}
                    onChange={(e) => setFormData({...formData, telefono: e.target.value})}
                    required
                    disabled={loading || pagoProcesando}
                  />
                </div>
                <div>
                  <label className="block font-semibold text-sm mb-1">Cédula *</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#B90F0F]"
                    placeholder="1234567890"
                    value={formData.cedula}
                    onChange={(e) => setFormData({...formData, cedula: e.target.value})}
                    required
                    disabled={loading || pagoProcesando}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-semibold text-sm mb-1">Dirección de entrega *</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#B90F0F]"
                    placeholder="Calle 123 #45-67"
                    value={formData.direccion}
                    onChange={(e) => setFormData({...formData, direccion: e.target.value})}
                    required
                    disabled={loading || pagoProcesando}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-semibold text-sm mb-1">Ciudad *</label>
                  <input
                    type="text"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#B90F0F]"
                    placeholder="Bogotá"
                    value={formData.ciudad}
                    onChange={(e) => setFormData({...formData, ciudad: e.target.value})}
                    required
                    disabled={loading || pagoProcesando}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block font-semibold text-sm mb-1">Notas adicionales</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-xl resize-none focus:outline-none focus:border-[#B90F0F]"
                    rows="2"
                    placeholder="Instrucciones de entrega..."
                    value={formData.notas}
                    onChange={(e) => setFormData({...formData, notas: e.target.value})}
                    disabled={loading || pagoProcesando}
                  />
                </div>
              </div>

              <h2 className="text-xl font-bold mt-6 mb-4">Método de pago</h2>
              
              <div className="flex gap-4 flex-wrap mb-4">
                <button
                  type="button"
                  className={`px-6 py-3 rounded-xl font-semibold transition ${metodoPago === 'tarjeta' ? 'bg-[#B90F0F] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  onClick={() => setMetodoPago('tarjeta')}
                  disabled={loading || pagoProcesando}
                >
                  Tarjeta
                </button>
                <button
                  type="button"
                  className={`px-6 py-3 rounded-xl font-semibold transition ${metodoPago === 'nequi' ? 'bg-[#B90F0F] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  onClick={() => setMetodoPago('nequi')}
                  disabled={loading || pagoProcesando}
                >
                  Nequi
                </button>
                <button
                  type="button"
                  className={`px-6 py-3 rounded-xl font-semibold transition ${metodoPago === 'pse' ? 'bg-[#B90F0F] text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                  onClick={() => setMetodoPago('pse')}
                  disabled={loading || pagoProcesando}
                >
                  PSE
                </button>
              </div>

              {/* Datos de tarjeta */}
              {metodoPago === 'tarjeta' && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block font-semibold text-sm mb-1">Número de tarjeta *</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#B90F0F]"
                        placeholder="4242 4242 4242 4242"
                        maxLength="19"
                        value={tarjetaData.numero}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          const formatted = value.replace(/(.{4})/g, '$1 ').trim();
                          setTarjetaData({...tarjetaData, numero: formatted});
                        }}
                        disabled={loading || pagoProcesando}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-sm mb-1">Fecha expiración *</label>
                      <input
                        type="text"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#B90F0F]"
                        placeholder="MM/AA"
                        maxLength="5"
                        value={tarjetaData.expiracion}
                        onChange={(e) => {
                          const value = e.target.value.replace(/\D/g, '');
                          const formatted = value.length >= 2 ? value.slice(0,2) + '/' + value.slice(2) : value;
                          setTarjetaData({...tarjetaData, expiracion: formatted});
                        }}
                        disabled={loading || pagoProcesando}
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-sm mb-1">CVV *</label>
                      <input
                        type="password"
                        className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#B90F0F]"
                        placeholder="123"
                        maxLength="3"
                        value={tarjetaData.cvv}
                        onChange={(e) => setTarjetaData({...tarjetaData, cvv: e.target.value.replace(/\D/g, '')})}
                        disabled={loading || pagoProcesando}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Datos de Nequi */}
              {metodoPago === 'nequi' && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block font-semibold text-sm mb-1">Número de Nequi *</label>
                  <input
                    type="tel"
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#B90F0F]"
                    placeholder="3001234567"
                    value={nequiPhone}
                    onChange={(e) => setNequiPhone(e.target.value.replace(/\D/g, ''))}
                    disabled={loading || pagoProcesando}
                  />
                  <p className="text-xs text-gray-500 mt-1">Recibirás una notificación en la app para confirmar el pago</p>
                </div>
              )}

              {/* Datos de PSE */}
              {metodoPago === 'pse' && (
                <div className="bg-gray-50 p-4 rounded-xl">
                  <label className="block font-semibold text-sm mb-1">Banco *</label>
                  <select
                    className="w-full p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-[#B90F0F]"
                    value={pseBank}
                    onChange={(e) => setPseBank(e.target.value)}
                    disabled={loading || pagoProcesando}
                  >
                    <option value="">Selecciona un banco</option>
                    <option value="bancolombia">Bancolombia</option>
                    <option value="davivienda">Davivienda</option>
                    <option value="bbva">BBVA</option>
                    <option value="bogota">Banco de Bogotá</option>
                    <option value="occidente">Banco de Occidente</option>
                    <option value="popular">Banco Popular</option>
                  </select>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-6 bg-[#B90F0F] text-white py-4 rounded-xl font-bold text-lg hover:bg-[#8a0b0b] transition disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading || pagoProcesando}
              >
                {pagoProcesando ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Procesando pago...
                  </>
                ) : loading ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin mr-2"></i> Cargando...
                  </>
                ) : (
                  `Pagar $${total.toLocaleString('es-CO')}`
                )}
              </button>
            </form>
          </div>

          {/* RESUMEN DEL PEDIDO - 1 columna */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-md p-6 sticky top-20">
              <h2 className="text-xl font-bold mb-4">Resumen del pedido</h2>
              
              {carrito.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay productos</p>
              ) : (
                <>
                  <div className="max-h-[300px] overflow-y-auto mb-4">
                    {carrito.map((item) => (
                      <div key={item.id || item.id_producto} className="flex items-center gap-3 py-2 border-b border-gray-100">
                        <img 
                          src={item.imagen || item.imagen_url || '/img/default.png'} 
                          alt={item.nombre} 
                          className="w-12 h-12 object-cover rounded-lg"
                          onError={(e) => e.target.src = '/img/default.png'}
                        />
                        <div className="flex-1">
                          <p className="text-sm font-semibold">{item.nombre}</p>
                          <p className="text-xs text-gray-500">x{item.cantidad}</p>
                        </div>
                        <span className="text-sm font-bold">${(item.precio * item.cantidad).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                  
                  <div className="border-t border-gray-200 pt-4 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Subtotal</span>
                      <span>${subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Envío</span>
                      <span>{envio === 0 ? 'Gratis' : `$${envio.toLocaleString()}`}</span>
                    </div>
                    {envio === 0 && subtotal > 200000 && (
                      <p className="text-xs text-green-600">¡Envío gratis por compras mayores a $200,000!</p>
                    )}
                    <div className="flex justify-between text-lg font-bold pt-2 border-t border-gray-200">
                      <span>Total</span>
                      <span className="text-[#B90F0F]">${total.toLocaleString()}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* MODAL DE BOLD */}
      {showBoldModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-[#B90F0F] mx-auto mb-4"></div>
            <h3 className="text-xl font-bold mb-2">Procesando pago</h3>
            <p className="text-gray-500">Estamos procesando tu pago a través de Bold...</p>
            <p className="text-sm text-gray-400 mt-2">Por favor no cierres esta ventana</p>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-[#B90F0F] rounded-full animate-pulse w-3/4"></div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Checkout;