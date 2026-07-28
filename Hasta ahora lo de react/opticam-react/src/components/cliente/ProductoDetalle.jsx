import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const ProductoDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [colorSeleccionado, setColorSeleccionado] = useState('');
  const [materialSeleccionado, setMaterialSeleccionado] = useState('');
  const [reseñas, setReseñas] = useState([]);
  const [calificacion, setCalificacion] = useState(0);
  const [opinion, setOpinion] = useState('');
  const [mensajeExito, setMensajeExito] = useState(false);
  const [hoverEstrella, setHoverEstrella] = useState(0);

  useEffect(() => {
    cargarProducto();
    cargarReseñas();
  }, [id]);

  const obtenerProductos = () => {
    let productos = JSON.parse(localStorage.getItem('productos') || '[]');
    
    if (productos.length === 0) {
      productos = [
        { id: 1, nombre: "Ángel Gold", precio: 250000, material: "Plastico", imagen: "/img/producto1.png", color: "Dorado", descripcion: "Gafas elegantes con acabado dorado", colores: ["Dorado", "Negro", "Plateado"], materiales: ["Plástico", "Metal"], vendidos: 150, nuevo: true },
        { id: 2, nombre: "Sky Blue", precio: 180000, material: "Metal", imagen: "/img/producto2.png", color: "Azul", descripcion: "Diseño moderno en color azul cielo", colores: ["Azul", "Negro", "Blanco"], materiales: ["Metal", "Plástico"], vendidos: 89, nuevo: false },
        { id: 3, nombre: "Titanium Pro", precio: 350000, material: "Titanio", imagen: "/img/producto3.png", color: "Plateado", descripcion: "Ultra ligeras de titanio profesional", colores: ["Plateado", "Negro", "Oro rosa"], materiales: ["Titanio"], vendidos: 45, nuevo: true },
        { id: 4, nombre: "Gafas Ámbar", precio: 250000, material: "Plastico", imagen: "/img/producto4.png", color: "Ámbar", descripcion: "Tonos cálidos para un look sofisticado", colores: ["Ámbar", "Negro", "Marrón"], materiales: ["Plástico", "Acetato"], vendidos: 200, nuevo: true }
      ];
      localStorage.setItem('productos', JSON.stringify(productos));
    }
    
    return productos;
  };

  const cargarProducto = () => {
    const productos = obtenerProductos();
    const encontrado = productos.find(p => p.id == id);
    
    if (encontrado) {
      setProducto(encontrado);
      setColorSeleccionado(encontrado.color || '');
      setMaterialSeleccionado(encontrado.material || '');
      document.title = `Óptica Balamb - ${encontrado.nombre}`;
    } else {
      navigate('/catalogo');
    }
  };

  const cargarReseñas = () => {
    const todasReseñas = JSON.parse(localStorage.getItem('reseñas_producto') || '[]');
    const productReseñas = todasReseñas.filter(r => r.productoId == id);
    setReseñas(productReseñas);
  };

  const agregarAlCarrito = () => {
    if (!producto) return;
    
    if (!colorSeleccionado) {
      alert('⚠️ Por favor selecciona un color');
      return;
    }
    
    if (!materialSeleccionado) {
      alert('⚠️ Por favor selecciona un material');
      return;
    }
    
    let carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    
    const existeIndex = carrito.findIndex(item => 
      item.nombre === producto.nombre && 
      item.color === colorSeleccionado && 
      item.material === materialSeleccionado
    );
    
    if (existeIndex !== -1) {
      carrito[existeIndex].cantidad = (carrito[existeIndex].cantidad || 1) + 1;
      alert(`📦 ${producto.nombre} - Cantidad: ${carrito[existeIndex].cantidad}`);
    } else {
      carrito.push({
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        imagen: producto.imagen,
        color: colorSeleccionado,
        material: materialSeleccionado,
        cantidad: 1,
        seleccionado: true,
        fecha: new Date().toISOString()
      });
      alert(`🕶️ ${producto.nombre} añadido al carrito`);
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
  };

  const enviarReseña = (e) => {
    e.preventDefault();
    
    if (calificacion === 0) {
      alert('⭐ Por favor, selecciona una calificación');
      return;
    }
    
    if (!opinion.trim()) {
      alert('📝 Por favor, escribe tu opinión');
      return;
    }
    
    if (opinion.trim().length < 10) {
      alert('📝 Tu opinión debe tener al menos 10 caracteres');
      return;
    }
    
    const nombreUsuario = localStorage.getItem('nombre') || 'Usuario anónimo';
    
    const reseñasGuardadas = JSON.parse(localStorage.getItem('reseñas_producto') || '[]');
    reseñasGuardadas.push({
      id: Date.now(),
      productoId: parseInt(id),
      productoNombre: producto.nombre,
      calificacion: calificacion,
      opinion: opinion.trim(),
      nombre: nombreUsuario,
      fecha: new Date().toISOString()
    });
    localStorage.setItem('reseñas_producto', JSON.stringify(reseñasGuardadas));
    
    setMensajeExito(true);
    setCalificacion(0);
    setOpinion('');
    cargarReseñas();
    
    setTimeout(() => setMensajeExito(false), 3000);
  };

  const irAPruebaMontura = () => {
    navigate(`/prueba-montura/${producto.id}`);
  };

  const renderEstrellas = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (!producto) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-pulse text-gray-500 text-lg">Cargando producto...</div>
      </div>
    );
  }

  return (
    <div className="w-full flex justify-center bg-gray-50 py-8">
      <div className="w-full max-w-6xl px-4 sm:px-6 lg:px-8">
        
        {/* ===== PRODUCTO ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 bg-white rounded-2xl shadow-lg p-6 lg:p-8">
          
          {/* Imagen */}
          <div className="bg-gray-50 rounded-xl p-8 flex items-center justify-center min-h-[350px] lg:min-h-[450px]">
            <img 
              src={producto.imagen || '/img/default-product.jpg'} 
              alt={producto.nombre}
              className="max-w-full max-h-[400px] object-contain hover:scale-105 transition duration-300"
              onError={(e) => e.target.src = '/img/default-product.jpg'}
            />
          </div>
          
          {/* Detalles */}
          <div className="flex flex-col gap-5">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">
              {producto.nombre}
            </h1>
            
            <div>
              <p className="text-sm text-gray-500 font-medium">Precio</p>
              <p className="text-3xl lg:text-4xl font-bold text-red-600">
                ${producto.precio.toLocaleString('es-CO')}
              </p>
            </div>
            
            <p className="text-gray-600 text-base leading-relaxed border-l-4 border-red-500 pl-4">
              {producto.descripcion}
            </p>
            
            {/* Selectores */}
            <div className="space-y-4 mt-2">
              <div>
                <label className="font-semibold text-sm text-gray-700 block mb-1.5">
                  <i className="fa-solid fa-palette text-red-500 mr-2"></i>Color:
                </label>
                <select 
                  className="w-full max-w-xs p-2.5 border-2 border-gray-200 rounded-lg bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 transition outline-none"
                  value={colorSeleccionado}
                  onChange={(e) => setColorSeleccionado(e.target.value)}
                >
                  <option value="">Seleccionar color</option>
                  {(producto.colores || [producto.color]).map(color => (
                    <option key={color} value={color}>{color}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="font-semibold text-sm text-gray-700 block mb-1.5">
                  <i className="fa-solid fa-cubes text-red-500 mr-2"></i>Material:
                </label>
                <select 
                  className="w-full max-w-xs p-2.5 border-2 border-gray-200 rounded-lg bg-white focus:border-red-500 focus:ring-2 focus:ring-red-200 transition outline-none"
                  value={materialSeleccionado}
                  onChange={(e) => setMaterialSeleccionado(e.target.value)}
                >
                  <option value="">Seleccionar material</option>
                  {(producto.materiales || [producto.material]).map(material => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
              </div>
            </div>
            
            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button 
                className="flex-1 px-6 py-3.5 bg-black text-white rounded-xl font-semibold hover:bg-red-600 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
                onClick={agregarAlCarrito}
              >
                <i className="fa-solid fa-cart-plus"></i> Añadir al carrito
              </button>
              <button 
                className="flex-1 px-6 py-3.5 border-2 border-red-600 text-red-600 rounded-xl font-semibold hover:bg-red-600 hover:text-white transition flex items-center justify-center gap-2"
                onClick={irAPruebaMontura}
              >
                <i className="fa-solid fa-camera"></i> Prueba tu montura
              </button>
            </div>
          </div>
        </div>

        {/* ===== SEPARADOR ===== */}
        <div className="my-16 border-t border-gray-200"></div>

        {/* ===== RESEÑAS - CENTRADO ===== */}
        <div className="max-w-4xl mx-auto w-full">
          <h2 className="text-2xl lg:text-3xl font-bold text-center mb-12">
            <i className="fa-regular fa-star text-red-500 mr-2"></i>
            Opiniones de nuestros clientes
          </h2>
          
          {reseñas.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-2xl shadow-sm">
              <i className="fa-regular fa-comment-dots text-6xl text-gray-300 mb-4"></i>
              <p className="text-gray-500 text-lg">No hay reseñas aún.</p>
              <p className="text-gray-400 text-sm">Sé el primero en opinar!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {reseñas.map(reseña => (
                <div key={reseña.id} className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition border border-gray-100">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-semibold text-gray-800">{reseña.nombre}</h4>
                      <div className="text-yellow-400 text-lg mt-1">
                        {renderEstrellas(reseña.calificacion)}
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                      {new Date(reseña.fecha).toLocaleDateString('es-ES')}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed">"{reseña.opinion}"</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== SEPARADOR ===== */}
        <div className="my-16 border-t border-gray-200"></div>

        {/* ===== FORMULARIO RESEÑA - CENTRADO ===== */}
        <div className="max-w-2xl mx-auto w-full">
          <div className="bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100">
            <h2 className="text-2xl font-bold text-red-600 text-center mb-2">
              <i className="fa-regular fa-pen-to-square mr-2"></i>
              Deja tu opinión
            </h2>
            <p className="text-gray-500 text-sm text-center mb-8">
              Tu opinión nos ayuda a mejorar
            </p>
            
            {mensajeExito && (
              <div className="mb-6 p-4 bg-green-500 text-white rounded-lg text-center animate-pulse">
                ✓ ¡Gracias por tu opinión!
              </div>
            )}
            
            <form onSubmit={enviarReseña} className="flex flex-col gap-6">
              <div>
                <label className="block font-semibold text-sm text-gray-700 mb-3 text-center">
                  <i className="fa-regular fa-star text-red-500 mr-1"></i>
                  Tu calificación
                </label>
                <div className="flex justify-center gap-3 text-4xl">
                  {[1, 2, 3, 4, 5].map(val => (
                    <span 
                      key={val} 
                      className={`cursor-pointer transition transform hover:scale-125 ${
                        calificacion >= val ? 'text-yellow-400' : 'text-gray-300'
                      }`}
                      onClick={() => setCalificacion(val)}
                      onMouseEnter={() => setHoverEstrella(val)}
                      onMouseLeave={() => setHoverEstrella(0)}
                    >
                      {calificacion >= val || (hoverEstrella >= val && calificacion < val) ? '★' : '☆'}
                    </span>
                  ))}
                </div>
                {calificacion > 0 && (
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Has seleccionado {calificacion} estrella{calificacion !== 1 ? 's' : ''}
                  </p>
                )}
              </div>
              
              <div>
                <label className="block font-semibold text-sm text-gray-700 mb-2">
                  <i className="fa-regular fa-message text-red-500 mr-1"></i>
                  Tu opinión
                </label>
                <textarea 
                  rows="4" 
                  className="w-full p-4 border-2 border-gray-200 rounded-xl resize-none focus:border-red-400 focus:ring-2 focus:ring-red-100 transition outline-none"
                  placeholder="Escribe aquí tu experiencia..."
                  value={opinion}
                  onChange={(e) => setOpinion(e.target.value)}
                />
              </div>
              
              <button 
                type="submit" 
                className="w-full py-3.5 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
              >
                <i className="fa-solid fa-paper-plane"></i> Enviar reseña
              </button>
            </form>
          </div>
        </div>

        {/* ===== ESPACIO FINAL ===== */}
        <div className="h-8"></div>

      </div>
    </div>
  );
};

export default ProductoDetalle;