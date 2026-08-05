import React from 'react';

const InicioCliente = () => {
  return (
    <div>
      {/* Hero Section */}
      <section className="hero h-[650px] relative bg-cover bg-center max-md:h-[320px]" style={{ backgroundImage: "url('/img/imagen-bg.jpeg')" }}>
        <button className="absolute bottom-20 right-20 max-md:right-[16%] max-md:bottom-[30px] max-md:text-base max-md:py-2.5 max-md:px-5 bg-black text-white border-none cursor-pointer text-xl py-3 px-6 transition-transform hover:scale-95">
          ¡Únete!
        </button>
      </section>

      {/* Cards Section */}
      <section className="cards flex p-10 px-20 gap-5 max-md:flex-col max-md:p-5">
        {/* Columna izquierda */}
        <div className="cards-left w-[40%] flex flex-col gap-5 max-md:w-full">
          <div className="card relative mb-5 transition-transform hover:scale-95 h-[180px] text-white flex justify-center items-center text-2xl font-bold overflow-hidden bg-cover bg-center before:content-[''] before:absolute before:inset-0 before:bg-black/50" style={{ backgroundImage: "url('/img/card.jpg')" }}>
            <span className="relative z-10">Conócenos</span>
          </div>
          <div className="card relative mb-5 transition-transform hover:scale-95 h-[180px] text-white flex justify-center items-center text-2xl font-bold overflow-hidden bg-cover bg-center before:content-[''] before:absolute before:inset-0 before:bg-black/50" style={{ backgroundImage: "url('/img/card2.jpg')" }}>
            <span className="relative z-10">Nuestro Producto</span>
          </div>
        </div>

        {/* Columna derecha */}
        <div className="cards-right w-[60%] max-md:w-full">
          <div className="card large relative transition-transform hover:scale-95 h-[400px] max-md:h-[250px] text-white flex justify-center items-center text-2xl font-bold overflow-hidden bg-cover bg-center before:content-[''] before:absolute before:inset-0 before:bg-black/50" style={{ backgroundImage: "url('/img/card3.jpg')" }}>
            <span className="relative z-10">¡Haz tu pedido!</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default InicioCliente;