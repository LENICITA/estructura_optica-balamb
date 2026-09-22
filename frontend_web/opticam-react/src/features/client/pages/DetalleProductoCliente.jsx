// src/features/client/pages/DetalleProductoCliente.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProductController } from '../../../core/controllers/ProductController';

const DetalleProductoCliente = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const productController = new ProductController();

  const [producto, setProducto] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);

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

  const agregarAlCarrito = () => {
    if (!producto) return;

    try {
      const carritoGuardado = localStorage.getItem('@carrito');
      const carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];

      const indexExistente = carrito.findIndex((item) => item.id_producto === producto.id_producto);

      if (indexExistente !== -1) {
        carrito[indexExistente].cantidad += cantidad;
      } else {
        carrito.push({
          id: Date.now(),
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: cantidad,
          imagen: producto.imagen_url || producto.imagen || '',
          color: producto.color,
          material: producto.material,
          seleccionado: true,
        });
      }

      localStorage.setItem('@carrito', JSON.stringify(carrito));
      alert(`✅ ${producto.nombre} agregado al carrito`);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      alert('No se pudo agregar el producto al carrito');
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
          onClick={() => navigate('/catalogo')}
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8 pb-32">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
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

            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Detalle del producto
              </h1>
              <p className="text-sm text-gray-500 mt-1">
                Consulta las características y detalles del producto.
              </p>
            </div>
          </div>
        </div>

        {/* PRODUCTO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">

            {/* IMAGEN */}
            <div className="bg-gray-50 min-h-[320px] sm:min-h-[450px] lg:min-h-[520px] flex items-center justify-center p-6 sm:p-10">
              {imagenProducto ? (
                <img
                  src={imagenProducto}
                  alt={producto.nombre}
                  className="w-full h-full max-h-[480px] object-contain hover:scale-105 transition duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center">
                  <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center">
                    <i className="fa-solid fa-image text-gray-300 text-4xl"></i>
                  </div>

                  <p className="text-sm font-semibold text-gray-500 mt-4">
                    Sin imagen
                  </p>

                  <p className="text-xs text-gray-400 mt-1">
                    No hay una imagen disponible.
                  </p>
                </div>
              )}
            </div>

            {/* INFORMACIÓN */}
            <div className="p-5 sm:p-7 lg:p-8 flex flex-col">

              <div>
                <span className="inline-flex items-center bg-[#B90F0F] text-white text-xs font-bold uppercase px-3 py-1.5 rounded-lg">
                  {producto.tipo_categoria || 'Producto'}
                </span>

                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-4 leading-tight">
                  {producto.nombre}
                </h2>

                <p className="text-2xl sm:text-3xl font-black text-[#B90F0F] mt-3">
                  {producto.precioFormateado}
                </p>
              </div>

              {/* ESPECIFICACIONES */}
              <div className="mt-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <i className="fa-solid fa-list text-[#B90F0F]"></i>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Especificaciones
                    </h3>
                    <p className="text-xs text-gray-500">
                      Características del producto.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3">
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
                          <p className="text-[11px] font-semibold text-gray-400 uppercase">
                            {spec.label}
                          </p>

                          <p className="text-sm font-bold text-gray-800 mt-1 truncate">
                            {spec.value || 'N/A'}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* DESCRIPCIÓN */}
              <div className="mt-7">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
                    <i className="fa-solid fa-align-left text-[#B90F0F]"></i>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-gray-900">
                      Descripción
                    </h3>
                    <p className="text-xs text-gray-500">
                      Información adicional del producto.
                    </p>
                  </div>
                </div>

                <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                  <p className="text-sm text-gray-600 leading-6">
                    {producto.descripcion ||
                      'Sin descripción disponible para este producto.'}
                  </p>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* COMPRA */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase">
                Cantidad
              </p>

              <div className="flex items-center border border-gray-300 rounded-xl h-12 w-fit mt-2 overflow-hidden">
                <button
                  onClick={() =>
                    cantidad > 1 && setCantidad(cantidad - 1)
                  }
                  className="w-12 h-full flex items-center justify-center hover:bg-gray-50 transition"
                >
                  <i className="fa-solid fa-minus text-gray-700 text-sm"></i>
                </button>

                <span className="w-12 text-center text-base font-bold text-gray-900">
                  {cantidad}
                </span>

                <button
                  onClick={() => setCantidad(cantidad + 1)}
                  className="w-12 h-full flex items-center justify-center hover:bg-gray-50 transition"
                >
                  <i className="fa-solid fa-plus text-gray-700 text-sm"></i>
                </button>
              </div>
            </div>

            <button
              onClick={agregarAlCarrito}
              className="w-full sm:w-auto sm:min-w-[280px] h-12 bg-[#B90F0F] rounded-xl flex items-center justify-center gap-3 shadow-sm hover:bg-[#9f0d0d] transition"
            >
              <i className="fa-solid fa-cart-shopping text-white text-lg"></i>

              <span className="text-white text-sm font-bold">
                Agregar al carrito
              </span>
            </button>

          </div>
        </div>

        {/* VOLVER */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <button
            onClick={() => navigate('/catalogo')}
            className="w-full border border-gray-300 text-gray-700 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50 transition"
          >
            <i className="fa-solid fa-arrow-left"></i>
            Volver al catálogo
          </button>
        </div>

      </div>
    </div>
  );
};

export default DetalleProductoCliente;