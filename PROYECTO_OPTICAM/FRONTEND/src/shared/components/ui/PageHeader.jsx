import React from 'react';

export const PageHeader = ({ icono, titulo, subtitulo, onRefresh, refreshing, botonExtra }) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <i className={`fa-solid ${icono} text-[#B90F0F] text-xl`}></i>
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{titulo}</h1>
            <p className="text-sm text-gray-500 mt-1">{subtitulo}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          {botonExtra}
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={refreshing}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
            >
              <i className={`fa-solid fa-rotate-right ${refreshing ? 'animate-spin' : ''}`}></i>
              Actualizar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};