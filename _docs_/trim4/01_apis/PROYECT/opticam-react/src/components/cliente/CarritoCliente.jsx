import React, { useState, useEffect } from 'react';

const Carrito = () => {
  const [carrito, setCarrito] = useState([]);
  const [seleccionarTodos, setSeleccionarTodos] = useState(false);
  const [total, setTotal] = useState(0);
  const [productosSeleccionados, setProductosSeleccionados] = useState(0);

  // Cargar carrito al iniciar
  useEffect(() => {
    cargarCarrito();
  }, []);

  // Actualizar resumen cuando cambie el carrito
  useEffect(() => {
    actualizarResumen();
  }, [carrito]);

  const obtenerCarrito = () => {
    const carritoGuardado = localStorage.getItem('carrito');
    return carritoGuardado ? JSON.parse(carritoGuardado) : [];
  };

  const guardarCarrito = (nuevoCarrito) => {
    localStorage.setItem('carrito', JSON.stringify(nuevoCarrito));
    setCarrito(nuevoCarrito);
    actualizarContadorCarrito();
  };

  const actualizarContadorCarrito = () => {
    const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    const contadores = document.querySelectorAll('.cart-count');
    contadores.forEach(contador => {
      contador.textContent = totalItems;
    });
  };

  const cargarCarrito = () => {
    const carritoData = obtenerCarrito();
    setCarrito(carritoData);
    setSeleccionarTodos(carritoData.length > 0 && carritoData.every(item => item.seleccionado !== false));
  };

  const actualizarResumen = () => {
    let totalSum = 0;
    let seleccionadosCount = 0;

    carrito.forEach(item => {
      if (item.seleccionado !== false) {
        let precio = item.precio;
        if (typeof precio === 'string') {
          precio = parseInt(precio.replace(/[^0-9]/g, '')) || 0;
        }
        totalSum += precio * (item.cantidad || 1);
        seleccionadosCount++;
      }
    });

    setTotal(totalSum);
    setProductosSeleccionados(seleccionadosCount);
  };

  const cambiarCantidad = (index, cambio) => {
    const nuevoCarrito = [...carrito];
    const nuevaCantidad = (nuevoCarrito[index].cantidad || 1) + cambio;

    if (nuevaCantidad >= 1 && nuevaCantidad <= 99) {
      nuevoCarrito[index].cantidad = nuevaCantidad;
      guardarCarrito(nuevoCarrito);
      mostrarNotificacion(`Cantidad actualizada: ${nuevaCantidad}`, 'success');
    } else if (nuevaCantidad < 1) {
      eliminarItem(index);
    }
  };

  const eliminarItem = (index) => {
    const producto = carrito[index];
    if (window.confirm(`¿Eliminar "${producto.nombre}" del carrito?`)) {
      const nuevoCarrito = carrito.filter((_, i) => i !== index);
      guardarCarrito(nuevoCarrito);
      mostrarNotificacion(`${producto.nombre} eliminado del carrito`, 'success');
    }
  };

  const vaciarCarrito = () => {
    if (carrito.length === 0) {
      mostrarNotificacion('El carrito ya está vacío', 'warning');
      return;
    }
    if (window.confirm('¿Estás seguro de que deseas vaciar todo el carrito?')) {
      guardarCarrito([]);
      setSeleccionarTodos(false);
      mostrarNotificacion('Carrito vaciado completamente', 'success');
    }
  };

  const seleccionarTodosItems = (seleccionado) => {
    const nuevoCarrito = carrito.map(item => ({
      ...item,
      seleccionado: seleccionado
    }));
    guardarCarrito(nuevoCarrito);
    setSeleccionarTodos(seleccionado);
  };

  const toggleItemSeleccionado = (index) => {
    const nuevoCarrito = [...carrito];
    nuevoCarrito[index].seleccionado = !nuevoCarrito[index].seleccionado;
    guardarCarrito(nuevoCarrito);
    
    const todosSeleccionados = nuevoCarrito.every(item => item.seleccionado !== false);
    setSeleccionarTodos(todosSeleccionados);
  };

  const eliminarSeleccionados = () => {
    const seleccionados = carrito.filter(item => item.seleccionado !== false);
    
    if (seleccionados.length === 0) {
      mostrarNotificacion('No has seleccionado ningún producto', 'warning');
      return;
    }
    
    if (window.confirm(`¿Eliminar ${seleccionados.length} producto(s) seleccionado(s)?`)) {
      const nuevoCarrito = carrito.filter(item => item.seleccionado === false);
      guardarCarrito(nuevoCarrito);
      setSeleccionarTodos(false);
      mostrarNotificacion(`${seleccionados.length} producto(s) eliminado(s)`, 'success');
    }
  };

  const procederAlPago = () => {
    const productosSeleccionados = carrito.filter(item => item.seleccionado !== false);
    
    if (productosSeleccionados.length === 0) {
      alert('Por favor selecciona al menos un producto para continuar');
      return;
    }
    
    localStorage.setItem('carrito_compra', JSON.stringify(productosSeleccionados));
    window.location.href = 'checkout.html';
  };

  const mostrarNotificacion = (mensaje, tipo = 'success') => {
    const notificacion = document.createElement('div');
    notificacion.className = 'notificacion-carrito';
    notificacion.innerHTML = `
      <i class="fa-solid ${tipo === 'success' ? 'fa-check-circle' : tipo === 'warning' ? 'fa-exclamation-circle' : 'fa-info-circle'}"></i>
      <span>${mensaje}</span>
    `;
    
    if (tipo === 'warning') {
      notificacion.style.background = '#ff9800';
    } else if (tipo === 'error') {
      notificacion.style.background = '#f44336';
    }
    
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
      notificacion.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notificacion.remove(), 300);
    }, 2500);
  };

  const escapeHtml = (text) => {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  };

  if (carrito.length === 0) {
    return (
      <div className="carrito-main">
        <div className="carrito-container">
          <h1><i className="fa-solid fa-cart-shopping"></i> Mi Carrito</h1>
          <div className="carrito-vacio">
            <i className="fa-solid fa-cart-shopping"></i>
            <p>Tu carrito está vacío</p>
            <a href="catalogo.html" className="btn-seguir-comprando">
              <i className="fa-solid fa-store"></i> Seguir comprando
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="carrito-main">
      <div className="carrito-container">
        <h1><i className="fa-solid fa-cart-shopping"></i> Mi Carrito</h1>
        
        <div className="carrito-header">
          <label className="seleccion-todos">
            <input 
              type="checkbox" 
              checked={seleccionarTodos}
              onChange={(e) => seleccionarTodosItems(e.target.checked)}
            />
            <span>Seleccionar todos</span>
          </label>
          <div className="carrito-acciones">
            <button className="btn-eliminar-seleccionados" onClick={eliminarSeleccionados}>
              <i className="fa-solid fa-trash-can"></i> Eliminar seleccionados
            </button>
            <button className="btn-vaciar" onClick={vaciarCarrito}>
              <i className="fa-solid fa-broom"></i> Vaciar carrito
            </button>
          </div>
        </div>

        <div className="carrito-lista">
          {carrito.map((item, index) => {
            let precio = item.precio;
            if (typeof precio === 'string') {
              precio = parseInt(precio.replace(/[^0-9]/g, '')) || 0;
            }
            
            const cantidad = item.cantidad || 1;
            const totalItem = precio * cantidad;
            const isChecked = item.seleccionado !== false;
            
            return (
              <div key={`${item.id}-${index}`} className="carrito-item">
                <input 
                  type="checkbox" 
                  className="item-checkbox" 
                  checked={isChecked}
                  onChange={() => toggleItemSeleccionado(index)}
                />
                <img 
                  src={item.imagen || '/img/default-product.jpg'} 
                  className="item-imagen" 
                  alt={item.nombre}
                  onError={(e) => e.target.src = '/img/default-product.jpg'}
                />
                <div className="item-info">
                  <h3>{escapeHtml(item.nombre || 'Producto')}</h3>
                  <p className="item-detalles">
                    Color: {item.color || '-'} | Material: {item.material || '-'}
                  </p>
                  <div className="item-cantidad">
                    <button className="btn-cantidad" onClick={() => cambiarCantidad(index, -1)}>-</button>
                    <span>{cantidad}</span>
                    <button className="btn-cantidad" onClick={() => cambiarCantidad(index, 1)}>+</button>
                  </div>
                </div>
                <div className="item-precio">
                  <span className="precio-unitario">${precio.toLocaleString('es-CO')}</span>
                  <span className="precio-total">${totalItem.toLocaleString('es-CO')}</span>
                  <button className="btn-eliminar-item" onClick={() => eliminarItem(index)}>
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        <div className="carrito-footer">
          <div className="resumen">
            <span id="productos-seleccionados">
              {productosSeleccionados} producto{productosSeleccionados !== 1 ? 's' : ''} seleccionado{productosSeleccionados !== 1 ? 's' : ''}
            </span>
            <span className="total">${total.toLocaleString('es-CO')}</span>
          </div>
          <button className="btn-pagar" onClick={procederAlPago}>
            <i className="fa-solid fa-credit-card"></i> Proceder al pago
          </button>
        </div>
      </div>

      {/* Estilos CSS */}
      <style jsx>{`
        .carrito-main {
          max-width: 1200px;
          margin: 120px auto 60px;
          padding: 0 20px;
          min-height: 400px;
        }
        .carrito-container h1 {
          font-size: 28px;
          color: var(--color-texto, #000);
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .carrito-container h1 i {
          color: var(--color-primario, #B90F0F);
        }
        .carrito-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 25px;
          padding-bottom: 15px;
          border-bottom: 2px solid var(--card-border, #e0e0e0);
          flex-wrap: wrap;
          gap: 15px;
        }
        .seleccion-todos {
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          font-size: 14px;
          color: var(--color-texto, #000);
        }
        .seleccion-todos input {
          width: 18px;
          height: 18px;
          cursor: pointer;
          accent-color: var(--color-primario, #B90F0F);
        }
        .carrito-acciones {
          display: flex;
          gap: 10px;
        }
        .btn-eliminar-seleccionados,
        .btn-vaciar {
          background: transparent;
          border: 1px solid var(--card-border, #e0e0e0);
          padding: 8px 16px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s;
          font-size: 14px;
          color: var(--color-texto, #000);
        }
        .btn-eliminar-seleccionados:hover {
          background: #ff6b6b;
          border-color: #ff6b6b;
          color: white;
        }
        .btn-vaciar:hover {
          background: #333;
          border-color: #333;
          color: white;
        }
        .carrito-lista {
          min-height: 300px;
          margin-bottom: 20px;
        }
        .carrito-vacio {
          text-align: center;
          padding: 60px 20px;
          background: var(--color-fondo, #fff);
          border-radius: 12px;
        }
        .carrito-vacio i {
          font-size: 80px;
          color: #ccc;
          margin-bottom: 20px;
        }
        .carrito-vacio p {
          font-size: 18px;
          color: #666;
          margin-bottom: 20px;
        }
        .btn-seguir-comprando {
          display: inline-block;
          background: var(--color-primario, #B90F0F);
          color: white;
          padding: 12px 25px;
          border-radius: 8px;
          text-decoration: none;
          transition: all 0.3s;
        }
        .btn-seguir-comprando:hover {
          background: var(--color-secundario, #000);
          transform: translateY(-2px);
        }
        .carrito-item {
          display: flex;
          align-items: center;
          gap: 20px;
          background: var(--color-fondo, #fff);
          border-radius: 12px;
          padding: 20px;
          margin-bottom: 15px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          transition: all 0.3s;
          position: relative;
        }
        .carrito-item:hover {
          box-shadow: 0 5px 15px rgba(0,0,0,0.1);
          transform: translateY(-2px);
        }
        .carrito-item input[type="checkbox"] {
          width: 20px;
          height: 20px;
          cursor: pointer;
          accent-color: var(--color-primario, #B90F0F);
        }
        .item-imagen {
          width: 100px;
          height: 100px;
          object-fit: cover;
          border-radius: 10px;
          background: var(--bg-color, #f4f6f9);
        }
        .item-info {
          flex: 1;
        }
        .item-info h3 {
          font-size: 16px;
          margin: 0 0 8px 0;
          color: var(--color-texto, #000);
        }
        .item-detalles {
          font-size: 13px;
          color: #666;
          margin: 0 0 10px 0;
        }
        .item-cantidad {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .btn-cantidad {
          width: 32px;
          height: 32px;
          border: 1px solid var(--card-border, #e0e0e0);
          background: var(--color-fondo, #fff);
          border-radius: 6px;
          cursor: pointer;
          font-size: 16px;
          font-weight: bold;
          transition: all 0.3s;
        }
        .btn-cantidad:hover {
          background: var(--color-primario, #B90F0F);
          color: white;
          border-color: var(--color-primario, #B90F0F);
        }
        .item-cantidad span {
          font-size: 16px;
          font-weight: 600;
          min-width: 30px;
          text-align: center;
        }
        .item-precio {
          text-align: right;
          min-width: 160px;
        }
        .precio-unitario {
          display: block;
          font-size: 12px;
          color: #999;
          text-decoration: line-through;
        }
        .precio-total {
          display: block;
          font-size: 20px;
          font-weight: bold;
          color: var(--color-primario, #B90F0F);
          margin: 5px 0;
        }
        .btn-eliminar-item {
          background: transparent;
          border: none;
          color: #ccc;
          font-size: 18px;
          cursor: pointer;
          transition: color 0.3s;
          margin-top: 5px;
        }
        .btn-eliminar-item:hover {
          color: #ff6b6b;
        }
        .carrito-footer {
          background: var(--color-fondo, #fff);
          border-radius: 12px;
          padding: 25px;
          margin-top: 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.05);
        }
        .resumen {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        #productos-seleccionados {
          font-size: 14px;
          color: #666;
        }
        .total {
          font-size: 28px;
          font-weight: bold;
          color: var(--color-primario, #B90F0F);
        }
        .btn-pagar {
          background: var(--color-boton, #B90F0F);
          color: white;
          border: none;
          padding: 15px 35px;
          border-radius: 10px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .btn-pagar:hover {
          background: var(--color-secundario, #000);
          transform: translateY(-2px);
          box-shadow: 0 5px 15px rgba(185, 15, 15, 0.3);
        }
        @keyframes slideOutRight {
          from {
            transform: translateX(0);
            opacity: 1;
          }
          to {
            transform: translateX(100%);
            opacity: 0;
          }
        }
        @keyframes slideInRight {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        .notificacion-carrito {
          position: fixed;
          bottom: 20px;
          right: 20px;
          background: #4CAF50;
          color: white;
          padding: 12px 20px;
          border-radius: 8px;
          z-index: 9999;
          animation: slideInRight 0.3s ease;
          box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          display: flex;
          align-items: center;
          gap: 10px;
        }
        @media (max-width: 768px) {
          .carrito-main {
            margin: 100px auto 40px;
          }
          .carrito-item {
            flex-wrap: wrap;
            gap: 15px;
          }
          .item-imagen {
            width: 80px;
            height: 80px;
          }
          .item-precio {
            width: 100%;
            text-align: left;
            display: flex;
            justify-content: space-between;
            align-items: center;
            flex-wrap: wrap;
          }
          .precio-total {
            font-size: 18px;
          }
          .carrito-footer {
            flex-direction: column;
            text-align: center;
          }
          .btn-pagar {
            width: 100%;
            justify-content: center;
          }
          .carrito-acciones {
            width: 100%;
            justify-content: space-between;
          }
          .btn-eliminar-seleccionados,
          .btn-vaciar {
            flex: 1;
            text-align: center;
          }
        }
        @media (max-width: 480px) {
          .carrito-container h1 {
            font-size: 24px;
          }
          .carrito-item {
            padding: 15px;
          }
          .item-info h3 {
            font-size: 14px;
          }
          .total {
            font-size: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Carrito;