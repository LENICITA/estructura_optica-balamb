import React, { useState, useEffect } from 'react';

const CarritoCliente = () => {
  const [carrito, setCarrito] = useState([]);
  const [seleccionarTodos, setSeleccionarTodos] = useState(false);
  const [total, setTotal] = useState(0);
  const [productosSeleccionados, setProductosSeleccionados] = useState(0);

  useEffect(() => {
    cargarCarrito();
  }, []);

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
    window.location.href = '/checkout';
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
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
          <i className="fa-solid fa-cart-shopping text-red-600"></i> Mi Carrito
        </h1>
        <div className="bg-white rounded-xl shadow-sm p-12 text-center">
          <i className="fa-solid fa-cart-shopping text-6xl text-gray-300 mb-4"></i>
          <p className="text-gray-500 text-lg">Tu carrito está vacío</p>
          <a href="/catalogo" className="inline-block mt-4 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition">
            <i className="fa-solid fa-store mr-2"></i> Seguir comprando
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold flex items-center gap-2 mb-6">
        <i className="fa-solid fa-cart-shopping text-red-600"></i> Mi Carrito
      </h1>
      
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        {/* Header del carrito */}
        <div className="flex flex-wrap items-center justify-between p-4 border-b border-gray-200 gap-3">
          <label className="flex items-center gap-2 cursor-pointer text-sm">
            <input 
              type="checkbox" 
              checked={seleccionarTodos}
              onChange={(e) => seleccionarTodosItems(e.target.checked)}
              className="w-4 h-4 accent-red-600"
            />
            <span>Seleccionar todos</span>
          </label>
          <div className="flex gap-2">
            <button className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition" onClick={eliminarSeleccionados}>
              <i className="fa-solid fa-trash-can mr-1"></i> Eliminar seleccionados
            </button>
            <button className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition" onClick={vaciarCarrito}>
              <i className="fa-solid fa-broom mr-1"></i> Vaciar
            </button>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="divide-y divide-gray-100">
          {carrito.map((item, index) => {
            let precio = item.precio;
            if (typeof precio === 'string') {
              precio = parseInt(precio.replace(/[^0-9]/g, '')) || 0;
            }
            
            const cantidad = item.cantidad || 1;
            const totalItem = precio * cantidad;
            const isChecked = item.seleccionado !== false;
            
            return (
              <div key={index} className="flex flex-wrap items-center gap-4 p-4 hover:bg-gray-50 transition">
                <input 
                  type="checkbox" 
                  className="w-4 h-4 accent-red-600"
                  checked={isChecked}
                  onChange={() => toggleItemSeleccionado(index)}
                />
                <img 
                  src={item.imagen || '/img/default-product.jpg'} 
                  className="w-20 h-20 object-cover rounded-lg bg-gray-100"
                  alt={item.nombre}
                  onError={(e) => e.target.src = '/img/default-product.jpg'}
                />
                <div className="flex-1 min-w-[150px]">
                  <h3 className="font-semibold">{escapeHtml(item.nombre || 'Producto')}</h3>
                  <p className="text-sm text-gray-500">
                    Color: {item.color || '-'} | Material: {item.material || '-'}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <button className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-100 transition" onClick={() => cambiarCantidad(index, -1)}>-</button>
                    <span className="w-8 text-center font-medium">{cantidad}</span>
                    <button className="w-8 h-8 border border-gray-300 rounded-lg hover:bg-gray-100 transition" onClick={() => cambiarCantidad(index, 1)}>+</button>
                  </div>
                </div>
                <div className="text-right min-w-[120px]">
                  <span className="text-sm text-gray-400 line-through block">${precio.toLocaleString('es-CO')}</span>
                  <span className="text-lg font-bold text-red-600">${totalItem.toLocaleString('es-CO')}</span>
                  <button className="block text-gray-400 hover:text-red-500 transition mt-1" onClick={() => eliminarItem(index)}>
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer del carrito */}
        <div className="flex flex-wrap items-center justify-between p-4 border-t border-gray-200 bg-gray-50 gap-3">
          <div>
            <span className="text-sm text-gray-500">
              {productosSeleccionados} producto{productosSeleccionados !== 1 ? 's' : ''} seleccionado{productosSeleccionados !== 1 ? 's' : ''}
            </span>
            <span className="text-2xl font-bold text-red-600 block">${total.toLocaleString('es-CO')}</span>
          </div>
          <button className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition flex items-center gap-2" onClick={procederAlPago}>
            <i className="fa-solid fa-credit-card"></i> Proceder al pago
          </button>
        </div>
      </div>

      {/* Estilos para notificaciones */}
      <style>{`
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
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
      `}</style>
    </div>
  );
};

export default CarritoCliente;