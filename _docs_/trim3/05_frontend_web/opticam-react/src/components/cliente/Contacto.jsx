import React, { useState } from 'react';

const Contacto = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });
  const [enviado, setEnviado] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.nombre || !formData.email || !formData.mensaje) {
      alert('❌ Completa los campos obligatorios');
      return;
    }
    setEnviado(true);
    setTimeout(() => setEnviado(false), 5000);
    setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
  };

  return (
    <section className="py-16 px-5 bg-white">
      <div className="max-w-[1280px] mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          {/* Columna izquierda - Acerca de */}
          <div className="bg-white rounded-3xl shadow-md p-8 text-center border border-gray-100">
            <img src="../../../public/img/logo.png" alt="Logo" className="max-w-[150px] mx-auto mb-6" />
            <div className="text-lg font-medium text-[#740b0b] border-l-4 border-[#B90F0F] pl-5 my-5">
              Somos una óptica virtual que se preocupa por la experiencia del cliente
            </div>
            <p className="text-gray-700 mb-8 text-base leading-relaxed">
              En Óptica Virtual Balamb, combinamos tecnología y calidez humana para ofrecerte 
              la mejor experiencia en la compra de tus gafas. Nos enfocamos en entender tus 
              necesidades visuales y de estilo, brindando asesoría personalizada y productos 
              de alta calidad. Tu satisfacción es nuestro mayor compromiso.
            </p>
            <div className="bg-[#B90F0F] rounded-2xl p-8 mt-5">
              <div className="flex flex-col items-center gap-8">
                <div className="flex flex-col items-center gap-2.5">
                  <i className="fa-regular fa-envelope text-3xl text-black"></i>
                  <span className="text-sm text-center">Opticavirtualbalamb@gmail.com</span>
                </div>
                <div className="flex flex-col items-center gap-2.5">
                  <i className="fa-regular fa-comment text-3xl text-black"></i>
                  <span className="text-sm text-center">301 2092941</span>
                </div>
                <div className="flex flex-col items-center gap-2.5">
                  <i className="fa-solid fa-phone text-3xl text-black"></i>
                  <span className="text-sm text-center">(57) 301 2092941</span>
                </div>
              </div>
            </div>
          </div>

          {/* Columna derecha - Formulario */}
          <div className="bg-white rounded-3xl shadow-md p-8 border border-gray-100">
            <h2 className="text-3xl font-bold text-black mb-3">Contáctenos</h2>
            <p className="text-[#740b0b] mb-7 text-sm border-l-3 border-[#B90F0F] pl-3.5">
              Por favor contáctenos a través del formulario para temas relacionados con PQRS.
            </p>
            
            {enviado && (
              <div className="bg-green-100 text-green-700 p-3 rounded-lg mb-4">
                ✅ ¡Mensaje enviado! Te contactaremos pronto.
              </div>
            )}
            
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div>
                <label className="block font-semibold text-sm mb-2">Nombre completo</label>
                <input 
                  type="text" 
                  name="nombre" 
                  required 
                  placeholder="Tu nombre completo"
                  value={formData.nombre}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-2xl bg-white focus:outline-none focus:border-[#B90F0F]"
                />
              </div>
              
              <div>
                <label className="block font-semibold text-sm mb-2">Email</label>
                <input 
                  type="email" 
                  name="email" 
                  required 
                  placeholder="tucorreo@ejemplo.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-2xl bg-white focus:outline-none focus:border-[#B90F0F]"
                />
              </div>
              
              <div>
                <label className="block font-semibold text-sm mb-2">Teléfono</label>
                <input 
                  type="tel" 
                  name="telefono" 
                  placeholder="Teléfono de contacto"
                  value={formData.telefono}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-2xl bg-white focus:outline-none focus:border-[#B90F0F]"
                />
              </div>
              
              <div>
                <label className="block font-semibold text-sm mb-2">Mensaje</label>
                <textarea 
                  name="mensaje" 
                  rows="4" 
                  required 
                  placeholder="Escribe aquí tu PQRS..."
                  value={formData.mensaje}
                  onChange={handleChange}
                  className="w-full p-3 border border-gray-300 rounded-2xl bg-white resize-none focus:outline-none focus:border-[#B90F0F]"
                ></textarea>
              </div>
              
              <button 
                type="submit"
                className="bg-[#B90F0F] text-white border-none py-3.5 px-7 rounded-full text-base font-semibold cursor-pointer transition-all hover:bg-[#8a0b0b] hover:-translate-y-0.5"
              >
                Enviar formulario
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contacto;