import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const AgregarProducto = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [categorias, setCategorias] = useState([]);

  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    id_categoria: "",
    marca: "",
    material: "",
    color: "",
    precio: "",
    imagen: null,
  });

  useEffect(() => {
    const cargarCategorias = async () => {
      try {
        const response = await api.get('/inventario/categorias');
        
        if (response.data.success) {
          setCategorias(response.data.categorias || []);
        }
      } catch (error) {
        console.error('Error al cargar categorías:', error);
        alert('Error al cargar las categorías');
      }
    };
    cargarCategorias();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.id]: e.target.value,
    }));
  };

  const handleCategoriaChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      id_categoria: e.target.value,
    }));
  };
  
  // MANEJO DE IMAGEN - SUBE A CLOUDINARY VÍA BACKEND
  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      alert('Formato no permitido. Usa JPG, PNG, WEBP o GIF.');
      e.target.value = '';
      return;
    }

    // Limitar tamaño a 5MB
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen es demasiado grande. Máximo 5MB.');
      e.target.value = '';
      return;
    }

    // Mostrar preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreviewImage(event.target.result);
    };
    reader.readAsDataURL(file);

    // Guardar archivo en formData
    setFormData((prev) => ({
      ...prev,
      imagen: file,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const { nombre, descripcion, id_categoria, marca, material, color, precio, imagen } = formData;

    // Validaciones
    if (!nombre || !descripcion || !id_categoria || !marca || !material || !color || !precio) {
      alert('Completa todos los campos');
      return;
    }

    if (!imagen) {
      alert('Selecciona una imagen para el producto');
      return;
    }

    setLoading(true);

    try {
      // CREAR FormData PARA ENVIAR AL BACKEND
      const formDataToSend = new FormData();
      formDataToSend.append('id_categoria', id_categoria);
      formDataToSend.append('nombre', nombre.trim());
      formDataToSend.append('descripcion', descripcion.trim());
      formDataToSend.append('marca', marca.trim());
      formDataToSend.append('material', material.trim());
      formDataToSend.append('color', color.trim());
      formDataToSend.append('precio', precio);
      formDataToSend.append('imagen', imagen);

      const response = await api.post('/inventario/productos', formDataToSend, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.success) {
        alert('Producto agregado correctamente');
        navigate('/admin/inventario');
      } else {
        throw new Error(response.data.message || 'Error al agregar producto');
      }

    } catch (error) {
      console.error('Error:', error);
      
      if (error.response?.status === 413) {
        alert('El archivo es demasiado grande. Prueba con una imagen más pequeña.');
      } else if (error.response?.status === 400) {
        alert(`${error.response.data?.message || 'Datos inválidos'}`);
      } else {
        alert(error.response?.data?.message || 'Error al agregar el producto');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="grid grid-cols-2 gap-5 p-5 max-md:grid-cols-1">
      <div className="header-main col-span-2 flex justify-between items-center my-10 mx-2.5 max-md:flex-col max-md:gap-2.5">
        <div>
          <h1 className="text-2xl font-bold mb-1">Añadir Nuevo Producto</h1>
          <h2 className="text-gray-500 font-normal">Nuevo Producto</h2>
        </div>
        <button
          type="submit"
          form="form-producto"
          className="bg-[#B90F0F] text-white border-none px-4 py-2.5 rounded-lg cursor-pointer hover:bg-[#8a0b0b] transition disabled:opacity-50"
          disabled={loading || uploadingImage}
        >
          {loading ? (
            <>
              <i className="fa-solid fa-spinner fa-spin mr-1"></i> Guardando...
            </>
          ) : (
            <>
              <i className="fa-solid fa-plus mr-1"></i> Añadir
            </>
          )}
        </button>
      </div>

      <form id="form-producto" onSubmit={handleSubmit} className="contents">
        {/* Columna Izquierda - Información del Producto */}
        <div className="left-column flex flex-col gap-5">
          <div className="bg-white p-5 rounded-xl shadow-md">
            <h3 className="mb-2.5 text-lg font-bold">Información del Producto</h3>
            
            <label className="font-semibold text-sm">Nombre del Producto *</label>
            <input
              type="text"
              id="nombre"
              placeholder="Ej: Gafas de sol"
              value={formData.nombre}
              onChange={handleChange}
              className="w-full mt-2 mb-3 p-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#B90F0F]"
              disabled={loading}
              required
            />
            
            <label className="font-semibold text-sm">Descripción *</label>
            <textarea
              id="descripcion"
              placeholder="Descripción del producto"
              value={formData.descripcion}
              onChange={handleChange}
              className="w-full mt-2 mb-3 p-2.5 border border-gray-300 rounded-md min-h-[100px] resize-none focus:outline-none focus:border-[#B90F0F]"
              disabled={loading}
              required
            />
          </div>

          <div className="bg-white p-5 rounded-xl shadow-md">
            <h3 className="mb-2.5 text-lg font-bold">Información adicional</h3>
            
            <label className="font-semibold text-sm">Categoría *</label>
            <select
              id="id_categoria"
              value={formData.id_categoria}
              onChange={handleCategoriaChange}
              className="w-full mt-2 mb-3 p-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#B90F0F]"
              disabled={loading}
              required
            >
              <option value="">Seleccionar categoría</option>
              {categorias.map((cat) => (
                <option key={cat.id_categoria} value={cat.id_categoria}>
                  {cat.tipo_categoria} - {cat.descripcion}
                </option>
              ))}
            </select>

            <label className="font-semibold text-sm">Marca *</label>
            <input
              id="marca"
              type="text"
              placeholder="Ej: Rayban"
              value={formData.marca}
              onChange={handleChange}
              className="w-full mt-2 mb-3 p-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#B90F0F]"
              disabled={loading}
              required
            />

            <label className="font-semibold text-sm">Material *</label>
            <input
              id="material"
              type="text"
              placeholder="Ej: Policarbonato"
              value={formData.material}
              onChange={handleChange}
              className="w-full mt-2 mb-3 p-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#B90F0F]"
              disabled={loading}
              required
            />

            <label className="font-semibold text-sm">Color *</label>
            <input
              id="color"
              type="text"
              placeholder="Ej: Negro"
              value={formData.color}
              onChange={handleChange}
              className="w-full mt-2 mb-3 p-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#B90F0F]"
              disabled={loading}
              required
            />
          </div>
        </div>

        {/* Columna Derecha - Multimedia y Precio */}
        <div className="right-column flex flex-col gap-5">
          <div className="bg-white p-5 rounded-xl shadow-md">
            <h3 className="mb-2.5 text-lg font-bold">Multimedia</h3>
            <label
              htmlFor="imagen"
              className="border-2 border-dashed border-gray-300 rounded-xl p-[30px] cursor-pointer transition-colors hover:border-[#B90F0F] hover:bg-gray-50 flex flex-col items-center justify-center gap-2.5 text-center"
            >
              <i className="fa-solid fa-cloud-arrow-up text-3xl text-gray-500"></i>
              <p className="font-bold m-0">Sube tus imágenes</p>
              <span className="text-xs text-gray-500">
                Haz clic o arrastra aquí (máx 5MB, JPG, PNG, WEBP, GIF)
              </span>
              <span className="text-xs text-[#B90F0F]">
                La imagen se subirá a Cloudinary automáticamente
              </span>
              <input
                type="file"
                id="imagen"
                hidden
                onChange={handleImageChange}
                disabled={loading}
                accept="image/jpeg,image/png,image/webp,image/gif"
              />
            </label>
            
            {previewImage && (
              <div className="mt-4 flex items-center gap-4">
                <img
                  src={previewImage}
                  alt="Preview"
                  className="w-20 h-20 object-cover rounded-md border border-gray-300"
                />
                <div>
                  <p className="text-sm font-medium text-green-600">
                    Imagen seleccionada
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewImage(null);
                      setFormData(prev => ({ ...prev, imagen: null }));
                      document.getElementById('imagen').value = '';
                    }}
                    className="mt-1 text-sm text-red-500 hover:text-red-700 transition"
                  >
                    <i className="fa-solid fa-times mr-1"></i> Quitar imagen
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="bg-white p-5 rounded-xl shadow-md">
            <label className="font-bold text-sm">Precio *</label>
            <input
              id="precio"
              type="number"
              placeholder="Ej: 250000"
              value={formData.precio}
              onChange={handleChange}
              className="w-full mt-2 mb-3 p-2.5 border border-gray-300 rounded-md focus:outline-none focus:border-[#B90F0F]"
              disabled={loading}
              required
              min="0"
              step="1000"
            />
            <p className="text-xs text-gray-500 mt-1">Ingresa el precio en pesos colombianos</p>
          </div>
        </div>
      </form>
    </main>
  );
};

export default AgregarProducto;