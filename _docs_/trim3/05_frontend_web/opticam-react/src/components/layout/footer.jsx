import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-black text-white flex justify-around py-10 px-20 flex-wrap gap-[30px]">
      <div className="flex flex-col gap-2.5">
        <h3 className="text-[#B90F0F] mb-2.5">Contacto</h3>
        <p className="text-sm cursor-pointer hover:opacity-70">opticavirtualbalamb@gmail.com</p>
        <p className="text-sm cursor-pointer hover:opacity-70">+57 300 237 4767</p>
      </div>
      <div className="flex flex-col gap-2.5">
        <h3 className="text-[#B90F0F] mb-2.5">Tienda</h3>
        <p className="text-sm cursor-pointer hover:opacity-70">Acerca de</p>
        <p className="text-sm cursor-pointer hover:opacity-70">Catálogo</p>
      </div>
      <div className="flex flex-col gap-2.5">
        <h3 className="text-[#B90F0F] mb-2.5">Síguenos</h3>
        <div className="flex gap-4">
          <i className="fa-brands fa-facebook text-xl cursor-pointer hover:text-[#B90F0F]"></i>
          <i className="fa-brands fa-instagram text-xl cursor-pointer hover:text-[#B90F0F]"></i>
          <i className="fa-brands fa-whatsapp text-xl cursor-pointer hover:text-[#B90F0F]"></i>
        </div>
      </div>
    </footer>
  );
};

export default Footer;