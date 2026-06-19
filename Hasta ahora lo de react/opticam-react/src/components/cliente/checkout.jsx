import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Importar useNavigate

const Checkout = () => {
  const navigate = useNavigate(); // ✅ Usar navigate
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

  // ... todas las funciones permanecen igual hasta handleSubmit ...

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
    
    // ✅ Cambiar redirección a React Router
    navigate(`/confirmacion/${referencia}`);
    // Si no tienes ruta de confirmación, usa:
    // navigate(`/control-pedido`);
  };

  // ... resto de funciones ...

  // Si el carrito está vacío
  if (carrito.length === 0 && !loading) {
    return (
      <div className="checkout-container">
        <h1 className="checkout-title">💳 Finalizar Compra</h1>
        <div style={{ textAlign: 'center', padding: '60px', background: 'white', borderRadius: '12px' }}>
          <i className="fa-solid fa-cart-shopping" style={{ fontSize: '64px', color: '#ccc' }}></i>
          <p style={{ marginTop: '20px', fontSize: '18px', color: '#666' }}>No hay productos en tu carrito</p>
          {/* ✅ Cambiar enlace a React Router */}
          <button 
            onClick={() => navigate('/catalogo')}
            style={{ 
              display: 'inline-block', 
              marginTop: '20px', 
              background: '#B90F0F', 
              color: 'white', 
              padding: '12px 25px', 
              borderRadius: '8px', 
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '16px'
            }}
          >
            <i className="fa-solid fa-store"></i> Ir al catálogo
          </button>
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
            {/* ... todo el formulario queda igual ... */}
          </form>

          {/* RESUMEN DEL PEDIDO */}
          <div className="order-summary">
            {/* ... todo el resumen queda igual ... */}
          </div>
        </div>
      </div>

      {/* Modal de Bold */}
      {showBoldModal && (
        <div className="modal-bold">
          <div className="modal-bold-content">
            {/* ... modal queda igual ... */}
          </div>
        </div>
      )}

      {/* ... estilos quedan igual ... */}
    </>
  );
};

export default Checkout;