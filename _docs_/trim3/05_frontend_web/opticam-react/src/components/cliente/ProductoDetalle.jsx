import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const Producto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [producto, setProducto] = useState(null);
  const [colorSeleccionado, setColorSeleccionado] = useState('');
  const [materialSeleccionado, setMaterialSeleccionado] = useState('');
  const [reseñas, setReseñas] = useState([]);
  const [calificacion, setCalificacion] = useState(0);
  const [opinion, setOpinion] = useState('');
  const [mensajeExito, setMensajeExito] = useState(false);
  const [totalItems, setTotalItems] = useState(0);
  const [hoverEstrella, setHoverEstrella] = useState(0);

  // Cargar producto al iniciar
  useEffect(() => {
    cargarProducto();
    cargarReseñas();
    actualizarContadorCarrito();
  }, [id]);

  // Escuchar cambios en el carrito
  useEffect(() => {
    window.addEventListener('storage', (e) => {
      if (e.key === 'carrito') {
        actualizarContadorCarrito();
      }
    });
    return () => window.removeEventListener('storage', () => {});
  }, []);

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
      navigate('/catalogo.html');
    }
  };

  const cargarReseñas = () => {
    const todasReseñas = JSON.parse(localStorage.getItem('reseñas_producto') || '[]');
    const productReseñas = todasReseñas.filter(r => r.productoId == id);
    setReseñas(productReseñas);
  };

  const actualizarContadorCarrito = () => {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const total = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    setTotalItems(total);
  };

  const agregarAlCarrito = () => {
    if (!producto) return;
    
    if (!colorSeleccionado) {
      mostrarNotificacion('⚠️ Por favor selecciona un color', 'warning');
      return;
    }
    
    if (!materialSeleccionado) {
      mostrarNotificacion('⚠️ Por favor selecciona un material', 'warning');
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
      mostrarNotificacion(`📦 ${producto.nombre} - Cantidad: ${carrito[existeIndex].cantidad}`, 'success');
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
      mostrarNotificacion(`🕶️ ${producto.nombre} añadido al carrito`, 'success');
    }
    
    localStorage.setItem('carrito', JSON.stringify(carrito));
    actualizarContadorCarrito();
  };

  const mostrarNotificacion = (mensaje, tipo) => {
    const notificacion = document.createElement('div');
    const colores = {
      success: '#4CAF50',
      warning: '#ff9800',
      error: '#f44336',
      info: '#2196F3'
    };
    const iconos = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️'
    };
    
    notificacion.style.cssText = `
      position: fixed;
      bottom: 100px;
      right: 20px;
      background: ${colores[tipo] || '#333'};
      color: white;
      padding: 12px 20px;
      border-radius: 10px;
      z-index: 10000;
      font-size: 14px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      animation: slideInRight 0.3s ease;
      max-width: 300px;
      display: flex;
      align-items: center;
      gap: 10px;
    `;
    notificacion.innerHTML = `${iconos[tipo] || '📢'} ${mensaje}`;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
      notificacion.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notificacion.remove(), 300);
    }, 3000);
  };

  const manejarEstrellas = (valor) => {
    setCalificacion(valor);
  };

  const manejarHoverEstrella = (valor) => {
    setHoverEstrella(valor);
  };

  const enviarReseña = (e) => {
    e.preventDefault();
    
    if (calificacion === 0) {
      mostrarNotificacion('⭐ Por favor, selecciona una calificación', 'warning');
      return;
    }
    
    if (!opinion.trim()) {
      mostrarNotificacion('📝 Por favor, escribe tu opinión', 'warning');
      return;
    }
    
    if (opinion.trim().length < 10) {
      mostrarNotificacion('📝 Tu opinión debe tener al menos 10 caracteres', 'warning');
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
    
    setTimeout(() => {
      setMensajeExito(false);
    }, 3000);
  };

  const irAPruebaMontura = () => {
    mostrarNotificacion('🔄 Cargando prueba de montura...', 'info');
    setTimeout(() => {
      window.location.href = `/pruebamonturas.html?id=${producto.id}`;
    }, 500);
  };

  const renderEstrellas = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (!producto) {
    return (
      <div className="loading-container">
        <div className="loading">Cargando producto...</div>
        <style jsx>{`
          .loading-container {
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 400px;
          }
          .loading {
            font-size: 18px;
            color: #666;
          }
        `}</style>
      </div>
    );
  }

  return (
    <>
      {/* Sección Producto */}
      <section className="producto">
        <div className="imagen_producto">
          <img 
            id="producto-imagen" 
            src={producto.imagen || '/img/default-product.jpg'} 
            alt={producto.nombre}
            onError={(e) => e.target.src = '/img/default-product.jpg'}
          />
        </div>
        <div className="descripcion_producto">
          <h1 id="producto-nombre">{producto.nombre}</h1>
          <h3>Precio</h3>
          <h1 className="precio-destacado" id="producto-precio">
            ${producto.precio.toLocaleString('es-CO')}
          </h1>
          <p id="producto-descripcion">{producto.descripcion}</p>
          
          <div className="dropdown-group">
            <label htmlFor="color-select">Color:</label>
            <select 
              id="color-select" 
              className="dropdown-select" 
              value={colorSeleccionado}
              onChange={(e) => setColorSeleccionado(e.target.value)}
            >
              <option value="">Seleccionar color</option>
              {(producto.colores || [producto.color]).map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>
          </div>

          <div className="dropdown-group">
            <label htmlFor="material-select">Material:</label>
            <select 
              id="material-select" 
              className="dropdown-select" 
              value={materialSeleccionado}
              onChange={(e) => setMaterialSeleccionado(e.target.value)}
            >
              <option value="">Seleccionar material</option>
              {(producto.materiales || [producto.material]).map(material => (
                <option key={material} value={material}>{material}</option>
              ))}
            </select>
          </div>

          <div className="botones-container">
            <button className="btn-comprar" id="btn-anadir-carrito" onClick={agregarAlCarrito}>
              <i className="fa-solid fa-cart-plus"></i> Añadir al carrito
            </button>
            <button className="btn-comprar btn-prueba" onClick={irAPruebaMontura}>
              <i className="fa-solid fa-camera"></i> Prueba tu montura
            </button>
          </div>
        </div>
      </section>

      {/* Reseñas */}
      <section className="reseñas">
        <h2 className="reseñas-titulo">Opiniones de nuestros clientes</h2>
        <div className="reseñas-container" id="reseñas-container">
          {reseñas.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '20px' }}>No hay reseñas aún. Sé el primero en opinar!</p>
          ) : (
            reseñas.map(reseña => (
              <div key={reseña.id} className="tarjeta-reseña">
                <div className="reseña-header">
                  <div className="usuario-info">
                    <div className="usuario-nombre">
                      <h4>{reseña.nombre}</h4>
                      <div className="estrellas">
                        {renderEstrellas(reseña.calificacion)}
                      </div>
                    </div>
                  </div>
                  <div className="fecha">
                    {new Date(reseña.fecha).toLocaleDateString('es-ES')}
                  </div>
                </div>
                <p className="reseña-texto">{reseña.opinion}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Formulario de reseña */}
      <section className="enviar-reseña">
        <h2>Deja tu opinión</h2>
        <p>¿Ya probaste este producto? Cuéntanos qué te pareció.</p>
        <form className="form-reseña" id="formReseña" onSubmit={enviarReseña}>
          <div className="grupo-estrellas">
            <label>Tu calificación</label>
            <div className="estrellas-input">
              {[1, 2, 3, 4, 5].map(val => (
                <span 
                  key={val} 
                  className={`estrella ${calificacion >= val ? 'seleccionada' : ''}`}
                  onClick={() => manejarEstrellas(val)}
                  onMouseEnter={() => manejarHoverEstrella(val)}
                  onMouseLeave={() => manejarHoverEstrella(0)}
                >
                  {calificacion >= val || (hoverEstrella >= val && calificacion < val) ? '★' : '☆'}
                </span>
              ))}
            </div>
          </div>
          <div className="grupo-opinion">
            <label htmlFor="opinion">Tu opinión</label>
            <textarea 
              id="opinion" 
              rows="3" 
              placeholder="Escribe aquí tu experiencia..."
              value={opinion}
              onChange={(e) => setOpinion(e.target.value)}
            ></textarea>
          </div>
          <button type="submit" className="btn-enviar">
            <i className="fa-solid fa-paper-plane"></i> Enviar reseña
          </button>
        </form>
        {mensajeExito && (
          <div className="mensaje-exito" id="mensajeExito">
            <p>✓ ¡Gracias por tu opinión!</p>
          </div>
        )}
      </section>

      {/* Estilos CSS */}
      <style jsx>{`
        .producto {
          margin: 40px auto;
          display: grid;
          grid-template-columns: auto 1fr;
          gap: 30px;
          align-items: start;
          max-width: 1200px;
          padding: 0 20px;
        }
        .imagen_producto {
          display: flex;
          justify-content: center;
          background: linear-gradient(135deg, #fafafa 0%, #f0f0f0 100%);
          border-radius: 20px;
          padding: 20px;
        }
        .imagen_producto img {
          width: 100%;
          height: auto;
          max-width: 450px;
          transition: transform 0.3s ease;
          border-radius: 10px;
        }
        .imagen_producto img:hover {
          transform: scale(1.03);
        }
        .descripcion_producto {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        .descripcion_producto h1:first-child {
          font-size: 36px;
          color: var(--color-texto, #000);
          margin: 0;
        }
        .descripcion_producto h3 {
          font-size: 24px;
          color: #08ca08;
          margin: 0;
        }
        .descripcion_producto .precio-destacado {
          font-size: 32px;
          color: var(--color-primario, #B90F0F);
          margin: 0;
          font-weight: bold;
        }
        .descripcion_producto p {
          font-size: 18px;
          color: var(--color-texto, #000);
          margin: 0;
          line-height: 1.5;
        }
        .dropdown-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
          margin-top: 5px;
        }
        .dropdown-group label {
          font-size: 16px;
          font-weight: bold;
          color: var(--color-texto, #000);
        }
        .dropdown-select {
          width: 100%;
          max-width: 300px;
          padding: 10px 15px;
          font-size: 16px;
          border: 2px solid var(--color-secundario, #000);
          border-radius: 8px;
          background-color: var(--color-primario, #B90F0F);
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .dropdown-select:hover {
          background-color: #8a0b0b;
        }
        .botones-container {
          display: flex;
          gap: 15px;
          margin-top: 10px;
          flex-wrap: wrap;
        }
        .btn-comprar {
          padding: 12px 24px;
          font-size: 16px;
          font-weight: bold;
          color: white;
          background-color: var(--color-secundario, #000);
          border: 2px solid var(--color-secundario, #000);
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .btn-comprar:hover {
          background-color: var(--color-primario, #B90F0F);
          border-color: var(--color-primario, #B90F0F);
          transform: scale(1.02);
        }
        .btn-prueba {
          background-color: transparent;
          border: 2px solid var(--color-primario, #B90F0F);
          color: var(--color-primario, #B90F0F);
        }
        .btn-prueba:hover {
          background-color: var(--color-primario, #B90F0F);
          color: white;
        }
        .reseñas {
          margin-top: 60px;
          padding: 40px 20px;
          background-color: #f9f9f9;
          border-radius: 20px;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;
        }
        .reseñas-titulo {
          text-align: center;
          font-size: 36px;
          color: #333;
          margin-bottom: 40px;
          font-weight: bold;
        }
        .reseñas-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 30px;
          margin-bottom: 40px;
        }
        .tarjeta-reseña {
          background: white;
          border-radius: 15px;
          padding: 25px;
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.08);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .tarjeta-reseña:hover {
          transform: translateY(-5px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }
        .reseña-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 20px;
          flex-wrap: wrap;
          gap: 10px;
        }
        .usuario-nombre h4 {
          margin: 0 0 5px 0;
          font-size: 18px;
          color: #333;
        }
        .estrellas {
          color: #FFD700;
          font-size: 18px;
          letter-spacing: 2px;
        }
        .fecha {
          color: #888;
          font-size: 14px;
        }
        .reseña-texto {
          font-size: 16px;
          line-height: 1.6;
          color: #555;
          margin-bottom: 20px;
          font-style: italic;
        }
        .enviar-reseña {
          max-width: 500px;
          margin: 60px auto;
          padding: 30px;
          background: white;
          border-radius: 15px;
          box-shadow: 0 5px 20px rgba(0, 0, 0, 0.1);
          text-align: center;
        }
        .enviar-reseña h2 {
          font-size: 28px;
          color: var(--color-primario, #B90F0F);
          margin-bottom: 10px;
        }
        .enviar-reseña p {
          color: #666;
          margin-bottom: 25px;
          font-size: 14px;
        }
        .form-reseña {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .grupo-estrellas {
          text-align: center;
        }
        .grupo-estrellas label {
          display: block;
          margin-bottom: 10px;
          font-weight: bold;
          color: #333;
          font-size: 14px;
        }
        .estrellas-input {
          display: flex;
          justify-content: center;
          gap: 10px;
        }
        .estrella {
          font-size: 35px;
          cursor: pointer;
          color: #ddd;
          transition: all 0.2s ease;
        }
        .estrella.seleccionada {
          color: #FFD700;
        }
        .estrella:hover {
          transform: scale(1.1);
        }
        .grupo-opinion textarea {
          width: 100%;
          padding: 12px;
          border: 2px solid #e0e0e0;
          border-radius: 8px;
          font-size: 14px;
          resize: vertical;
          font-family: inherit;
        }
        .btn-enviar {
          background-color: var(--color-primario, #B90F0F);
          color: white;
          padding: 12px 25px;
          border: none;
          border-radius: 25px;
          font-size: 16px;
          font-weight: bold;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .btn-enviar:hover {
          background-color: #8a0b0b;
          transform: scale(1.02);
        }
        .mensaje-exito {
          margin-top: 20px;
          padding: 12px;
          background-color: #4CAF50;
          color: white;
          border-radius: 8px;
          animation: fadeIn 0.3s ease;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes slideInRight {
          from { transform: translateX(100%); opacity: 0; }
          to { transform: translateX(0); opacity: 1; }
        }
        @keyframes slideOutRight {
          from { transform: translateX(0); opacity: 1; }
          to { transform: translateX(100%); opacity: 0; }
        }
        @media (max-width: 768px) {
          .producto {
            grid-template-columns: 1fr;
            text-align: center;
          }
          .dropdown-select {
            max-width: 100%;
          }
          .botones-container {
            justify-content: center;
          }
          .reseñas-titulo {
            font-size: 28px;
          }
          .reseñas-container {
            grid-template-columns: 1fr;
          }
          .footer {
            flex-direction: column;
            align-items: center;
            text-align: center;
          }
        }
        @media (max-width: 480px) {
          .descripcion_producto h1:first-child {
            font-size: 28px;
          }
          .descripcion_producto .precio-destacado {
            font-size: 26px;
          }
          .estrella {
            font-size: 28px;
          }
        }
      `}</style>
    </>
  );
};

export default Producto;