import React, { useState } from 'react';

const Inventario = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingProduct, setEditingProduct] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

  const productos = [
    { id: 1, nombre: "Ángel Gold", descripcion: "Gafas elegantes", categoria: "Gafas de Sol", marca: "OptiCam", material: "Plástico", color: "Dorado", precio: 250000, imagen: "/img/producto1.jpg" },
    { id: 2, nombre: "Sky Blue", descripcion: "Gafas modernas", categoria: "Gafas de Sol", marca: "OptiCam", material: "Metal", color: "Azul", precio: 180000, imagen: "/img/producto2.jpg" },
    { id: 3, nombre: "Titanium Pro", descripcion: "Gafas ultraligeras", categoria: "Gafas de Lectura", marca: "OptiCam", material: "Titanio", color: "Plateado", precio: 350000, imagen: "/img/producto3.jpg" },
  ];

  const handleEdit = (producto) => {
    setEditingProduct(producto);
    setModalOpen(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('¿Eliminar este producto?')) {
      alert('Producto eliminado');
    }
  };

  const handleSave = () => {
    setModalOpen(false);
    setEditingProduct(null);
    alert('Producto actualizado');
  };

  const filteredProductos = productos.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.categoria.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <main className="p-10 max-md:p-5">
      {/* Título y botón agregar */}
      <div className="flex justify-between items-center my-10 mx-10 max-md:flex-col max-md:gap-2.5 max-md:my-5 max-md:mx-0">
        <h1 className="text-2xl font-bold text-[#000000]">Inventario</h1>
        <button className="bg-[#B90F0F] text-[#ffffff] border-none px-4 py-2.5 rounded-lg cursor-pointer hover:bg-[#8a0b0b] transition">
          <a href="/agregar-producto" className="text-[#ffffff] no-underline">
            <i className="fa-solid fa-plus mr-1"></i> Agregar Producto
          </a>
        </button>
      </div>

      {/* Cards de estadísticas */}
      <div className="flex gap-5 my-10 mx-10 max-md:flex-col max-md:my-5 max-md:mx-0">
        <div className="flex-1 bg-[#ffffff] p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm text-[#000000]">Inventario Total</h2>
              <p className="text-xl font-bold text-[#000000] mt-1" id="total-productos">120</p>
              <span className="text-xs text-gray-500">Items</span>
            </div>
            <img className="w-12 h-12" src="../../../public/img/caja.png" alt="Caja" />
          </div>
        </div>
        <div className="flex-1 bg-[#ffffff] p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm text-[#000000]">Ventas totales</h2>
              <p className="text-xl font-bold text-[#000000] mt-1">$3.500.000</p>
              <span className="text-xs text-gray-500">COL</span>
            </div>
            <img className="w-12 h-12" src="../../../public/img/ventas.png" alt="Ventas" />
          </div>
        </div>
        <div className="flex-1 bg-[#ffffff] p-5 rounded-2xl shadow-md">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-sm text-[#000000]">Valor Total del Inventario</h2>
              <p className="text-xl font-bold text-[#000000] mt-1">$12.500.000</p>
              <span className="text-xs text-gray-500">COL</span>
            </div>
            <img className="w-12 h-12" src="../../../public/img/monedas-de-un-dolar.png" alt="Monedas" />
          </div>
        </div>
      </div>

      {/* Buscador */}
      <input
        type="text"
        id="buscador-table"
        placeholder="Buscar en el inventario..."
        className="w-[95%] p-2.5 my-5 mx-10 block border border-gray-300 rounded-md focus:outline-none focus:border-[#B90F0F] max-md:w-full max-md:mx-0"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Tabla */}
      <div className="overflow-x-auto">
        <table className="w-[95%] mx-auto my-[30px] bg-white rounded-md overflow-hidden shadow-md max-md:w-full">
          <thead className="bg-[#f1f5f9]">
            <tr>
              <th className="p-4 text-left text-sm text-[#000000]">Producto</th>
              <th className="p-4 text-left text-sm text-[#000000]">Descripción</th>
              <th className="p-4 text-left text-sm text-[#000000]">Categoría</th>
              <th className="p-4 text-left text-sm text-[#000000]">Marca</th>
              <th className="p-4 text-left text-sm text-[#000000]">Material</th>
              <th className="p-4 text-left text-sm text-[#000000]">Color</th>
              <th className="p-4 text-left text-sm text-[#000000]">Precio</th>
              <th className="p-4 text-left text-sm text-[#000000]">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filteredProductos.map((producto) => (
              <tr key={producto.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="p-4">
                  <div className="flex items-center gap-2.5">
                    <img src={producto.imagen} alt={producto.nombre} className="w-11 h-11 rounded-md object-cover" />
                    <span>{producto.nombre}</span>
                  </div>
                </td>
                <td className="p-4">{producto.descripcion}</td>
                <td className="p-4">{producto.categoria}</td>
                <td className="p-4">{producto.marca}</td>
                <td className="p-4">{producto.material}</td>
                <td className="p-4">{producto.color}</td>
                <td className="p-4">${producto.precio.toLocaleString()}</td>
                <td className="p-4">
                  <button onClick={() => handleEdit(producto)} className="bg-transparent border-none text-[#000000] text-base mr-2 cursor-pointer hover:text-[#B90F0F]">
                    <i className="fa-solid fa-pen-to-square"></i>
                  </button>
                  <button onClick={() => handleDelete(producto.id)} className="bg-transparent border-none text-[#B90F0F] text-base cursor-pointer hover:text-red-700">
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal de edición */}
      {modalOpen && editingProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-5 rounded-xl w-[350px]">
            <h2 className="text-xl font-bold mb-4">Editar Producto</h2>
            <label className="font-bold text-sm">Nombre:</label>
            <input type="text" defaultValue={editingProduct.nombre} className="w-full p-2 border border-gray-300 rounded-md mb-3" />
            <label className="font-bold text-sm">Descripción:</label>
            <input type="text" defaultValue={editingProduct.descripcion} className="w-full p-2 border border-gray-300 rounded-md mb-3" />
            <label className="font-bold text-sm">Categoría:</label>
            <input type="text" defaultValue={editingProduct.categoria} className="w-full p-2 border border-gray-300 rounded-md mb-3" />
            <label className="font-bold text-sm">Marca:</label>
            <input type="text" defaultValue={editingProduct.marca} className="w-full p-2 border border-gray-300 rounded-md mb-3" />
            <label className="font-bold text-sm">Material:</label>
            <input type="text" defaultValue={editingProduct.material} className="w-full p-2 border border-gray-300 rounded-md mb-3" />
            <label className="font-bold text-sm">Color:</label>
            <input type="text" defaultValue={editingProduct.color} className="w-full p-2 border border-gray-300 rounded-md mb-3" />
            <label className="font-bold text-sm">Precio:</label>
            <input type="number" defaultValue={editingProduct.precio} className="w-full p-2 border border-gray-300 rounded-md mb-4" />
            <div className="flex gap-3">
              <button onClick={handleSave} className="flex-1 bg-[#B90F0F] text-white py-2 rounded-md cursor-pointer hover:bg-[#8a0b0b]">Guardar</button>
              <button onClick={() => setModalOpen(false)} className="flex-1 bg-gray-500 text-white py-2 rounded-md cursor-pointer hover:bg-gray-600">Cancelar</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
};

export default Inventario;