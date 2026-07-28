import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PrincipalCliente = () => {
  const navigate = useNavigate();
  const [nombreUsuario, setNombreUsuario] = useState('Cliente');
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [menuAbierto, setMenuAbierto] = useState(false);
  const [panelMensajesAbierto, setPanelMensajesAbierto] = useState(false);
  const [chatbotAbierto, setChatbotAbierto] = useState(false);
  const [mensajesChat, setMensajesChat] = useState([
    { tipo: 'bot', texto: '¡Hola! Soy OptiBot, tu asistente virtual. 😊\n¿En qué puedo ayudarte hoy?', hora: 'Ahora' }
  ]);
  const [inputChat, setInputChat] = useState('');
  const [notificaciones, setNotificaciones] = useState([
    { titulo: "¡Bienvenido!", mensaje: "Gracias por ser parte de Óptica Balamb", tiempo: "Ahora" },
    { titulo: "Oferta especial", mensaje: "15% OFF en monturas seleccionadas", tiempo: "Hoy" }
  ]);

  useEffect(() => {
    const nombre = localStorage.getItem('nombre') || 'Cliente';
    const email = localStorage.getItem('email');
    const rol = localStorage.getItem('rol');
    
    if (!email) {
      navigate('/login'); // ✅ Cambiado
      return;
    }
    
    setNombreUsuario(nombre);
    actualizarContadorCarrito();
    cargarProductosDestacados();
  }, []);

  const actualizarContadorCarrito = () => {
    const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
    const total = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
    setTotalItems(total);
  };

  const cargarProductosDestacados = () => {
    let productos = JSON.parse(localStorage.getItem('productos') || '[]');
    
    if (productos.length === 0) {
      productos = [
        { id: 1, nombre: "Ángel Gold", precio: 250000, imagen: "/img/producto1.png" },
        { id: 2, nombre: "Sky Blue", precio: 180000, imagen: "/img/producto2.png" },
        { id: 3, nombre: "Titanium Pro", precio: 350000, imagen: "/img/producto3.png" },
        { id: 4, nombre: "Gafas Ámbar", precio: 250000, imagen: "/img/producto4.png" }
      ];
    }
    
    setProductosDestacados(productos.slice(0, 4));
  };

  const cerrarSesion = () => {
    localStorage.clear();
    navigate('/login'); // ✅ Cambiado
  };

  const enviarMensajeChat = () => {
    if (!inputChat.trim()) return;
    
    setMensajesChat(prev => [...prev, { 
      tipo: 'usuario', 
      texto: inputChat, 
      hora: new Date().toLocaleTimeString() 
    }]);
    
    setInputChat('');
    
    setTimeout(() => {
      setMensajesChat(prev => [...prev, { 
        tipo: 'bot', 
        texto: 'Gracias por tu mensaje. Un asesor te contactará pronto. 😊', 
        hora: new Date().toLocaleTimeString() 
      }]);
    }, 500);
  };

  const respuestaRapida = (respuesta) => {
    let mensaje = '';
    switch(respuesta) {
      case 'precios':
        mensaje = 'Nuestros precios van desde $50.000 hasta $350.000';
        break;
      case 'envio':
        mensaje = 'El envío es gratis en compras mayores a $200.000';
        break;
      case 'garantia':
        mensaje = 'Todos nuestros productos tienen 30 días de garantía';
        break;
      case 'contacto':
        mensaje = 'Puedes contactarnos al +57 300 237 4767';
        break;
      default:
        mensaje = '¿En qué más puedo ayudarte?';
    }
    
    setMensajesChat(prev => [...prev, { 
      tipo: 'bot', 
      texto: mensaje, 
      hora: new Date().toLocaleTimeString() 
    }]);
  };

  // ✅ Función para navegar a producto
  const irProducto = (id) => {
    navigate(`/producto/${id}`);
  };

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="left">
          <a href="/" className="logo" onClick={(e) => { e.preventDefault(); navigate('/'); }}>
            <img src="/img/logo 2.jpeg" alt="Óptica Balamb" />
          </a>
          <div className="left-icons">
            <button id="btn-menu" className="menu-btn" onClick={() => setMenuAbierto(!menuAbierto)}>
              <i className="fas fa-bars"></i>
            </button>
            <form id="search-form" onSubmit={(e) => e.preventDefault()}>
              <button type="button" id="search-btn">
                <i className="fa-solid fa-magnifying-glass"></i>
              </button>
              <input type="text" id="search-input" placeholder="Buscar..." />
            </form>
          </div>
        </div>

        <nav className="menu">
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/catalogo'); }}>Productos</a>
          <a href="#" onClick={(e) => { e.preventDefault(); navigate('/contacto'); }}>Acerca de</a>
        </nav>

        <div className="icons">
          <button onClick={() => navigate('/carrito')}>
            <i className="fa-solid fa-cart-shopping"></i>
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </button>
          <button id="btn-mensajes" onClick={() => setPanelMensajesAbierto(!panelMensajesAbierto)}>
            <i className="fa-regular fa-envelope"></i>
          </button>
          <button onClick={() => navigate('/perfil-cliente')}>
            <i className="fa-solid fa-circle-user"></i>
          </button>
        </div>
      </header>

      {/* Menú Hamburguesa */}
      <div className={`menu-hamburguesa ${menuAbierto ? 'active' : ''}`} id="menu-hamburguesa">
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/'); }}><i className="fa-solid fa-house"></i> Inicio</a>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/catalogo'); }}><i className="fa-solid fa-glasses"></i> Catálogo</a>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/carrito'); }}><i className="fa-solid fa-cart-shopping"></i> Mi Carrito</a>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/formula'); }}><i className="fa-solid fa-eye"></i> Mi Fórmula</a>
        <a href="#" onClick={(e) => { e.preventDefault(); navigate('/perfil-cliente'); }}><i className="fa-solid fa-user"></i> Mi Perfil</a>
        <a href="#" onClick={cerrarSesion}><i className="fa-solid fa-sign-out-alt"></i> Cerrar Sesión</a>
      </div>
      <div className={`menu-overlay ${menuAbierto ? 'active' : ''}`} onClick={() => setMenuAbierto(false)}></div>

      {/* Panel de Mensajes */}
      <div className={`panel-mensajes ${panelMensajesAbierto ? 'active' : ''}`} id="panel-mensajes">
        <div className="panel-header">
          <h4><i className="fa-solid fa-bell"></i> Notificaciones</h4>
          <button className="cerrar-panel" onClick={() => setPanelMensajesAbierto(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div id="mensajes-lista" className="mensajes-lista">
          {notificaciones.map((noti, idx) => (
            <div key={idx} className="mensaje">
              <i className="fa-solid fa-bell"></i>
              <div className="mensaje-contenido">
                <strong>{noti.titulo}</strong>
                <p>{noti.mensaje}</p>
                <small>{noti.tiempo}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Contenido Principal */}
      <main className="cliente-main">
        {/* Bienvenida */}
        <section className="bienvenida">
          <h1 id="bienvenida-nombre">¡Bienvenido, {nombreUsuario}! 👓</h1>
          <p>Encuentra las mejores monturas y cuida tu estilo visual</p>
        </section>

        {/* Banner Oferta */}
        <section className="banner-oferta">
          <div className="banner-content">
            <h2>✨ Hasta 30% OFF ✨</h2>
            <p>En monturas seleccionadas</p>
            <button onClick={() => navigate('/catalogo')}>Ver ofertas →</button>
          </div>
          <div className="banner-imagen">
            <i className="fa-solid fa-glasses"></i>
          </div>
        </section>

        {/* Categorías destacadas */}
        <section className="categorias">
          <h2>Categorías destacadas</h2>
          <div className="categorias-grid">
            <div className="categoria-card" onClick={() => navigate('/catalogo')}>
              <i className="fa-solid fa-glasses"></i>
              <h3>Monturas</h3>
              <p>Ver todas</p>
            </div>
            <div className="categoria-card" onClick={() => navigate('/catalogo')}>
              <i className="fa-solid fa-sunglasses"></i>
              <h3>Gafas de Sol</h3>
              <p>Ver todas</p>
            </div>
            <div className="categoria-card" onClick={() => navigate('/formula')}>
              <i className="fa-solid fa-eye"></i>
              <h3>Fórmula Médica</h3>
              <p>Sube tu fórmula</p>
            </div>
            <div className="categoria-card" onClick={() => navigate('/catalogo')}>
              <i className="fa-solid fa-clock"></i>
              <h3>Más Vendidos</h3>
              <p>Ver todos</p>
            </div>
          </div>
        </section>

        {/* Productos destacados */}
        <section className="productos-destacados">
          <h2>🔥 Productos destacados</h2>
          <div className="productos-grid" id="productos-destacados">
            {productosDestacados.map((producto) => (
              <div key={producto.id} className="producto-card" onClick={() => irProducto(producto.id)}>
                <div className="producto-imagen">
                  <img src={producto.imagen} alt={producto.nombre} />
                </div>
                <div className="producto-info">
                  <h4>{producto.nombre}</h4>
                  <p className="precio">${producto.precio.toLocaleString('es-CO')}</p>
                  <button onClick={(e) => { e.stopPropagation(); irProducto(producto.id); }}>Ver detalles</button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Beneficios */}
        <section className="beneficios">
          <div className="beneficio">
            <i className="fa-solid fa-truck-fast"></i>
            <h3>Envío gratis</h3>
            <p>En compras mayores a $200.000</p>
          </div>
          <div className="beneficio">
            <i className="fa-solid fa-shield-haltered"></i>
            <h3>Garantía</h3>
            <p>30 días de garantía</p>
          </div>
          <div className="beneficio">
            <i className="fa-solid fa-rotate-left"></i>
            <h3>Devoluciones</h3>
            <p>Hasta 15 días después</p>
          </div>
          <div className="beneficio">
            <i className="fa-solid fa-headset"></i>
            <h3>Soporte 24/7</h3>
            <p>Atención al cliente</p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-section">
          <h3>Contacto</h3>
          <p>opticavirtualbalamb@gmail.com</p>
          <p>+57 300 237 4767</p>
        </div>
        <div className="footer-section">
          <h3>Tienda</h3>
          <p onClick={() => navigate('/contacto')} style={{ cursor: 'pointer' }}>Acerca de</p>
          <p onClick={() => navigate('/catalogo')} style={{ cursor: 'pointer' }}>Catálogo</p>
        </div>
      </footer>

      {/* Chatbot */}
      <div id="chatbot" className="chatbot">
        <div className="chatbot-icono" onClick={() => setChatbotAbierto(!chatbotAbierto)}>
          <i className="fa-solid fa-comment-dots"></i>
        </div>
        <div className={`chatbot-ventana ${chatbotAbierto ? 'activo' : ''}`} id="chatbot-ventana">
          <div className="chatbot-header">
            <div className="chatbot-header-info">
              <i className="fa-solid fa-robot"></i>
              <span>OptiBot - Asistente Virtual</span>
            </div>
            <button className="chatbot-cerrar" onClick={() => setChatbotAbierto(false)}>
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          <div className="chatbot-mensajes" id="chatbot-mensajes">
            {mensajesChat.map((msg, idx) => (
              <div key={idx} className={`mensaje ${msg.tipo}`}>
                <div className="mensaje-contenido">{msg.texto}</div>
                <div className="mensaje-hora">{msg.hora}</div>
              </div>
            ))}
          </div>
          <div className="chatbot-input-area">
            <input 
              type="text" 
              id="chatbot-input" 
              placeholder="Escribe tu mensaje..." 
              value={inputChat}
              onChange={(e) => setInputChat(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && enviarMensajeChat()}
            />
            <button id="chatbot-enviar" onClick={enviarMensajeChat}>
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
          <div className="chatbot-opciones">
            <button className="opcion-btn" onClick={() => respuestaRapida('precios')}>💰 Precios</button>
            <button className="opcion-btn" onClick={() => respuestaRapida('envio')}>📦 Envíos</button>
            <button className="opcion-btn" onClick={() => respuestaRapida('garantia')}>🛡️ Garantía</button>
            <button className="opcion-btn" onClick={() => respuestaRapida('contacto')}>📞 Contacto</button>
          </div>
        </div>
      </div>

      {/* Estilos CSS - mismos estilos que ya tenías */}
      <style jsx>{`
        /* ... todos los estilos permanecen igual ... */
      `}</style>
    </>
  );
};

export default PrincipalCliente;