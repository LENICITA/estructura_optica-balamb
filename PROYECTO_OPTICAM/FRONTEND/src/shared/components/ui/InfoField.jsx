// src/shared/components/ui/InfoField.jsx
import React from 'react';

export const InfoField = ({ icon, label, value, field, editable = false, type = 'text', id, onChange }) => {
  return (
    <div className="mb-3">
      <label htmlFor={id} className="block text-xs font-semibold text-black mb-1.5">
        {label}
      </label>
      <div className="flex items-center bg-gray-100 rounded-lg px-3 min-h-[42px]">
        <i className={`fa-solid ${icon} text-[#B90F0F] mr-2`}></i>
        {editable ? (
          <input
            id={id}
            type={type}
            value={value}
            onChange={(e) => onChange(field, e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-gray-700 py-2"
          />
        ) : (
          <span id={id} className="flex-1 text-sm text-gray-700 py-2">
            {value || 'No registrado'}
          </span>
        )}
      </div>
    </div>
  );
};