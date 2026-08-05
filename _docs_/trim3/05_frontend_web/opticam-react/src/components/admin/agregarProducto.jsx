import React, { useState } from 'react';

const AgregarProducto = () => {
  const [previewImage, setPreviewImage] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => setPreviewImage(event.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert('✅ Producto agregado correctamente');
  };

  return (
    <main className="grid grid-cols-2 gap-5 p-5 max-md:grid-cols-1">
      <div className="header-main col-span-2 flex justify-between items-center my-10 mx-2.5 max-md:flex-col max-md:gap-2.5">
        <div>
          <h1 className="text-2xl font-bold mb-1">Añadir Nuevo Producto</h1>
          <h2 className="text-gray-500 font-normal">Nuevo Producto</h2>
        </div>
        <button type="button" onClick={handleSubmit} className="bg-[#B90F0F] text-white border-none px-4 py-2.5 rounded-lg cursor-pointer hover:bg-[#8a0b0b]">
          <i className="fa-solid fa-plus mr-1"></i> Añadir
        </button>
      </div>

      <div className="left-column flex flex-col gap-5">
        <div className="bg-white p-5 rounded-xl shadow-md">
          <h3 className="mb-2.5 text-lg font-bold">Información del Producto</h3>
          <label className="font-semibold text-sm">Nombre del Producto</label>
          <input type="text" id="nombre" placeholder="Ej: Gafas de sol" className="w-full mt-2 mb-3 p-2.5 border border-gray-300 rounded-md" />
          <label className="font-semibold text-sm">Descripción</label>
          <textarea id="descripcion" placeholder="Descripción del producto" className="w-full mt-2 mb-3 p-2.5 border border-gray-300 rounded-md min-h-[100px] resize-none"></textarea>
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md">
          <h3 className="mb-2.5 text-lg font-bold">Información adicional</h3>
          <label className="font-semibold text-sm">Categoría</label>
          <input id="categoria" type="text" className="w-full mt-2 mb-3 p-2.5 border border-gray-300 rounded-md" />
          <label className="font-semibold text-sm">Marca</label>
          <input id="marca" type="text" className="w-full mt-2 mb-3 p-2.5 border border-gray-300 rounded-md" />
          <label className="font-semibold text-sm">Material</label>
          <input id="material" type="text" className="w-full mt-2 mb-3 p-2.5 border border-gray-300 rounded-md" />
          <label className="font-semibold text-sm">Color</label>
          <input id="color" type="text" className="w-full mt-2 mb-3 p-2.5 border border-gray-300 rounded-md" />
        </div>
      </div>

      <div className="right-column flex flex-col gap-5">
        <div className="bg-white p-5 rounded-xl shadow-md">
          <h3 className="mb-2.5 text-lg font-bold">Multimedia</h3>
          <label htmlFor="imagen" className="border-2 border-dashed border-gray-300 rounded-xl p-[30px] cursor-pointer transition-colors hover:border-[#B90F0F] hover:bg-gray-50 flex flex-col items-center justify-center gap-2.5 text-center">
            <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-500"></i>
            <p className="font-bold m-0">Sube tus imágenes</p>
            <span className="text-xs text-gray-500">Haz clic o arrastra aquí</span>
            <input type="file" id="imagen" hidden onChange={handleImageChange} />
          </label>
          {previewImage && (
            <div className="mt-4">
              <img src={previewImage} alt="Preview" className="w-20 h-20 object-cover rounded-md border border-gray-300" />
            </div>
          )}
        </div>

        <div className="bg-white p-5 rounded-xl shadow-md">
          <label className="font-bold text-sm">Precio</label>
          <input id="precio" type="number" className="w-full mt-2 mb-3 p-2.5 border border-gray-300 rounded-md" />
        </div>
      </div>
    </main>
  );
};

export default AgregarProducto;