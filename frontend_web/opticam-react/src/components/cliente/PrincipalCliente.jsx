import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const PrincipalCliente = () => {
  const navigate = useNavigate();
  
  const navegacionRealizada = useRef(false);
  const cargadoInicial = useRef(false);
  
  const [nombreUsuario, setNombreUsuario] = useState('Cliente');
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [panelMensajesAbierto, setPanelMensajesAbierto] = useState(false);
  const [chatbotAbierto, setChatbotAbierto] = useState(false);
  const [mensajesChat, setMensajesChat] = useState([
    { tipo: 'bot', texto: '¡Hola! Soy OptiBot, tu asistente virtual. \n¿En qué puedo ayudarte hoy?', hora: 'Ahora' }
  ]);
  const [inputChat, setInputChat] = useState('');
  const [notificaciones, setNotificaciones] = useState([
    { titulo: "¡Bienvenido!", mensaje: "Gracias por ser parte de Óptica Balamb", tiempo: "Ahora" },
    { titulo: "Oferta especial", mensaje: "15% OFF en monturas seleccionadas", tiempo: "Hoy" }
  ]);


  // CARGAR DATOS DEL CLIENTE
  useEffect(() => {
    if (cargadoInicial.current) return;
    cargadoInicial.current = true;

    cargarDatosCliente();
    actualizarContadorCarrito();
  }, []);

  const cargarDatosCliente = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }


      // 1. Obtener perfil del usuario
      const perfilResponse = await api.get('/usuarios/perfil');

      let userData = perfilResponse.data;
      if (perfilResponse.data && perfilResponse.data.data) {
        userData = perfilResponse.data.data;
      }
      if (perfilResponse.data && perfilResponse.data.usuario) {
        userData = perfilResponse.data.usuario;
      }

      const nombre = userData.nombre_completo || 'Cliente';
      setNombreUsuario(nombre);
      localStorage.setItem('nombre', nombre);

      // Obtener productos destacados (últimos 6)
      try {
        const productosResponse = await api.get('/inventario/productos/destacados');

        let productosData = productosResponse.data;
        if (productosResponse.data && productosResponse.data.data) {
          productosData = productosResponse.data.data;
        }
        if (productosResponse.data && productosResponse.data.productos) {
          productosData = productosResponse.data.productos;
        }

        if (Array.isArray(productosData)) {
          // Mapear productos para el frontend
          const productosMapeados = productosData.map(p => ({
            id: p.id_producto || p.id,
            nombre: p.nombre || 'Producto',
            precio: p.precio || 0,
            imagen: p.imagen || p.imagen_url || '/img/default.png',
            material: p.material || 'No especificado',
            color: p.color || '',
            marca: p.marca || '',
            vendidos: p.vendidos || Math.floor(Math.random() * 200) + 1,
            ...p
          }));
          setProductosDestacados(productosMapeados);
        } else {
          // Si no hay productos destacados, usar datos de ejemplo
          setProductosDestacados([
            { id: 1, nombre: "Ángel Gold", precio: 250000, imagen: "/img/producto1.png", vendidos: 150 },
            { id: 2, nombre: "Sky Blue", precio: 180000, imagen: "/img/producto2.png", vendidos: 89 },
            { id: 3, nombre: "Titanium Pro", precio: 350000, imagen: "/img/producto3.png", vendidos: 45 },
            { id: 4, nombre: "Gafas Ámbar", precio: 250000, imagen: "/img/producto4.png", vendidos: 200 }
          ]);
        }

      } catch (err) {
        console.warn('No se pudieron cargar productos destacados:', err);
        // Datos de ejemplo
        setProductosDestacados([
          { id: 1, nombre: "Ángel Gold", precio: 250000, imagen: "/img/producto1.png", vendidos: 150 },
          { id: 2, nombre: "Sky Blue", precio: 180000, imagen: "/img/producto2.png", vendidos: 89 },
          { id: 3, nombre: "Titanium Pro", precio: 350000, imagen: "/img/producto3.png", vendidos: 45 },
          { id: 4, nombre: "Gafas Ámbar", precio: 250000, imagen: "/img/producto4.png", vendidos: 200 }
        ]);
      }

    } catch (err) {
      console.error('Error al cargar datos:', err);
      
      let mensajeError = 'Error al cargar tus datos. ';
      if (err.response?.status === 401) {
        mensajeError += 'Sesión expirada. Redirigiendo al login...';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        mensajeError += err.response?.data?.message || err.message;
      }
      
      setError(mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const actualizarContadorCarrito = () => {
    try {
      const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
      const total = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
      setTotalItems(total);
    } catch (error) {
      console.error('Error al actualizar carrito:', error);
    }
  };


  // CHATBOT
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
        texto: 'Gracias por tu mensaje. Un asesor te contactará pronto.', 
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


  // NAVEGACIÓN
  const irProducto = (id) => {
    if (!id) return;
    navigate(`/producto/${id}`, { replace: true });
  };

  const navegarSeguro = (ruta) => {
    if (!ruta) return;
    navigate(ruta, { replace: true });
  };


  // RENDERIZADO CONDICIONAL
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando tu dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex justify-center items-center p-5">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-lg p-8 text-center">
          <i className="fa-solid fa-triangle-exclamation text-5xl text-red-500 mb-4"></i>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-[#B90F0F] text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // RENDER PRINCIPAL
  return (
    <div className="min-h-screen bg-gray-50 relative">
      
      {/* ===== PANEL DE MENSAJES ===== */}
      <div 
        className={`fixed top-[70px] w-[380px] max-h-[80vh] bg-white shadow-2xl rounded-xl overflow-hidden z-[999] transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${
          panelMensajesAbierto ? 'right-5' : '-right-[400px]'
        } max-[992px]:w-[90%] max-[992px]:right-[-100%] max-[992px]:top-[10px] max-[992px]:active:right-[5%]`}
      >
        <div className="bg-[#B90F0F] text-white p-4 flex justify-between items-center">
          <h4 className="text-base flex items-center gap-2.5">
            <i className="fa-solid fa-bell"></i> Notificaciones
          </h4>
          <button className="bg-transparent border-none text-white text-xl cursor-pointer" onClick={() => setPanelMensajesAbierto(false)}>
            <i className="fa-solid fa-xmark"></i>
          </button>
        </div>
        <div className="p-4 max-h-[400px] overflow-y-auto">
          {notificaciones.map((noti, idx) => (
            <div key={idx} className="flex gap-4 p-4 border-b border-gray-100 hover:bg-red-50 transition-all">
              <i className="fa-solid fa-bell text-[#B90F0F] text-lg mt-1"></i>
              <div className="flex-1">
                <strong className="block text-sm text-[#222]">{noti.titulo}</strong>
                <p className="text-sm text-[#666] my-1">{noti.mensaje}</p>
                <small className="text-xs text-gray-400">{noti.tiempo}</small>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ===== CONTENIDO PRINCIPAL ===== */}
      <main className="max-w-[1200px] mx-auto p-5 md:p-[30px]">
        
        {/* BIENVENIDA */}
        <section className="bg-gradient-to-br from-[#B90F0F] to-[#6b0b0b] text-white p-8 md:p-12 rounded-xl flex justify-between items-center flex-wrap gap-5 mb-8 max-[992px]:p-8 max-[992px]:flex-col max-[992px]:text-center">
          <div className="bienvenida-texto">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">¡Bienvenido, {nombreUsuario}!</h1>
            <p className="text-base opacity-90">Encuentra las mejores monturas y cuida tu estilo visual</p>
          </div>
          <div className="flex gap-3 flex-wrap max-[992px]:justify-center">
            <button 
              onClick={() => navegarSeguro('/catalogo')}
              className="bg-white text-[#B90F0F] px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:shadow-lg hover:-translate-y-0.5 transition-all"
            >
              <i className="fa-solid fa-glasses"></i> Ver Catálogo
            </button>
            <button 
              onClick={() => navegarSeguro('/formula')}
              className="bg-white/20 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2 hover:bg-white/30 hover:-translate-y-0.5 transition-all"
            >
              <i className="fa-solid fa-eye"></i> Subir Fórmula
            </button>
          </div>
        </section>

        {/* CATEGORÍAS */}
        <section className="mb-10">
          <h2 className="text-2xl font-bold text-[#222] mb-5">Categorías destacadas</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: 'fa-glasses', title: 'Monturas', action: '/catalogo' },
              { icon: 'fa-sunglasses', title: 'Gafas de Sol', action: '/catalogo' },
              { icon: 'fa-eye', title: 'Fórmula Médica', action: '/formula' },
              { icon: 'fa-clock', title: 'Más Vendidos', action: '/catalogo' }
            ].map((cat, idx) => (
              <div 
                key={idx}
                onClick={() => navegarSeguro(cat.action)}
                className="bg-white p-6 rounded-xl text-center cursor-pointer shadow-md border-2 border-transparent hover:-translate-y-1 hover:shadow-lg hover:border-[#B90F0F] transition-all"
              >
                <i className={`fa-solid ${cat.icon} text-4xl text-[#B90F0F] mb-3`}></i>
                <h3 className="text-base font-semibold mb-1">{cat.title}</h3>
                <p className="text-sm text-[#B90F0F] font-medium">Ver todas</p>
              </div>
            ))}
          </div>
        </section>

        {/* PRODUCTOS DESTACADOS */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-2xl font-bold text-[#222]">Productos destacados</h2>
            <button 
              onClick={() => navegarSeguro('/catalogo')}
              className="bg-transparent border-none text-[#B90F0F] font-semibold flex items-center gap-1 hover:translate-x-1 transition-all cursor-pointer"
            >
              Ver todos <i className="fa-solid fa-arrow-right"></i>
            </button>
          </div>
          {productosDestacados.length === 0 ? (
            <div className="bg-white rounded-xl p-8 text-center">
              <p className="text-gray-500">No hay productos destacados disponibles</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {productosDestacados.map((producto) => (
                <div 
                  key={producto.id} 
                  onClick={() => irProducto(producto.id)}
                  className="bg-white rounded-xl overflow-hidden shadow-md hover:-translate-y-1 hover:shadow-xl transition-all cursor-pointer"
                >
                  <div className="bg-gray-50 p-5 flex justify-center items-center min-h-[200px]">
                    <img 
                      src={producto.imagen || '/img/default.png'} 
                      alt={producto.nombre} 
                      className="max-w-[80%] h-auto hover:scale-105 transition-all"
                      onError={(e) => e.target.src = '/img/default.png'}
                    />
                  </div>
                  <div className="p-4">
                    <h4 className="text-base font-semibold text-[#222] mb-1">{producto.nombre}</h4>
                    <p className="text-lg font-bold text-[#B90F0F] mb-1">
                      ${producto.precio.toLocaleString('es-CO')}
                    </p>
                    <p className="text-xs text-gray-500 mb-3">{producto.vendidos || 0} vendidos</p>
                    <button 
                      className="w-full py-2 bg-[#B90F0F] text-white rounded-lg text-sm font-semibold hover:bg-[#8a0b0b] transition-all"
                      onClick={(e) => { e.stopPropagation(); irProducto(producto.id); }}
                    >
                      Ver detalles
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* BENEFICIOS */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-6 my-10">
          {[
            { icon: 'fa-truck-fast', title: 'Envío gratis', desc: 'En compras mayores a $200.000' },
            { icon: 'fa-shield-haltered', title: 'Garantía', desc: '30 días de garantía' },
            { icon: 'fa-rotate-left', title: 'Devoluciones', desc: 'Hasta 15 días después' },
            { icon: 'fa-headset', title: 'Soporte 24/7', desc: 'Atención al cliente' }
          ].map((item, idx) => (
            <div key={idx} className="text-center p-6 bg-white rounded-xl shadow-md hover:-translate-y-1 hover:shadow-lg transition-all">
              <i className={`fa-solid ${item.icon} text-4xl text-[#B90F0F] mb-2`}></i>
              <h3 className="text-base font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-[#666]">{item.desc}</p>
            </div>
          ))}
        </section>
      </main>

      {/* ===== CHATBOT ===== */}
      <div className="fixed bottom-8 right-8 z-[999]">
        <button 
          onClick={() => setChatbotAbierto(!chatbotAbierto)}
          className="w-14 h-14 rounded-full bg-[#B90F0F] text-white border-none text-3xl shadow-xl hover:scale-110 hover:bg-[#8a0b0b] transition-all cursor-pointer flex items-center justify-center"
        >
          <i className="fa-solid fa-comment-dots"></i>
        </button>
        
        <div className={`absolute bottom-20 right-0 w-[350px] max-h-[500px] bg-white rounded-xl shadow-2xl flex-col overflow-hidden transition-all ${
          chatbotAbierto ? 'flex' : 'hidden'
        } max-[992px]:w-[300px] max-[992px]:right-[-20px] max-[480px]:w-[280px] max-[480px]:right-[-40px]`}>
          <div className="bg-[#B90F0F] text-white p-4 flex justify-between items-center">
            <div className="flex items-center gap-2.5">
              <i className="fa-solid fa-robot text-xl"></i>
              <span>OptiBot - Asistente Virtual</span>
            </div>
            <button className="bg-transparent border-none text-white text-xl cursor-pointer" onClick={() => setChatbotAbierto(false)}>
              <i className="fa-solid fa-times"></i>
            </button>
          </div>
          
          <div className="p-4 max-h-[300px] overflow-y-auto flex-1">
            {mensajesChat.map((msg, idx) => (
              <div key={idx} className={`mb-3 max-w-[85%] ${msg.tipo === 'bot' ? 'self-start' : 'self-end ml-auto'}`}>
                <div className={`p-3 rounded-xl text-sm ${msg.tipo === 'bot' ? 'bg-gray-100' : 'bg-[#B90F0F] text-white'}`}>
                  {msg.texto}
                </div>
                <div className="text-[10px] text-gray-400 mt-1">{msg.hora}</div>
              </div>
            ))}
          </div>
          
          <div className="p-2.5 border-t border-gray-200 flex gap-2.5">
            <input 
              type="text" 
              placeholder="Escribe tu mensaje..." 
              className="flex-1 p-2 border border-gray-300 rounded-lg text-sm outline-none focus:border-[#B90F0F]"
              value={inputChat}
              onChange={(e) => setInputChat(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && enviarMensajeChat()}
            />
            <button 
              onClick={enviarMensajeChat}
              className="px-4 py-2 bg-[#B90F0F] text-white rounded-lg hover:bg-[#8a0b0b] transition-all"
            >
              <i className="fa-solid fa-paper-plane"></i>
            </button>
          </div>
          
          <div className="p-2.5 flex flex-wrap gap-2 border-t border-gray-200">
            {['Precios', 'Envíos', 'Garantía', 'Contacto'].map((label, idx) => {
              const acciones = ['precios', 'envio', 'garantia', 'contacto'];
              return (
                <button 
                  key={idx}
                  onClick={() => respuestaRapida(acciones[idx])}
                  className="px-3 py-1 bg-gray-100 border-none rounded-full text-xs cursor-pointer hover:bg-[#B90F0F] hover:text-white transition-all"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrincipalCliente;