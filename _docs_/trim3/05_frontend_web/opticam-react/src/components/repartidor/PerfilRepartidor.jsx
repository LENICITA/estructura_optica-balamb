import React, { useState } from 'react';

const PerfilRepartidor = () => {
  const [editando, setEditando] = useState(false);
  const [formData, setFormData] = useState({
    nombre: 'Fernando García',
    direccion: 'Calle Principal #456',
    correo: 'fernando@gmail.com',
    telefono: '3112223344'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const activarEdicion = () => {
    setEditando(true);
  };

  const guardar = () => {
    alert('✅ Datos guardados correctamente');
    setEditando(false);
  };import React, { useState, useEffect } from 'react';
  
  const Perfil = () => {
    const [editando, setEditando] = useState(false);
    const [usuarioActual, setUsuarioActual] = useState(null);
    const [formData, setFormData] = useState({
      nombre: '',
      documento: '',
      correo: '',
      telefono: '',
      direccion: '',
      password: '********'
    });
    const [preferencias, setPreferencias] = useState({
      notificacionesEmail: true,
      notificacionesPedidos: true
    });
    const [pedidosRecientes, setPedidosRecientes] = useState([]);
    const [fotoPerfil, setFotoPerfil] = useState('https://via.placeholder.com/150');
    const [totalPedidos, setTotalPedidos] = useState(0);
    const [totalReseñas, setTotalReseñas] = useState(0);
    const [mostrarPassword, setMostrarPassword] = useState(false);
  
    useEffect(() => {
      const emailUsuario = localStorage.getItem('email');
      const rolUsuario = localStorage.getItem('rol');
      
      if (!emailUsuario) {
        alert('❌ No hay sesión iniciada. Redirigiendo al login...');
        window.location.href = '/principal.html';
        return;
      }
      
      if (rolUsuario === 'admin') {
        cargarDatosAdmin();
      } else if (rolUsuario === 'cliente') {
        cargarDatosCliente();
      } else if (rolUsuario === 'repartidor') {
        cargarDatosRepartidor();
      } else {
        cargarDatosCliente();
      }
      
      cargarPedidosRecientes();
      cargarFotoPerfil();
      actualizarContadorCarrito();
    }, []);
  
    const cargarDatosCliente = () => {
      const emailLogueado = localStorage.getItem('email');
      const clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const usuario = clientes.find(c => c.email === emailLogueado);
      
      if (usuario) {
        setUsuarioActual(usuario);
        setFormData({
          nombre: usuario.nombre || '',
          documento: usuario.documento || '',
          correo: usuario.email || '',
          telefono: usuario.telefono || '',
          direccion: usuario.direccion || '',
          password: '********'
        });
        cargarEstadisticas(usuario.email);
      } else {
        const usuarioTemp = {
          nombre: localStorage.getItem('nombre') || 'Cliente',
          email: emailLogueado,
          documento: 'No registrado',
          telefono: 'No registrado',
          direccion: 'No registrada',
          fechaRegistro: new Date().toISOString(),
          rol: 'cliente'
        };
        setUsuarioActual(usuarioTemp);
        setFormData({
          nombre: usuarioTemp.nombre,
          documento: usuarioTemp.documento,
          correo: usuarioTemp.email,
          telefono: usuarioTemp.telefono,
          direccion: usuarioTemp.direccion,
          password: '********'
        });
        cargarEstadisticas(usuarioTemp.email);
      }
    };
  
    const cargarDatosAdmin = () => {
      const usuarioTemp = {
        nombre: localStorage.getItem('nombre') || 'Administrador',
        email: localStorage.getItem('email') || 'admin@gmail.com',
        documento: 'ADMIN-001',
        telefono: '3000000000',
        direccion: 'Óptica Balamb - Sede Principal',
        fechaRegistro: new Date().toISOString(),
        rol: 'admin'
      };
      setUsuarioActual(usuarioTemp);
      setFormData({
        nombre: usuarioTemp.nombre,
        documento: usuarioTemp.documento,
        correo: usuarioTemp.email,
        telefono: usuarioTemp.telefono,
        direccion: usuarioTemp.direccion,
        password: '********'
      });
    };
  
    const cargarDatosRepartidor = () => {
      const emailLogueado = localStorage.getItem('email');
      const repartidores = JSON.parse(localStorage.getItem('repartidores') || '[]');
      const usuario = repartidores.find(r => r.email === emailLogueado);
      
      if (usuario) {
        setUsuarioActual(usuario);
        setFormData({
          nombre: usuario.nombre || '',
          documento: usuario.documento || '',
          correo: usuario.email || '',
          telefono: usuario.telefono || '',
          direccion: usuario.direccion || '',
          password: '********'
        });
      } else {
        const usuarioTemp = {
          nombre: localStorage.getItem('nombre') || 'Repartidor',
          email: emailLogueado,
          documento: 'No registrado',
          telefono: 'No registrado',
          direccion: 'No registrada',
          fechaRegistro: new Date().toISOString(),
          rol: 'repartidor'
        };
        setUsuarioActual(usuarioTemp);
        setFormData({
          nombre: usuarioTemp.nombre,
          documento: usuarioTemp.documento,
          correo: usuarioTemp.email,
          telefono: usuarioTemp.telefono,
          direccion: usuarioTemp.direccion,
          password: '********'
        });
      }
    };
  
    const cargarEstadisticas = (emailUsuario) => {
      const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
      const pedidosUsuario = pedidos.filter(p => p.cliente?.email === emailUsuario);
      setTotalPedidos(pedidosUsuario.length);
      
      const reseñas = JSON.parse(localStorage.getItem('reseñas_producto') || '[]');
      const reseñasUsuario = reseñas.filter(r => r.email === emailUsuario);
      setTotalReseñas(reseñasUsuario.length);
    };
  
    const cargarPedidosRecientes = () => {
      const pedidos = JSON.parse(localStorage.getItem('pedidos') || '[]');
      const emailUsuario = usuarioActual?.email || localStorage.getItem('email');
      const pedidosUsuario = pedidos.filter(p => p.cliente?.email === emailUsuario);
      const pedidosRecientesData = [...pedidosUsuario].reverse().slice(0, 3);
      setPedidosRecientes(pedidosRecientesData);
    };
  
    const cargarFotoPerfil = () => {
      const fotoGuardada = localStorage.getItem('foto_perfil');
      if (fotoGuardada) {
        setFotoPerfil(fotoGuardada);
      }
    };
  
    const cargarPreferencias = () => {
      const prefEmail = localStorage.getItem('notificaciones_email');
      const prefPedidos = localStorage.getItem('notificaciones_pedidos');
      setPreferencias({
        notificacionesEmail: prefEmail !== 'false',
        notificacionesPedidos: prefPedidos !== 'false'
      });
    };
  
    const activarEdicion = () => {
      setEditando(true);
      mostrarNotificacion('✏️ Ahora puedes editar tu información', 'info');
    };
  
    const guardar = () => {
      if (!editando) {
        mostrarNotificacion('Primero presiona "Editar perfil"', 'warning');
        return;
      }
      
      if (!formData.direccion) {
        mostrarNotificacion('❌ La dirección no puede estar vacía', 'error');
        return;
      }
      
      if (!formData.telefono) {
        mostrarNotificacion('❌ El teléfono no puede estar vacío', 'error');
        return;
      }
      
      if (formData.telefono.length < 7) {
        mostrarNotificacion('❌ El teléfono debe tener al menos 7 dígitos', 'error');
        return;
      }
      
      // Guardar preferencias
      localStorage.setItem('notificaciones_email', preferencias.notificacionesEmail);
      localStorage.setItem('notificaciones_pedidos', preferencias.notificacionesPedidos);
      
      const rolUsuario = localStorage.getItem('rol');
      let actualizado = false;
      
      if (rolUsuario === 'cliente') {
        actualizado = actualizarCliente();
      } else if (rolUsuario === 'repartidor') {
        actualizado = actualizarRepartidor();
      } else if (rolUsuario === 'admin') {
        actualizado = actualizarAdmin();
      }
      
      if (actualizado) {
        setEditando(false);
        mostrarNotificacion('✅ Datos guardados correctamente', 'exito');
      }
    };
  
    const actualizarCliente = () => {
      const emailLogueado = localStorage.getItem('email');
      let clientes = JSON.parse(localStorage.getItem('clientes') || '[]');
      const index = clientes.findIndex(c => c.email === emailLogueado);
      
      if (index !== -1) {
        clientes[index].direccion = formData.direccion;
        clientes[index].telefono = formData.telefono;
        if (formData.password && formData.password !== '********' && formData.password.length >= 4) {
          clientes[index].password = formData.password;
        }
        
        localStorage.setItem('clientes', JSON.stringify(clientes));
        localStorage.setItem('nombre', clientes[index].nombre);
        setUsuarioActual(clientes[index]);
        return true;
      }
      mostrarNotificacion('❌ Error al actualizar el perfil', 'error');
      return false;
    };
  
    const actualizarRepartidor = () => {
      const emailLogueado = localStorage.getItem('email');
      let repartidores = JSON.parse(localStorage.getItem('repartidores') || '[]');
      const index = repartidores.findIndex(r => r.email === emailLogueado);
      
      if (index !== -1) {
        repartidores[index].direccion = formData.direccion;
        repartidores[index].telefono = formData.telefono;
        if (formData.password && formData.password !== '********' && formData.password.length >= 4) {
          repartidores[index].password = formData.password;
        }
        localStorage.setItem('repartidores', JSON.stringify(repartidores));
        localStorage.setItem('nombre', repartidores[index].nombre);
        setUsuarioActual(repartidores[index]);
        return true;
      }
      return false;
    };
  
    const actualizarAdmin = () => {
      const adminData = {
        nombre: localStorage.getItem('nombre') || 'Administrador',
        email: localStorage.getItem('email'),
        direccion: formData.direccion,
        telefono: formData.telefono
      };
      localStorage.setItem('admin_data', JSON.stringify(adminData));
      if (formData.password && formData.password !== '********' && formData.password.length >= 4) {
        mostrarNotificacion('ℹ️ La contraseña del administrador no se puede cambiar por seguridad', 'info');
      }
      return true;
    };
  
    const subirFoto = () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file) {
          if (file.size > 2 * 1024 * 1024) {
            mostrarNotificacion('❌ La imagen no debe superar los 2MB', 'error');
            return;
          }
          if (!file.type.startsWith('image/')) {
            mostrarNotificacion('❌ Por favor selecciona una imagen válida', 'error');
            return;
          }
          const reader = new FileReader();
          reader.onload = (event) => {
            setFotoPerfil(event.target.result);
            localStorage.setItem('foto_perfil', event.target.result);
            mostrarNotificacion('✅ Foto de perfil actualizada', 'exito');
          };
          reader.readAsDataURL(file);
        }
      };
      input.click();
    };
  
    const togglePassword = () => {
      setMostrarPassword(!mostrarPassword);
    };
  
    const cerrarSesion = () => {
      if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
        localStorage.removeItem('rol');
        localStorage.removeItem('email');
        localStorage.removeItem('nombre');
        localStorage.removeItem('userId');
        localStorage.removeItem('clienteData');
        window.location.href = '/principal.html';
      }
    };
  
    const actualizarContadorCarrito = () => {
      const carrito = JSON.parse(localStorage.getItem('carrito') || '[]');
      const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);
      const contadores = document.querySelectorAll('.cart-count');
      contadores.forEach(contador => {
        contador.textContent = totalItems;
      });
    };
  
    const mostrarNotificacion = (mensaje, tipo) => {
      const notificacion = document.createElement('div');
      const colores = {
        exito: '#4CAF50',
        error: '#f44336',
        warning: '#ff9800',
        info: '#2196F3'
      };
      notificacion.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        background: ${colores[tipo] || '#333'};
        color: white;
        padding: 12px 20px;
        border-radius: 8px;
        z-index: 10000;
        font-size: 14px;
        animation: fadeInOut 3s ease;
      `;
      notificacion.textContent = mensaje;
      document.body.appendChild(notificacion);
      setTimeout(() => notificacion.remove(), 3000);
    };
  
    const handleInputChange = (e) => {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value
      });
    };
  
    const handlePreferenciaChange = (e) => {
      setPreferencias({
        ...preferencias,
        [e.target.id]: e.target.checked
      });
    };
  
    const formatearFecha = (fechaISO) => {
      if (!fechaISO) return 'Enero 2024';
      try {
        const fecha = new Date(fechaISO);
        return fecha.toLocaleDateString('es-ES', { year: 'numeric', month: 'long' });
      } catch {
        return 'Enero 2024';
      }
    };
  
    if (!usuarioActual) {
      return <div className="loading">Cargando perfil...</div>;
    }
  
    return (
      <main className="perfil-main">
        <div className="perfil-container">
          <div className="perfil-header">
            <h1><i className="fa-solid fa-user-circle"></i> Mi Perfil</h1>
            <p>Gestiona tu información personal y preferencias</p>
          </div>
  
          <div className="perfil-grid">
            {/* Columna Izquierda - Foto de Perfil */}
            <div className="perfil-avatar-section">
              <div className="avatar-card">
                <div className="avatar-container">
                  <img id="preview" src={fotoPerfil} alt="Foto de perfil" />
                  <div className="avatar-overlay">
                    <button className="btn-cambiar-foto" onClick={subirFoto}>
                      <i className="fa-solid fa-camera"></i>
                      <span>Cambiar foto</span>
                    </button>
                  </div>
                </div>
                <div className="avatar-info">
                  <h3 id="nombre-display">{formData.nombre || usuarioActual?.nombre}</h3>
                  <p><i className="fa-regular fa-envelope"></i> <span id="email-display">{formData.correo || usuarioActual?.email}</span></p>
                  <p><i className="fa-regular fa-calendar"></i> Miembro desde: <span id="miembro-desde">{formatearFecha(usuarioActual?.fechaRegistro)}</span></p>
                </div>
              </div>
  
              {/* Tarjeta de estadísticas */}
              <div className="stats-card">
                <div className="stat-item">
                  <i className="fa-solid fa-box"></i>
                  <div>
                    <span className="stat-number" id="total-pedidos">{totalPedidos}</span>
                    <span className="stat-label">Pedidos realizados</span>
                  </div>
                </div>
                <div className="stat-item">
                  <i className="fa-solid fa-star"></i>
                  <div>
                    <span className="stat-number" id="total-reseñas">{totalReseñas}</span>
                    <span className="stat-label">Reseñas escritas</span>
                  </div>
                </div>
              </div>
            </div>
  
            {/* Columna Derecha - Formulario */}
            <div className="perfil-form-section">
              <div className="form-card">
                <div className="form-header">
                  <h3><i className="fa-solid fa-address-card"></i> Información personal</h3>
                  <div className="form-actions">
                    {!editando ? (
                      <button className="btn-editar" id="btn-editar" onClick={activarEdicion}>
                        <i className="fa-solid fa-pencil"></i> Editar perfil
                      </button>
                    ) : (
                      <button className="btn-guardar" id="btn-guardar" onClick={guardar}>
                        <i className="fa-solid fa-save"></i> Guardar cambios
                      </button>
                    )}
                  </div>
                </div>
  
                <form id="perfil-form" className="perfil-form">
                  <div className="form-row">
                    <div className="form-group">
                      <label><i className="fa-solid fa-user"></i> Nombre completo</label>
                      <input 
                        type="text" 
                        id="nombre" 
                        value={formData.nombre} 
                        disabled={!editando}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div className="form-group">
                      <label><i className="fa-solid fa-id-card"></i> Documento</label>
                      <input 
                        type="text" 
                        id="documento" 
                        value={formData.documento} 
                        disabled
                      />
                    </div>
                  </div>
  
                  <div className="form-row">
                    <div className="form-group">
                      <label><i className="fa-solid fa-envelope"></i> Correo electrónico</label>
                      <input 
                        type="email" 
                        id="correo" 
                        value={formData.correo} 
                        disabled
                      />
                    </div>
                    <div className="form-group">
                      <label><i className="fa-solid fa-phone"></i> Teléfono</label>
                      <input 
                        type="tel" 
                        id="telefono" 
                        value={formData.telefono} 
                        disabled={!editando}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
  
                  <div className="form-group">
                    <label><i className="fa-solid fa-location-dot"></i> Dirección</label>
                    <input 
                      type="text" 
                      id="direccion" 
                      value={formData.direccion} 
                      disabled={!editando}
                      onChange={handleInputChange}
                    />
                  </div>
  
                  <div className="form-group">
                    <label><i className="fa-solid fa-lock"></i> Contraseña</label>
                    <div className="password-wrapper">
                      <input 
                        type={mostrarPassword ? "text" : "password"}
                        id="password" 
                        value={formData.password} 
                        disabled={!editando}
                        onChange={handleInputChange}
                      />
                      <button type="button" className="btn-ver-password" onClick={togglePassword}>
                        <i className={`fa-solid ${mostrarPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    <small className="form-hint">* La contraseña está encriptada por seguridad</small>
                  </div>
  
                  <div className="form-group">
                    <label><i className="fa-solid fa-bell"></i> Preferencias de notificación</label>
                    <div className="checkbox-group">
                      <label>
                        <input 
                          type="checkbox" 
                          id="notificaciones-email" 
                          checked={preferencias.notificacionesEmail}
                          onChange={handlePreferenciaChange}
                          disabled={!editando}
                        /> Recibir ofertas por email
                      </label>
                      <label>
                        <input 
                          type="checkbox" 
                          id="notificaciones-pedidos" 
                          checked={preferencias.notificacionesPedidos}
                          onChange={handlePreferenciaChange}
                          disabled={!editando}
                        /> Estado de mis pedidos
                      </label>
                    </div>
                  </div>
                </form>
  
                {/* Botones de acción adicionales */}
                <div className="form-footer">
                  <a href="mis-pedidos.html" className="btn-link">
                    <i className="fa-solid fa-truck"></i> Ver mis pedidos
                  </a>
                  <a href="mis-resenas.html" className="btn-link">
                    <i className="fa-solid fa-star"></i> Ver mis reseñas
                  </a>
                  <a href="formula.html" className="btn-link formula-link">
                    <i className="fa-solid fa-prescription-bottle"></i> Ver mi fórmula
                  </a>
                  <button className="btn-link cerrar-sesion" onClick={cerrarSesion}>
                    <i className="fa-solid fa-sign-out-alt"></i> Cerrar sesión
                  </button>
                </div>
              </div>
            </div>
          </div>
  
          {/* Sección de pedidos recientes */}
          <div className="pedidos-recientes">
            <div className="section-header">
              <h3><i className="fa-solid fa-clock-rotate-left"></i> Pedidos recientes</h3>
              <a href="mis-pedidos.html" className="ver-todos">Ver todos <i className="fa-solid fa-arrow-right"></i></a>
            </div>
            <div id="pedidos-lista" className="pedidos-lista">
              {pedidosRecientes.length === 0 ? (
                <div className="pedido-placeholder">
                  <i className="fa-solid fa-box-open"></i>
                  <p>Aún no tienes pedidos</p>
                  <a href="catalogo.html" className="btn-comprar-ahora">Comprar ahora</a>
                </div>
              ) : (
                pedidosRecientes.map((pedido, idx) => (
                  <div key={idx} className="pedido-card">
                    <div className="pedido-header">
                      <span className="pedido-id">{pedido.id}</span>
                      <span className="pedido-fecha">{new Date(pedido.fecha).toLocaleDateString('es-ES')}</span>
                    </div>
                    <div className="pedido-items">
                      {pedido.productos?.slice(0, 2).map((item, itemIdx) => (
                        <div key={itemIdx} className="pedido-item">
                          <span>{item.nombre} x{item.cantidad || 1}</span>
                        </div>
                      ))}
                      {pedido.productos?.length > 2 && <small>+{pedido.productos.length - 2} productos más</small>}
                    </div>
                    <div className="pedido-footer">
                      <span className="pedido-total">Total: ${(pedido.total || 0).toLocaleString('es-CO')}</span>
                      <span className={`pedido-estado ${pedido.estado === 'confirmado' ? 'confirmado' : 'pendiente'}`}>
                        {pedido.estado === 'confirmado' ? '✅ Confirmado' : '⏳ Pendiente'}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
  
        {/* Estilos CSS */}
        <style jsx>{`
          .perfil-main {
            max-width: 1200px;
            margin: 120px auto 60px;
            padding: 0 20px;
          }
          .perfil-header {
            text-align: center;
            margin-bottom: 40px;
          }
          .perfil-header h1 {
            font-size: 32px;
            color: var(--color-texto, #000);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 12px;
            margin-bottom: 10px;
          }
          .perfil-header h1 i {
            color: var(--color-primario, #B90F0F);
          }
          .perfil-header p {
            color: #666;
            font-size: 16px;
          }
          .perfil-grid {
            display: grid;
            grid-template-columns: 300px 1fr;
            gap: 30px;
            margin-bottom: 40px;
          }
          .perfil-avatar-section {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .avatar-card {
            background: var(--color-fondo, #fff);
            border-radius: 20px;
            padding: 25px;
            text-align: center;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            transition: transform 0.3s, box-shadow 0.3s;
          }
          .avatar-card:hover {
            transform: translateY(-5px);
            box-shadow: 0 10px 30px rgba(0,0,0,0.12);
          }
          .avatar-container {
            position: relative;
            width: 150px;
            height: 150px;
            margin: 0 auto 20px;
            border-radius: 50%;
            overflow: hidden;
            cursor: pointer;
          }
          .avatar-container img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          .avatar-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.6);
            display: flex;
            align-items: center;
            justify-content: center;
            opacity: 0;
            transition: opacity 0.3s;
          }
          .avatar-container:hover .avatar-overlay {
            opacity: 1;
          }
          .btn-cambiar-foto {
            background: var(--color-primario, #B90F0F);
            color: white;
            border: none;
            padding: 8px 12px;
            border-radius: 20px;
            font-size: 12px;
            cursor: pointer;
            display: flex;
            align-items: center;
            gap: 5px;
          }
          .btn-cambiar-foto:hover {
            background: var(--color-secundario, #000);
          }
          .avatar-info h3 {
            font-size: 20px;
            margin-bottom: 10px;
            color: var(--color-texto, #000);
          }
          .avatar-info p {
            font-size: 13px;
            color: #666;
            margin: 5px 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
          }
          .stats-card {
            background: linear-gradient(135deg, var(--color-primario, #B90F0F), #8a0b0b);
            border-radius: 20px;
            padding: 20px;
            color: white;
          }
          .stat-item {
            display: flex;
            align-items: center;
            gap: 15px;
            padding: 15px 0;
            border-bottom: 1px solid rgba(255,255,255,0.2);
          }
          .stat-item:last-child {
            border-bottom: none;
          }
          .stat-item i {
            font-size: 32px;
          }
          .stat-number {
            display: block;
            font-size: 24px;
            font-weight: bold;
          }
          .stat-label {
            font-size: 12px;
            opacity: 0.9;
          }
          .perfil-form-section {
            background: var(--color-fondo, #fff);
            border-radius: 20px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            overflow: hidden;
          }
          .form-card {
            padding: 30px;
          }
          .form-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 15px;
            border-bottom: 2px solid #eee;
            flex-wrap: wrap;
            gap: 15px;
          }
          .form-header h3 {
            font-size: 20px;
            color: var(--color-texto, #000);
          }
          .form-header h3 i {
            color: var(--color-primario, #B90F0F);
            margin-right: 10px;
          }
          .form-actions {
            display: flex;
            gap: 10px;
          }
          .btn-editar, .btn-guardar {
            padding: 10px 20px;
            border: none;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .btn-editar {
            background: var(--color-primario, #B90F0F);
            color: white;
          }
          .btn-editar:hover {
            background: var(--color-secundario, #000);
            transform: translateY(-2px);
          }
          .btn-guardar {
            background: #4CAF50;
            color: white;
          }
          .btn-guardar:hover {
            background: #45a049;
            transform: translateY(-2px);
          }
          .perfil-form {
            display: flex;
            flex-direction: column;
            gap: 20px;
          }
          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          .form-group {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }
          .form-group label {
            font-size: 14px;
            font-weight: 600;
            color: #555;
            display: flex;
            align-items: center;
            gap: 8px;
          }
          .form-group label i {
            color: var(--color-primario, #B90F0F);
            width: 18px;
          }
          .form-group input {
            padding: 12px 15px;
            border: 1px solid #ddd;
            border-radius: 10px;
            font-size: 14px;
            transition: all 0.3s;
            background: #f9f9f9;
          }
          .form-group input:focus {
            outline: none;
            border-color: var(--color-primario, #B90F0F);
            box-shadow: 0 0 0 3px rgba(185,15,15,0.1);
          }
          .form-group input:not([disabled]) {
            background: white;
            border-color: var(--color-primario, #B90F0F);
          }
          .password-wrapper {
            display: flex;
            gap: 10px;
          }
          .password-wrapper input {
            flex: 1;
          }
          .btn-ver-password {
            padding: 0 15px;
            background: #f0f0f0;
            border: 1px solid #ddd;
            border-radius: 10px;
            cursor: pointer;
            transition: all 0.3s;
          }
          .btn-ver-password:hover {
            background: var(--color-primario, #B90F0F);
            color: white;
          }
          .form-hint {
            font-size: 11px;
            color: #999;
          }
          .checkbox-group {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }
          .checkbox-group label {
            display: flex;
            align-items: center;
            gap: 10px;
            font-weight: normal;
            cursor: pointer;
          }
          .checkbox-group input {
            width: 18px;
            height: 18px;
            cursor: pointer;
            accent-color: var(--color-primario, #B90F0F);
          }
          .form-footer {
            margin-top: 25px;
            padding-top: 20px;
            border-top: 1px solid #eee;
            display: flex;
            flex-wrap: wrap;
            gap: 15px;
          }
          .btn-link {
            background: none;
            border: none;
            padding: 8px 15px;
            color: #666;
            text-decoration: none;
            font-size: 14px;
            cursor: pointer;
            transition: all 0.3s;
            border-radius: 8px;
            display: inline-flex;
            align-items: center;
            gap: 8px;
          }
          .btn-link:hover {
            background: #f5f5f5;
            color: var(--color-primario, #B90F0F);
          }
          .cerrar-sesion {
            color: #f44336;
          }
          .cerrar-sesion:hover {
            background: #ffebee;
          }
          .pedidos-recientes {
            background: var(--color-fondo, #fff);
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 5px 20px rgba(0,0,0,0.08);
            margin-top: 30px;
          }
          .section-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 20px;
            padding-bottom: 10px;
            border-bottom: 2px solid #eee;
          }
          .section-header h3 {
            font-size: 18px;
            color: var(--color-texto, #000);
          }
          .section-header h3 i {
            color: var(--color-primario, #B90F0F);
            margin-right: 8px;
          }
          .ver-todos {
            color: var(--color-primario, #B90F0F);
            text-decoration: none;
            font-size: 14px;
          }
          .ver-todos:hover {
            text-decoration: underline;
          }
          .pedidos-lista {
            min-height: 150px;
          }
          .pedido-placeholder {
            text-align: center;
            padding: 40px;
            color: #999;
          }
          .pedido-placeholder i {
            font-size: 48px;
            margin-bottom: 15px;
          }
          .btn-comprar-ahora {
            display: inline-block;
            margin-top: 15px;
            padding: 10px 25px;
            background: var(--color-primario, #B90F0F);
            color: white;
            text-decoration: none;
            border-radius: 8px;
            transition: all 0.3s;
          }
          .btn-comprar-ahora:hover {
            background: var(--color-secundario, #000);
          }
          .pedido-card {
            background: #f9f9f9;
            border-radius: 12px;
            padding: 15px;
            margin-bottom: 15px;
            transition: all 0.3s;
          }
          .pedido-card:hover {
            background: #f0f0f0;
            transform: translateX(5px);
          }
          .pedido-header {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;
            font-size: 12px;
            color: #666;
          }
          .pedido-id {
            font-weight: bold;
            color: var(--color-primario, #B90F0F);
          }
          .pedido-items {
            margin-bottom: 10px;
            font-size: 13px;
          }
          .pedido-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 10px;
            border-top: 1px solid #ddd;
          }
          .pedido-total {
            font-weight: bold;
            color: var(--color-primario, #B90F0F);
          }
          .pedido-estado.confirmado {
            color: #4CAF50;
          }
          .pedido-estado.pendiente {
            color: #ff9800;
          }
          @keyframes fadeInOut {
            0% { opacity: 0; transform: translateX(100px); }
            15% { opacity: 1; transform: translateX(0); }
            85% { opacity: 1; transform: translateX(0); }
            100% { opacity: 0; transform: translateX(100px); }
          }
          @media (max-width: 992px) {
            .perfil-grid {
              grid-template-columns: 1fr;
            }
            .perfil-avatar-section {
              max-width: 400px;
              margin: 0 auto;
            }
          }
          @media (max-width: 768px) {
            .perfil-main {
              margin: 100px auto 40px;
            }
            .perfil-header h1 {
              font-size: 28px;
            }
            .form-row {
              grid-template-columns: 1fr;
              gap: 15px;
            }
            .form-header {
              flex-direction: column;
              text-align: center;
            }
            .form-footer {
              justify-content: center;
            }
            .section-header {
              flex-direction: column;
              gap: 10px;
              text-align: center;
            }
          }
          @media (max-width: 480px) {
            .form-card {
              padding: 20px;
            }
            .btn-editar, .btn-guardar {
              padding: 8px 16px;
              font-size: 12px;
            }
          }
        `}</style>
      </main>
    );
  };
  
  export default Perfil;

  const subirFoto = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const preview = document.getElementById('preview');
          if (preview) preview.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    };
    input.click();
  };

  return (
    <div className="container mx-auto py-10 px-5">
      <h2 className="text-2xl font-bold text-center mb-5">GESTIÓN DE PERFIL REPARTIDOR</h2>

      <div className="bg-white w-full max-w-2xl mx-auto p-8 rounded-xl shadow-lg relative">
        {/* Foto de perfil */}
        <div className="absolute -right-[60px] -top-10 max-md:static max-md:mb-5 max-md:text-center">
          <div className="relative inline-block">
            <img 
              id="preview" 
              src="/img/user.jpg" 
              alt="Foto" 
              className="w-[110px] h-[110px] rounded-full border-4 border-[#B90F0F] object-cover"
              onError={(e) => e.target.src = 'https://via.placeholder.com/110'}
            />
            <button 
              onClick={subirFoto}
              className="absolute bottom-0 right-0 bg-[#B90F0F] text-white border-none rounded-full w-8 h-8 cursor-pointer flex items-center justify-center"
            >
              📷
            </button>
          </div>
        </div>

        {/* Formulario */}
        <form className="mt-4">
          <div className="mb-4">
            <label className="block font-bold text-sm mb-1">Nombre</label>
            <input 
              type="text" 
              value={formData.nombre} 
              disabled 
              className="w-full p-2.5 rounded-xl border-none bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold text-sm mb-1">Dirección</label>
            <input 
              type="text" 
              name="direccion" 
              value={formData.direccion} 
              onChange={handleChange}
              disabled={!editando}
              className="w-full p-2.5 rounded-xl border-none bg-gray-100 disabled:bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold text-sm mb-1">Contraseña</label>
            <input 
              type="password" 
              value="********" 
              disabled 
              className="w-full p-2.5 rounded-xl border-none bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold text-sm mb-1">Correo</label>
            <input 
              type="email" 
              name="correo" 
              value={formData.correo} 
              onChange={handleChange}
              disabled={!editando}
              className="w-full p-2.5 rounded-xl border-none bg-gray-100 disabled:bg-gray-100"
            />
          </div>

          <div className="mb-4">
            <label className="block font-bold text-sm mb-1">Teléfono</label>
            <input 
              type="text" 
              name="telefono" 
              value={formData.telefono} 
              onChange={handleChange}
              disabled={!editando}
              className="w-full p-2.5 rounded-xl border-none bg-gray-100 disabled:bg-gray-100"
            />
          </div>

          <div className="flex gap-3 mt-4">
            {!editando ? (
              <button 
                type="button" 
                onClick={activarEdicion}
                className="flex-1 bg-black text-white py-3 rounded-full cursor-pointer hover:opacity-85 transition"
              >
                EDITAR PERFIL
              </button>
            ) : (
              <button 
                type="button" 
                onClick={guardar}
                className="flex-1 bg-[#B90F0F] text-white py-3 rounded-full cursor-pointer hover:opacity-85 transition"
              >
                GUARDAR
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default PerfilRepartidor;