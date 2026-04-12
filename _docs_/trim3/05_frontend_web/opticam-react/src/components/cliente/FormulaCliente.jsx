import React, { useState } from 'react';

const FormulaCliente = () => {
  const [formulas, setFormulas] = useState([]);
  const [formData, setFormData] = useState({
    fecha: '',
    descripcion: '',
    condicion: '',
    imagen: null
  });
  const [imagenPreview, setImagenPreview] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const condiciones = ['Astigmatismo', 'Miopia', 'Daltonismo', 'Baja visión'];

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
      const reader = new FileReader();
      reader.onload = (event) => setImagenPreview(event.target.result);
      reader.readAsDataURL(file);
      setFormData({ ...formData, imagen: file });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.fecha || !formData.descripcion || !formData.condicion || !formData.imagen) {
      alert('❌ Completa todos los campos');
      return;
    }
    
    const nuevaFormula = {
      id: Date.now(),
      fecha: formData.fecha,
      descripcion: formData.descripcion,
      condicion: formData.condicion,
      imagen: imagenPreview,
      estado: 'en-revision',
      fechaSubida: new Date().toLocaleDateString()
    };
    
    setFormulas([nuevaFormula, ...formulas]);
    setFormData({ fecha: '', descripcion: '', condicion: '', imagen: null });
    setImagenPreview('');
    alert('✅ Fórmula subida correctamente');
  };

  const eliminarFormula = (id) => {
    if (window.confirm('¿Eliminar esta fórmula?')) {
      setFormulas(formulas.filter(f => f.id !== id));
    }
  };

  const getEstadoBadge = (estado) => {
    const config = {
      'en-revision': 'bg-yellow-500',
      'valorada': 'bg-green-500',
      'rechazada': 'bg-red-500'
    };
    return <span className={`${config[estado] || 'bg-gray-500'} text-white px-3 py-1 rounded-full text-xs`}>{estado === 'en-revision' ? 'En revisión' : estado}</span>;
  };

  return (
    <div className="max-w-[600px] mx-auto py-10 px-5">
      <h1 className="text-4xl text-center mb-2.5">
        Gestión de Fórmula <br />
        <span className="text-xl text-gray-500 font-normal">Sube tu fórmula óptica fácilmente</span>
      </h1>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-lg mt-5">
        <label className="block mt-4 mb-1 font-medium">Fecha de creación</label>
        <input type="date" name="fecha" className="w-full p-3 rounded-lg border border-gray-300" value={formData.fecha} onChange={handleChange} required />

        <label className="block mt-4 mb-1 font-medium">Descripción</label>
        <input type="text" name="descripcion" className="w-full p-3 rounded-lg border border-gray-300" placeholder="Ej: Fórmula reciente" value={formData.descripcion} onChange={handleChange} required />

        <label className="block mt-4 mb-1 font-medium">Condición</label>
        <div className="relative">
          <div 
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="border border-gray-300 rounded-lg p-3 cursor-pointer flex justify-between items-center"
          >
            <span>{formData.condicion || 'Seleccionar'}</span>
            <i className={`fa-solid fa-angle-right transition-transform ${dropdownOpen ? 'rotate-90' : ''}`}></i>
          </div>
          {dropdownOpen && (
            <div className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 z-10">
              {condiciones.map(cond => (
                <div key={cond} onClick={() => handleCondicionSelect(cond)} className="p-3 hover:bg-red-50 cursor-pointer">
                  {cond}
                </div>
              ))}
            </div>
          )}
        </div>

        <label className="block mt-4 mb-1 font-medium">Subir imagen de la fórmula</label>
        <input type="file" accept="image/*" onChange={handleImagenChange} className="w-full p-2.5 border border-gray-300 rounded-lg" required />
        
        {imagenPreview && (
          <img src={imagenPreview} alt="Preview" className="w-full mt-4 rounded-lg max-h-[200px] object-contain" />
        )}

        <button type="submit" className="w-full mt-5 bg-[#B90F0F] text-white py-3.5 rounded-full font-bold uppercase tracking-wide cursor-pointer hover:bg-[#8a0b0b] transition">
          SUBIR FÓRMULA
        </button>
      </form>

      {/* Mis Fórmulas */}
      <h2 className="text-3xl text-center mt-12">Mis Fórmulas</h2>
      
      <div className="flex flex-wrap gap-6 justify-center my-[30px] mx-10">
        {formulas.length === 0 ? (
          <div className="text-center py-16 text-gray-400 w-full">
            <i className="fa-regular fa-file-lines text-6xl mb-5"></i>
            <p>No hay fórmulas subidas aún</p>
          </div>
        ) : (
          formulas.map(formula => (
            <div key={formula.id} className="w-[280px] bg-white rounded-2xl overflow-hidden shadow-md transition-all hover:-translate-y-1">
              <div className="h-[180px] overflow-hidden bg-gray-100">
                <img src={formula.imagen} alt="Fórmula" className="w-full h-full object-cover transition-all hover:scale-105" />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-2.5">
                  <i className="fa-regular fa-calendar text-[#B90F0F]"></i>
                  {new Date(formula.fecha).toLocaleDateString()}
                </div>
                <h4 className="text-lg font-bold mb-2">{formula.descripcion}</h4>
                <div className="flex items-center gap-2 text-gray-500 text-sm mb-3 pb-2 border-b border-gray-200">
                  <i className="fa-regular fa-eye text-[#B90F0F]"></i>
                  {formula.condicion}
                </div>
                <div className="mb-3">{getEstadoBadge(formula.estado)}</div>
                <button onClick={() => eliminarFormula(formula.id)} className="w-full py-2.5 bg-gray-100 border-none rounded-lg text-gray-500 cursor-pointer transition-all hover:bg-red-500 hover:text-white">
                  <i className="fa-regular fa-trash-can mr-1"></i> Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default FormulaCliente;