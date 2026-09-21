// src/shared/components/chatbot/ChatBot.jsx
import React, { useEffect, useRef, useState } from 'react';
import { ChatBotController } from '../../../core/controllers/ChatBotController';

export const ChatBot = () => {
  const chatBotController = useRef(new ChatBotController()).current;

  const [abierto, setAbierto] = useState(false);
  const [mensaje, setMensaje] = useState('');
  const [mensajes, setMensajes] = useState([
    {
      id: 'inicio',
      texto: '¡Hola! Soy OptiBot 👋\n¿En qué puedo ayudarte?',
      tipo: 'bot',
    },
  ]);
  const [botones, setBotones] = useState([]);
  const [enviando, setEnviando] = useState(false);

  const scrollRef = useRef(null);
  const inputRef = useRef(null);

  // ===== CARGAR BOTONES =====
  useEffect(() => {
    cargarBotones();
  }, []);

  const cargarBotones = async () => {
    try {
      const data = await chatBotController.obtenerBotones();
      setBotones(data);
    } catch (error) {
      console.error('Error cargando botones:', error);
    }
  };

  // ===== SCROLL AUTOMÁTICO =====
  useEffect(() => {
    setTimeout(() => {
      if (scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }, 100);
  }, [mensajes]);

  // ===== AGREGAR MENSAJE =====
  const agregarMensaje = (texto, tipo) => {
    setMensajes((prev) => [
      ...prev,
      {
        id: Date.now().toString() + Math.random().toString(),
        texto,
        tipo,
      },
    ]);
  };

  // ===== ENVIAR MENSAJE =====
  const enviarMensaje = async (textoPersonalizado) => {
    const texto = (textoPersonalizado ?? mensaje).trim();

    if (!texto) return;
    if (enviando) return;

    // Mostrar mensaje usuario
    agregarMensaje(texto, 'usuario');

    setMensaje('');
    if (inputRef.current) inputRef.current.blur();

    try {
      setEnviando(true);

      const response = await chatBotController.enviarMensaje(texto);

      if (response.success) {
        agregarMensaje(response.respuesta || '', 'bot');
      } else {
        agregarMensaje(
          'Lo siento, ocurrió un problema. Intenta nuevamente.',
          'bot'
        );
      }
    } catch (error) {
      console.error('Error enviando mensaje:', error);
      agregarMensaje(
        'No pude conectarme con OptiBot. Intenta nuevamente.',
        'bot'
      );
    } finally {
      setEnviando(false);
    }
  };

  // ===== SELECCIONAR BOTÓN RÁPIDO =====
  const seleccionarBoton = (boton) => {
    enviarMensaje(boton.value);
  };

  // ===== MANEJAR ENTER =====
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviarMensaje();
    }
  };

  // ===== BOTÓN FLOTANTE =====
  if (!abierto) {
        return (
      <button
        onClick={() => setAbierto(true)}
        className="fixed right-5 bottom-[150px] w-14 h-14 rounded-full bg-[#B90F0F] flex items-center justify-center shadow-xl hover:bg-[#9f0d0d] hover:scale-105 transition-all duration-200 z-[999]"
        aria-label="Abrir chat"
      >
        <i className="fa-solid fa-comment-dots text-white text-2xl"></i>

        <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></span>
      </button>
    );
  }

  // ===== VENTANA DEL CHAT =====
    return (
    <>
      {/* OVERLAY */}
      <div
        className="fixed inset-0 bg-black/30 z-[1000] flex items-end justify-end p-4 sm:p-6"
        onClick={() => setAbierto(false)}
      >
        {/* VENTANA DEL CHAT */}
        <div
          className="w-full sm:w-[390px] h-[520px] max-h-[calc(100vh-2rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden flex flex-col z-[1001] sm:mr-2 sm:mb-14"
          onClick={(e) => e.stopPropagation()}
        >

          {/* HEADER */}
          <div className="bg-[#B90F0F] px-4 py-3.5 flex items-center justify-between shrink-0">

            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0">
                <i className="fa-solid fa-comment-dots text-[#B90F0F] text-lg"></i>

                <span className="absolute -right-1 -bottom-1 w-3.5 h-3.5 bg-green-500 border-2 border-[#B90F0F] rounded-full"></span>
              </div>

              <div>
                <h4 className="text-white text-base font-bold">
                  OptiBot
                </h4>

                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-300"></span>

                  <p className="text-red-100 text-[11px]">
                    Asistente virtual
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setAbierto(false)}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white hover:bg-white/10 transition"
              aria-label="Cerrar chat"
            >
              <i className="fa-solid fa-xmark text-xl"></i>
            </button>

          </div>

          {/* MENSAJES */}
          <div
            ref={scrollRef}
            className="flex-1 bg-gray-50 overflow-y-auto p-4"
          >
            {mensajes.map((item) => (
              <div
                key={item.id}
                className={`w-full mb-3 flex ${
                  item.tipo === 'usuario'
                    ? 'justify-end'
                    : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-[82%] px-3.5 py-2.5 rounded-2xl shadow-sm ${
                    item.tipo === 'usuario'
                      ? 'bg-[#B90F0F] text-white rounded-br-md'
                      : 'bg-white border border-gray-200 text-gray-800 rounded-bl-md'
                  }`}
                >
                  <p className="text-[13px] leading-5 whitespace-pre-wrap">
                    {item.texto}
                  </p>
                </div>
              </div>
            ))}

            {/* INDICADOR DE ESCRITURA */}
            {enviando && (
              <div className="flex justify-start mb-3">
                <div className="bg-white border border-gray-200 px-3.5 py-2.5 rounded-2xl rounded-bl-md shadow-sm flex items-center gap-2.5">

                  <div className="flex gap-1">
                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '0ms' }}
                    ></span>

                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '150ms' }}
                    ></span>

                    <span
                      className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: '300ms' }}
                    ></span>
                  </div>

                  <span className="text-[11px] text-gray-500">
                    OptiBot está escribiendo...
                  </span>

                </div>
              </div>
            )}
          </div>

          {/* BOTONES RÁPIDOS */}
          {botones.length > 0 && (
            <div className="bg-white border-t border-gray-200 px-3 py-2.5 shrink-0">

              <div className="flex items-center gap-2 mb-2">
                <i className="fa-solid fa-bolt text-[#B90F0F] text-[10px]"></i>

                <p className="text-[10px] text-gray-500 font-semibold uppercase">
                  Preguntas rápidas
                </p>
              </div>

              <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                {botones.map((boton) => (
                  <button
                    key={boton.id}
                    onClick={() => seleccionarBoton(boton)}
                    disabled={enviando}
                    className="px-3 py-1.5 bg-red-50 border border-red-100 rounded-full text-[11px] text-[#B90F0F] font-semibold whitespace-nowrap hover:bg-red-100 transition disabled:opacity-50"
                  >
                    {boton.label}
                  </button>
                ))}
              </div>

            </div>
          )}

          {/* INPUT */}
          <div className="bg-white border-t border-gray-200 p-3 shrink-0">

            <div className="flex items-end gap-2">

              <textarea
                ref={inputRef}
                value={mensaje}
                onChange={(e) => setMensaje(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe un mensaje..."
                maxLength={300}
                disabled={enviando}
                rows={1}
                className="flex-1 min-h-[42px] max-h-[80px] bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-[13px] text-gray-800 resize-none outline-none focus:border-[#B90F0F] focus:ring-2 focus:ring-red-50 transition disabled:bg-gray-100"
              />

              <button
                onClick={() => enviarMensaje()}
                disabled={!mensaje.trim() || enviando}
                className="w-[42px] h-[42px] rounded-xl bg-[#B90F0F] flex items-center justify-center hover:bg-[#9f0d0d] transition disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                aria-label="Enviar mensaje"
              >
                <i className="fa-solid fa-paper-plane text-white text-sm"></i>
              </button>

            </div>

            <p className="text-[10px] text-gray-400 text-center mt-2">
              Presiona Enter para enviar
            </p>

          </div>

        </div>
      </div>
    </>
  );
};