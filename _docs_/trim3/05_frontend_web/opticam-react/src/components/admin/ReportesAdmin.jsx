import React, { useState } from 'react';

const ReportesAdmin = () => {
  const [reportes, setReportes] = useState([
    { id: 1, nombre: "Reporte de Ventas - Enero 2024", descripcion: "Reporte de ventas para el mes de enero de 2024", periodo: "Diario", fecha: "15/01/2024", tipo: "sales" },
    { id: 2, nombre: "Reporte de Inventario - Enero 2024", descripcion: "Reporte de inventario para el mes de enero de 2024", periodo: "Semanal", fecha: "20/01/2024", tipo: "inventory" },
    { id: 3, nombre: "Reporte de Repartidores - Enero 2024", descripcion: "Reporte de repartidores para el mes de enero de 2024", periodo: "Mensual", fecha: "25/01/2024", tipo: "repartidor" },
    { id: 4, nombre: "Reporte de Clientes - Enero 2024", descripcion: "Reporte de clientes para el mes de enero de 2024", periodo: "Anual", fecha: "30/01/2024", tipo: "clientes" }
  ]);

  const [tipo, setTipo] = useState('sales');
  const [periodo, setPeriodo] = useState('daily');
  const [filtroCategoria, setFiltroCategoria] = useState('all');

  const nombres = { sales: 'Ventas', inventory: 'Inventario', repartidor: 'Repartidores', clientes: 'Clientes' };
  const periodos = { daily: 'Diario', weekly: 'Semanal', monthly: 'Mensual', yearly: 'Anual' };

  const generarReporte = (e) => {
    e.preventDefault();
    const nuevoReporte = {
      id: Date.now(),
      nombre: `Reporte de ${nombres[tipo]} - ${new Date().toLocaleDateString()}`,
      descripcion: `Reporte de ${nombres[tipo]} - ${periodos[periodo]}`,
      periodo: periodos[periodo],
      fecha: new Date().toLocaleDateString('es-CO'),
      tipo: tipo
    };
    setReportes([nuevoReporte, ...reportes]);
    alert('✅ Reporte generado correctamente');
  };

  const eliminarReporte = (id) => {
    setReportes(reportes.filter(r => r.id !== id));
  };

  const verReporte = (reporte) => {
    alert(`📄 Visualizando: ${reporte.nombre}\n${reporte.descripcion}`);
  };

  const descargarReporte = (reporte) => {
    const blob = new Blob([`Reporte: ${reporte.nombre}\nFecha: ${reporte.fecha}\nPeríodo: ${reporte.periodo}\nDescripción: ${reporte.descripcion}`], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reporte.nombre.replace(/ /g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const reportesFiltrados = filtroCategoria === 'all' ? reportes : reportes.filter(r => r.tipo === filtroCategoria);

  return (
    <main className="p-5">
      <h1 className="text-3xl font-bold text-center text-[#B90F0F] mb-8">Biblioteca de Reportes</h1>

      {/* Generador de reportes */}
      <div className="bg-white p-5 rounded-xl shadow-md mb-8">
        <h2 className="text-2xl font-bold text-center text-[#000000] mb-5">Generar Nuevo Reporte</h2>
        <form onSubmit={generarReporte} className="flex flex-col gap-4">
          <div>
            <label className="block text-[#000000] font-bold mb-2">Tipo de Reporte:</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={tipo} 
              onChange={(e) => setTipo(e.target.value)}
            >
              <option value="sales">Reporte de Ventas</option>
              <option value="inventory">Reporte de Inventario</option>
              <option value="repartidor">Reporte de Repartidores</option>
              <option value="clientes">Reporte de Clientes</option>
            </select>
          </div>
          <div>
            <label className="block text-[#000000] font-bold mb-2">Período:</label>
            <select 
              className="w-full p-2 border border-gray-300 rounded-md"
              value={periodo} 
              onChange={(e) => setPeriodo(e.target.value)}
            >
              <option value="daily">Diario</option>
              <option value="weekly">Semanal</option>
              <option value="monthly">Mensual</option>
              <option value="yearly">Anual</option>
            </select>
          </div>
          <button type="submit" className="bg-[#B90F0F] text-white border-none py-2.5 px-5 rounded-md cursor-pointer hover:bg-[#8a0b0b] transition mt-2">
            Generar
          </button>
        </form>
      </div>

      {/* Filtros de categoría */}
      <div className="flex justify-center gap-4 mb-5 flex-wrap">
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); setFiltroCategoria('all'); }}
          className={`no-underline text-[#000000] px-4 py-2 rounded-full text-sm transition-all ${filtroCategoria === 'all' ? 'bg-[#B90F0F] text-white' : 'bg-gray-200 hover:bg-[#B90F0F] hover:text-white'}`}
        >
          Todo
        </a>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); setFiltroCategoria('sales'); }}
          className={`no-underline text-[#000000] px-4 py-2 rounded-full text-sm transition-all ${filtroCategoria === 'sales' ? 'bg-[#B90F0F] text-white' : 'bg-gray-200 hover:bg-[#B90F0F] hover:text-white'}`}
        >
          Reporte de Ventas
        </a>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); setFiltroCategoria('inventory'); }}
          className={`no-underline text-[#000000] px-4 py-2 rounded-full text-sm transition-all ${filtroCategoria === 'inventory' ? 'bg-[#B90F0F] text-white' : 'bg-gray-200 hover:bg-[#B90F0F] hover:text-white'}`}
        >
          Reporte de Inventario
        </a>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); setFiltroCategoria('repartidor'); }}
          className={`no-underline text-[#000000] px-4 py-2 rounded-full text-sm transition-all ${filtroCategoria === 'repartidor' ? 'bg-[#B90F0F] text-white' : 'bg-gray-200 hover:bg-[#B90F0F] hover:text-white'}`}
        >
          Reporte de Repartidores
        </a>
        <a 
          href="#" 
          onClick={(e) => { e.preventDefault(); setFiltroCategoria('clientes'); }}
          className={`no-underline text-[#000000] px-4 py-2 rounded-full text-sm transition-all ${filtroCategoria === 'clientes' ? 'bg-[#B90F0F] text-white' : 'bg-gray-200 hover:bg-[#B90F0F] hover:text-white'}`}
        >
          Reporte de Clientes
        </a>
      </div>

      {/* Tabla de reportes */}
      <div className="overflow-x-auto">
        <table className="w-full bg-white rounded-xl overflow-hidden shadow-md">
          <thead className="bg-gray-100">
            <tr className="[&_th]:p-3 [&_th]:text-center">
              <th>Nombre</th>
              <th>Descripción</th>
              <th>Período</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {reportesFiltrados.map((reporte) => (
              <tr key={reporte.id} className="border-b border-gray-200 hover:bg-gray-50">
                <td className="p-3 text-center">{reporte.nombre}</td>
                <td className="p-3 text-center">{reporte.descripcion}</td>
                <td className="p-3 text-center">{reporte.periodo}</td>
                <td className="p-3 text-center">{reporte.fecha}</td>
                <td className="p-3 text-center">
                  <i onClick={() => verReporte(reporte)} className="fa-solid fa-folder-open text-[#B90F0F] text-base mx-1 cursor-pointer hover:text-red-700"></i>
                  <i onClick={() => descargarReporte(reporte)} className="fa-solid fa-download text-[#B90F0F] text-base mx-1 cursor-pointer hover:text-red-700"></i>
                  <i onClick={() => eliminarReporte(reporte.id)} className="fa-solid fa-trash text-[#B90F0F] text-base mx-1 cursor-pointer hover:text-red-700"></i>
                </td>
              </tr>
            ))}
            {reportesFiltrados.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-10 text-gray-500">
                  <i className="fa-regular fa-folder-open text-4xl mb-2"></i>
                  <p>No hay reportes guardados</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
};

export default ReportesAdmin;