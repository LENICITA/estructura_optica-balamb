import React, { useState, useEffect } from 'react';

const Checkout = () => {
  const [carrito, setCarrito] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [envio, setEnvio] = useState(0);
  const [total, setTotal] = useState(0);
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
  const [loading, setLoading] = useState(false);
  const [showBoldModal, setShowBoldModal] = useState(false);
  const [pagoProcesando, setPagoProcesando] = useState(false);

  useEffect(() => {
    cargarProductosCheckout();
  }, []);

  const obtenerCarrito = () => {
    const carritoGuardado = localStorage.getItem('carrito');
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  };

  const obtenerProductosCheckout = () => {
    // Primero intentar obtener los seleccionados del carrito
    let productosSeleccionados = localStorage.getItem('carrito_compra');
    
    if (productosSeleccionados) {
      productosSeleccionados = JSON.parse(productosSeleccionados);
      console.log('✅ Productos seleccionados para compra:', productosSeleccionados);
      return productosSeleccionados;
    }
    
    // Si no hay seleccionados, obtener todo el carrito
    const carrito = obtenerCarrito();
    const productosActivos = carrito.filter(item => item.seleccionado !== false);
    return productosActivos;
  };

  const cargarProductosCheckout = () => {
    const productos = obtenerProductosCheckout();
    setCarrito(productos);
    calcularTotales(productos);
  };

  const calcularTotales = (productos) => {
    const subtotalCalc = productos.reduce((sum, item) => {
      let precio = item.precio;
      if (typeof precio === 'string') {
        precio = parseInt(precio.replace(/[^0-9]/g, '')) || 0;
      }
      return sum + (precio * (item.cantidad || 1));
    }, 0);
    
    const envioCalc = subtotalCalc > 200000 ? 0 : 15000;
    const totalCalc = subtotalCalc + envioCalc;
    
    setSubtotal(subtotalCalc);
    setEnvio(envioCalc);
    setTotal(totalCalc);
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleTarjetaChange = (e) => {
    let value = e.target.value;
    const id = e.target.id;
    
    if (id === 'card-number') {
      value = value.replace(/\s/g, '');
      if (value.length > 16) value = value.slice(0, 16);
      value = value.replace(/(\d{4})/g, '$1 ').trim();
    } else if (id === 'card-expiry') {
      value = value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
    } else if (id === 'card-cvv') {
      value = value.replace(/\D/g, '').slice(0, 3);
    }
    
    setTarjetaData({
      ...tarjetaData,
      [id]: value
    });
  };

  const validarFormularioEnvio = () => {
    const { nombre, email, direccion, ciudad, telefono, cedula } = formData;
    const errores = [];
    
    if (!nombre) errores.push('Nombre completo');
    if (!email) errores.push('Correo electrónico');
    if (!direccion) errores.push('Dirección');
    if (!ciudad) errores.push('Ciudad');
    if (!telefono) errores.push('Teléfono');
    if (!cedula) errores.push('Cédula');
    
    if (errores.length > 0) {
      alert(`Por favor complete los siguientes campos:\n- ${errores.join('\n- ')}`);
      return false;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      alert('Por favor ingrese un correo electrónico válido');
      return false;
    }
    
    const telefonoRegex = /^\d{7,}$/;
    if (!telefonoRegex.test(telefono.replace(/\s/g, ''))) {
      alert('Por favor ingrese un número de teléfono válido (mínimo 7 dígitos)');
      return false;
    }
    
    return true;
  };

  const validarTarjeta = () => {
    const { numero, expiracion, cvv } = tarjetaData;
    const numLimpio = numero.replace(/\s/g, '');
    
    if (!/^\d{16}$/.test(numLimpio)) {
      alert('Número de tarjeta inválido (debe tener 16 dígitos)');
      return false;
    }
    
    if (!/^\d{2}\/\d{2}$/.test(expiracion)) {
      alert('Formato de fecha inválido (use MM/AA)');
      return false;
    }
    
    const [mes, año] = expiracion.split('/');
    const mesNum = parseInt(mes);
    const añoNum = parseInt(año);
    const ahora = new Date();
    const añoActual = ahora.getFullYear() % 100;
    const mesActual = ahora.getMonth() + 1;
    
    if (mesNum < 1 || mesNum > 12) {
      alert('Mes inválido');
      return false;
    }
    
    if (añoNum < añoActual || (añoNum === añoActual && mesNum < mesActual)) {
      alert('La tarjeta está vencida');
      return false;
    }
    
    if (!/^\d{3}$/.test(cvv)) {
      alert('CVV inválido (debe tener 3 dígitos)');
      return false;
    }
    
    return true;
  };

  const validarNequi = () => {
    const telefonoLimpio = nequiPhone.replace(/\s/g, '');
    if (!/^\d{10}$/.test(telefonoLimpio)) {
      alert('Número de Nequi inválido (debe tener 10 dígitos)');
      return false;
    }
    return true;
  };

  const procesarPagoBold = () => {
    return new Promise((resolve) => {
      setShowBoldModal(true);
      
      const handlePagar = () => {
        setPagoProcesando(true);
        setTimeout(() => {
          setShowBoldModal(false);
          setPagoProcesando(false);
          resolve({ success: true, transactionId: 'BOLD-' + Date.now() });
        }, 2000);
      };
      
      const handleCancelar = () => {
        setShowBoldModal(false);
        resolve({ success: false, error: 'Pago cancelado' });
      };
      
      // Limpiar event listeners previos
      const boldPagarBtn = document.getElementById('bold-pagar');
      const boldCancelarBtn = document.getElementById('bold-cancelar');
      
      if (boldPagarBtn) {
        boldPagarBtn.onclick = handlePagar;
      }
      if (boldCancelarBtn) {
        boldCancelarBtn.onclick = handleCancelar;
      }
    });
  };

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
    
    const datosEnvio = {
      ...formData,
      notas: formData.notas || ''
    };
    
    const referencia = 'ORD-' + Date.now();
    
    // Mostrar simulador Bold
    const resultadoPago = await procesarPagoBold();
    
    if (!resultadoPago.success) {
      alert('❌ Pago cancelado');
      return;
    }
    
    // Crear pedido
    const pedido = {
      id: referencia,
      fecha: new Date().toISOString(),
      cliente: datosEnvio,
      productos: carrito,
      metodoPago: metodoPago,
      subtotal: subtotal,
      envio: envio,
      total: total,
      estado: 'confirmado',
      transaccionId: resultadoPago.transactionId,
      fechaPago: new Date().toISOString()
    };
    
    console.log('📋 Pedido creado:', pedido);
    
    // Guardar pedido
    const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
    pedidos.push(pedido);
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    
    // Limpiar carrito
    localStorage.removeItem('carrito');
    localStorage.removeItem('carrito_compra');
    
    alert(`✅ ¡Pago exitoso!\n\nNúmero de pedido: ${referencia}\nTotal pagado: $${total.toLocaleString('es-CO')}\n\nRecibirás un correo de confirmación en ${formData.email}`);
    
    // Redirigir a confirmación
    window.location.href = `confirmacion.html?id=${referencia}`;
  };

  const formatPrice = (price) => {
    if (typeof price === 'string') {
      price = parseInt(price.replace(/[^0-9]/g, '')) || 0;
    }
    return `$${price.toLocaleString('es-CO')}`;
  };

  // Cargar datos del usuario logueado si existen
  useEffect(() => {
    const userEmail = localStorage.getItem('email');
    const userNombre = localStorage.getItem('nombre');
    const rol = localStorage.getItem('rol');
    
    if (rol === 'cliente' && userNombre) {
      // Intentar cargar datos del cliente
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const cliente = clientes.find(c => c.email === userEmail);
      if (cliente) {
        setFormData(prev => ({
          ...prev,
          nombre: cliente.nombre || '',
          email: cliente.email || '',
          telefono: cliente.telefono || '',
          cedula: cliente.documento || '',
          direccion: cliente.direccion || '',
          ciudad: cliente.ciudad || ''
        }));
      }
    }
  }, []);

  if (carrito.length === 0 && !loading) {
    return (
      <div className="checkout-container">
        <h1 className="checkout-title">💳 Finalizar Compra</h1>
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
          <i className="fa-solid fa-cart-shopping" style={{ fontSize: '64px', color: '#ccc' }}></i>
          <p style={{ marginTop: '20px', fontSize: '18px', color: '#666' }}>No hay productos en tu carrito</p>
          <a href="catalogo.html" className="btn-seguir-comprando" style={{ display: 'inline-block', marginTop: '20px', background: '#B90F0F', color: 'white', padding: '12px 25px', borderRadius: '8px', textDecoration: 'none' }}>
            <i className="fa-solid fa-store"></i> Ir al catálogo
          </a>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="checkout-container">
        <h1 className="checkout-title">💳 Finalizar Compra</h1>
        
        <div className="checkout-grid">
          {/* FORMULARIO */}
          <form id="checkout-form" className="checkout-form" onSubmit={handleSubmit}>
            {/* Información personal */}
            <div className="form-section">
              <h3>📋 Información personal</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Nombre completo *</label>
                  <input 
                    type="text" 
                    id="nombre" 
                    value={formData.nombre}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Email *</label>
                  <input 
                    type="email" 
                    id="email" 
                    value={formData.email}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Teléfono *</label>
                  <input 
                    type="tel" 
                    id="telefono" 
                    value={formData.telefono}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Cédula *</label>
                  <input 
                    type="text" 
                    id="cedula" 
                    value={formData.cedula}
                    onChange={handleFormChange}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Dirección de envío */}
            <div className="form-section">
              <h3>📍 Dirección de envío</h3>
              <div className="form-group">
                <label>Dirección *</label>
                <input 
                  type="text" 
                  id="direccion" 
                  value={formData.direccion}
                  onChange={handleFormChange}
                  required
                />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Ciudad *</label>
                  <input 
                    type="text" 
                    id="ciudad" 
                    value={formData.ciudad}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Notas adicionales</label>
                  <input 
                    type="text" 
                    id="notas" 
                    placeholder="Ej: Apartamento, casa, etc."
                    value={formData.notas}
                    onChange={handleFormChange}
                  />
                </div>
              </div>
            </div>

            {/* Métodos de pago */}
            <div className="form-section">
              <h3>💵 Método de pago</h3>
              <div className="payment-methods">
                <div className={`payment-method ${metodoPago === 'tarjeta' ? 'active' : ''}`} onClick={() => setMetodoPago('tarjeta')}>
                  <input type="radio" name="payment-method" value="tarjeta" checked={metodoPago === 'tarjeta'} readOnly />
                  <span className="payment-icon">💳</span>
                  <label>Tarjeta de Crédito/Débito</label>
                </div>
                <div className={`payment-method ${metodoPago === 'nequi' ? 'active' : ''}`} onClick={() => setMetodoPago('nequi')}>
                  <input type="radio" name="payment-method" value="nequi" checked={metodoPago === 'nequi'} readOnly />
                  <span className="payment-icon"></span>
                  <label>Nequi</label>
                </div>
                <div className={`payment-method ${metodoPago === 'pse' ? 'active' : ''}`} onClick={() => setMetodoPago('pse')}>
                  <input type="radio" name="payment-method" value="pse" checked={metodoPago === 'pse'} readOnly />
                  <span className="payment-icon"></span>
                  <label>PSE</label>
                </div>
              </div>

              {/* Detalles tarjeta de crédito */}
              <div className={`card-details ${metodoPago === 'tarjeta' ? 'active' : ''}`}>
                <div className="form-group">
                  <label>Número de tarjeta</label>
                  <input 
                    type="text" 
                    id="card-number" 
                    placeholder="1234 5678 9012 3456" 
                    maxLength="19"
                    value={tarjetaData.numero}
                    onChange={handleTarjetaChange}
                  />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Fecha expiración</label>
                    <input 
                      type="text" 
                      id="card-expiry" 
                      placeholder="MM/AA"
                      value={tarjetaData.expiracion}
                      onChange={handleTarjetaChange}
                    />
                  </div>
                  <div className="form-group">
                    <label>CVV</label>
                    <input 
                      type="text" 
                      id="card-cvv" 
                      placeholder="123" 
                      maxLength="4"
                      value={tarjetaData.cvv}
                      onChange={handleTarjetaChange}
                    />
                  </div>
                </div>
              </div>

              {/* Detalles Nequi */}
              <div className={`card-details ${metodoPago === 'nequi' ? 'active' : ''}`}>
                <div style={{ background: '#e8f5e9', padding: '15px', borderRadius: '10px' }}>
                  <p><strong>📱 Pago con Nequi:</strong></p>
                  <p>Ingresa tu número de Nequi para recibir la solicitud de pago:</p>
                  <input 
                    type="tel" 
                    id="nequi-phone" 
                    placeholder="3001234567" 
                    style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px' }}
                    value={nequiPhone}
                    onChange={(e) => setNequiPhone(e.target.value)}
                  />
                  <p className="small">* Recibirás una notificación en tu app de Nequi para completar el pago</p>
                </div>
              </div>

              {/* Detalles PSE */}
              <div className={`card-details ${metodoPago === 'pse' ? 'active' : ''}`}>
                <div style={{ background: '#fff3e0', padding: '15px', borderRadius: '10px' }}>
                  <p><strong>🏦 Pago por PSE:</strong></p>
                  <select 
                    id="pse-bank" 
                    style={{ width: '100%', padding: '10px', margin: '10px 0', border: '1px solid #ddd', borderRadius: '5px' }}
                    value={pseBank}
                    onChange={(e) => setPseBank(e.target.value)}
                  >
                    <option value="">Selecciona tu banco</option>
                    <option value="bancolombia">Bancolombia</option>
                    <option value="davivienda">Davivienda</option>
                    <option value="bbva">BBVA</option>
                    <option value="occidente">Banco de Occidente</option>
                    <option value="popular">Banco Popular</option>
                    <option value="caja-social">Caja Social</option>
                  </select>
                  <p className="small">* Serás redirigido a tu banco para completar la transacción</p>
                </div>
              </div>
            </div>

            <button type="submit" className="confirm-btn" disabled={pagoProcesando}>
              <i className="fa-solid fa-check-circle"></i> {pagoProcesando ? 'Procesando...' : 'Confirmar pedido'}
            </button>
          </form>

          {/* RESUMEN DEL PEDIDO */}
          <div className="order-summary">
            <h3>📦 Resumen del pedido</h3>
            <div id="order-items" className="order-items">
              {carrito.map((item, index) => {
                let precio = item.precio;
                if (typeof precio === 'string') {
                  precio = parseInt(precio.replace(/[^0-9]/g, '')) || 0;
                }
                const cantidad = item.cantidad || 1;
                const totalItem = precio * cantidad;
                
                return (
                  <div key={index} className="order-item">
                    <img 
                      src={item.imagen || '/img/default-product.jpg'} 
                      className="order-item-image" 
                      alt={item.nombre}
                      onError={(e) => e.target.src = '/img/default-product.jpg'}
                    />
                    <div className="order-item-info">
                      <h4>{item.nombre || 'Producto'}</h4>
                      <p>Cantidad: {cantidad}</p>
                      <p>Color: {item.color || '-'} / Material: {item.material || '-'}</p>
                    </div>
                    <div className="order-item-price">
                      {formatPrice(totalItem)}
                    </div>
                  </div>
                );
              })}
            </div>
            <div id="order-totals">
              <div className="summary-row">
                <span>Subtotal:</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="summary-row">
                <span>Envío:</span>
                <span>{envio === 0 ? 'GRATIS 🎉' : formatPrice(envio)}</span>
              </div>
              <div className="summary-total">
                <span>Total:</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Bold */}
      {showBoldModal && (
        <div className="modal-bold">
          <div className="modal-bold-content">
            <div className="modal-bold-header">
              <i className="fa-solid fa-credit-card"></i>
              <h2>Pago seguro con Bold</h2>
            </div>
            <div className="modal-bold-body">
              <div className="bold-logo">
                <i className="fa-solid fa-shield-alt"></i>
                <span>Bold</span>
              </div>
              <div className="monto-pago">
                <p>Monto a pagar:</p>
                <h3>{formatPrice(total)}</h3>
              </div>
              <div className="transaccion-info">
                <p><strong>📱 Datos de la transacción (SIMULACIÓN)</strong></p>
                <p>🔹 Comercio: Óptica Balamb</p>
                <p>🔹 Referencia: ORD-{Date.now()}</p>
                <p>🔹 Método: {metodoPago === 'tarjeta' ? 'Tarjeta de crédito' : metodoPago === 'nequi' ? 'Nequi' : 'PSE'}</p>
              </div>
              <p className="simulador-text">🔒 Este es un simulador de pago de Bold</p>
            </div>
            <div className="modal-bold-footer">
              <button id="bold-pagar" className="btn-pagar-bold">
                <i className="fa-solid fa-check"></i> Simular pago exitoso
              </button>
              <button id="bold-cancelar" className="btn-cancelar-bold">
                <i className="fa-solid fa-times"></i> Cancelar
              </button>
            </div>
            <p className="simulador-note">⚡ Simulación de Bold - Entorno de pruebas</p>
          </div>
        </div>
      )}

      {/* Estilos CSS */}
      <style jsx>{`
        .checkout-container {
          max-width: 1200px;
          margin: 120px auto 60px;
          padding: 0 20px;
        }
        .checkout-title {
          font-size: 32px;
          color: var(--color-texto, #000);
          margin-bottom: 30px;
          text-align: center;
          position: relative;
          display: inline-block;
          width: 100%;
        }
        .checkout-title::after {
          content: '';
          position: absolute;
          bottom: -10px;
          left: 50%;
          transform: translateX(-50%);
          width: 60px;
          height: 3px;
          background-color: var(--color-primario, #B90F0F);
          border-radius: 2px;
          transition: width 0.3s ease;
        }
        .checkout-grid {
          display: grid;
          grid-template-columns: 1fr 400px;
          gap: 30px;
        }
        .checkout-form {
          background: var(--color-fondo, #fff);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          padding: 30px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .checkout-form:hover {
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .form-section {
          margin-bottom: 30px;
        }
        .form-section h3 {
          font-size: 18px;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid var(--color-primario, #B90F0F);
          color: var(--color-texto, #000);
          position: relative;
        }
        .form-group {
          margin-bottom: 20px;
        }
        .form-group label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: var(--color-texto, #000);
          font-size: 14px;
        }
        .form-group input,
        .form-group select,
        .form-group textarea {
          width: 100%;
          padding: 12px;
          border: 1px solid var(--card-border, #e0e0e0);
          border-radius: 8px;
          font-size: 14px;
          transition: all 0.3s ease;
          background: var(--color-fondo, #fff);
          color: var(--color-texto, #000);
        }
        .form-group input:focus,
        .form-group select:focus,
        .form-group textarea:focus {
          outline: none;
          border-color: var(--color-primario, #B90F0F);
          box-shadow: 0 0 0 3px rgba(185,15,15,0.1);
        }
        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 15px;
        }
        .payment-methods {
          display: grid;
          gap: 12px;
          margin-bottom: 20px;
        }
        .payment-method {
          border: 2px solid var(--card-border, #e0e0e0);
          border-radius: 10px;
          padding: 15px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 15px;
          background: var(--color-fondo, #fff);
        }
        .payment-method:hover {
          border-color: var(--color-primario, #B90F0F);
          transform: translateX(5px);
        }
        .payment-method.active {
          border-color: var(--color-primario, #B90F0F);
          background: #fdf2f2;
        }
        .payment-method input[type="radio"] {
          margin: 0;
          width: 18px;
          height: 18px;
          accent-color: var(--color-primario, #B90F0F);
          cursor: pointer;
        }
        .payment-method label {
          cursor: pointer;
          font-weight: 600;
          flex: 1;
          color: var(--color-texto, #000);
        }
        .payment-icon {
          font-size: 28px;
        }
        .card-details {
          display: none;
          margin-top: 20px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 10px;
          animation: fadeIn 0.3s ease;
        }
        .card-details.active {
          display: block;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .order-summary {
          background: var(--color-fondo, #fff);
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          padding: 25px;
          position: sticky;
          top: 100px;
          transition: all 0.3s ease;
        }
        .order-summary:hover {
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .order-summary h3 {
          font-size: 18px;
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid var(--color-primario, #B90F0F);
          color: var(--color-texto, #000);
        }
        .order-items {
          max-height: 350px;
          overflow-y: auto;
          margin-bottom: 20px;
        }
        .order-items::-webkit-scrollbar {
          width: 6px;
        }
        .order-items::-webkit-scrollbar-track {
          background: var(--bg-color, #f4f6f9);
          border-radius: 10px;
        }
        .order-items::-webkit-scrollbar-thumb {
          background: var(--color-primario, #B90F0F);
          border-radius: 10px;
        }
        .order-item {
          display: flex;
          gap: 12px;
          padding: 12px 0;
          border-bottom: 1px solid var(--card-border, #e0e0e0);
          transition: all 0.3s ease;
        }
        .order-item:hover {
          background: #fdf2f2;
          padding-left: 8px;
        }
        .order-item-image {
          width: 60px;
          height: 60px;
          object-fit: cover;
          border-radius: 8px;
          background: var(--bg-color, #f4f6f9);
        }
        .order-item-info {
          flex: 1;
        }
        .order-item-info h4 {
          margin: 0 0 5px;
          font-size: 14px;
          color: var(--color-texto, #000);
        }
        .order-item-info p {
          margin: 0;
          font-size: 12px;
          color: #666;
        }
        .order-item-price {
          font-weight: 700;
          color: var(--color-primario, #B90F0F);
        }
        .summary-row {
          display: flex;
          justify-content: space-between;
          padding: 10px 0;
          color: var(--color-texto, #000);
          font-size: 14px;
        }
        .summary-total {
          display: flex;
          justify-content: space-between;
          padding: 15px 0;
          font-size: 20px;
          font-weight: 700;
          color: var(--color-primario, #B90F0F);
          border-top: 2px solid var(--card-border, #e0e0e0);
          margin-top: 10px;
        }
        .confirm-btn {
          width: 100%;
          background: var(--color-boton, #B90F0F);
          color: var(--color-texto2, #fff);
          border: none;
          padding: 14px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 25px;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
        }
        .confirm-btn:hover:not(:disabled) {
          background: var(--color-secundario, #000);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(185,15,15,0.3);
        }
        .confirm-btn:disabled {
          background: #ccc;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
        }
        .small {
          font-size: 12px;
          color: #666;
          margin-top: 8px;
        }
        .btn-seguir-comprando:hover {
          background: var(--color-secundario, #000);
          transform: translateY(-2px);
        }
        .modal-bold {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.8);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 20000;
          animation: fadeIn 0.3s ease;
        }
        .modal-bold-content {
          background: white;
          border-radius: 20px;
          max-width: 500px;
          width: 90%;
          padding: 30px;
          text-align: center;
        }
        .modal-bold-header {
          margin-bottom: 20px;
        }
        .modal-bold-header i {
          font-size: 48px;
          color: var(--color-primario, #B90F0F);
          margin-bottom: 10px;
        }
        .modal-bold-header h2 {
          color: #333;
        }
        .bold-logo {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          margin: 20px 0;
        }
        .bold-logo i {
          font-size: 32px;
          color: #0052cc;
        }
        .bold-logo span {
          font-size: 24px;
          font-weight: bold;
          color: #0052cc;
        }
        .monto-pago {
          margin: 20px 0;
        }
        .monto-pago p {
          color: #666;
        }
        .monto-pago h3 {
          font-size: 28px;
          color: var(--color-primario, #B90F0F);
        }
        .transaccion-info {
          background: #f5f5f5;
          border-radius: 10px;
          padding: 15px;
          text-align: left;
          margin: 20px 0;
        }
        .transaccion-info p {
          margin: 5px 0;
          font-size: 13px;
        }
        .simulador-text {
          color: #666;
          font-size: 12px;
          margin: 15px 0;
        }
        .modal-bold-footer {
          display: flex;
          gap: 15px;
          justify-content: center;
        }
        .btn-pagar-bold {
          background: #4CAF50;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 30px;
          cursor: pointer;
          font-size: 16px;
        }
        .btn-cancelar-bold {
          background: #f44336;
          color: white;
          border: none;
          padding: 12px 30px;
          border-radius: 30px;
          cursor: pointer;
          font-size: 16px;
        }
        .simulador-note {
          margin-top: 20px;
          font-size: 11px;
          color: #999;
        }
        @media (max-width: 992px) {
          .checkout-grid {
            grid-template-columns: 1fr;
            gap: 25px;
          }
          .order-summary {
            position: static;
            top: auto;
          }
        }
        @media (max-width: 768px) {
          .checkout-container {
            margin: 100px auto 40px;
            padding: 0 15px;
          }
          .checkout-title {
            font-size: 28px;
          }
          .checkout-form,
          .order-summary {
            padding: 20px;
          }
          .form-row {
            grid-template-columns: 1fr;
            gap: 0;
          }
          .payment-method {
            padding: 12px;
          }
          .payment-icon {
            font-size: 24px;
          }
          .order-item-image {
            width: 50px;
            height: 50px;
          }
        }
        @media (max-width: 480px) {
          .checkout-title {
            font-size: 24px;
          }
          .checkout-form {
            padding: 15px;
          }
          .payment-method {
            flex-wrap: wrap;
            gap: 10px;
          }
        }
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .order-summary {
          animation: slideInRight 0.5s ease;
        }
      `}</style>
    </>
  );
};

export default Checkout;