// src/shared/components/ui/ProductoForm.jsx
import React, { useState } from 'react';

const CATEGORIAS = [
  { id_categoria: 1, nombre: 'MONTURAS' },
  { id_categoria: 2, nombre: 'ACCESORIOS' },
  { id_categoria: 3, nombre: 'GAFAS DE SOL' },
];

export const ProductoForm = ({
  titulo,
  subtitulo,
  icono,
  formData,
  setFormData,
  categoriaSeleccionada,
  setCategoriaSeleccionada,
  imagenPreview,
  handleImageChange,
  limpiarImagen,
  onSubmit,
  onCancel,
  subiendo,
  textoBoton,
}) => {
  const [dropdown, setDropdown] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
      {/* CATEGORÍA */}
      <div className="mb-6">
        <p className="block text-sm font-semibold text-gray-700 mb-2">Categoría:</p>
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdown(!dropdown)}
            className="w-full flex justify-between items-center h-12 border border-gray-300 rounded-xl px-4 bg-white text-left focus:border-[#B90F0F] outline-none transition"
          >
            <span className={categoriaSeleccionada ? 'text-sm text-gray-800' : 'text-sm text-gray-400'}>
              {categoriaSeleccionada?.nombre || 'Seleccionar categoría'}
            </span>
            <i className={`fa-solid ${dropdown ? 'fa-chevron-up' : 'fa-chevron-down'} text-gray-500`}></i>
          </button>

          {dropdown && (
            <div className="absolute top-[56px] left-0 right-0 bg-white border border-gray-200 rounded-xl max-h-[200px] overflow-y-auto z-50 shadow-lg">
              {CATEGORIAS.map((item) => (
                <button
                  key={item.id_categoria}
                  type="button"
                  onClick={() => {
                    setCategoriaSeleccionada(item);
                    setDropdown(false);
                  }}
                  className="w-full text-left py-3 px-4 border-b border-gray-100 hover:bg-red-50 text-sm text-gray-700 transition"
                >
                  {item.nombre}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* INFORMACIÓN DEL PRODUCTO */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {['nombre', 'marca', 'precio', 'material', 'color'].map((field) => (
          <div key={field}>
            <label htmlFor={`prod-${field}`} className="block text-sm font-semibold text-gray-700 mb-2 capitalize">
              {field}:
            </label>
            <input
              id={`prod-${field}`}
              type={field === 'precio' ? 'number' : 'text'}
              value={formData[field]}
              onChange={(e) => setFormData({ ...formData, [field]: e.target.value })}
              placeholder={`Ingrese el ${field} del producto`}
              maxLength={field === 'precio' ? 10 : 45}
              className="w-full h-12 border border-gray-300 rounded-xl px-4 outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F]/20 transition"
            />
          </div>
        ))}

        <div className="lg:col-span-2">
          <label htmlFor="prod-descripcion" className="block text-sm font-semibold text-gray-700 mb-2">Descripción:</label>
          <textarea
            id="prod-descripcion"
            value={formData.descripcion}
            onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
            placeholder="Ingrese la descripción del producto"
            maxLength={45}
            className="w-full min-h-[120px] border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F]/20 transition resize-none"
          />
        </div>
      </div>

      {/* IMAGEN */}
      <div className="mt-6">
        <label htmlFor="prod-imagen" className="block text-sm font-semibold text-gray-700 mb-2">Imagen:</label>
        <label className="flex flex-col items-center justify-center min-h-[180px] border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-pointer hover:bg-red-50 hover:border-[#B90F0F] transition">
          <i className="fa-solid fa-cloud-arrow-up text-[#B90F0F] text-3xl mb-3"></i>
          <span className="text-sm font-medium text-gray-600">Seleccionar imagen</span>
          <span className="text-xs text-gray-400 mt-1">Haz clic para seleccionar una imagen</span>
          <input id="prod-imagen" type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>

        {imagenPreview && (
          <div className="relative mt-4 bg-gray-50 rounded-xl border border-gray-200 p-3">
            <img src={imagenPreview} alt="Preview" className="w-full h-[240px] object-contain rounded-lg" />
            <button
              type="button"
              onClick={limpiarImagen}
              className="absolute top-5 right-5 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center"
            >
              <i className="fa-solid fa-circle-xmark text-[#B90F0F] text-2xl"></i>
            </button>
          </div>
        )}
      </div>

      {/* BOTONES */}
      <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-8 pt-6 border-t border-gray-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={subiendo}
          className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
        >
          Cancelar
        </button>

        {subiendo ? (
          <div className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#B90F0F] flex items-center justify-center gap-2.5 opacity-70">
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            <span className="text-white font-bold">Procesando...</span>
          </div>
        ) : (
          <button
            onClick={onSubmit}
            disabled={subiendo}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 bg-[#B90F0F] text-white rounded-xl font-semibold hover:bg-[#9f0d0d] transition shadow-sm"
          >
            <i className="fa-solid fa-floppy-disk"></i>
            {textoBoton}
          </button>
        )}
      </div>
    </div>
  );
};