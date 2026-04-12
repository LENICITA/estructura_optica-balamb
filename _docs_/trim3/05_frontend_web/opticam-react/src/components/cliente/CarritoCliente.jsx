import React, { useState } from 'react';

const CarritoCliente = () => {
  const [carrito, setCarrito] = useState([
    { id: 1, nombre: "Gafas Ángel Gold", precio: 250000, cantidad: 1, imagen: "../../../public/img/producto1.png", color: "Dorado", material: "Plástico", seleccionado: true },
    { id: 2, nombre: "Gafas Sky Blue", precio: 180000, cantidad: 2, imagen: "../../../public/img/producto2.png", color: "Azul", material: "Metal", seleccionado: true },
    { id: 3, nombre: "Lentes Titanium Pro", precio: 350000, cantidad: 1, imagen: "../../../public/img/producto3.png", color: "Plateado", material: "Titanio", seleccionado: false }
  ]);

  const [seleccionarTodos, setSeleccionarTodos] = useState(false);

  const toggleSeleccionarTodos = () => {
    const nuevoEstado = !seleccionarTodos;
    setSeleccionarTodos(nuevoEstado);
    setCarrito(carrito.map(item => ({ ...item, seleccionado: nuevoEstado })));
  };

  const toggleSeleccionItem = (id) => {
    const nuevoCarrito = carrito.map(item =>
      item.id === id ? { ...item, seleccionado: !item.seleccionado } : item
    );
    setCarrito(nuevoCarrito);
    setSeleccionarTodos(nuevoCarrito.every(item => item.seleccionado));
  };

  const cambiarCantidad = (id, delta) => {
    const nuevoCarrito = carrito.map(item =>
      item.id === id ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item
    );
    setCarrito(nuevoCarrito);
  };

  const eliminarItem = (id) => {
    if (window.confirm('¿Eliminar este producto del carrito?')) {
      setCarrito(carrito.filter(item => item.id !== id));
    }
  };

  const eliminarSeleccionados = () => {
    const seleccionados = carrito.filter(item => item.seleccionado);
    if (seleccionados.length === 0) {
      alert('No hay productos seleccionados');
      return;
    }
    if (window.confirm(`¿Eliminar ${seleccionados.length} producto(s) seleccionado(s)?`)) {
      setCarrito(carrito.filter(item => !item.seleccionado));
      setSeleccionarTodos(false);
    }
  };

  const vaciarCarrito = () => {
    if (carrito.length === 0) {
      alert('El carrito ya está vacío');
      return;
    }
    if (window.confirm('¿Vaciar todo el carrito? Esta acción no se puede deshacer.')) {
      setCarrito([]);
      setSeleccionarTodos(false);
    }
  };

  const productosSeleccionados = carrito.filter(item => item.seleccionado);
  const total = productosSeleccionados.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);

  const pagar = () => {
    if (productosSeleccionados.length === 0) {
      alert('Selecciona al menos un producto para continuar');
      return;
    }
    alert(`✅ Compra realizada por $${total.toLocaleString()}\n\nGracias por tu compra.`);
  };

  if (carrito.length === 0) {
    return (
      <div className="max-w-[1200px] mx-auto my-10 px-5">
        <div className="bg-white rounded-2xl shadow-md overflow-hidden">
          <div className="text-center py-20">
            <i className="fa-solid fa-cart-shopping text-6xl text-gray-300 mb-5"></i>
            <h3 className="text-2xl text-gray-700 mb-2.5">🛒 Tu carrito está vacío</h3>
            <p className="text-gray-500 mb-6">¡Agrega productos desde la tienda!</p>
            <button className="bg-[#B90F0F] text-white border-none py-3 px-7 rounded-full text-sm font-semibold cursor-pointer transition-all hover:bg-[#8a0b0b]">
              <i className="fa-solid fa-store mr-2"></i> Seguir comprando
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1200px] mx-auto my-10 px-5">
      <div className="bg-white rounded-2xl shadow-md overflow-hidden">
        <h1 className="text-2xl p-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 m-0 text-gray-800">
          <i className="fa-solid fa-cart-shopping text-[#B90F0F] mr-2"></i> Mi Carrito
        </h1>

        {/* Header del carrito */}
        <div className="flex justify-between items-center p-4 bg-gray-50 border-b border-gray-200 flex-wrap gap-4">
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-gray-500">
            <input 
              type="checkbox" 
              checked={seleccionarTodos} 
              onChange={toggleSeleccionarTodos}
              className="w-4 h-4 cursor-pointer accent-[#B90F0F]"
            />
            Seleccionar todos
          </label>
          <div className="flex gap-2">
            <button onClick={eliminarSeleccionados} className="bg-transparent border-none text-red-500 px-4 py-2 rounded-lg text-sm cursor-pointer transition-all hover:bg-red-50">
              <i className="fa-solid fa-trash-can mr-1"></i> Eliminar seleccionados
            </button>
            <button onClick={vaciarCarrito} className="bg-transparent border-none text-gray-500 px-4 py-2 rounded-lg text-sm cursor-pointer transition-all hover:bg-gray-100">
              <i className="fa-solid fa-broom mr-1"></i> Vaciar carrito
            </button>
          </div>
        </div>

        {/* Lista de productos */}
        <div className="divide-y divide-gray-100">
          {carrito.map((item) => (
            <div key={item.id} className={`flex items-center gap-4 p-5 border-b border-gray-100 transition-all flex-wrap md:flex-nowrap ${item.seleccionado ? 'bg-green-50' : ''}`}>
              <div className="w-12">
                <input 
                  type="checkbox" 
                  checked={item.seleccionado} 
                  onChange={() => toggleSeleccionItem(item.id)}
                  className="w-5 h-5 cursor-pointer accent-[#B90F0F]"
                />
              </div>
              <div className="w-20 h-20 bg-gray-50 rounded-xl flex items-center justify-center overflow-hidden">
                <img src={item.imagen} alt={item.nombre} className="max-w-[90%] max-h-[90%] object-contain" />
              </div>
              <div className="flex-1 min-w-[180px]">
                <h3 className="text-base font-semibold text-gray-800 mb-2">{item.nombre}</h3>
                <div className="flex gap-4 mb-2 flex-wrap">
                  <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500">{item.color}</span>
                  <span className="text-xs bg-gray-100 px-3 py-1 rounded-full text-gray-500">{item.material}</span>
                </div>
                <div className="text-sm text-[#B90F0F] font-semibold">${item.precio.toLocaleString()} c/u</div>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={() => cambiarCantidad(item.id, -1)} disabled={item.cantidad <= 1} className="w-8 h-8 bg-white border border-gray-300 rounded-lg cursor-pointer flex items-center justify-center transition-all hover:bg-[#B90F0F] hover:border-[#B90F0F] hover:text-white disabled:opacity-50 disabled:cursor-not-allowed">
                  <i className="fa-solid fa-minus text-sm"></i>
                </button>
                <span className="text-base font-semibold min-w-[30px] text-center">{item.cantidad}</span>
                <button onClick={() => cambiarCantidad(item.id, 1)} className="w-8 h-8 bg-white border border-gray-300 rounded-lg cursor-pointer flex items-center justify-center transition-all hover:bg-[#B90F0F] hover:border-[#B90F0F] hover:text-white">
                  <i className="fa-solid fa-plus text-sm"></i>
                </button>
              </div>
              <div className="min-w-[100px] text-right">
                <span className="text-base font-bold text-gray-800">${(item.precio * item.cantidad).toLocaleString()}</span>
              </div>
              <div>
                <button onClick={() => eliminarItem(item.id)} className="bg-transparent border-none text-gray-400 cursor-pointer text-lg p-2 rounded-lg transition-all hover:text-red-500 hover:bg-red-50">
                  <i className="fa-solid fa-trash-can"></i>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer del carrito */}
        <div className="bg-gray-50 p-5 border-t border-gray-200 flex justify-between items-center flex-wrap gap-5">
          <div>
            <div className="text-sm text-gray-500">{productosSeleccionados.length} de {totalItems} productos seleccionados</div>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-[#B90F0F]">${total.toLocaleString()}</div>
            <button onClick={pagar} className="bg-[#B90F0F] text-white border-none py-3 px-8 rounded-full text-base font-semibold cursor-pointer transition-all mt-2.5 hover:bg-[#8a0b0b]">
              <i className="fa-solid fa-credit-card mr-2"></i> Proceder al pago
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CarritoCliente;