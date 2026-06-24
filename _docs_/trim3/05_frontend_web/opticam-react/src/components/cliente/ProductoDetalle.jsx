import React, { useState } from 'react';
import { useParams } from 'react-router-dom';

const ProductoDetalle = () => {
  const { id } = useParams();
  const [calificacion, setCalificacion] = useState(0);
  const [opinion, setOpinion] = useState('');
  const [mensajeExito, setMensajeExito] = useState('');

  const producto = {
    id: parseInt(id),
    nombre: "Ángel Gold",
    precio: 250000,
    material: "Plastico",
    color: "Dorado",
    imagen: "/img/producto1.jpg",
    descripcion: "Gafas elegantes con montura clásica dorada. Incluye protección UV y estuche de regalo.",
    colores: ["Rojo", "Negro", "Azul", "Dorado"],
    materiales: ["Plástico", "Metal", "Titanio"]
  };

  const [colorSeleccionado, setColorSeleccionado] = useState(producto.colores[0]);
  const [materialSeleccionado, setMaterialSeleccionado] = useState(producto.materiales[0]);

  const agregarAlCarrito = () => {
    alert(`✅ ${producto.nombre} (${colorSeleccionado}, ${materialSeleccionado}) añadido al carrito`);
  };

  const enviarReseña = (e) => {
    e.preventDefault();
    if (calificacion === 0) { alert('⭐ Selecciona una calificación'); return; }
    if (!opinion.trim()) { alert('📝 Escribe tu opinión'); return; }
    setMensajeExito('✅ ¡Gracias por tu opinión!');
    setTimeout(() => setMensajeExito(''), 3000);
    setCalificacion(0);
    setOpinion('');
  };

  const reseñas = [
    { id: 1, usuario: "María García", calificacion: 5, comentario: "Excelente calidad, las gafas son súper cómodas y llegaron antes de lo esperado. ¡Las recomiendo!", fecha: "Hace 2 días" },
    { id: 2, usuario: "Carlos López", calificacion: 4, comentario: "Muy bonitas y bien hechas. El único detalle es que tardaron un poco en el envío, pero valió la pena.", fecha: "Hace 5 días" }
  ];

  return (
    <div className="max-w-[1200px] mx-auto py-10 px-5">
      {/* Producto principal */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Imagen */}
        <div className="bg-white rounded-2xl shadow-md p-8 flex justify-center">
          <img src={producto.imagen} alt={producto.nombre} className="max-w-full h-auto max-h-[400px] transition-transform hover:scale-105" />
        </div>

        {/* Detalles */}
        <div className="flex flex-col gap-4">
          <h1 className="text-3xl font-bold text-black">{producto.nombre}</h1>
          <h3 className="text-2xl text-green-600">Precio</h3>
          <h1 className="text-4xl font-bold text-[#B90F0F]">${producto.precio.toLocaleString()}</h1>
          <p className="text-lg text-gray-700">{producto.descripcion}</p>

          {/* Color */}
          <div>
            <label className="font-bold text-base block mb-2">Color:</label>
            <select 
              value={colorSeleccionado} 
              onChange={(e) => setColorSeleccionado(e.target.value)}
              className="w-full max-w-[300px] p-2.5 border-2 border-black rounded-lg bg-[#B90F0F] text-white cursor-pointer hover:bg-[#8a0b0b]"
            >
              {producto.colores.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          {/* Material */}
          <div>
            <label className="font-bold text-base block mb-2">Material:</label>
            <select 
              value={materialSeleccionado} 
              onChange={(e) => setMaterialSeleccionado(e.target.value)}
              className="w-full max-w-[300px] p-2.5 border-2 border-black rounded-lg bg-[#B90F0F] text-white cursor-pointer hover:bg-[#8a0b0b]"
            >
              {producto.materiales.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>

          {/* Botones */}
          <div className="flex gap-4 mt-2.5 flex-wrap">
            <button onClick={agregarAlCarrito} className="bg-black text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 hover:bg-[#B90F0F] transition">
              <i className="fa-solid fa-cart-plus"></i> Añadir al carrito
            </button>
            <button className="bg-transparent border-2 border-[#B90F0F] text-[#B90F0F] px-6 py-3 rounded-lg font-bold hover:bg-[#B90F0F] hover:text-white transition">
              <i className="fa-solid fa-camera"></i> Prueba tu montura
            </button>
          </div>
        </div>
      </div>

      {/* Sección de reseñas */}
      <div className="mt-16 bg-gray-100 py-10 px-5 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-10">Opiniones de nuestros clientes</h2>
        
        <div className="grid md:grid-cols-2 gap-8 max-w-[1000px] mx-auto mb-10">
          {reseñas.map(reseña => (
            <div key={reseña.id} className="bg-white rounded-xl p-6 shadow-md transition-all hover:-translate-y-1">
              <div className="flex justify-between items-start flex-wrap gap-2.5 mb-5">
                <div className="flex gap-4 items-center">
                  <img src="/img/user.jpg" alt="Usuario" className="w-[60px] h-[60px] rounded-full object-cover" />
                  <div><h4 className="text-lg font-bold">{reseña.usuario}</h4><div className="text-yellow-500 text-lg">{'★'.repeat(reseña.calificacion)}{'☆'.repeat(5 - reseña.calificacion)}</div></div>
                </div>
                <div className="text-gray-400 text-sm">{reseña.fecha}</div>
              </div>
              <p className="text-gray-600 text-base italic">"{reseña.comentario}"</p>
            </div>
          ))}
        </div>

        {/* Formulario para nueva reseña */}
        <div className="max-w-[500px] mx-auto bg-white rounded-xl p-8 shadow-md text-center">
          <h2 className="text-2xl font-bold text-[#B90F0F] mb-2.5">Deja tu opinión</h2>
          <p className="text-gray-500 text-sm mb-6">¿Ya probaste este producto? Cuéntanos qué te pareció.</p>
          {mensajeExito && <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">{mensajeExito}</div>}
          <form onSubmit={enviarReseña} className="flex flex-col gap-5">
            <div className="text-center">
              <label className="block font-bold text-sm mb-2.5">Tu calificación</label>
              <div className="flex justify-center gap-2.5">
                {[1,2,3,4,5].map(star => (
                  <i key={star} onClick={() => setCalificacion(star)} className={`fa-star ${calificacion >= star ? 'fa-solid' : 'fa-regular'} text-4xl text-yellow-400 cursor-pointer transition-all hover:scale-110`}></i>
                ))}
              </div>
            </div>
            <div className="text-left">
              <label className="block font-bold text-sm mb-2">Tu opinión</label>
              <textarea rows="3" value={opinion} onChange={(e) => setOpinion(e.target.value)} className="w-full p-3 border-2 border-gray-200 rounded-lg resize-none focus:outline-none focus:border-[#B90F0F]" placeholder="Escribe aquí tu experiencia..."></textarea>
            </div>
            <button type="submit" className="bg-[#B90F0F] text-white py-3 rounded-full font-bold hover:bg-[#8a0b0b] transition">Enviar reseña</button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ProductoDetalle;