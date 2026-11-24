// src/features/admin/pages/CatalogoAdmin.jsx
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCatalogo } from '../../../shared/hooks/useCatalogo';
import { CatalogoUI } from '../../../shared/components/ui/CatalogoUI';
import { alertError, alertConfirm, toastSuccess } from '../../../shared/utils/alert';

export const CatalogoAdmin = () => {
  const navigate = useNavigate();
  const catalogo = useCatalogo();

  const eliminarProducto = async (producto) => {
    const confirmado = await alertConfirm({
      title: '¿Eliminar producto?',
      text: `¿Estás seguro de eliminar el producto "${producto.nombre}"? Esta acción no se puede deshacer.`,
      confirmButtonText: 'Sí, eliminar',
    });
    if (!confirmado) return;

    try {
      const response = await (new (await import('../../../core/controllers/ProductController')).ProductController()).eliminarProducto(producto.id_producto);
      if (response.success) {
        void toastSuccess('Producto eliminado correctamente');
        void catalogo.limpiarFiltros(); // Recarga la lista
      } else {
        void alertError(response.message || 'Error al eliminar');
      }
    } catch (error) {
      void alertError('No se pudo eliminar el producto');
      console.error(error);
    }
  };

  const renderAccionesAdmin = (item) => (
    <>
      <button onClick={() => void navigate(`/admin/productos/${item.id_producto}`)} className="flex-1 h-10 border border-gray-300 rounded-xl flex items-center justify-center gap-2 hover:bg-gray-50 transition">
        <i className="fa-solid fa-eye text-gray-700 text-xs"></i>
        <span className="text-xs text-gray-700 font-bold">Ver detalle</span>
      </button>
      <Link to={`/admin/productos/${item.id_producto}/editar`} className="w-10 h-10 rounded-xl border border-[#B90F0F] text-[#B90F0F] flex items-center justify-center hover:bg-red-50 transition" title="Editar producto">
        <i className="fa-solid fa-pen"></i>
      </Link>
      <button onClick={() => eliminarProducto(item)} className="w-10 h-10 rounded-xl border border-red-200 text-red-500 flex items-center justify-center hover:bg-red-50 transition" title="Eliminar producto">
        <i className="fa-solid fa-trash"></i>
      </button>
    </>
  );

  return (
    <CatalogoUI
      catalogo={catalogo}
      titulo="Catálogo de productos"
      subtitulo="Gestiona los productos disponibles en la tienda."
      icono="fa-boxes-stacked"
      botonHeader={
        <Link to="/admin/productos/crear" className="w-full lg:w-auto flex items-center justify-center gap-2 bg-[#B90F0F] hover:bg-[#9f0d0d] text-white px-5 py-3 rounded-xl font-bold text-sm transition">
          <i className="fa-solid fa-circle-plus"></i> Crear producto
        </Link>
      }
      renderAcciones={renderAccionesAdmin}
    />
  );
};

export default CatalogoAdmin;