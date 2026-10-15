// src/shared/components/layout/Header.jsx
import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { alertConfirm } from '../../../shared/utils/alert';

export const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const headerRef = useRef(null);
  const [headerHeight, setHeaderHeight] = useState(94);

  useEffect(() => {
    if (headerRef.current) {
      setHeaderHeight(headerRef.current.offsetHeight);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const nombre = user.nombre_completo || localStorage.getItem('nombre') || user.email || '';
      setNombreUsuario(nombre);
    } else {
      const nombre = localStorage.getItem('nombre') || '';
      setNombreUsuario(nombre);
    }
  }, [user]);

  const getRoles = () => {
    if (!user) return [];

    let rolesArray = [];
    if (Array.isArray(user.roles)) {
      rolesArray = user.roles.map((role) => {
        if (typeof role === 'string') return role;
        return role?.nombre || role?.rol || role?.name || '';
      });
    } else if (typeof user.roles === 'string') {
      rolesArray = [user.roles];
    } else if (user.rol) {
      rolesArray = [user.rol];
    }
    return rolesArray.filter(Boolean).map((role) => role.toUpperCase());
  };

  const getMainRole = () => {
    const roles = getRoles();
    if (roles.includes('ADMIN') || roles.includes('ADMINISTRADOR')) return 'ADMIN';
    if (roles.includes('REPARTIDOR')) return 'REPARTIDOR';
    if (roles.includes('CLIENTE')) return 'CLIENTE';
    return '';
  };

  const goToHome = () => {
    setSidebarOpen(false);
    const role = getMainRole();

    if (!isAuthenticated || !user) {
      navigate('/');
      return;
    }

    if (role === 'ADMIN') {
      navigate('/admin/dashboard');
      return;
    }

    if (role === 'REPARTIDOR') {
      navigate('/repartidor/inicio');
      return;
    }

    if (role === 'CLIENTE') {
      navigate('/cliente/inicio');
      return;
    }

    navigate('/');
  };

  const handleLogout = async () => {
    const confirmado = await alertConfirm({
      title: '¿Cerrar sesión?',
      text: '¿Estás seguro de que quieres cerrar sesión?',
      confirmButtonText: 'Sí, cerrar sesión',
      cancelButtonText: 'Cancelar',
    });
    if (!confirmado) return;

    logout();
    navigate('/login');
    setSidebarOpen(false);
  };

  const getMenuItems = () => {
    const items = [];

    items.push({
      id: 'home',
      path: '/',
      label: 'Inicio',
      icon: 'fa-solid fa-home',
    });

    if (!isAuthenticated || getMainRole() === 'CLIENTE') {
      items.push({
        id: 'contacto',
        path: '/contacto',
        label: 'Contacto',
        icon: 'fa-solid fa-comment-dots',
      });
    }

    if (isAuthenticated && user) {
      const role = getMainRole();

      if (role === 'ADMIN') {
        items.push(
          { id: 'admin-inventario', path: '/admin/inventario', label: 'Inventario', icon: 'fa-solid fa-cube' },
          { id: 'admin-formulas', path: '/admin/formulas', label: 'Fórmulas', icon: 'fa-solid fa-eye' },
          { id: 'admin-pedidos', path: '/admin/pedidos', label: 'Pedidos', icon: 'fa-solid fa-cart-shopping' },
          { id: 'admin-distribuciones', path: '/admin/distribuciones', label: 'Distribuciones', icon: 'fa-solid fa-motorcycle' },
          { id: 'admin-repartidores', path: '/admin/repartidores', label: 'Repartidores', icon: 'fa-solid fa-users' },
          { id: 'admin-reportes', path: '/admin/reportes', label: 'Reportes', icon: 'fa-solid fa-chart-pie' }
        );
      } else if (role === 'REPARTIDOR') {
        items.push(
          { id: 'repartidor-historial', path: '/repartidor/historial', label: 'Historial', icon: 'fa-solid fa-clock-rotate-left' }
        );
      } else if (role === 'CLIENTE') {
        items.push(
          { id: 'catalogo', path: '/catalogo', label: 'Productos', icon: 'fa-solid fa-glasses' },
          { id: 'mis-formulas', path: '/cliente/mis-formulas', label: 'Mis Fórmulas', icon: 'fa-solid fa-file-medical' },
          { id: 'carrito', path: '/carrito', label: 'Carrito', icon: 'fa-solid fa-cart-shopping' },
          { id: 'mis-pedidos', path: '/cliente/mis-pedidos', label: 'Mis Pedidos', icon: 'fa-solid fa-box' }
        );
      }

      items.push({
        id: 'perfil',
        path:
          role === 'ADMIN' ? '/admin/perfil' :
          role === 'REPARTIDOR' ? '/repartidor/perfil' :
          '/cliente/perfil',
        label: 'Mi Perfil',
        icon: 'fa-solid fa-user',
      });
    }

    return items;
  };

  const menuItems = getMenuItems();

  const handleMenuNavigation = (path) => {
    setSidebarOpen(false);

    if (path === '/') {
      goToHome();
      return;
    }

    navigate(path);
  };

  return (
    <>
      <header
        ref={headerRef}
        className="bg-black flex items-center justify-between px-[30px] py-2.5 relative flex-wrap gap-[15px] z-50"
      >
        <div className="flex items-center gap-[15px]">
          <button onClick={goToHome} aria-label="Ir al inicio">
            <img src="/img/logo2.jpeg" alt="OptiCam" className="h-[70px]" />
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="flex w-10 h-10 bg-[#B90F0F] border-none rounded-md cursor-pointer items-center justify-center hover:bg-red-700 transition"
              aria-label="Abrir menú"
            >
              <i className="fas fa-bars text-white text-xl"></i>
            </button>

            <div
              className={`flex items-center rounded-[30px] shadow-md p-2.5 transition-all duration-500 overflow-hidden ${
                searchActive ? 'w-[300px]' : 'w-10'
              }`}
            >
              <button
                onClick={() => setSearchActive(!searchActive)}
                className="w-[30px] h-[30px] flex items-center justify-center"
                aria-label="Buscar"
              >
                <i className="fa-solid fa-magnifying-glass text-white"></i>
              </button>
              <input
                type="text"
                placeholder="Buscar..."
                className={`outline-none bg-[#f0f3ff] h-[30px] rounded-[30px] px-2.5 transition-all duration-500 ${
                  searchActive ? 'w-[250px] opacity-100' : 'w-0 opacity-0'
                }`}
                aria-label="Campo de búsqueda"
              />
            </div>
          </div>
        </div>

        <nav className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center gap-2 lg:gap-4 xl:gap-5">
          {menuItems.slice(0, 5).map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleMenuNavigation(item.path)}
              className="text-white text-xs lg:text-sm whitespace-nowrap hover:text-[#B90F0F] transition"
            >
              {item.label}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-2.5">
          {isAuthenticated && nombreUsuario && (
            <span className="text-white text-sm mr-2 hidden md:inline truncate max-w-[120px]">
              {nombreUsuario}
            </span>
          )}

          {isAuthenticated && getMainRole() === 'CLIENTE' && (
            <Link
              to="/carrito"
              className="text-white text-xl hover:text-[#B90F0F] transition"
              aria-label="Carrito"
            >
              <i className="fa-solid fa-cart-shopping"></i>
            </Link>
          )}

          {isAuthenticated ? (
            <button
              onClick={handleLogout}
              className="text-white text-xl hover:opacity-70 transition"
              aria-label="Cerrar sesión"
            >
              <i className="fa-solid fa-sign-out-alt"></i>
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="hidden sm:inline-flex items-center gap-2 px-4 py-2 border border-white/30 text-white text-sm font-semibold rounded-lg hover:bg-white/10 hover:border-white/60 transition"
              >
                <i className="fa-solid fa-right-to-bracket"></i>
                Iniciar sesión
              </Link>

              <Link
                to="/registro"
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#B90F0F] text-white text-sm font-semibold rounded-lg hover:bg-[#9f0d0d] transition"
              >
                <i className="fa-solid fa-user-plus"></i>
                Registrarse
              </Link>

              <Link
                to="/login"
                className="sm:hidden text-white text-xl hover:opacity-70 transition"
                aria-label="Iniciar sesión"
              >
                <i className="fa-solid fa-circle-user"></i>
              </Link>
            </>
          )}
        </div>
      </header>

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
          padding: '10px 0',
        }}
      >
        {isAuthenticated && user && (
          <div className="px-5 pt-3 pb-4 border-b border-gray-700">
            <p className="text-white text-base font-bold truncate">
              {user.nombre_completo}
            </p>
            <p className="text-[#B90F0F] text-xs font-semibold mt-1">
              {getMainRole() === 'ADMIN'
                ? 'Administrador'
                : getMainRole() === 'REPARTIDOR'
                ? 'Repartidor'
                : 'Cliente'}
            </p>
          </div>
        )}

        {menuItems.map((item, idx) => (
          <button
            key={idx}
            onClick={() => handleMenuNavigation(item.path)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 20px',
              color: 'white',
              textDecoration: 'none',
              transition: 'all 0.3s',
              fontSize: '15px',
              width: '100%',
              background: 'transparent',
              border: 'none',
              borderBottom: '1px solid #333',
              cursor: 'pointer',
              textAlign: 'left',
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
          </button>
        ))}

        {isAuthenticated && (
          <>
            <div
              style={{
                borderBottom: '1px solid #333',
                margin: '5px 0',
              }}
            ></div>
            <button
              onClick={handleLogout}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                color: 'white',
                textDecoration: 'none',
                transition: 'all 0.3s',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '15px',
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
          </>
        )}

        {!isAuthenticated && (
          <>
            <div
              style={{
                borderBottom: '1px solid #333',
                margin: '5px 0',
              }}
            ></div>

            <button
              onClick={() => handleMenuNavigation('/login')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                color: 'white',
                transition: 'all 0.3s',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '15px',
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
              <i className="fa-solid fa-right-to-bracket w-5" style={{ color: '#B90F0F' }}></i>
              Iniciar Sesión
            </button>

            <button
              onClick={() => handleMenuNavigation('/registro')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 20px',
                color: 'white',
                transition: 'all 0.3s',
                width: '100%',
                textAlign: 'left',
                cursor: 'pointer',
                backgroundColor: 'transparent',
                border: 'none',
                fontSize: '15px',
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
              <i className="fa-solid fa-user-plus w-5" style={{ color: '#B90F0F' }}></i>
              Registrarse
            </button>
          </>
        )}
      </div>

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
            cursor: 'pointer',
          }}
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};