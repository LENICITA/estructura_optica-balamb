import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-black text-white flex justify-around py-10 px-20 flex-wrap gap-[30px]">
      {/* Contacto */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-[#B90F0F] text-lg font-semibold mb-2.5">Contacto</h3>
        <p className="text-sm cursor-pointer hover:text-[#B90F0F] transition">
          <i className="fa-regular fa-envelope mr-2"></i>
          opticavirtualbalamb@gmail.com
        </p>
        <p className="text-sm cursor-pointer hover:text-[#B90F0F] transition">
          <i className="fa-solid fa-phone mr-2"></i>
          +57 300 237 4767
        </p>
      </div>

      {/* Tienda */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-[#B90F0F] text-lg font-semibold mb-2.5">Tienda</h3>
        <Link 
          to="/contacto" 
          className="text-sm hover:text-[#B90F0F] transition"
        >
          Acerca de
        </Link>
        <Link 
          to="/catalogo" 
          className="text-sm hover:text-[#B90F0F] transition"
        >
          Catálogo
        </Link>
        <Link 
          to="/formula" 
          className="text-sm hover:text-[#B90F0F] transition"
        >
          Mi Fórmula
        </Link>
      </div>

      {/* Síguenos */}
      <div className="flex flex-col gap-2.5">
        <h3 className="text-[#B90F0F] text-lg font-semibold mb-2.5">Síguenos</h3>
        <div className="flex gap-4">
          <a 
            href="https://facebook.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xl hover:text-[#B90F0F] transition"
          >
            <i className="fa-brands fa-facebook"></i>
          </a>
          <a 
            href="https://instagram.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xl hover:text-[#B90F0F] transition"
          >
            <i className="fa-brands fa-instagram"></i>
          </a>
          <a 
            href="https://wa.me/573002374767" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-xl hover:text-[#B90F0F] transition"
          >
            <i className="fa-brands fa-whatsapp"></i>
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;