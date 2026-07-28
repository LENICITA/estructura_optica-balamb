import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // ✅ Importar useNavigate

const PerfilCliente = () => { // ✅ Cambiado de Perfil a PerfilCliente
  const navigate = useNavigate(); // ✅ Añadir navigate
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
      navigate('/login'); // ✅ Cambiar a navigate
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

  // ... todas las funciones permanecen igual ...

  const cerrarSesion = () => {
    if (window.confirm('¿Estás seguro de que deseas cerrar sesión?')) {
      localStorage.removeItem('rol');
      localStorage.removeItem('email');
      localStorage.removeItem('nombre');
      localStorage.removeItem('userId');
      localStorage.removeItem('clienteData');
      navigate('/principal'); // ✅ Cambiar a navigate
    }
  };

  // ... resto del código ...

  return (
    <main className="perfil-main">
      <div className="perfil-container">
        {/* ... todo el contenido queda igual ... */}
        
        {/* Botones de acción - Cambiar enlaces */}
        <div className="form-footer">
          {/* ✅ Cambiar a navigate */}
          <button className="btn-link" onClick={() => navigate('/control-pedido')}>
            <i className="fa-solid fa-truck"></i> Ver mis pedidos
          </button>
          <button className="btn-link" onClick={() => navigate('/formula')}>
            <i className="fa-solid fa-prescription-bottle"></i> Ver mi fórmula
          </button>
          <button className="btn-link cerrar-sesion" onClick={cerrarSesion}>
            <i className="fa-solid fa-sign-out-alt"></i> Cerrar sesión
          </button>
        </div>
      </div>

      {/* Sección de pedidos recientes */}
      <div className="pedidos-recientes">
        <div className="section-header">
          <h3><i className="fa-solid fa-clock-rotate-left"></i> Pedidos recientes</h3>
          {/* ✅ Cambiar a navigate */}
          <button className="ver-todos" onClick={() => navigate('/control-pedido')}>
            Ver todos <i className="fa-solid fa-arrow-right"></i>
          </button>
        </div>
        <div id="pedidos-lista" className="pedidos-lista">
          {pedidosRecientes.length === 0 ? (
            <div className="pedido-placeholder">
              <i className="fa-solid fa-box-open"></i>
              <p>Aún no tienes pedidos</p>
              {/* ✅ Cambiar a navigate */}
              <button className="btn-comprar-ahora" onClick={() => navigate('/catalogo')}>
                Comprar ahora
              </button>
            </div>
          ) : (
            pedidosRecientes.map((pedido, idx) => (
              <div key={idx} className="pedido-card">
                {/* ... contenido del pedido ... */}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ... estilos ... */}
    </main>
  );
};

export default PerfilCliente; // ✅ Cambiado a PerfilCliente