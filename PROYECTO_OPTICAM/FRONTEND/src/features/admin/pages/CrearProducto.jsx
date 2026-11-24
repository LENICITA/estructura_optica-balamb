// src/features/admin/pages/CrearProducto.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ProductController } from '../../../core/controllers/ProductController';
import { ProductoForm } from '../../../shared/components/ui/ProductoForm';
import { alertError, alertSuccess } from '../../../shared/utils/alert';

const CrearProducto = () => {
  const navigate = useNavigate();
  const productController = new ProductController();

  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', marca: '', precio: '', material: '', color: '',
  });

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImagen(file);
      setImagenPreview(URL.createObjectURL(file));
    }
  };

  const limpiarImagen = () => {
    setImagen(null);
    setImagenPreview(null);
  };

  const crearProducto = async () => {
    try {
      setSubiendo(true);
      const resultado = await productController.crearProducto({
        id_categoria: categoriaSeleccionada?.id_categoria,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        marca: formData.marca.trim(),
        precio: Number.parseFloat(formData.precio),
        imagen: imagen,
        material: formData.material.trim(),
        color: formData.color.trim(),
      });

      if (!resultado.success) {
        void alertError(resultado.message);
        return;
      }

      void alertSuccess('El producto fue registrado correctamente.');
      void navigate('/admin/inventario');
    } catch (error) {
      console.error('Error creando producto:', error);
      void alertError(error?.message || 'No fue posible crear el producto.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <button onClick={() => void navigate(-1)} className="inline-flex items-center gap-2 text-[#B90F0F] font-semibold hover:text-[#8a0b0b] transition">
            <i className="fa-solid fa-arrow-left"></i> Volver
          </button>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-circle-plus text-[#B90F0F] text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Crear Nuevo Producto</h2>
              <p className="text-sm text-gray-500 mt-1">Formulario para crear un nuevo producto.</p>
            </div>
          </div>
        </div>

        <ProductoForm
          formData={formData}
          setFormData={setFormData}
          categoriaSeleccionada={categoriaSeleccionada}
          setCategoriaSeleccionada={setCategoriaSeleccionada}
          imagenPreview={imagenPreview}
          handleImageChange={handleImageChange}
          limpiarImagen={limpiarImagen}
          onSubmit={crearProducto}
          onCancel={() => void navigate(-1)}
          subiendo={subiendo}
          textoBoton="Crear Producto"
        />
      </div>
    </div>
  );
};

export default CrearProducto;