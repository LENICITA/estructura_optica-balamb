import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AgregarProducto = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    categoria: '',
    marca: '',
    material: '',
    color: '',
    precio: ''
  });
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenFile, setImagenFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value
    });
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        mostrarNotificacion('❌ El archivo debe ser una imagen', 'error');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        mostrarNotificacion('❌ La imagen no debe superar los 5MB', 'error');
        return;
      }
      
      setImagenFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        setImagenPreview(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const mostrarNotificacion = (mensaje, tipo) => {
    const notificacion = document.createElement('div');
    const colores = {
      exito: '#4CAF50',
      error: '#f44336',
      warning: '#ff9800',
      info: '#2196F3'
    };
    const iconos = {
      exito: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };
    
    notificacion.style.cssText = `
      position: fixed;
      bottom: 30px;
      right: 30px;
      background: ${colores[tipo] || '#333'};
      color: white;
      padding: 15px 25px;
      border-radius: 10px;
      z-index: 10000;
      font-size: 14px;
      font-weight: bold;
      box-shadow: 0 4px 15px rgba(0,0,0,0.2);
      animation: slideInRight 0.3s ease;
      max-width: 350px;
      text-align: center;
    `;
    notificacion.innerHTML = `${iconos[tipo] || '📢'} ${mensaje}`;
    document.body.appendChild(notificacion);
    
    setTimeout(() => {
      notificacion.style.animation = 'slideOutRight 0.3s ease';
      setTimeout(() => notificacion.remove(), 300);
    }, 3000);
  };

  const guardarProducto = (imagenUrl) => {
    let productos = JSON.parse(localStorage.getItem('productos')) || [];
    
    const nuevoId = Date.now();
    
    const productoExistente = productos.find(p => p.nombre.toLowerCase() === formData.nombre.toLowerCase());
    if (productoExistente) {
      if (!window.confirm("⚠️ Ya existe un producto con este nombre. ¿Deseas agregarlo de todas formas?")) {
        setLoading(false);
        return;
      }
    }
    
    const nuevoProducto = {
      id: nuevoId,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      categoria: formData.categoria,
      marca: formData.marca,
      material: formData.material,
      color: formData.color,
      precio: parseInt(formData.precio),
      imagen: imagenUrl || "/img/default-product.jpg",
      vendidos: 0,
      nuevo: true,
      fechaAgregado: new Date().toISOString()
    };
    
    productos.push(nuevoProducto);
    
    localStorage.setItem('productos', JSON.stringify(productos));
    localStorage.setItem('productos_db', JSON.stringify(productos));
    
    console.log('✅ Producto guardado:', nuevoProducto);
    console.log('📦 Total de productos:', productos.length);
    
    mostrarNotificacion(`✅ ¡${formData.nombre} agregado exitosamente!`, 'exito');
    
    setTimeout(() => {
      navigate('/inventario.html');
    }, 1500);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validaciones
    if (!formData.nombre) {
      mostrarNotificacion('❌ Por favor, ingresa el nombre del producto', 'error');
      return;
    }
    if (!formData.descripcion) {
      mostrarNotificacion('❌ Por favor, ingresa una descripción', 'error');
      return;
    }
    if (!formData.categoria) {
      mostrarNotificacion('❌ Por favor, selecciona una categoría', 'error');
      return;
    }
    if (!formData.marca) {
      mostrarNotificacion('❌ Por favor, ingresa la marca', 'error');
      return;
    }
    if (!formData.material) {
      mostrarNotificacion('❌ Por favor, ingresa el material', 'error');
      return;
    }
    if (!formData.color) {
      mostrarNotificacion('❌ Por favor, ingresa el color', 'error');
      return;
    }
    if (!formData.precio || isNaN(formData.precio) || formData.precio <= 0) {
      mostrarNotificacion('❌ Por favor, ingresa un precio válido', 'error');
      return;
    }
    
    setLoading(true);
    
    if (imagenFile) {
      const reader = new FileReader();
      reader.onload = function(e) {
        guardarProducto(e.target.result);
        setLoading(false);
      };
      reader.onerror = function() {
        mostrarNotificacion('❌ Error al leer la imagen', 'error');
        guardarProducto("");
        setLoading(false);
      };
      reader.readAsDataURL(imagenFile);
    } else {
      guardarProducto("");
      setLoading(false);
    }
  };

  return (
    <>
      <main className="container">
        <div className="header-main">
          <div className="title">
            <h1>Añadir Nuevo Producto</h1>
            <h2>Nuevo Producto</h2>
          </div>
          <button type="button" className="add-product" onClick={handleSubmit} disabled={loading}>
            <i className="fa-solid fa-plus"></i> {loading ? 'Guardando...' : 'Añadir'}
          </button>
        </div>
        
        <div className="left-column">
          <div className="card product-info">
            <h3>Información del Producto</h3>
            <label>Nombre del Producto</label>
            <input 
              type="text" 
              id="nombre" 
              placeholder="Ej: Gafas de sol"
              value={formData.nombre}
              onChange={handleChange}
            />
            <label>Descripción</label>
            <textarea 
              id="descripcion" 
              placeholder="Descripción del producto"
              value={formData.descripcion}
              onChange={handleChange}
            ></textarea>
          </div>

          <div className="card info-add">
            <h3>Información adicional</h3>
            <label htmlFor="categoria">Categoría</label>
            <select id="categoria" value={formData.categoria} onChange={handleChange}>
              <option value="">Seleccione una categoría</option>
              <option value="Monturas">Monturas</option>
              <option value="Accesorios">Accesorios</option>
              <option value="Gafas de sol">Gafas de sol</option>
            </select>

            <label>Marca</label>
            <input id="marca" type="text" value={formData.marca} onChange={handleChange} />

            <label>Material</label>
            <input id="material" type="text" value={formData.material} onChange={handleChange} />

            <label>Color</label>
            <input id="color" type="text" value={formData.color} onChange={handleChange} />
          </div>
        </div>

        <div className="right-column">
          <div className="card multimedia">
            <h3>Multimedia</h3>
            <label htmlFor="imagen" className="upload-box">
              <i className="fa-solid fa-cloud-arrow-up"></i>
              <p>Sube tus imágenes</p>
              <span>Haz clic o arrastra aquí</span>
              <input 
                type="file" 
                id="imagen" 
                hidden 
                accept="image/*"
                onChange={handleImagenChange}
              />
            </label>
            <div id="preview">
              {imagenPreview && (
                <img src={imagenPreview} alt="Preview" style={{ width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px' }} />
              )}
            </div>
          </div>

          <div className="card precio">
            <label>Precio</label>
            <input 
              id="precio" 
              type="number" 
              value={formData.precio}
              onChange={handleChange}
            />
          </div>
        </div>
      </main>

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

        .container {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 20px;
          padding: 20px 40px;
        }
        .add-product {
          background-color: var(--color-boton, #B90F0F);
          color: var(--color-texto2, #fff);
          border: none;
          padding: 10px 18px;
          border-radius: 8px;
          cursor: pointer;
        }
        .add-product:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        .add-product i {
          margin-right: 5px;
        }
        .header-main {
          grid-column: 1 / -1;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 40px 5px 40px 10px;
        }
        .title {
          display: flex;
          flex-direction: column;
        }
        .header-main h1 {
          margin-bottom: 5px;
        }
        .header-main h2 {
          color: gray;
          font-weight: normal;
        }
        .left-column,
        .right-column {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        .card {
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 8px rgba(0,0,0,0.08);
        }
        .card input,
        .card textarea,
        .card select {
          width: 100%;
          margin-top: 8px;
          margin-bottom: 12px;
          padding: 10px;
          border-radius: 6px;
          border: 1px solid #ccc;
        }
        .card textarea {
          min-height: 100px;
          resize: none;
        }
        .card h3 {
          margin-bottom: 10px;
        }
        .precio label {
          font-weight: bold;
        }
        .upload-box {
          border: 2px dashed #ccc;
          border-radius: 12px;
          padding: 30px;
          cursor: pointer;
          transition: 0.3s;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 10px;
          text-align: center;
          color: #555;
          background: #fafafa;
        }
        .upload-box i {
          font-size: 35px;
          color: #888;
        }
        .upload-box p {
          font-weight: bold;
          margin: 0;
        }
        .upload-box span {
          font-size: 13px;
          color: gray;
        }
        .upload-box:hover {
          border-color: var(--color-primario, #B90F0F);
          background: #f3f3f3;
        }
        #preview {
          margin-top: 15px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
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
          .container {
            grid-template-columns: 1fr;
            padding: 20px;
          }
          .header-main {
            flex-direction: column;
            gap: 15px;
            text-align: center;
          }
        }
      `}</style>
    </>
  );
};

export default AgregarProducto;