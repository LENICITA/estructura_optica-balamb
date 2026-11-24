import React from 'react';

export const CardInfo = ({ icono, label, valor }) => (
  <div className="bg-gray-50 rounded-xl p-3">
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center flex-shrink-0">
        <i className={`fa-solid ${icono} text-gray-500`}></i>
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{label}</p>
        <p className="text-sm text-gray-800 font-semibold mt-0.5 break-words">{valor || 'N/A'}</p>
      </div>
    </div>
  </div>
);

export const EstadoBadge = ({ bg, color, icono, texto }) => (
  <span
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold shrink-0"
    style={{ backgroundColor: bg, color: color }}
  >
    <i className={`fa-solid ${icono}`}></i>
    {texto}
  </span>
);