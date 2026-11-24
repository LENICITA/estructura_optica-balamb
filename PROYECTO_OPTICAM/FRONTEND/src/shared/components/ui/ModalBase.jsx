import React from 'react';

export const ModalBase = ({ visible, onClose, titulo, subtitulo, children, size = 'max-w-lg' }) => {
  if (!visible) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 bg-black/50 z-[1000] flex items-end sm:items-center justify-center p-0 sm:p-4"
      onClick={onClose}
      onKeyDown={(e) => e.key === 'Escape' && onClose()}
    >
      <div
        role="presentation"
        className={`w-full sm:${size} bg-white rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 max-h-[80vh] overflow-y-auto shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-5">
          <div>
            <h3 className="text-lg font-bold text-gray-900">{titulo}</h3>
            {subtitulo && <p className="text-xs text-gray-500 mt-1">{subtitulo}</p>}
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full hover:bg-gray-100 flex items-center justify-center transition"
          >
            <i className="fa-solid fa-xmark text-xl text-gray-600"></i>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};