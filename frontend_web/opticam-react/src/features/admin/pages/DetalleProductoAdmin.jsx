// src/features/admin/pages/DetalleProductoAdmin.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ProductController } from '../../../core/controllers/ProductController';

const DetalleProductoAdmin = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const productController = new ProductController();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) cargarDetalleProducto();
    else setLoading(false);
  }, [id]);

  const cargarDetalleProducto = async () => {
    try {
      setLoading(true);
      const data = await productController.getProductoById(Number(id));
      setProducto(data);
    } catch (error) {
      console.error('Error cargando detalle del producto:', error);
    } finally {
      setLoading(false);
    }
  };

  const eliminarProducto = async () => {
    if (!window.confirm(`¿Estás seguro de eliminar "${producto?.nombre}"?`)) return;

    try {
      setLoading(true);
      const response = await productController.eliminarProducto(Number(id));

      if (response.success) {
        alert('Producto eliminado correctamente');
        navigate('/admin/inventario');
      } else {
        alert(response.message || 'Error al eliminar');
      }
    } catch (error) {
      alert('No se pudo eliminar el producto');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-white">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-gray-500 text-sm">Cargando detalle...</p>
      </div>
    );
  }

  if (!producto) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] p-5 bg-white">
        <i className="fa-solid fa-circle-exclamation text-6xl text-gray-300"></i>
        <p className="mt-3 text-sm text-gray-500 text-center">No se encontró la información del producto.</p>
        <button
          onClick={() => navigate(-1)}
          className="mt-4 px-5 py-2.5 bg-[#B90F0F] text-white rounded-lg font-semibold"
        >
          Volver al catálogo
        </button>
      </div>
    );
  }

  const imagenProducto = producto.imagen_url || producto.imagen;
  const specs = [
    { icon: 'fa-tag', label: 'Marca', value: producto.marca },
    { icon: 'fa-cube', label: 'Material', value: producto.material },
    { icon: 'fa-palette', label: 'Color', value: producto.color },
  ];

    return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">

        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="w-10 h-10 rounded-xl border border-gray-200 flex items-center justify-center text-gray-600 hover:bg-gray-50 transition"
              >
                <i className="fa-solid fa-arrow-left"></i>
              </button>

              <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                <i className="fa-solid fa-glasses text-2xl text-[#B90F0F]"></i>
              </div>

              <div>
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                  Detalle del producto
                </h1>

                <p className="text-sm text-gray-500 mt-1">
                  Información completa del producto
                </p>
              </div>
            </div>

            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-red-50 text-[#B90F0F] text-sm font-bold self-start sm:self-auto">
              <i className="fa-solid fa-box"></i>
              {producto.tipo_categoria || 'Producto'}
            </span>

          </div>
        </div>

        {/* INFORMACIÓN PRINCIPAL */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">

          {/* IMAGEN */}
          <div className="w-full h-[300px] sm:h-[400px] bg-gray-50 border-b border-gray-200 flex items-center justify-center p-6">
            {imagenProducto ? (
              <img
                src={imagenProducto}
                alt={producto.nombre}
                className="w-full h-full object-contain"
              />
            ) : (
              <div className="flex flex-col items-center justify-center">
                <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center">
                  <i className="fa-solid fa-image text-gray-300 text-3xl"></i>
                </div>

                <p className="text-sm text-gray-400 mt-3">
                  Imagen no disponible
                </p>
              </div>
            )}
          </div>

          {/* DATOS DEL PRODUCTO */}
          <div className="p-5 sm:p-7">

            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">

              <div className="min-w-0">
                <p className="text-xs font-semibold text-gray-400 uppercase">
                  Producto
                </p>

                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-1 break-words">
                  {producto.nombre}
                </h2>

                <p className="text-2xl sm:text-3xl font-black text-[#B90F0F] mt-2">
                  {producto.precioFormateado}
                </p>
              </div>

              <div className="bg-red-50 rounded-xl px-4 py-3 self-start">
                <p className="text-xs text-gray-500">
                  Categoría
                </p>

                <p className="text-sm font-bold text-[#B90F0F] mt-1">
                  {producto.tipo_categoria || 'Producto'}
                </p>
              </div>

            </div>

            {/* ESPECIFICACIONES */}
            <div className="mt-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <i className="fa-solid fa-circle-info text-[#B90F0F]"></i>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Especificaciones
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Características principales del producto.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">

                {specs.map((spec, i) => (
                  <div
                    key={i}
                    className="border border-gray-200 rounded-xl p-4"
                  >
                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                        <i
                          className={`fa-solid ${spec.icon} text-[#B90F0F]`}
                        ></i>
                      </div>

                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-gray-400 uppercase">
                          {spec.label}
                        </p>

                        <p className="text-sm font-bold text-gray-900 mt-1 truncate">
                          {spec.value || 'No especificado'}
                        </p>
                      </div>

                    </div>
                  </div>
                ))}

              </div>
            </div>

            {/* DESCRIPCIÓN */}
            <div className="mt-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                  <i className="fa-solid fa-align-left text-[#B90F0F]"></i>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-gray-900">
                    Descripción
                  </h3>

                  <p className="text-xs text-gray-500 mt-1">
                    Información adicional del producto.
                  </p>
                </div>
              </div>

              <div className="border border-gray-200 rounded-xl bg-gray-50 p-5">
                <p className="text-sm text-gray-600 leading-6">
                  {producto.descripcion ||
                    'Sin descripción disponible para este producto.'}
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* ACCIONES DEL ADMINISTRADOR */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-screwdriver-wrench text-[#B90F0F]"></i>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Acciones del administrador
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Gestiona la información de este producto.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

            <Link
              to={`/admin/productos/${id}/editar`}
              className="h-12 rounded-xl border border-[#B90F0F] flex items-center justify-center gap-2 bg-white text-[#B90F0F] font-bold text-sm hover:bg-red-50 transition"
            >
              <i className="fa-solid fa-pen"></i>
              Editar producto
            </Link>

            <button
              onClick={eliminarProducto}
              className="h-12 rounded-xl bg-[#B90F0F] flex items-center justify-center gap-2 text-white font-bold text-sm hover:bg-[#9f0d0d] transition shadow-sm"
            >
              <i className="fa-solid fa-trash"></i>
              Eliminar producto
            </button>

          </div>
        </div>

        {/* VOLVER */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <button
            onClick={() => navigate(-1)}
            className="w-full border border-gray-300 text-gray-700 py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver al catálogo
          </button>
        </div>

      </div>
    </div>
  );
};

export default DetalleProductoAdmin;