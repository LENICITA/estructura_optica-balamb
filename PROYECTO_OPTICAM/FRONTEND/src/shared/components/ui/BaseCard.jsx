import React from 'react';

export const BaseCard = ({ children, onClick, isClickable = false }) => (
  <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition">
    <div
      role={isClickable ? 'button' : undefined}
      tabIndex={isClickable ? 0 : undefined}
      onClick={onClick}
      onKeyDown={
        isClickable
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick?.();
              }
            }
          : undefined
      }
      className={isClickable ? 'cursor-pointer' : ''}
    >
      {children}
    </div>
  </div>
);

export const CardHeader = ({ icono, titulo, subtitulo, badge }) => (
  <div className="p-5 flex items-start justify-between gap-3">
    <div className="flex items-center gap-3 min-w-0">
      <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
        <i className={`fa-solid ${icono} text-[#B90F0F] text-lg`}></i>
      </div>
      <div className="min-w-0">
        <p className="text-base font-bold text-gray-900">{titulo}</p>
        {subtitulo && <p className="text-xs text-gray-500 mt-1">{subtitulo}</p>}
      </div>
    </div>
    {badge}
  </div>
);

export const CardDivider = () => <div className="h-px bg-gray-100"></div>;

export const CardSection = ({ icono, titulo, children }) => (
  <div className="p-5">
    <div className="flex items-center gap-2 mb-3">
      <i className={`fa-solid ${icono} text-[#B90F0F]`}></i>
      <span className="text-sm font-bold text-gray-800">{titulo}</span>
    </div>
    {children}
  </div>
);