import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [mensajesOpen, setMensajesOpen] = useState(false);
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(94);

  // Calcular la altura del header
  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
    setSidebarOpen(false);
  };

  const getMenuItems = () => {
    if (!isAuthenticated) {
      return [
        { path: '/inicio-cliente', label: 'Inicio', icon: 'fa-solid fa-home' },
        { path: '/catalogo', label: 'Productos', icon: 'fa-solid fa-glasses' },
        { path: '/contacto', label: 'Acerca de', icon: 'fa-solid fa-info-circle' }
      ];
    }
    
    if (user?.rol === 'admin') {
      return [
        { path: '/admin/dashboard', label: 'Dashboard', icon: 'fa-solid fa-chart-line' },
        { path: '/admin/inventario', label: 'Inventario', icon: 'fa-solid fa-box' },
        { path: '/admin/pedidos', label: 'Pedidos', icon: 'fa-solid fa-cart-shopping' },
        { path: '/admin/repartidores', label: 'Repartidores', icon: 'fa-solid fa-motorcycle' },
        { path: '/admin/reportes', label: 'Reportes', icon: 'fa-solid fa-chart-pie' },
        { path: '/admin/formulas', label: 'Fórmulas', icon: 'fa-solid fa-eye' },
        { path: '/admin/perfil', label: 'Mi Perfil', icon: 'fa-solid fa-user' }
      ];
    }
    
    if (user?.rol === 'repartidor') {
      return [
        { path: '/repartidor/inicio', label: 'Inicio', icon: 'fa-solid fa-home' },
        { path: '/repartidor/historial', label: 'Historial', icon: 'fa-solid fa-clock-rotate-left' },
        { path: '/perfil-repartidor', label: 'Mi Perfil', icon: 'fa-solid fa-user' }
      ];
    }
    
    return [
      { path: '/inicio-cliente', label: 'Inicio', icon: 'fa-solid fa-home' },
      { path: '/catalogo', label: 'Productos', icon: 'fa-solid fa-glasses' },
      { path: '/carrito', label: 'Carrito', icon: 'fa-solid fa-cart-shopping' },
      { path: '/contacto', label: 'Acerca de', icon: 'fa-solid fa-info-circle' },
      { path: '/perfil-cliente', label: 'Mi Perfil', icon: 'fa-solid fa-user' }
    ];
  };

  const menuItems = getMenuItems();

  return (
    <>
      <header ref={headerRef} className="bg-black flex items-center justify-between px-[30px] py-2.5 relative flex-wrap gap-[15px] z-50">
        <div className="flex items-center gap-[15px]">

            <img src="/img/logo2.jpeg" alt="OptiCam" className="h-[70px]" />
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex w-10 h-10 bg-[#B90F0F] border-none rounded-md cursor-pointer items-center justify-center hover:bg-red-700 transition"
            >
              <i className="fas fa-bars text-white text-xl"></i>
            </button>
            
            <div className={`flex items-center rounded-[30px] shadow-md p-2.5 transition-all duration-500 overflow-hidden ${searchActive ? 'w-[300px]' : 'w-10'}`}>
              <button onClick={() => setSearchActive(!searchActive)} className="w-[30px] h-[30px]">
                <i className="fa-solid fa-magnifying-glass text-white"></i>
              </button>
              <input 
                type="text" 
                placeholder="Buscar..." 
                className={`outline-none bg-[#f0f3ff] h-[30px] rounded-[30px] px-2.5 transition-all duration-500 ${searchActive ? 'w-[250px] opacity-100' : 'w-0 opacity-0'}`} 
              />
            </div>
          </div>
        </div>

        <nav className="absolute left-1/2 -translate-x-1/2 flex gap-5 max-md:hidden">
          {menuItems.slice(0, 5).map((item, idx) => (
            <Link key={idx} to={item.path} className="text-white text-sm hover:text-[#B90F0F] transition">
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {isAuthenticated && user?.rol === 'cliente' && (
            <Link to="/carrito" className="text-white text-xl hover:text-[#B90F0F]">
              <i className="fa-solid fa-cart-shopping"></i>
            </Link>
          )}
          
          <button onClick={() => setMensajesOpen(!mensajesOpen)} className="text-white text-xl hover:opacity-70">
            <i className="fa-regular fa-envelope"></i>
          </button>
          
          {isAuthenticated ? (
            <button onClick={handleLogout} className="text-white text-xl hover:opacity-70">
              <i className="fa-solid fa-sign-out-alt"></i>
            </button>
          ) : (
            <Link to="/login" className="text-white text-xl hover:opacity-70">
              <i className="fa-solid fa-circle-user"></i>
            </Link>
          )}
        </div>
      </header>

      {mensajesOpen && (
        <div className="fixed top-[100px] right-5 w-[350px] max-h-[400px] bg-white shadow-md z-[1001] rounded-xl border border-gray-100">
          <div className="bg-[#B90F0F] text-white p-3 rounded-t-xl flex justify-between">
            <h4 className="text-sm"><i className="fa-solid fa-bell"></i> Notificaciones</h4>
            <button onClick={() => setMensajesOpen(false)} className="text-white"><i className="fa-solid fa-xmark"></i></button>
          </div>
          <div className="p-2">
            <div className="flex gap-3 p-3 border-b hover:bg-gray-50">
              <i className="fa-solid fa-box text-[#B90F0F]"></i>
              <div>
                <strong>📦 Nuevo pedido</strong>
                <p className="text-xs text-gray-500">Pedido #1234 espera confirmación</p>
                <small className="text-xs text-gray-400">Hace 5 min</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menú lateral */}
      <div 
        style={{
          position: 'fixed',
          top: `${headerHeight}px`,
          left: sidebarOpen ? '0' : '-300px',
          width: '260px',
          height: `calc(100vh - ${headerHeight}px)`,
          backgroundColor: 'black',
          boxShadow: '2px 5px 10px rgba(0,0,0,0.3)',
          zIndex: 1000,
          transition: 'left 0.3s ease',
          overflowY: 'auto',
          borderRadius: '0 10px 10px 0',
          padding: '10px 0'
        }}
      >
        {menuItems.map((item, idx) => (
          <Link 
            key={idx} 
            to={item.path} 
            onClick={() => setSidebarOpen(false)} 
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              color: 'white',
              textDecoration: 'none',
              borderBottom: '1px solid #333',
              transition: 'all 0.3s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a1a1a';
              e.currentTarget.style.paddingLeft = '25px';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.paddingLeft = '20px';
            }}
          >
            <i className={`${item.icon} w-5`} style={{ color: '#B90F0F' }}></i>
            {item.label}
          </Link>
        ))}
        {isAuthenticated && (
          <button 
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              color: 'white',
              textDecoration: 'none',
              borderBottom: '1px solid #333',
              transition: 'all 0.3s',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              backgroundColor: 'transparent'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#1a1a1a';
              e.currentTarget.style.paddingLeft = '25px';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.paddingLeft = '20px';
            }}
          >
            <i className="fa-solid fa-sign-out-alt w-5" style={{ color: '#B90F0F' }}></i>
            Cerrar Sesión
          </button>
        )}
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0,0,0,0.5)',
            zIndex: 999,
            cursor: 'pointer'
          }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Header;