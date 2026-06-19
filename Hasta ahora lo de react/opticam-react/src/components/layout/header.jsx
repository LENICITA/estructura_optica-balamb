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
        { path: '/', label: 'Inicio', icon: 'fa-solid fa-home' },
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
    
    // Cliente
    return [
      { path: '/', label: 'Inicio', icon: 'fa-solid fa-home' },
      { path: '/catalogo', label: 'Productos', icon: 'fa-solid fa-glasses' },
      { path: '/carrito', label: 'Carrito', icon: 'fa-solid fa-cart-shopping' },
      { path: '/contacto', label: 'Acerca de', icon: 'fa-solid fa-info-circle' },
      { path: '/perfil-cliente', label: 'Mi Perfil', icon: 'fa-solid fa-user' }
    ];
  };

  const menuItems = getMenuItems();

  return (
    <>
      <header 
        ref={headerRef} 
        className="bg-black text-white shadow-lg border-b border-gray-800"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Link to="/" className="flex items-center gap-2">
                <img src="/img/logo2.jpeg" alt="OptiCam" className="h-14 w-auto object-contain" />
                <span className="text-xl font-bold text-white hidden sm:inline">
                  Óptica<span className="text-red-600">Balamb</span>
                </span>
              </Link>
            </div>

            {/* Navegación central (escritorio) */}
            <nav className="hidden md:flex items-center gap-8">
              {menuItems.slice(0, 5).map((item, idx) => (
                <Link 
                  key={idx} 
                  to={item.path} 
                  className="text-sm font-medium text-gray-300 hover:text-white hover:scale-105 transition-all duration-200 relative group"
                >
                  {item.label}
                  <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-red-600 transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ))}
            </nav>

            {/* Iconos derecha */}
            <div className="flex items-center gap-3">
              {/* Buscador */}
              <div className={`flex items-center rounded-full bg-gray-800 transition-all duration-300 overflow-hidden ${searchActive ? 'w-64' : 'w-10'}`}>
                <button 
                  onClick={() => setSearchActive(!searchActive)} 
                  className="w-10 h-10 flex items-center justify-center hover:text-red-500 transition"
                >
                  <i className="fa-solid fa-magnifying-glass"></i>
                </button>
                <input 
                  type="text" 
                  placeholder="Buscar..." 
                  className={`bg-transparent text-white outline-none transition-all duration-300 ${searchActive ? 'w-48 px-2' : 'w-0'}`} 
                />
              </div>

              {/* ✅ CARRITO - Icono normal como perfil */}
              <Link 
                to="./carrito" 
                className="p-2 hover:text-red-500 transition"
              >
                <i className="fa-solid fa-cart-shopping text-lg"></i>
              </Link>
              
              {/* Notificaciones */}
              <button 
                onClick={() => setMensajesOpen(!mensajesOpen)} 
                className="p-2 hover:text-red-500 transition relative"
              >
                <i className="fa-regular fa-envelope text-lg"></i>
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              </button>
              
              {/* Login/Perfil */}
              {isAuthenticated ? (
                <button 
                  onClick={handleLogout} 
                  className="p-2 hover:text-red-500 transition"
                  title="Cerrar sesión"
                >
                  <i className="fa-solid fa-sign-out-alt text-lg"></i>
                </button>
              ) : (
                <Link to="/login" className="p-2 hover:text-red-500 transition">
                  <i className="fa-solid fa-circle-user text-lg"></i>
                </Link>
              )}

              {/* Menú hamburguesa (móvil) */}
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="md:hidden p-2 hover:text-red-500 transition"
              >
                <i className="fas fa-bars text-xl"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Panel de notificaciones */}
      {mensajesOpen && (
        <div className="fixed top-20 right-4 w-80 max-h-[400px] bg-gray-900 text-white shadow-2xl z-[1001] rounded-xl border border-gray-700 overflow-hidden">
          <div className="bg-red-600 p-4 flex justify-between items-center">
            <h4 className="font-semibold">
              <i className="fa-solid fa-bell mr-2"></i> Notificaciones
            </h4>
            <button onClick={() => setMensajesOpen(false)} className="hover:opacity-70 transition">
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>
          </div>
          <div className="p-3 max-h-[350px] overflow-y-auto divide-y divide-gray-700">
            <div className="flex gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
              <i className="fa-solid fa-box text-red-400 text-xl"></i>
              <div>
                <strong className="text-sm">📦 Nuevo pedido</strong>
                <p className="text-xs text-gray-400">Pedido #1234 espera confirmación</p>
                <small className="text-xs text-gray-500">Hace 5 min</small>
              </div>
            </div>
            <div className="flex gap-3 p-3 hover:bg-gray-800 rounded-lg transition">
              <i className="fa-solid fa-truck text-red-400 text-xl"></i>
              <div>
                <strong className="text-sm">🚚 Pedido enviado</strong>
                <p className="text-xs text-gray-400">Tu pedido #1235 está en camino</p>
                <small className="text-xs text-gray-500">Hace 2 horas</small>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Menú lateral (móvil) */}
      <div 
        className={`fixed top-0 left-0 w-72 h-full bg-gray-900 shadow-2xl z-[1000] transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ top: `${headerHeight}px`, height: `calc(100vh - ${headerHeight}px)` }}
      >
        <div className="py-4 px-3">
          {menuItems.map((item, idx) => (
            <Link 
              key={idx} 
              to={item.path} 
              onClick={() => setSidebarOpen(false)} 
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 text-sm"
            >
              <i className={`${item.icon} w-5 text-red-500`}></i>
              {item.label}
            </Link>
          ))}
          {isAuthenticated && (
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 text-gray-300 hover:text-white hover:bg-gray-800 rounded-lg transition-all duration-200 text-sm w-full text-left"
            >
              <i className="fa-solid fa-sign-out-alt w-5 text-red-500"></i>
              Cerrar Sesión
            </button>
          )}
        </div>
      </div>

      {/* Overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-[999]"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Header;