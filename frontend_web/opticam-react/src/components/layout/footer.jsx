import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white flex justify-around py-10 px-20 flex-wrap gap-[30px] max-md:flex-col max-md:text-center max-md:items-center">
      {/* Contacto */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-[#B90F0F] mb-2.5 text-lg font-bold">Contacto</h3>
        <a 
          href="mailto:opticavirtualbalamb@gmail.com" 
          className="text-sm cursor-pointer hover:text-[#B90F0F] transition"
        >
          opticavirtualbalamb@gmail.com
        </a>
        <a 
          href="tel:+573002374767" 
          className="text-sm cursor-pointer hover:text-[#B90F0F] transition"
        >
          +57 300 237 4767
        </a>
        <p className="text-sm text-gray-400">
          Lunes a Viernes: 8am - 6pm
        </p>
        <p className="text-sm text-gray-400">
          Sábados: 9am - 1pm
        </p>
      </div>

      {/* Tienda */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-[#B90F0F] mb-2.5 text-lg font-bold">Tienda</h3>
        <Link to="/principal" className="text-sm cursor-pointer hover:text-[#B90F0F] transition">
          Inicio
        </Link>
        <Link to="/catalogo" className="text-sm cursor-pointer hover:text-[#B90F0F] transition">
          Catálogo
        </Link>
        <Link to="/contacto" className="text-sm cursor-pointer hover:text-[#B90F0F] transition">
          Acerca de
        </Link>
      </div>

      {/* Síguenos */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-[#B90F0F] mb-2.5 text-lg font-bold">Síguenos</h3>
        <div className="flex gap-4 justify-center">
          <a 
            href="https://facebook.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-[#B90F0F] transition text-2xl"
            aria-label="Facebook"
          >
            <i className="fa-brands fa-facebook"></i>
          </a>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-[#B90F0F] transition text-2xl"
            aria-label="Instagram"
          >
            <i className="fa-brands fa-instagram"></i>
          </a>
          <a 
            href="https://wa.me/573002374767" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-[#B90F0F] transition text-2xl"
            aria-label="WhatsApp"
          >
            <i className="fa-brands fa-whatsapp"></i>
          </a>
          <a 
            href="https://youtube.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-white hover:text-[#B90F0F] transition text-2xl"
            aria-label="YouTube"
          >
            <i className="fa-brands fa-youtube"></i>
          </a>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          © {currentYear} Óptica Balamb. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;