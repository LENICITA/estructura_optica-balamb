import React, { useState } from 'react';

const FormulasAdmin = () => {
  const [formulas] = useState([
    { id: 1, img: "/img/formula-progresiva.jpg", condicion: "Miopía", observacion: "Vista borrosa", fecha: "08/04/2026", cobrada: false, precio: null },
    { id: 2, img: "/img/formula-con-prisma.jpg", condicion: "Astigmatismo", observacion: "Dolor de cabeza", fecha: "07/04/2026", cobrada: false, precio: null }
  ]);

  const [formulaActual, setFormulaActual] = useState(null);
  const [precioInput, setPrecioInput] = useState('');

  const seleccionarFormula = (formula) => {
    setFormulaActual(formula);
    setPrecioInput('');
  };

  const enviarPrecio = (e) => {
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
    alert(`✅ Fórmula cobrada por $${parseInt(precioInput).toLocaleString()}`);
    setFormulaActual(null);
    setPrecioInput('');
  };

  return (
    <main className="flex-1 pb-10 max-w-[1500px] mx-auto px-5 py-10">
      {/* Header */}
      <div className="flex justify-between items-center mb-5 mt-5 ml-10 max-md:flex-col max-md:items-start max-md:ml-0">
        <h1 className="text-3xl max-md:text-2xl font-bold">Gestión de Fórmulas</h1>
      </div>

      {/* Contenedor principal */}
      <div className="flex gap-6 mt-12 max-md:flex-col">
        {/* Lista de fórmulas */}
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
                  <th>Acción</th>
                </tr>
              </thead>
              <tbody>
                {formulas.filter(f => !f.cobrada).map((formula) => (
                  <tr 
                    key={formula.id} 
                    onClick={() => seleccionarFormula(formula)}
                    className="cursor-pointer hover:bg-gray-50 transition"
                  >
                    <td className="p-3 border-b border-gray-200">
                      <img src={formula.img} alt="Fórmula" className="w-15 h-15 rounded-lg object-cover" />
                    </td>
                    <td className="p-3 border-b border-gray-200">{formula.condicion}</td>
                    <td className="p-3 border-b border-gray-200">{formula.observacion}</td>
                    <td className="p-3 border-b border-gray-200">{formula.fecha}</td>
                    <td className="p-3 border-b border-gray-200">
                      <button className="bg-[#B90F0F] text-white border-none px-3 py-1 rounded-md text-sm cursor-pointer hover:bg-[#8a0b0b]">Ver</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detalle de fórmula */}
        <div className="flex-1 bg-white p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-bold mb-4">Detalle de fórmula</h2>
          {formulaActual ? (
            <>
              <img 
                src={formulaActual.img} 
                alt="Fórmula" 
                className="w-full max-h-[300px] object-contain rounded-xl mb-4"
              />
              <p><strong>Condición:</strong> {formulaActual.condicion}</p>
              <p><strong>Observación:</strong> {formulaActual.observacion}</p>
              <p><strong>Fecha:</strong> {formulaActual.fecha}</p>
              <form onSubmit={enviarPrecio} className="mt-4">
                <label className="font-bold block mb-2">Asignar precio:</label>
                <input 
                  type="number" 
                  className="w-full p-2.5 border border-gray-300 rounded-md mb-4"
                  placeholder="Ej: 120000"
                  value={precioInput}
                  onChange={(e) => setPrecioInput(e.target.value)}
                  required
                />
                <button type="submit" className="w-full bg-[#B90F0F] text-white py-2.5 rounded-lg cursor-pointer hover:bg-[#8a0b0b] transition">
                  Enviar precio
                </button>
              </form>
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