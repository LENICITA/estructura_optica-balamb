// src/features/admin/pages/EditarProducto.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductController } from '../../../core/controllers/ProductController';
import { ProductoForm } from '../../../shared/components/ui/ProductoForm';
import { validarFormularioEditarProducto } from '../../../shared/validators/productoValidators';
import { alertError, alertSuccess } from '../../../shared/utils/alert';

const CATEGORIAS = [
  { id_categoria: 1, nombre: 'MONTURAS' },
  { id_categoria: 2, nombre: 'ACCESORIOS' },
  { id_categoria: 3, nombre: 'GAFAS DE SOL' },
];

const EditarProducto = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const productController = new ProductController();

  const [imagen, setImagen] = useState(null);
  const [imagenPreview, setImagenPreview] = useState(null);
  const [imagenOriginal, setImagenOriginal] = useState(null);
  const [subiendo, setSubiendo] = useState(false);
  const [cargandoProducto, setCargandoProducto] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '', descripcion: '', marca: '', precio: '', material: '', color: '',
  });

  useEffect(() => {
    const cargarProducto = async () => {
      if (!id) {
        void alertError('No se encontró el ID del producto.');
        void navigate(-1);
        return;
      }

      try {
        setCargandoProducto(true);
        const producto = await productController.getProductoById(Number(id));

        if (!producto) {
          void alertError('No se encontró el producto.');
          void navigate(-1);
          return;
        }

        setFormData({
          nombre: producto.nombre || '', descripcion: producto.descripcion || '',
          marca: producto.marca || '', precio: producto.precio ? String(producto.precio) : '',
          material: producto.material || '', color: producto.color || '',
        });

        if (producto.imagen_url) {
          setImagenOriginal(producto.imagen_url);
          setImagenPreview(producto.imagen_url);
        }

        if (producto.id_categoria) {
          const cat = CATEGORIAS.find((c) => c.id_categoria === producto.id_categoria);
          if (cat) setCategoriaSeleccionada(cat);
        }
      } catch (error) {
        console.error('Error cargando producto:', error);
        void alertError('No fue posible cargar los datos del producto.');
      } finally {
        setCargandoProducto(false);
      }
    };

    void cargarProducto();
  }, [id, navigate, productController]);

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
    setImagenOriginal(null);
  };

  const editarProducto = async () => {
    const imagenFinal = imagen || imagenOriginal;

    const check = validarFormularioEditarProducto({
      id_categoria: categoriaSeleccionada?.id_categoria,
      nombre: formData.nombre, descripcion: formData.descripcion,
      marca: formData.marca, precio: formData.precio,
      imagen: imagenFinal || '', material: formData.material, color: formData.color,
    });

    if (!check.valido) {
      void alertError(check.mensaje || 'Datos inválidos');
      return;
    }

    try {
      setSubiendo(true);
      const resultado = await productController.actualizarProducto(Number(id), {
        id_categoria: categoriaSeleccionada.id_categoria,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        marca: formData.marca.trim(),
        precio: Number.parseFloat(formData.precio),
        imagen: imagen || imagenOriginal,
        material: formData.material.trim(),
        color: formData.color.trim(),
      });

      if (!resultado.success) {
        void alertError(resultado.message);
        return;
      }

      void alertSuccess('El producto fue actualizado correctamente.');
      void navigate('/admin/inventario');
    } catch (error) {
      console.error('Error editando producto:', error);
      void alertError(error?.message || 'No fue posible editar el producto.');
    } finally {
      setSubiendo(false);
    }
  };

  if (cargandoProducto) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-gray-100">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-500">Cargando producto...</p>
      </div>
    );
  }

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
              <i className="fa-solid fa-pen text-[#B90F0F] text-xl"></i>
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Editar Producto</h2>
              <p className="text-sm text-gray-500 mt-1">Actualiza los datos del producto existente.</p>
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
          onSubmit={editarProducto}
          onCancel={() => void navigate(-1)}
          subiendo={subiendo}
          textoBoton="Guardar Cambios"
        />
      </div>
    </div>
  );
};

export default EditarProducto;