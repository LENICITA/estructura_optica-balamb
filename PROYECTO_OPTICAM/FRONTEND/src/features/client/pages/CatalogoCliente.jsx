// src/features/client/pages/CatalogoCliente.jsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useCatalogo } from '../../../shared/hooks/useCatalogo';
import { CatalogoUI } from '../../../shared/components/ui/CatalogoUI';
import { alertError, toastSuccess } from '../../../shared/utils/alert';

export const CatalogoCliente = () => {
  const navigate = useNavigate();
  const catalogo = useCatalogo();

  const agregarAlCarrito = (producto) => {
    try {
      const carritoGuardado = localStorage.getItem('@carrito');
      const carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];
      const indexExistente = carrito.findIndex((item) => item.id_producto === producto.id_producto);

      if (indexExistente !== -1) {
        carrito[indexExistente].cantidad += 1;
      } else {
        carrito.push({
          id: Date.now(),
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: 1,
          imagen: producto.imagen_url || producto.imagen || '',
          color: producto.color,
          material: producto.material,
          seleccionado: true,
        });
      }
      localStorage.setItem('@carrito', JSON.stringify(carrito));
      void toastSuccess(`${producto.nombre} agregado al carrito`);
    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      void alertError('No se pudo agregar el producto');
    }
  };

  const renderAccionesCliente = (item) => (
    <>
      <button onClick={() => void navigate(`/producto/${item.id_producto}`)} className="flex-1 h-10 border border-gray-300 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition">
        <i className="fa-solid fa-eye text-gray-700 text-xs"></i>
        <span className="text-xs text-gray-700 font-bold">Ver detalle</span>
      </button>
      <button onClick={() => agregarAlCarrito(item)} className="w-10 h-10 rounded-xl bg-[#B90F0F] flex items-center justify-center hover:bg-[#9f0d0d] transition" title="Agregar al carrito">
        <i className="fa-solid fa-cart-shopping text-white"></i>
      </button>
    </>
  );

  return (
    <CatalogoUI
      catalogo={catalogo}
      titulo="Catálogo de productos"
      subtitulo="Encuentra monturas, gafas de sol y accesorios."
      icono="fa-glasses"
      botonHeader={
        <button onClick={() => void navigate(-1)} className="w-full lg:w-auto flex items-center justify-center gap-2 border border-gray-200 text-gray-700 px-5 py-3 rounded-xl font-bold text-sm hover:bg-gray-50 transition">
          <i className="fa-solid fa-arrow-left"></i> Volver
        </button>
      }
      renderAcciones={renderAccionesCliente}
    />
  );
};

export default CatalogoCliente;