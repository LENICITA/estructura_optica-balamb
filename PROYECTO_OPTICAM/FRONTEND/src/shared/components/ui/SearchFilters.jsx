import React from 'react';

export const SearchFilters = ({ 
  busqueda, setBusqueda, placeholder, 
  filtros, filtroActivo, setFiltroActivo, 
  textoBotonExtra, onBotonExtra 
}) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 sm:p-5 mb-6">
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 relative">
          <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input
            type="text"
            placeholder={placeholder}
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full h-12 pl-11 pr-10 border border-gray-300 rounded-xl outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F]/20 transition"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda('')}
              className="absolute right-4 top-1/2 -translate-y-1/2"
            >
              <i className="fa-solid fa-circle-xmark text-gray-400 hover:text-gray-600"></i>
            </button>
          )}
        </div>

        {textoBotonExtra && onBotonExtra && (
          <button
            onClick={onBotonExtra}
            className="h-12 px-4 rounded-xl bg-[#B90F0F] text-white flex items-center justify-center gap-2 font-semibold hover:bg-[#9f0d0d] transition"
          >
            <i className="fa-solid fa-briefcase"></i>
            <span className="text-sm">{textoBotonExtra}</span>
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2 mt-4">
        {filtros.map((filtro) => (
          <button
            key={filtro.value}
            onClick={() => setFiltroActivo(filtro.value)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${
              filtroActivo === filtro.value
                ? 'bg-[#B90F0F] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {filtro.label}
          </button>
        ))}
      </div>
    </div>
  );
};