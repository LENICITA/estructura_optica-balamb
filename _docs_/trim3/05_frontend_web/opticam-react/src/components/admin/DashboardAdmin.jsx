import React from 'react';

const DashboardAdmin = () => {
  return (
    <main className="py-10 px-20 max-md:px-5">
      {/* Bienvenida */}
      <section className="mb-8">
        <h1 className="text-[35px] max-md:text-2xl text-black">Bienvenido, LENNY TABAREZ 👋</h1>
        <p className="text-gray-500 mt-1">Gestiona tu Óptica Balamb desde aquí</p>
      </section>

      {/* Cards */}
      <section className="flex gap-5 my-[30px] max-md:flex-col">
        <div className="flex-1 bg-white p-5 rounded-xl text-center shadow-md hover:-translate-y-1 transition-all">
          <i className="fa-solid fa-glasses text-2xl text-[#B90F0F] mb-2.5"></i>
          <h3 className="text-sm">Productos</h3>
          <p className="text-xl font-bold">120</p>
        </div>
        <div className="flex-1 bg-white p-5 rounded-xl text-center shadow-md hover:-translate-y-1 transition-all">
          <i className="fa-solid fa-cart-shopping text-2xl text-[#B90F0F] mb-2.5"></i>
          <h3 className="text-sm">Pedidos</h3>
          <p className="text-xl font-bold">45</p>
        </div>
        <div className="flex-1 bg-white p-5 rounded-xl text-center shadow-md hover:-translate-y-1 transition-all">
          <i className="fa-solid fa-users text-2xl text-[#B90F0F] mb-2.5"></i>
          <h3 className="text-sm">Clientes</h3>
          <p className="text-xl font-bold">80</p>
        </div>
        <div className="flex-1 bg-white p-5 rounded-xl text-center shadow-md hover:-translate-y-1 transition-all">
          <i className="fa-solid fa-dollar-sign text-2xl text-[#B90F0F] mb-2.5"></i>
          <h3 className="text-sm">Ventas</h3>
          <p className="text-xl font-bold text-[#B90F0F]">$3.500.000</p>
        </div>
      </section>

      {/* Acciones */}
      <section className="flex gap-[15px] mb-[30px] max-md:flex-col">
        <button className="bg-[#B90F0F] text-white border-none px-5 py-2.5 rounded-lg cursor-pointer hover:bg-[#8a0b0b] transition">
          <a href="/admin/pedidos" className="text-white no-underline">Ver pedidos</a>
        </button>
        <button className="bg-[#B90F0F] text-white border-none px-5 py-2.5 rounded-lg cursor-pointer hover:bg-[#8a0b0b] transition">
          <a href="/admin/reportes" className="text-white no-underline">Generar reporte</a>
        </button>
        <button className="bg-[#B90F0F] text-white border-none px-5 py-2.5 rounded-lg cursor-pointer hover:bg-[#8a0b0b] transition">
          <a href="/admin/formulas" className="text-white no-underline">Gestionar fórmulas</a>
        </button>
      </section>

      {/* Tabla actividad reciente */}
      <section>
        <h2 className="mb-[15px]">Actividad reciente</h2>
        <div className="overflow-x-auto">
          <table className="w-full bg-white rounded-xl overflow-hidden shadow-md">
            <thead className="bg-[#f5f5f5]">
              <tr>
                <th className="p-3 text-left">Usuario</th>
                <th className="p-3 text-left">Acción</th>
                <th className="p-3 text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#eeeeee]"><td className="p-3">Juan</td><td className="p-3">Realizó un pedido</td><td className="p-3">Hoy</td></tr>
              <tr className="border-b border-[#eeeeee]"><td className="p-3">Maria</td><td className="p-3">Registro nuevo</td><td className="p-3">Hoy</td></tr>
              <tr className="border-b border-[#eeeeee]"><td className="p-3">Laura</td><td className="p-3">Registro nuevo</td><td className="p-3">Hoy</td></tr>
              <tr className="border-b border-[#eeeeee]"><td className="p-3">Pedro</td><td className="p-3">Realizó un pedido</td><td className="p-3">Hoy</td></tr>
              <tr className="border-b border-[#eeeeee]"><td className="p-3">Lenny</td><td className="p-3">Subió formula</td><td className="p-3">Ayer</td></tr>
              <tr className="border-b border-[#eeeeee]"><td className="p-3">Sara</td><td className="p-3">Registro nuevo</td><td className="p-3">Ayer</td></tr>
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
};

export default DashboardAdmin;