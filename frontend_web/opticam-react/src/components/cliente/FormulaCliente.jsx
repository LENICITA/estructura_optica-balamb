import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const FormulaCliente = () => {
  const navigate = useNavigate();
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [formData, setFormData] = useState({
    fecha: '',
    descripcion: '',
    condicion: '',
    imagen: null
  });
  const [imagenPreview, setImagenPreview] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // REF para evitar duplicados
  const cargadoInicial = useRef(false);

  const condiciones = ['DALTONISMO', 'ASTIGMATISMO', 'MIOPIA', 'BAJA VISION'];

  useEffect(() => {
    // Solo cargar si no se ha cargado antes
    if (!cargadoInicial.current) {
      cargadoInicial.current = true;
      cargarFormulas();
    }
  }, []);

  const cargarFormulas = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await api.get('/formulas/mis-formulas');

      let formulasData = response.data;
      if (response.data && response.data.data) {
        formulasData = response.data.data;
      }
      if (response.data && response.data.formulas) {
        formulasData = response.data.formulas;
      }

      if (!Array.isArray(formulasData)) {
        formulasData = [];
      }

      const formulasMapeadas = formulasData.map(f => ({
        id: f.id_formula || f.id || f._id,  // ← BUSCAR id_formula PRIMERO
        fecha: f.fecha_creacion || f.fecha || new Date().toISOString(),
        descripcion: f.observaciones || f.descripcion || 'Sin descripción',
        condicion: f.condicion || 'No especificada',
        imagen: f.imagen_formula || f.imagen || f.imagen_url || '/img/default.png',
        estado: f.estado || 'Pendiente',
        costo: f.costo || 0,
        fechaSubida: f.fecha_creacion ? new Date(f.fecha_creacion).toLocaleDateString('es-CO') : new Date().toLocaleDateString('es-CO'),
        ...f
      }));
      formulasMapeadas.forEach((f, i) => {
      });


      setFormulas(formulasMapeadas);

    } catch (err) {
      console.error('Error al cargar fórmulas:', err);
      
      let mensajeError = 'Error al cargar tus fórmulas. ';
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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCondicionSelect = (condicion) => {
    setFormData({ ...formData, condicion });
    setDropdownOpen(false);
  };

  const handleImagenChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(file.type)) {
        alert('Formato no permitido. Usa JPG, PNG, WEBP o GIF.');
        e.target.value = '';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        alert('La imagen es demasiado grande. Máximo 5MB.');
        e.target.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => setImagenPreview(event.target.result);
      reader.readAsDataURL(file);
      setFormData({ ...formData, imagen: file });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.fecha) {
      alert('Selecciona una fecha');
      return;
    }
    if (!formData.descripcion.trim()) {
      alert('Ingresa una descripción');
      return;
    }
    if (!formData.condicion) {
      alert('Selecciona una condición');
      return;
    }
    if (!formData.imagen) {
      alert('Selecciona una imagen de la fórmula');
      return;
    }

    setSubiendo(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const formDataToSend = new FormData();
      formDataToSend.append('condicion', formData.condicion);
      formDataToSend.append('observaciones', formData.descripcion);
      formDataToSend.append('imagen', formData.imagen);

      const response = await api.post('/formulas', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        alert('Fórmula subida correctamente. Espera la revisión del administrador.');
        
        setFormData({ fecha: '', descripcion: '', condicion: '', imagen: null });
        setImagenPreview('');
        document.getElementById('imagen-input').value = '';
        
        await cargarFormulas();
      } else {
        throw new Error(response.data.message || 'Error al subir la fórmula');
      }

    } catch (err) {
      console.error('Error al subir fórmula:', err);
      
      let mensajeError = 'Error al subir la fórmula. ';
      if (err.response?.status === 401) {
        mensajeError += 'Sesión expirada. Redirigiendo al login...';
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 400) {
        mensajeError += err.response.data?.message || 'Datos inválidos';
      } else {
        mensajeError += err.response?.data?.message || err.message;
      }
      
      alert(`${mensajeError}`);
    } finally {
      setSubiendo(false);
    }
  };

  const eliminarFormula = async (id) => {
    const formula = formulas.find(f => f.id === id);
    if (!formula) return;

    if (formula.estado !== 'Pendiente') {
      alert('Solo puedes eliminar fórmulas en estado Pendiente');
      return;
    }

    if (!window.confirm('¿Eliminar esta fórmula?')) return;

    try {
      const response = await api.delete(`/formulas/${id}`);

      if (response.data.success) {
        alert('Fórmula eliminada correctamente');
        await cargarFormulas();
      } else {
        throw new Error(response.data.message || 'Error al eliminar');
      }

    } catch (err) {
      console.error('Error al eliminar fórmula:', err);
      alert(`Error al eliminar: ${err.response?.data?.message || err.message}`);
    }
  };

  const getEstadoBadge = (estado) => {
    const config = {
      'Pendiente': { bg: 'bg-yellow-500', text: 'En revisión' },
      'Aprobado': { bg: 'bg-green-500', text: 'Aprobada' },
      'Rechazado': { bg: 'bg-red-500', text: 'Rechazada' }
    };
    const estadoConfig = config[estado] || { bg: 'bg-gray-500', text: estado };
    return (
      <span className={`${estadoConfig.bg} text-white px-3 py-1 rounded-full text-xs font-semibold`}>
        {estadoConfig.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F] mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando fórmulas...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-[600px] mx-auto py-10 px-5">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
          <p className="font-bold">Error</p>
          <p className="text-sm">{error}</p>
          <button 
            onClick={cargarFormulas}
            className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[600px] mx-auto py-10 px-5">
      <h1 className="text-4xl text-center mb-2.5">
        Gestión de Fórmula <br />
        <span className="text-xl text-gray-500 font-normal">Sube tu fórmula óptica fácilmente</span>
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg mt-5">
        <label className="block mt-4 mb-1 font-medium">Fecha de creación</label>
        <input 
          type="date" 
          name="fecha" 
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
          value={formData.fecha} 
          onChange={handleChange} 
          required 
          disabled={subiendo}
        />

        <label className="block mt-4 mb-1 font-medium">Descripción</label>
        <input 
          type="text" 
          name="descripcion" 
          className="w-full p-3 rounded-lg border border-gray-300 focus:outline-none focus:border-[#B90F0F]" 
          placeholder="Ej: Fórmula reciente" 
          value={formData.descripcion} 
          onChange={handleChange} 
          required 
          disabled={subiendo}
        />

        <label className="block mt-4 mb-1 font-medium">Condición</label>
        <div className="relative">
          <div 
            onClick={() => !subiendo && setDropdownOpen(!dropdownOpen)}
            className="border border-gray-300 rounded-lg p-3 cursor-pointer flex justify-between items-center focus:outline-none focus:border-[#B90F0F]"
          >
            <span className={formData.condicion ? 'text-gray-800' : 'text-gray-400'}>
              {formData.condicion || 'Seleccionar'}
            </span>
            <i className={`fa-solid fa-angle-right transition-transform ${dropdownOpen ? 'rotate-90' : ''}`}></i>
          </div>
          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 z-10 shadow-lg">
              {condiciones.map(cond => (
                <div 
                  key={cond} 
                  onClick={() => handleCondicionSelect(cond)}
                  className="p-3 hover:bg-red-50 cursor-pointer transition"
                >
                  {cond}
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="block mt-4 mb-1 font-medium">Subir imagen de la fórmula</label>
        <input 
          id="imagen-input"
          type="file" 
          accept="image/*" 
          onChange={handleImagenChange} 
          className="w-full p-2.5 border border-gray-300 rounded-lg file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#B90F0F] file:text-white hover:file:bg-[#8a0b0b] cursor-pointer"
          required 
          disabled={subiendo}
        />
        <p className="text-xs text-gray-500 mt-1">Formatos: JPG, PNG, WEBP, GIF (máx 5MB)</p>
        
        {imagenPreview && (
          <div className="mt-4">
            <img src={imagenPreview} alt="Preview" className="w-full rounded-lg max-h-[200px] object-contain border border-gray-200" />
          </div>
        )}

        <button 
          type="submit" 
          className="w-full mt-5 bg-[#B90F0F] text-white py-3.5 rounded-full font-bold uppercase tracking-wide cursor-pointer hover:bg-[#8a0b0b] transition disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={subiendo}
        >
          {subiendo ? (
            <>
              <i className="fa-solid fa-spinner fa-spin mr-2"></i> SUBIENDO...
            </>
          ) : (
            'SUBIR FÓRMULA'
          )}
        </button>
      </form>

      <h2 className="text-3xl text-center mt-12">Mis Fórmulas</h2>
      
      <div className="flex flex-wrap gap-6 justify-center my-[30px]">
        {formulas.length === 0 ? (
          <div className="text-center py-16 text-gray-400 w-full">
            <i className="fa-regular fa-file-lines text-6xl mb-5"></i>
            <p>No hay fórmulas subidas aún</p>
          </div>
        ) : (
          
          formulas.map(formula => (
            <div 
              key={formula.id} 
              className="w-[280px] bg-white rounded-2xl overflow-hidden shadow-md transition-all hover:-translate-y-1 hover:shadow-xl"
            >
              <div className="h-[180px] overflow-hidden bg-gray-100">
                <img 
                  src={formula.imagen} 
                  alt="Fórmula" 
                  className="w-full h-full object-cover transition-all hover:scale-105"
                  onError={(e) => e.target.src = '/img/default.png'}
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2.5">
                  <i className="fa-regular fa-calendar text-[#B90F0F]"></i>
                  {formula.fechaSubida}
                </div>
                <h4 className="text-lg font-bold mb-2">{formula.descripcion}</h4>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3 pb-2 border-b border-gray-200">
                  <i className="fa-regular fa-eye text-[#B90F0F]"></i>
                  {formula.condicion}
                </div>
                <div className="mb-3 flex items-center justify-between">
                  {getEstadoBadge(formula.estado)}
                  {formula.estado === 'Aprobado' && formula.costo > 0 && (
                    <span className="text-sm font-bold text-[#B90F0F]">
                      ${formula.costo.toLocaleString('es-CO')}
                    </span>
                  )}
                </div>
                {formula.estado === 'Pendiente' && (
                  <button 
                    onClick={() => eliminarFormula(formula.id)} 
                    className="w-full py-2.5 bg-gray-100 border-none rounded-lg text-gray-500 cursor-pointer transition-all hover:bg-red-500 hover:text-white"
                  >
                    <i className="fa-regular fa-trash-can mr-1"></i> Eliminar
                  </button>
                )}
                {formula.estado === 'Aprobado' && (
                  <button 
                    className="w-full py-2.5 bg-green-100 border-none rounded-lg text-green-700 cursor-pointer transition-all hover:bg-green-500 hover:text-white"
                  >
                    <i className="fa-solid fa-check mr-1"></i> Aprobada
                  </button>
                )}
                {formula.estado === 'Rechazado' && (
                  <button 
                    className="w-full py-2.5 bg-red-100 border-none rounded-lg text-red-700 cursor-pointer transition-all hover:bg-red-500 hover:text-white"
                    disabled
                  >
                    <i className="fa-solid fa-times mr-1"></i> Rechazada
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FormulaCliente;