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
      navigate('/iniciosesion.html');
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
    navigate('/iniciosesion.html');
  };

  const enviarMensajeChat = () => {
    if (!inputChat.trim()) return;
    
    // Agregar mensaje del usuario
    setMensajesChat(prev => [...prev, { 
      tipo: 'usuario', 
      texto: inputChat, 
      hora: new Date().toLocaleTimeString() 
    }]);
    
    setInputChat('');
    
    // Respuesta automática
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

  return (
    <>
      {/* Header */}
      <header className="header">
        <div className="left">
          <a href="/" className="logo">
            <img src="../img/logo 2.jpeg" alt="Óptica Balamb" />
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
          <a href="/catalogo.html">Productos</a>
          <a href="/contactenos.html">Acerca de</a>
        </nav>

        <div className="icons">
          <button onClick={() => navigate('/carrito.html')}>
            <i className="fa-solid fa-cart-shopping"></i>
            {totalItems > 0 && <span className="cart-count">{totalItems}</span>}
          </button>
          <button id="btn-mensajes" onClick={() => setPanelMensajesAbierto(!panelMensajesAbierto)}>
            <i className="fa-regular fa-envelope"></i>
          </button>
          <button onClick={() => navigate('/perfil.html')}>
            <i className="fa-solid fa-circle-user"></i>
          </button>
        </div>
      </header>

      {/* Menú Hamburguesa */}
      <div className={`menu-hamburguesa ${menuAbierto ? 'active' : ''}`} id="menu-hamburguesa">
        <a href="/principal-cliente.html"><i className="fa-solid fa-house"></i> Inicio</a>
        <a href="/catalogo.html"><i className="fa-solid fa-glasses"></i> Catálogo</a>
        <a href="/carrito.html"><i className="fa-solid fa-cart-shopping"></i> Mi Carrito</a>
        <a href="/formula.html"><i className="fa-solid fa-eye"></i> Mi Fórmula</a>
        <a href="/perfil.html"><i className="fa-solid fa-user"></i> Mi Perfil</a>
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
            <button onClick={() => navigate('/catalogo.html')}>Ver ofertas →</button>
          </div>
          <div className="banner-imagen">
            <i className="fa-solid fa-glasses"></i>
          </div>
        </section>

        {/* Categorías destacadas */}
        <section className="categorias">
          <h2>Categorías destacadas</h2>
          <div className="categorias-grid">
            <div className="categoria-card" onClick={() => navigate('/catalogo.html')}>
              <i className="fa-solid fa-glasses"></i>
              <h3>Monturas</h3>
              <p>Ver todas</p>
            </div>
            <div className="categoria-card" onClick={() => navigate('/catalogo.html')}>
              <i className="fa-solid fa-sunglasses"></i>
              <h3>Gafas de Sol</h3>
              <p>Ver todas</p>
            </div>
            <div className="categoria-card" onClick={() => navigate('/formula.html')}>
              <i className="fa-solid fa-eye"></i>
              <h3>Fórmula Médica</h3>
              <p>Sube tu fórmula</p>
            </div>
            <div className="categoria-card" onClick={() => navigate('/catalogo.html')}>
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
              <div key={producto.id} className="producto-card">
                <div className="producto-imagen">
                  <img src={producto.imagen} alt={producto.nombre} />
                </div>
                <div className="producto-info">
                  <h4>{producto.nombre}</h4>
                  <p className="precio">${producto.precio.toLocaleString('es-CO')}</p>
                  <button onClick={() => navigate(`/producto.html?id=${producto.id}`)}>Ver detalles</button>
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
          <p>Acerca de</p>
          <p>Catálogo</p>
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

      {/* Estilos CSS */}
      <style jsx>{`
        :root {
          --color-primario: #B90F0F;
          --color-secundario: #000000;
          --color-fondo: #ffffff;
          --color-texto: #000000;
          --color-texto2: #ffffff;
          --color-boton: #B90F0F;
        }

        .header {
          background-color: var(--color-secundario);
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 30px;
          flex-wrap: wrap;
          gap: 15px;
        }
        .logo img {
          height: 70px;
        }
        .menu-btn {
          display: flex;
          width: 40px;
          height: 40px;
          background-color: var(--color-primario);
          border: none;
          border-radius: 5px;
          cursor: pointer;
          align-items: center;
          justify-content: center;
        }
        .menu-btn i {
          color: white;
          font-size: 20px;
        }
        .left {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .left-icons {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        #search-btn {
          background: transparent;
          border: none;
          color: white;
          cursor: pointer;
          font-size: 18px;
        }
        #search-input {
          width: 0;
          opacity: 0;
          transition: 0.5s;
          padding: 15px;
          outline: none;
          border: none;
          background-color: #f0f3ff;
          height: 30px;
          border-radius: 30px;
        }
        .menu {
          display: flex;
          gap: 20px;
        }
        .menu a {
          color: white;
          text-decoration: none;
          font-size: 14px;
        }
        .menu a:hover {
          color: var(--color-primario);
        }
        .icons {
          display: flex;
          align-items: center;
          gap: 15px;
        }
        .icons button {
          background: transparent;
          border: none;
          color: white;
          font-size: 20px;
          cursor: pointer;
          position: relative;
        }
        .cart-count {
          position: absolute;
          top: -8px;
          right: -8px;
          background: var(--color-primario);
          color: white;
          font-size: 10px;
          padding: 2px 5px;
          border-radius: 50%;
        }
        .cliente-main {
          max-width: 1200px;
          margin: 0 auto;
          padding: 30px 20px;
        }
        .bienvenida {
          margin-bottom: 30px;
        }
        .bienvenida h1 {
          font-size: 32px;
          color: var(--color-texto);
        }
        .bienvenida p {
          color: #666;
          margin-top: 5px;
        }
        .banner-oferta {
          background: linear-gradient(135deg, var(--color-primario), #8a0b0b);
          border-radius: 20px;
          padding: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          color: white;
        }
        .banner-content h2 {
          font-size: 28px;
          margin-bottom: 10px;
        }
        .banner-content button {
          background: white;
          color: var(--color-primario);
          border: none;
          padding: 10px 25px;
          border-radius: 30px;
          margin-top: 15px;
          cursor: pointer;
          font-weight: bold;
        }
        .banner-imagen i {
          font-size: 80px;
        }
        .categorias {
          margin-bottom: 50px;
        }
        .categorias h2 {
          margin-bottom: 20px;
          font-size: 24px;
        }
        .categorias-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
        }
        .categoria-card {
          background: white;
          padding: 30px;
          text-align: center;
          border-radius: 15px;
          cursor: pointer;
          transition: transform 0.3s, box-shadow 0.3s;
        }
        .categoria-card:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 25px rgba(0,0,0,0.1);
        }
        .categoria-card i {
          font-size: 40px;
          color: var(--color-primario);
          margin-bottom: 15px;
        }
        .categoria-card h3 {
          margin-bottom: 10px;
        }
        .categoria-card p {
          color: var(--color-primario);
          font-size: 14px;
        }
        .productos-destacados {
          margin-bottom: 50px;
        }
        .productos-destacados h2 {
          margin-bottom: 20px;
          font-size: 24px;
        }
        .productos-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 25px;
        }
        .producto-card {
          background: white;
          border-radius: 12px;
          overflow: hidden;
          transition: transform 0.3s;
          cursor: pointer;
        }
        .producto-card:hover {
          transform: translateY(-5px);
        }
        .producto-imagen {
          height: 200px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #f8f8f8;
        }
        .producto-imagen img {
          max-width: 80%;
          max-height: 150px;
        }
        .producto-info {
          padding: 15px;
          text-align: center;
        }
        .producto-info h4 {
          margin-bottom: 8px;
        }
        .precio {
          color: var(--color-primario);
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
        }
        .producto-info button {
          background: var(--color-secundario);
          color: white;
          border: none;
          padding: 8px 20px;
          border-radius: 20px;
          cursor: pointer;
          transition: background 0.3s;
        }
        .producto-info button:hover {
          background: var(--color-primario);
        }
        .beneficios {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          background: white;
          padding: 30px;
          border-radius: 20px;
        }
        .beneficio {
          text-align: center;
        }
        .beneficio i {
          font-size: 35px;
          color: var(--color-primario);
          margin-bottom: 10px;
        }
        .beneficio h3 {
          margin-bottom: 8px;
          font-size: 16px;
        }
        .beneficio p {
          color: #666;
          font-size: 13px;
        }
        .footer {
          background-color: var(--color-secundario);
          color: white;
          display: flex;
          justify-content: space-around;
          padding: 40px 80px;
          flex-wrap: wrap;
          gap: 30px;
        }
        .footer-section h3 {
          color: var(--color-primario);
          margin-bottom: 10px;
        }
        .footer-section p {
          font-size: 14px;
          cursor: pointer;
        }
        .menu-hamburguesa {
          position: fixed;
          top: 94px;
          left: -300px;
          width: 260px;
          background-color: var(--color-secundario);
          z-index: 1000;
          transition: left 0.3s;
          border-radius: 0 10px 10px 0;
          padding: 10px 0;
        }
        .menu-hamburguesa.active {
          left: 0;
        }
        .menu-hamburguesa a {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 20px;
          color: white;
          text-decoration: none;
        }
        .menu-hamburguesa a i {
          color: var(--color-primario);
        }
        .menu-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          z-index: 999;
          display: none;
        }
        .menu-overlay.active {
          display: block;
        }
        .panel-mensajes {
          position: fixed;
          top: 100px;
          right: 20px;
          width: 350px;
          background: white;
          border-radius: 12px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.2);
          z-index: 1001;
          opacity: 0;
          visibility: hidden;
          transition: all 0.3s;
        }
        .panel-mensajes.active {
          opacity: 1;
          visibility: visible;
        }
        .panel-header {
          background: var(--color-primario);
          color: white;
          padding: 12px 15px;
          border-radius: 12px 12px 0 0;
          display: flex;
          justify-content: space-between;
        }
        .cerrar-panel {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
        }
        .mensajes-lista {
          padding: 5px;
          max-height: 350px;
          overflow-y: auto;
        }
        .mensaje {
          display: flex;
          gap: 12px;
          padding: 12px;
          border-bottom: 1px solid #f0f0f0;
        }
        .chatbot {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 9999;
        }
        .chatbot-icono {
          width: 60px;
          height: 60px;
          background: var(--color-primario);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 28px;
          cursor: pointer;
        }
        .chatbot-ventana {
          position: absolute;
          bottom: 80px;
          right: 0;
          width: 350px;
          height: 500px;
          background: white;
          border-radius: 16px;
          display: none;
          flex-direction: column;
          overflow: hidden;
        }
        .chatbot-ventana.activo {
          display: flex;
        }
        .chatbot-header {
          background: var(--color-primario);
          color: white;
          padding: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .chatbot-header-info {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .chatbot-cerrar {
          background: none;
          border: none;
          color: white;
          font-size: 18px;
          cursor: pointer;
        }
        .chatbot-mensajes {
          flex: 1;
          padding: 15px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: #f9f9f9;
        }
        .mensaje {
          display: flex;
          flex-direction: column;
          max-width: 85%;
        }
        .mensaje.usuario {
          align-self: flex-end;
        }
        .mensaje.bot {
          align-self: flex-start;
        }
        .mensaje-contenido {
          padding: 10px 12px;
          border-radius: 15px;
          font-size: 14px;
        }
        .mensaje.usuario .mensaje-contenido {
          background: var(--color-primario);
          color: white;
          border-bottom-right-radius: 5px;
        }
        .mensaje.bot .mensaje-contenido {
          background: white;
          color: #333;
          border: 1px solid #e0e0e0;
          border-bottom-left-radius: 5px;
        }
        .mensaje-hora {
          font-size: 10px;
          color: #999;
          margin-top: 5px;
          margin-left: 10px;
        }
        .chatbot-input-area {
          display: flex;
          padding: 10px;
          border-top: 1px solid #e0e0e0;
          background: white;
          gap: 8px;
        }
        .chatbot-input-area input {
          flex: 1;
          padding: 10px;
          border: 1px solid #e0e0e0;
          border-radius: 20px;
          outline: none;
        }
        .chatbot-input-area button {
          background: var(--color-primario);
          border: none;
          border-radius: 50%;
          width: 38px;
          height: 38px;
          cursor: pointer;
          color: white;
        }
        .chatbot-opciones {
          display: flex;
          gap: 8px;
          padding: 10px;
          border-top: 1px solid #e0e0e0;
          flex-wrap: wrap;
        }
        .opcion-btn {
          background: #f0f0f0;
          border: none;
          padding: 6px 12px;
          border-radius: 15px;
          font-size: 12px;
          cursor: pointer;
        }
        .opcion-btn:hover {
          background: var(--color-primario);
          color: white;
        }
        @media (max-width: 768px) {
          .header {
            flex-direction: column;
            text-align: center;
          }
          .menu {
            flex-wrap: wrap;
            justify-content: center;
          }
          .banner-oferta {
            flex-direction: column;
            text-align: center;
          }
          .footer {
            flex-direction: column;
            text-align: center;
          }
          .chatbot-ventana {
            width: calc(100vw - 40px);
            right: 0;
          }
        }
      `}</style>
    </>
  );
};

export default PrincipalCliente;