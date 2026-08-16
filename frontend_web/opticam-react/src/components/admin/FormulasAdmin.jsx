import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

const FormulasAdmin = () => {
  const [formulas, setFormulas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [formulaActual, setFormulaActual] = useState(null);
  const [precioInput, setPrecioInput] = useState('');

  useEffect(() => {
    cargarFormulas();
  }, []);

  const cargarFormulas = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No hay token de autenticación');
      }

      const response = await api.get('/formulas/admin/todas');

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
        id: f.id_formula || f.id || f._id,
        img: f.imagen || f.img || '/img/default.png',
        condicion: f.condicion || f.tipo || 'Sin especificar',
        observacion: f.observacion || f.descripcion || 'Sin observación',
        fecha: f.fecha_creacion ? new Date(f.fecha_creacion).toLocaleDateString('es-CO') : new Date().toLocaleDateString('es-CO'),
        cobrada: f.cobrada || f.estado === 'cobrada' || false,
        precio: f.precio || 0,
        ...f
      }));

      setFormulas(formulasMapeadas);

    } catch (err) {
      console.error('Error al cargar fórmulas:', err);
      setError('Error al cargar las fórmulas');
    } finally {
      setLoading(false);
    }
  };

  const seleccionarFormula = (formula) => {
    setFormulaActual(formula);
    setPrecioInput(formula.precio || '');
  };

  const enviarPrecio = async (e) => {
    e.preventDefault();
    
    if (!formulaActual) {
      alert("Selecciona una fórmula");
      return;
    }
    
    if (formulaActual.cobrada) {
      alert("Esta fórmula ya fue cobrada");
      return;
    }
    
    if (!precioInput || precioInput === "") {
      alert("Ingresa un precio");
      return;
    }

    try {
      const response = await api.post(`/formulas/${formulaActual.id}/cobrar`, {
        precio: parseInt(precioInput)
      });

      if (response.data.success || response.status === 200) {
        alert(`Fórmula cobrada por $${parseInt(precioInput).toLocaleString()}`);
        setFormulaActual(null);
        setPrecioInput('');
        cargarFormulas();
      }

    } catch (err) {
      console.error('Error al cobrar fórmula:', err);
      alert(`Error al cobrar la fórmula: ${err.response?.data?.message || err.message}`);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 pb-10 max-w-[1500px] mx-auto px-5 py-10">
        <div className="flex justify-center items-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#B90F0F] mx-auto"></div>
            <p className="mt-4 text-gray-600">Cargando fórmulas...</p>
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="flex-1 pb-10 max-w-[1500px] mx-auto px-5 py-10">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
          <button 
            onClick={cargarFormulas}
            className="mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700"
          >
            Reintentar
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="flex-1 pb-10 max-w-[1500px] mx-auto px-5 py-10">
      <div className="flex justify-between items-center mb-5 mt-5 ml-10 max-md:flex-col max-md:items-start max-md:ml-0">
        <h1 className="text-3xl max-md:text-2xl font-bold">Gestión de Fórmulas</h1>
        <button 
          onClick={cargarFormulas}
          className="bg-[#B90F0F] text-white px-4 py-2 rounded-lg hover:bg-[#8a0b0b] transition"
        >
          <i className="fa-solid fa-rotate mr-2"></i> Actualizar
        </button>
      </div>

      <div className="flex gap-6 mt-12 max-md:flex-col">
        <div className="flex-1 bg-white p-5 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Fórmulas recibidas</h2>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="[&_th]:p-3 [&_th]:text-left [&_th]:border-b [&_th]:border-gray-200">
                  <th>Imagen</th>
                  <th>Condición</th>
                  <th>Observación</th>
                  <th>Fecha</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {formulas.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-8 text-gray-500">
                      No hay fórmulas registradas
                    </td>
                  </tr>
                ) : (
                  formulas.map((formula) => (
                    <tr 
                      key={formula.id} 
                      onClick={() => seleccionarFormula(formula)}
                      className={`cursor-pointer hover:bg-gray-50 transition ${formulaActual?.id === formula.id ? 'bg-blue-50' : ''}`}
                    >
                      <td className="p-3 border-b border-gray-200">
                        <img src={formula.img} alt="Fórmula" className="w-15 h-15 rounded-lg object-cover" />
                      </td>
                      <td className="p-3 border-b border-gray-200">{formula.condicion}</td>
                      <td className="p-3 border-b border-gray-200">{formula.observacion}</td>
                      <td className="p-3 border-b border-gray-200">{formula.fecha}</td>
                      <td className="p-3 border-b border-gray-200">
                        <span className={`px-2 py-1 rounded-full text-xs ${formula.cobrada ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                          {formula.cobrada ? 'Cobrada' : 'Pendiente'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Detalle de fórmula</h2>
          {formulaActual ? (
            <>
              <img 
                src={formulaActual.img} 
                alt="Fórmula" 
                className="w-full max-h-[300px] object-contain rounded-xl mb-4"
                onError={(e) => e.target.src = '/img/default.png'}
              />
              <p><strong>Condición:</strong> {formulaActual.condicion}</p>
              <p><strong>Observación:</strong> {formulaActual.observacion}</p>
              <p><strong>Fecha:</strong> {formulaActual.fecha}</p>
              <p>
                <strong>Estado:</strong>{' '}
                <span className={`px-2 py-1 rounded-full text-xs ${formulaActual.cobrada ? 'bg-green-500 text-white' : 'bg-yellow-500 text-white'}`}>
                  {formulaActual.cobrada ? 'Cobrada' : 'Pendiente'}
                </span>
              </p>
              {formulaActual.cobrada && (
                <p><strong>Precio:</strong> ${formulaActual.precio?.toLocaleString('es-CO')}</p>
              )}
              {!formulaActual.cobrada && (
                <form onSubmit={enviarPrecio} className="mt-4">
                  <label className="font-bold block mb-2">Asignar precio:</label>
                  <input 
                    type="number" 
                    className="w-full p-2.5 border border-gray-300 rounded-md mb-4"
                    placeholder="Ej: 120000"
                    value={precioInput}
                    onChange={(e) => setPrecioInput(e.target.value)}
                    required
                    min="0"
                    step="1000"
                  />
                  <button type="submit" className="w-full bg-[#B90F0F] text-white py-2.5 rounded-lg cursor-pointer hover:bg-[#8a0b0b] transition">
                    Enviar precio
                  </button>
                </form>
              )}
            </>
          ) : (
            <p className="text-gray-500 text-center py-10">Selecciona una fórmula para ver sus detalles</p>
          )}
        </div>
      </div>
    </main>
  );
};

export default FormulasAdmin;