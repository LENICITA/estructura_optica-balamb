// src/features/admin/pages/CrearProducto.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductController } from '../../../core/controllers/ProductController';
import { validarFormularioProducto } from '../../../shared/validators/productoValidators';

const CrearProducto = () => {
  const navigate = useNavigate();
  const productController = new ProductController();

  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const categorias = [
    { id_categoria: 1, nombre: 'MONTURAS' },
    { id_categoria: 2, nombre: 'ACCESORIOS' },
    { id_categoria: 3, nombre: 'GAFAS DE SOL' },
  ];

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    marca: '',
    precio: '',
    material: '',
    color: '',
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const crearProducto = async () => {
    const check = validarFormularioProducto({
      id_categoria: categoriaSeleccionada?.id_categoria,
      nombre: formData.nombre,
      descripcion: formData.descripcion,
      marca: formData.marca,
      precio: formData.precio,
      imagen: imagen ? 'ok' : '',
      material: formData.material,
      color: formData.color,
    });

    if (!check.valido) {
      alert(check.mensaje || 'Datos inválidos');
      return;
    }

    try {
      setSubiendo(true);

      const resultado = await productController.crearProducto({
        id_categoria: categoriaSeleccionada.id_categoria,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        marca: formData.marca.trim(),
        precio: parseFloat(formData.precio),
        imagen: imagen,
        material: formData.material.trim(),
        color: formData.color.trim(),
      });

      if (!resultado.success) {
        alert(resultado.message);
        return;
      }

      alert('El producto fue registrado correctamente.');
      navigate('/admin/inventario');
    } catch (error) {
      console.error('Error creando producto:', error);
      alert(error?.message || 'No fue posible crear el producto.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
  <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
    <div className="max-w-5xl mx-auto">

      {/* ENCABEZADO */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-[#B90F0F] font-semibold hover:text-[#8a0b0b] transition"
        >
          <i className="fa-solid fa-arrow-left"></i>
          Volver
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-circle-plus text-[#B90F0F] text-xl"></i>
          </div>

          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
              Crear Nuevo Producto
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Formulario para crear un nuevo producto.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

        {/* CATEGORÍA */}
        <div className="mb-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Categoría:
          </label>

          <div className="relative">
            <button
              type="button"
              onClick={() => setDropdown(!dropdown)}
              className="w-full flex justify-between items-center h-12 border border-gray-300 rounded-xl px-4 bg-white text-left focus:border-[#B90F0F] outline-none transition"
            >
              <span
                className={
                  categoriaSeleccionada
                    ? 'text-sm text-gray-800'
                    : 'text-sm text-gray-400'
                }
              >
                {categoriaSeleccionada?.nombre || 'Seleccionar categoría'}
              </span>

              <i
                className={`fa-solid ${
                  dropdown ? 'fa-chevron-up' : 'fa-chevron-down'
                } text-gray-500`}
              ></i>
            </button>

            {dropdown && (
              <div className="absolute top-[56px] left-0 right-0 bg-white border border-gray-200 rounded-xl max-h-[200px] overflow-y-auto z-50 shadow-lg">
                {categorias.map((item) => (
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

          {/* NOMBRE */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nombre del producto:
            </label>

            <input
              type="text"
              value={formData.nombre}
              onChange={(e) =>
                setFormData({ ...formData, nombre: e.target.value })
              }
              placeholder="Ingrese el nombre del producto"
              maxLength={45}
              className="w-full h-12 border border-gray-300 rounded-xl px-4 outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F]/20 transition"
            />
          </div>

          {/* MARCA */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Marca:
            </label>

            <input
              type="text"
              value={formData.marca}
              onChange={(e) =>
                setFormData({ ...formData, marca: e.target.value })
              }
              placeholder="Ingrese la marca del producto"
              maxLength={45}
              className="w-full h-12 border border-gray-300 rounded-xl px-4 outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F]/20 transition"
            />
          </div>

          {/* PRECIO */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Precio:
            </label>

            <input
              type="number"
              value={formData.precio}
              onChange={(e) =>
                setFormData({ ...formData, precio: e.target.value })
              }
              placeholder="Ingrese el precio del producto"
              maxLength={10}
              className="w-full h-12 border border-gray-300 rounded-xl px-4 outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F]/20 transition"
            />
          </div>

          {/* MATERIAL */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Material:
            </label>

            <input
              type="text"
              value={formData.material}
              onChange={(e) =>
                setFormData({ ...formData, material: e.target.value })
              }
              placeholder="Ingrese el material del producto"
              maxLength={45}
              className="w-full h-12 border border-gray-300 rounded-xl px-4 outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F]/20 transition"
            />
          </div>

          {/* COLOR */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Color:
            </label>

            <input
              type="text"
              value={formData.color}
              onChange={(e) =>
                setFormData({ ...formData, color: e.target.value })
              }
              placeholder="Ingrese el color del producto"
              maxLength={45}
              className="w-full h-12 border border-gray-300 rounded-xl px-4 outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F]/20 transition"
            />
          </div>

          {/* DESCRIPCIÓN */}
          <div className="lg:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Descripción:
            </label>

            <textarea
              value={formData.descripcion}
              onChange={(e) =>
                setFormData({ ...formData, descripcion: e.target.value })
              }
              placeholder="Ingrese la descripción del producto"
              maxLength={45}
              className="w-full min-h-[120px] border border-gray-300 rounded-xl px-4 py-3 outline-none focus:border-[#B90F0F] focus:ring-1 focus:ring-[#B90F0F]/20 transition resize-none"
            />
          </div>
        </div>

        {/* IMAGEN */}
        <div className="mt-6">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Imagen:
          </label>

          <label className="flex flex-col items-center justify-center min-h-[180px] border-2 border-dashed border-gray-300 rounded-xl bg-gray-50 cursor-pointer hover:bg-red-50 hover:border-[#B90F0F] transition">
            <i className="fa-solid fa-cloud-arrow-up text-[#B90F0F] text-3xl mb-3"></i>

            <span className="text-sm font-medium text-gray-600">
              Seleccionar imagen
            </span>

            <span className="text-xs text-gray-400 mt-1">
              Haz clic para seleccionar una imagen
            </span>

            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>

          {imagenPreview && (
            <div className="relative mt-4 bg-gray-50 rounded-xl border border-gray-200 p-3">
              <img
                src={imagenPreview}
                alt="Preview"
                className="w-full h-[240px] object-contain rounded-lg"
              />

              <button
                type="button"
                onClick={() => {
                  setImagen(null);
                  setImagenPreview(null);
                }}
                className="absolute top-5 right-5 w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center"
              >
                <i className="fa-solid fa-circle-xmark text-[#B90F0F] text-2xl"></i>
              </button>
            </div>
          )}
        </div>

        {/* BOTÓN */}
        <div className="flex flex-col sm:flex-row sm:justify-end gap-3 mt-8 pt-6 border-t border-gray-100">

          <button
            type="button"
            onClick={() => navigate(-1)}
            disabled={subiendo}
            className="w-full sm:w-auto px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition disabled:opacity-50"
          >
            Cancelar
          </button>

          {subiendo ? (
            <div className="w-full sm:w-auto px-7 py-3 rounded-xl bg-[#B90F0F] flex items-center justify-center gap-2.5 opacity-70">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>

              <span className="text-white font-bold">
                Creando producto...
              </span>
            </div>
          ) : (
            <button
              onClick={crearProducto}
              disabled={subiendo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-7 py-3 bg-[#B90F0F] text-white rounded-xl font-semibold hover:bg-[#9f0d0d] transition shadow-sm"
            >
              <i className="fa-solid fa-floppy-disk"></i>
              Crear Producto
            </button>
          )}
        </div>

        <p className="text-xs text-gray-400 mt-4">
          Todos los campos son obligatorios.
        </p>
      </div>
    </div>
  </div>
);
};

export default CrearProducto;