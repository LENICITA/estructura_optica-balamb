// src/features/home/pages/ContactoScreen.jsx
import React, { useState } from 'react';
import { ContactoController } from '../../../core/controllers/ContactoController';
import { validarFormularioContacto } from '../../../shared/validators/contactoValidators';

export const ContactoScreen = () => {
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [enviado, setEnviado] = useState(false);

  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (error) setError(null);
    if (enviado) setEnviado(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const check = validarFormularioContacto({
      nombre: formData.nombre,
      email: formData.email,
      telefono: formData.telefono,
      mensaje: formData.mensaje,
    });

    if (!check.valido) {
      setError(check.mensaje || 'Datos inválidos');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await ContactoController.enviarMensaje({
        nombre: formData.nombre.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim(),
        mensaje: formData.mensaje.trim(),
      });

      if (result.success) {
        setEnviado(true);
        setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
        alert('¡Mensaje enviado! Te contactaremos pronto.');
        setTimeout(() => setEnviado(false), 5000);
      } else {
        setError(result.message || 'Error al enviar el mensaje');
      }
    } catch (err) {
      setError(err.message || 'Error al enviar el mensaje');
    } finally {
      setLoading(false);
    }
  };

    return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* ENCABEZADO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-4">

            <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-headset text-2xl text-[#B90F0F]"></i>
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                Contáctenos
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Estamos aquí para atender tus PQRS y resolver tus inquietudes.
              </p>
            </div>

          </div>
        </div>

        {/* INFORMACIÓN DE CONTACTO */}
        <div className="bg-[#B90F0F] rounded-2xl shadow-sm p-5 sm:p-6">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
              <i className="fa-solid fa-address-book text-white"></i>
            </div>

            <div>
              <h2 className="text-lg font-bold text-white">
                Canales de contacto
              </h2>

              <p className="text-xs text-white/80 mt-1">
                También puedes comunicarte directamente con nosotros.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-envelope text-[#B90F0F]"></i>
                </div>

                <div className="min-w-0">
                  <p className="text-xs text-white/70 uppercase font-semibold">
                    Correo
                  </p>

                  <p className="text-sm font-semibold text-white mt-1 break-all">
                    Opticavirtualbalamb@gmail.com
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-comment-dots text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-xs text-white/70 uppercase font-semibold">
                    WhatsApp
                  </p>

                  <p className="text-sm font-semibold text-white mt-1">
                    301 2092941
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/20 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-phone text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-xs text-white/70 uppercase font-semibold">
                    Teléfono
                  </p>

                  <p className="text-sm font-semibold text-white mt-1">
                    (57) 301 2092941
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* FORMULARIO */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-6">

          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center">
              <i className="fa-solid fa-message text-[#B90F0F]"></i>
            </div>

            <div>
              <h2 className="text-lg font-bold text-gray-900">
                Envíanos un mensaje
              </h2>

              <p className="text-xs text-gray-500 mt-1">
                Completa el formulario y nos pondremos en contacto contigo.
              </p>
            </div>
          </div>

          {/* MENSAJE DE ERROR */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-circle-exclamation text-[#B90F0F]"></i>
                </div>

                <div>
                  <p className="text-sm font-bold text-red-900">
                    No fue posible enviar el mensaje
                  </p>

                  <p className="text-xs text-red-800 mt-1">
                    {error}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* MENSAJE DE ÉXITO */}
          {enviado && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-5">
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
                  <i className="fa-solid fa-circle-check text-green-600"></i>
                </div>

                <div>
                  <p className="text-sm font-bold text-green-900">
                    ¡Mensaje enviado correctamente!
                  </p>

                  <p className="text-xs text-green-800 mt-1">
                    Te contactaremos pronto.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit}>

            {/* DATOS DE CONTACTO */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

              {/* NOMBRE */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Nombre completo *
                </label>

                <div className="relative">
                  <i className="fa-solid fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>

                  <input
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => handleChange('nombre', e.target.value)}
                    placeholder="Tu nombre completo"
                    disabled={loading}
                    className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 text-sm bg-white text-gray-900 outline-none focus:border-[#B90F0F] focus:ring-2 focus:ring-red-50 transition disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* EMAIL */}
              <div>
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Correo electrónico *
                </label>

                <div className="relative">
                  <i className="fa-solid fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>

                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="tucorreo@ejemplo.com"
                    autoComplete="email"
                    disabled={loading}
                    className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 text-sm bg-white text-gray-900 outline-none focus:border-[#B90F0F] focus:ring-2 focus:ring-red-50 transition disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* TELÉFONO */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-800 mb-2">
                  Teléfono
                </label>

                <div className="relative">
                  <i className="fa-solid fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>

                  <input
                    type="tel"
                    value={formData.telefono}
                    onChange={(e) => handleChange('telefono', e.target.value)}
                    placeholder="Teléfono de contacto"
                    disabled={loading}
                    className="w-full border border-gray-300 rounded-xl pl-11 pr-4 py-3 text-sm bg-white text-gray-900 outline-none focus:border-[#B90F0F] focus:ring-2 focus:ring-red-50 transition disabled:bg-gray-100"
                  />
                </div>
              </div>

              {/* MENSAJE */}
              <div className="md:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-800">
                    Mensaje *
                  </label>

                  <span className="text-[11px] text-gray-400">
                    {formData.mensaje.length}/1000
                  </span>
                </div>

                <textarea
                  value={formData.mensaje}
                  onChange={(e) => handleChange('mensaje', e.target.value)}
                  placeholder="Escribe aquí tu PQRS..."
                  maxLength={1000}
                  disabled={loading}
                  className="w-full min-h-[150px] border border-gray-300 rounded-xl px-4 py-3 text-sm bg-white text-gray-900 outline-none resize-none focus:border-[#B90F0F] focus:ring-2 focus:ring-red-50 transition disabled:bg-gray-100"
                />

                <p className="text-[11px] text-gray-400 mt-2">
                  Mínimo 10 caracteres · Máximo 1000
                </p>
              </div>

            </div>

            {/* BOTÓN */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#B90F0F] text-white py-3.5 rounded-xl font-bold text-sm hover:bg-[#9f0d0d] transition disabled:opacity-60 flex items-center justify-center gap-2 shadow-sm"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Enviando...
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-paper-plane"></i>
                    Enviar formulario
                  </>
                )}
              </button>
            </div>

          </form>
        </div>

        {/* INFORMACIÓN FINAL */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
              <i className="fa-solid fa-circle-info text-[#B90F0F]"></i>
            </div>

            <div>
              <p className="text-sm font-bold text-gray-900">
                Atención al cliente
              </p>

              <p className="text-xs text-gray-500 leading-5 mt-1">
                Utiliza este formulario para enviar peticiones, quejas,
                reclamos, sugerencias o cualquier inquietud relacionada con
                nuestros productos y servicios.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ContactoScreen;