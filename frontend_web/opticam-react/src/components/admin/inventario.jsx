import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const Inventario = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [productos, setProductos] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Cargar productos y categorias
  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const cargarProductos = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/inventario/productos');
      console.log('Productos cargados:', response.data);

      if (response.data.success) {
        setProductos(response.data.productos || []);
      } else {
        throw new Error(response.data.message || 'Error al cargar productos');
      }
    } catch (error) {
      console.error('Error al cargar productos:', error);
      setError(error.response?.data?.message || 'Error al cargar productos');
      setProductos([]);
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const response = await api.get('/inventario/categorias');
      console.log('Categorias cargadas:', response.data);

      if (response.data.success) {
        setCategorias(response.data.categorias || []);
      }
    } catch (error) {
      console.error('Error al cargar categorias:', error);
    }
  };

  // Editar producto
  const handleEdit = (producto) => {
    setEditingProduct({
      id_producto: producto.id_producto,
      id_categoria: producto.id_categoria || '',
      nombre: producto.nombre || '',
      descripcion: producto.descripcion || '',
      marca: producto.marca || '',
      material: producto.material || '',
      color: producto.color || '',
      precio: producto.precio || 0,
      imagen: producto.imagen || '/img/default.png',
    });
    setModalOpen(true);
  };

  // Eliminar producto
  const handleDelete = async (id_producto) => {
    if (!window.confirm('¿Estás seguro de eliminar este producto?')) return;

    setLoading(true);

    try {
      const response = await api.delete(`/inventario/productos/${id_producto}`);
      console.log('Producto eliminado:', response.data);

      if (response.data.success) {
        // Actualizar la lista local
        setProductos(productos.filter(p => p.id_producto !== id_producto));
        alert('Producto eliminado exitosamente');
      } else {
        throw new Error(response.data.message || 'Error al eliminar');
      }

    } catch (error) {
      console.error('Error al eliminar producto:', error);
      alert(error.response?.data?.message || 'Error al eliminar producto');
    } finally {
      setLoading(false);
    }
  };

  // Guardar edición
  const handleSave = async () => {
    if (!editingProduct) return;

    // Validar campos obligatorios
    if (!editingProduct.nombre || !editingProduct.precio || !editingProduct.id_categoria) {
      alert('Nombre, precio y categoria son obligatorios');
      return;
    }

    setLoading(true);

    try {
      const productoActualizado = {
        id_categoria: Number(editingProduct.id_categoria),
        nombre: editingProduct.nombre,
        descripcion: editingProduct.descripcion || '',
        marca: editingProduct.marca || '',
        material: editingProduct.material || '',
        color: editingProduct.color || '',
        precio: Number(editingProduct.precio),
        imagen: editingProduct.imagen || '/img/default.png',
      };

      const response = await api.put(`/inventario/productos/${editingProduct.id_producto}`, productoActualizado);

      console.log('Producto actualizado', response.data);

      if (response.data.success) {
        // Actualizar la lista local
        setProductos(productos.map(p => p.id_producto === editingProduct.id_producto ? { ...p, ...productoActualizado } : p ));

        setModalOpen(false);
        setEditingProduct(null);
        alert('Producto actualizado exitosamente');
      } else {
        throw new Error(response.data.message || 'Error al actualizar el producto');
      }
    } catch (error) {
      console.error('Error al actualizar producto:', error);
      alert(error.response?.data?.message || 'Error al actualizar producto');
    } finally {
      setLoading(false);
    }
  };

  // Filtrar productos
  const filteredProductos = productos.filter((p) =>
    p.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.marca?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.tipo_categoria?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const valorTotalInventario = productos.reduce((acc, p) => acc + Number(p.precio || 0), 0);

  return (
    <main className="p-10 max-md:p-5">

      { /* LOADING */}
      {loading && (
        <div className='text-center py-4'>
          <div className='inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-[#B90F0F]'></div>
          <p className='mt-2 text-gray-600'>Cargando productos...</p>
        </div>
      )}

      { /* ERROR */}
      {error && !loading && (
        <div className='bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4 mx-10 max-md:mx-0'>
          <p className='font-semibold'>Error:</p>
          <p>{error}</p>
          <button onClick={cargarProductos} className='mt-2 bg-red-600 text-white px-4 py-1 rounded hover:bg-red-700 transition'>Reintentar</button>
        </div>
      )}

      {/* HEADER */}
      <div className="flex justify-between items-center my-10 mx-10 max-md:flex-col max-md:gap-2.5 max-md:my-5 max-md:mx-0">
        <h1 className="text-2xl font-bold text-[#000000]">
          Inventario
        </h1>

        <button className="bg-[#B90F0F] text-[#ffffff] border-none px-4 py-2.5 rounded-lg cursor-pointer hover:bg-[#8a0b0b] transition" onClick={() => navigate('/admin/agregar-producto')} disabled={loading}>
            <i className="text-[#ffffff] no-underline">Agregar Producto</i>
        </button>
      </div>

      {/* CARDS */}
      <div className="flex gap-5 my-10 mx-10 max-md:flex-col max-md:my-5 max-md:mx-0">

        {/* Total productos */}
        <div className="flex-1 bg-[#ffffff] p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm text-[#000000]">
                Inventario Total
              </h2>

              <p className="text-xl font-bold text-[#000000] mt-1">
                {productos.length}
              </p>

              <span className="text-xs text-gray-500">
                Items
              </span>
            </div>

            <img
              className="w-12 h-12"
              src="/img/caja.png"
              alt="Caja"
            />
          </div>
        </div>

        {/* Ventas */}
        <div className="flex-1 bg-[#ffffff] p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm text-[#000000]">
                Ventas totales
              </h2>

              <p className="text-xl font-bold text-[#000000] mt-1">
                $3.500.000
              </p>

              <span className="text-xs text-gray-500">
                COL
              </span>
            </div>

            <img
              className="w-12 h-12"
              src="/img/ventas.png"
              alt="Ventas"
            />
          </div>
        </div>

        {/* Total inventario */}
        <div className="flex-1 bg-[#ffffff] p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm text-[#000000]">Valor Total del Inventario</h2>
              <p className="text-xl font-bold text-[#000000] mt-1">
                ${valorTotalInventario.toLocaleString('es-CO')}
              </p>
              <span className="text-xs text-gray-500">COL</span>
            </div>
            <img className="w-12 h-12" src="/img/monedas-de-un-dolar.png" alt="Monedas"/>
          </div>
        </div>
      </div>

      {/* BUSCADOR */}
      <input
        type="text"
        placeholder="Buscar en el inventario..."
        className="w-[95%] p-2.5 my-5 mx-10 block border border-gray-300 rounded-md focus:outline-none focus:border-[#B90F0F] max-md:w-full max-md:mx-0"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        disabled={loading}
      />

      {/* TABLA */}
      <div className="overflow-x-auto">
        <table className="w-[95%] mx-auto my-[30px] bg-white rounded-md overflow-hidden shadow-md max-md:w-full">

          <thead className="bg-[#f1f5f9]">
            <tr>
              <th className="p-4 text-left text-sm">
                Producto
              </th>

              <th className="p-4 text-left text-sm">
                Descripción
              </th>

              <th className="p-4 text-left text-sm">
                Categoría
              </th>

              <th className="p-4 text-left text-sm">
                Marca
              </th>

              <th className="p-4 text-left text-sm">
                Material
              </th>

              <th className="p-4 text-left text-sm">
                Color
              </th>

              <th className="p-4 text-left text-sm">
                Precio
              </th>

              <th className="p-4 text-left text-sm">
                Acciones
              </th>
            </tr>
          </thead>

          <tbody>
            {loading && productos.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-[#B90F0F]"></div>
                  <p className="mt-2">Cargando productos...</p>
                </td>
              </tr>
            ) : filteredProductos.length === 0 ? (
              <tr>
                <td colSpan="8" className="text-center py-8 text-gray-500">
                  {searchTerm
                    ? 'No se encontraron productos que coincidan con la búsqueda'
                    : 'No hay productos disponibles'}
                </td>
              </tr>
            ) : (
              filteredProductos.map((producto) => (
                <tr key={producto.id_producto} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="p-4">
                    <div className="flex items-center gap-2.5">
                      <img
                        src={producto.imagen || '/img/default.png'}
                        alt={producto.nombre}
                        className="w-11 h-11 rounded-md object-cover"
                        onError={(e) => (e.target.src = '/img/default.png')}
                      />
                      <span>{producto.nombre}</span>
                    </div>
                  </td>
                  <td className="p-4">{producto.descripcion || '-'}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 bg-gray-100 rounded-full text-xs">
                      {producto.tipo_categoria || producto.categoria_descripcion || 'Sin categoría'}
                    </span>
                  </td>
                  <td className="p-4">{producto.marca || '-'}</td>
                  <td className="p-4">{producto.material || '-'}</td>
                  <td className="p-4">
                    <span
                      className="inline-block w-4 h-4 rounded-full border border-gray-300 mr-1 align-middle"
                      style={{ backgroundColor: producto.color?.toLowerCase() || '#ccc' }}
                    />
                    {producto.color || '-'}
                  </td>
                  <td className="p-4 font-semibold">
                    ${Number(producto.precio).toLocaleString('es-CO')}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleEdit(producto)}
                      className="bg-transparent border-none text-[#000000] text-base mr-2 cursor-pointer hover:text-[#B90F0F] transition disabled:opacity-50"
                      disabled={loading}
                      title="Editar producto"
                    >
                      <i className="fa-solid fa-pen-to-square"></i>
                    </button>
                    <button
                      onClick={() => handleDelete(producto.id_producto)}
                      className="bg-transparent border-none text-[#B90F0F] text-base cursor-pointer hover:text-red-700 transition disabled:opacity-50"
                      disabled={loading}
                      title="Eliminar producto"
                    >
                      <i className="fa-solid fa-trash-can"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ===== MODAL EDITAR ===== */}
      {modalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-5 rounded-xl w-[350px] max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-bold mb-4">Editar Producto</h2>

            {/* Categoría - Select */}
            <label className="font-bold text-sm block mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            <select
              value={editingProduct.id_categoria}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, id_categoria: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md mb-3"
              disabled={loading}
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.tipo_categoria} - {cat.descripcion}
                </option>
              ))}
            </select>

            {/* Nombre */}
            <label className="font-bold text-sm block mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={editingProduct.nombre}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, nombre: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md mb-3"
              disabled={loading}
            />

            {/* Descripción */}
            <label className="font-bold text-sm block mb-1">Descripción</label>
            <input
              type="text"
              value={editingProduct.descripcion}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, descripcion: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md mb-3"
              disabled={loading}
            />

            {/* Marca */}
            <label className="font-bold text-sm block mb-1">Marca</label>
            <input
              type="text"
              value={editingProduct.marca}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, marca: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md mb-3"
              disabled={loading}
            />

            {/* Material */}
            <label className="font-bold text-sm block mb-1">Material</label>
            <input
              type="text"
              value={editingProduct.material}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, material: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md mb-3"
              disabled={loading}
            />

            {/* Color */}
            <label className="font-bold text-sm block mb-1">Color</label>
            <input
              type="text"
              value={editingProduct.color}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, color: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md mb-3"
              disabled={loading}
            />

            {/* Precio */}
            <label className="font-bold text-sm block mb-1">
              Precio <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              value={editingProduct.precio}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, precio: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md mb-3"
              disabled={loading}
              min="0"
              step="1000"
            />

            {/* Imagen URL */}
            <label className="font-bold text-sm block mb-1">URL Imagen</label>
            <input
              type="text"
              value={editingProduct.imagen}
              onChange={(e) =>
                setEditingProduct({ ...editingProduct, imagen: e.target.value })
              }
              className="w-full p-2 border border-gray-300 rounded-md mb-4"
              disabled={loading}
              placeholder="/img/default.png"
            />

            {/* Botones */}
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 bg-[#B90F0F] text-white py-2 rounded-md cursor-pointer hover:bg-[#8a0b0b] transition disabled:opacity-50"
                disabled={loading}
              >
                {loading ? 'Guardando...' : 'Guardar'}
              </button>
              <button
                onClick={() => {
                  setModalOpen(false);
                  setEditingProduct(null);
                }}
                className="flex-1 bg-gray-500 text-white py-2 rounded-md cursor-pointer hover:bg-gray-600 transition disabled:opacity-50"
                disabled={loading}
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Inventario;