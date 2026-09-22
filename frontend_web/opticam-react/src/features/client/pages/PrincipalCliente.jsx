// src/features/client/pages/PrincipalCliente.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/context/AuthContext';
import { ProductController } from '../../../core/controllers/ProductController';

export const PrincipalCliente = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const productController = new ProductController();

  const [nombreUsuario, setNombreUsuario] = useState('Cliente');
  const [productosDestacados, setProductosDestacados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const cargadoInicial = useRef(false);

  useEffect(() => {
    if (cargadoInicial.current) return;
    cargadoInicial.current = true;
    cargarDatosCliente();
  }, []);

  const cargarDatosCliente = async () => {
    try {
      setLoading(true);
      setError(null);

      if (user?.nombre_completo) setNombreUsuario(user.nombre_completo);

      try {
        const productos = await productController.getProductosDestacados();

        let productosData = [];
        if (productos?.productos) productosData = productos.productos;
        else if (productos?.data && Array.isArray(productos.data)) productosData = productos.data;
        else if (Array.isArray(productos)) productosData = productos;

        if (Array.isArray(productosData) && productosData.length > 0) {
          const productosMapeados = productosData.map((p) => ({
            id: p.id_producto || p.id,
            nombre: p.nombre || 'Producto',
            precio: p.precio || 0,
            imagen: p.imagen || p.imagen_url || 'https://via.placeholder.com/150',
            vendidos: p.vendidos || 0,
          }));
          setProductosDestacados(productosMapeados);
        } else {
          setProductosDestacados([]);
        }
      } catch (err) {
        console.warn('No se pudieron cargar productos destacados:', err);
        setProductosDestacados([]);
      }
    } catch (err) {
      console.error('Error al cargar datos:', err);
      setError('Error al cargar el dashboard. Verifica tu conexión.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] bg-white">
        <div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 text-base">Cargando tu tienda...</p>
      </div>
    );
  }

  const categorias = [
    { icon: 'fa-glasses', title: 'Monturas', action: '/catalogo' },
    { icon: 'fa-sun', title: 'Gafas de Sol', action: '/catalogo' },
    { icon: 'fa-file-medical', title: 'Fórmula Médica', action: '/cliente/mis-formulas' },
    { icon: 'fa-chart-line', title: 'Más Vendidos', action: '/catalogo' },
  ];

  const beneficios = [
    { icon: 'fa-truck', title: 'Envío gratis', desc: 'En compras > $200.000' },
    { icon: 'fa-shield', title: 'Garantía', desc: '30 días de garantía' },
    { icon: 'fa-rotate', title: 'Devoluciones', desc: 'Hasta 15 días' },
    { icon: 'fa-headset', title: 'Soporte 24/7', desc: 'Atención al cliente' },
  ];

    return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* ENCABEZADO / BIENVENIDA */}
        <div className="bg-[#B90F0F] rounded-2xl shadow-sm p-6 sm:p-8 text-white">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                  <i className="fa-solid fa-glasses text-2xl"></i>
                </div>

                <span className="text-sm font-semibold text-white/80">
                  ÓptiCam
                </span>
              </div>

              <h1 className="text-2xl sm:text-3xl font-bold">
                ¡Bienvenido, {nombreUsuario}!
              </h1>

              <p className="text-white/90 text-sm sm:text-base mt-2">
                Encuentra las mejores monturas y cuida tu estilo visual.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 lg:min-w-[360px]">
              <Link
                to="/catalogo"
                className="flex-1 flex items-center justify-center gap-2 bg-white text-[#B90F0F] px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-100 transition"
              >
                <i className="fa-solid fa-glasses"></i>
                Ver catálogo
              </Link>

              <Link
                to="/cliente/crear-formula"
                className="flex-1 flex items-center justify-center gap-2 bg-white/15 border border-white/30 text-white px-5 py-3 rounded-xl font-bold text-sm hover:bg-white/20 transition"
              >
                <i className="fa-solid fa-file-medical"></i>
                Subir fórmula
              </Link>
            </div>
          </div>
        </div>

        {/* ACCESOS RÁPIDOS */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Accesos rápidos
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Explora las opciones principales de tu tienda.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {categorias.map((cat, idx) => (
              <Link
                key={idx}
                to={cat.action}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center">
                    <i
                      className={`fa-solid ${cat.icon} text-2xl text-[#B90F0F]`}
                    ></i>
                  </div>

                  <i className="fa-solid fa-arrow-right text-gray-300"></i>
                </div>

                <h3 className="text-base font-bold text-gray-900 mt-4">
                  {cat.title}
                </h3>

                <p className="text-xs text-[#B90F0F] font-semibold mt-1">
                  Ver todas
                </p>
              </Link>
            ))}
          </div>
        </div>

        {/* PRODUCTOS DESTACADOS */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Productos destacados
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Descubre algunos de nuestros productos disponibles.
              </p>
            </div>

            <Link
              to="/catalogo"
              className="inline-flex items-center justify-center gap-2 text-[#B90F0F] font-bold text-sm hover:text-[#9f0d0d] transition"
            >
              Ver todos
              <i className="fa-solid fa-arrow-right"></i>
            </Link>
          </div>

          {productosDestacados.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {productosDestacados.map((producto) => (
                <Link
                  key={producto.id}
                  to={`/producto/${producto.id}`}
                  className="group border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition bg-white"
                >
                  <div className="h-48 bg-gray-50 flex items-center justify-center p-5">
                    <img
                      src={producto.imagen}
                      alt={producto.nombre}
                      className="w-full h-full object-contain group-hover:scale-105 transition"
                    />
                  </div>

                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-sm font-bold text-gray-900 truncate">
                        {producto.nombre}
                      </h3>

                      <i className="fa-regular fa-heart text-gray-300 text-sm"></i>
                    </div>

                    <p className="text-lg font-black text-[#B90F0F] mt-2">
                      ${producto.precio.toLocaleString('es-CO')}
                    </p>

                    <button
                      type="button"
                      className="w-full mt-4 bg-[#B90F0F] text-white py-2.5 rounded-xl text-sm font-bold hover:bg-[#9f0d0d] transition"
                    >
                      Ver detalles
                    </button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 rounded-2xl p-10 text-center">
              <div className="w-14 h-14 rounded-xl bg-gray-50 flex items-center justify-center mx-auto">
                <i className="fa-solid fa-box-open text-gray-400 text-2xl"></i>
              </div>

              <p className="text-sm font-semibold text-gray-700 mt-4">
                No hay productos disponibles
              </p>

              <p className="text-xs text-gray-400 mt-1">
                Actualmente no hay productos destacados para mostrar.
              </p>
            </div>
          )}
        </div>

        {/* BENEFICIOS */}
        <div>
          <div className="mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Beneficios de comprar con nosotros
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Servicios pensados para brindarte una mejor experiencia.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {beneficios.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5"
              >
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center">
                  <i
                    className={`fa-solid ${item.icon} text-xl text-[#B90F0F]`}
                  ></i>
                </div>

                <h3 className="text-sm font-bold text-gray-900 mt-4">
                  {item.title}
                </h3>

                <p className="text-xs text-gray-500 mt-1">
                  {item.desc}
                </p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default PrincipalCliente;