import React, { useCallback, useMemo, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { DistribucionController } from '../../../core/controllers/DistribucionController';
import { PedidoController } from '../../../core/controllers/PedidoController';
import { UserController } from '../../../core/controllers/UserController';
import { AuthController } from '../../../core/controllers/AuthController';
import { alertError, alertSuccess, alertConfirm } from '../../../shared/utils/alert';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import { SearchFilters } from '../../../shared/components/ui/SearchFilters';
import { ModalBase } from '../../../shared/components/ui/ModalBase';
import { CardInfo, EstadoBadge } from '../../../shared/components/ui/CardInfo';
import { BaseCard, CardHeader, CardDivider, CardSection } from '../../../shared/components/ui/BaseCard';
// ✅ Importamos las funciones y el diccionario
import { 
  PEDIDOS_ESTADOS, 
  getEstadoColor, 
  getEstadoBackground, 
  getEstadoIcon, 
  getEstadoTexto 
} from '../../../shared/utils/estadosUI';

const ESTADOS_VALIDOS = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Abonado (50%)', value: 'Abonado' },
  { label: 'Listo para pagar', value: 'Listo' },
  { label: 'Pagado (100%)', value: 'Pagado' },
  { label: 'En proceso', value: 'En Proceso' },
  { label: 'Enviado', value: 'Enviado' },
  { label: 'Entregado', value: 'Entregado' },
];

const GestionarPedidosAdmin = () => {
  const navigate = useNavigate();
  const pedidoController = new PedidoController();
  const userController = new UserController();
  const authController = new AuthController();
  const distribucionController = new DistribucionController();

  const [pedidos, setPedidos] = useState([]);
  const [repartidores, setRepartidores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [mostrarRepartidores, setMostrarRepartidores] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);

  const cargarPedidos = useCallback(async () => {
    try {
      setError(null);
      const data = await pedidoController.getTodosLosPedidos();
      if (!Array.isArray(data)) return setPedidos([]);
      setPedidos(data);
    } catch (err) {
      console.error('Error cargando pedidos:', err);
      setError(err?.message || 'No fue posible cargar los pedidos');
      setPedidos([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const cargarRepartidores = useCallback(async () => {
    try {
      const repartidoresData = await userController.getRepartidores();
      const admin = await authController.loadUser();
      let listaUsuarios = repartidoresData && repartidoresData.length > 0 ? [...repartidoresData] : [];
      if (admin && !listaUsuarios.some((u) => u.id_usuario === admin.id_usuario)) {
        const adminConFlag = { ...admin, esAdmin: true, vehiculo: admin.vehiculo || { tipo: 'Distribuidora externa', modelo: '', placa: 'N/A', color: '' } };
        listaUsuarios.push(adminConFlag);
      }
      setRepartidores(listaUsuarios);
    } catch (err) {
      console.error('Error cargando repartidores:', err);
      setRepartidores([]);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void cargarPedidos();
    void cargarRepartidores();
  }, [cargarPedidos, cargarRepartidores]);

  const onRefresh = () => {
    setRefreshing(true);
    void cargarPedidos();
    void cargarRepartidores();
  };

  const pedidosFiltrados = useMemo(() => {
    let resultado = [...pedidos];
    if (filtroEstado !== 'TODOS') resultado = resultado.filter((p) => p.estado === filtroEstado);
    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase().trim();
      resultado = resultado.filter((p) =>
        String(p.id_pedido).includes(texto) || p.cliente?.nombre?.toLowerCase().includes(texto) ||
        p.ciudad_envio?.toLowerCase().includes(texto) || p.direccion_entrega?.toLowerCase().includes(texto)
      );
    }
    return resultado;
  }, [pedidos, busqueda, filtroEstado]);

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha estimada';
    return new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const handleAsignar = async (usuario) => {
    if (!pedidoSeleccionado) return void alertError('No hay pedido seleccionado');
    if (pedidoSeleccionado.estado !== 'Pagado') {
      void alertError(`El pedido debe estar en estado "Pagado". Estado actual: ${pedidoSeleccionado.estado}`);
      setMostrarRepartidores(false);
      return;
    }

    const nombreUsuario = usuario.nombre_completo;
    const esAdmin = usuario.esAdmin || false;
    const tipo = esAdmin ? 'administrador (distribuidora externa)' : 'repartidor';

    const confirmado = await alertConfirm({
      title: '¿Asignar pedido?',
      text: `¿Asignar pedido #${pedidoSeleccionado.id_pedido} a ${nombreUsuario} (${tipo})?`,
      confirmButtonText: 'Sí, asignar',
    });
    if (!confirmado) return;

    try {
      const result = await distribucionController.asignarPedido({
        id_pedido: pedidoSeleccionado.id_pedido,
        id_usuario: usuario.id_usuario,
        observaciones: `Asignado por ${tipo}`,
      });
      if (result.success) {
        let mensaje = `Pedido #${pedidoSeleccionado.id_pedido} asignado a ${nombreUsuario}`;
        if (result.data?.tipo_asignacion === 'DISTRIBUIDORA_EXTERNA') mensaje += ' — Envío externo (fuera de Bogotá)';
        else mensaje += ' — Envío en Bogotá';
        void alertSuccess(mensaje);
        setMostrarRepartidores(false);
        setPedidoSeleccionado(null);
        void cargarPedidos();
      } else {
        void alertError(result.message || 'No se pudo asignar el pedido');
      }
    } catch (error) {
      console.error('Error asignando pedido:', error);
      void alertError(error.message || 'Error al asignar el pedido');
      setMostrarRepartidores(false);
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center h-[60vh]"><div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div><p className="mt-3 text-gray-500 text-sm">Cargando...</p></div>;
  if (error) return <div className="text-center mt-10"><p className="text-red-500">{error}</p><button onClick={cargarPedidos} className="mt-4 bg-[#B90F0F] text-white px-4 py-2 rounded-lg">Reintentar</button></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader icono="fa-receipt" titulo="Gestionar pedidos" subtitulo="Consulta y administra los pedidos realizados." onRefresh={onRefresh} refreshing={refreshing} />

        <SearchFilters 
          busqueda={busqueda} setBusqueda={setBusqueda} placeholder="Buscar pedido, cliente o ciudad..." 
          filtros={ESTADOS_VALIDOS} filtroActivo={filtroEstado} setFiltroActivo={setFiltroEstado} 
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {pedidosFiltrados.map((item) => {
            const estado = item.estado || 'Pendiente';
            const repartidorAsignado = item.repartidor_nombre || item.repartidor?.nombre || null;
            const puedeAsignar = estado === 'Pagado';
            const nombreCliente = item.cliente || item.nombre_completo || 'Sin nombre';

            return (
              <BaseCard key={item.id_pedido} isClickable onClick={() => void navigate(`/admin/pedidos/${item.id_pedido}`, { state: { esAdmin: true } })}>
                <CardHeader 
                  icono="fa-receipt" 
                  titulo={`Pedido #${item.id_pedido}`} 
                  subtitulo={item.fechaFormateada}
                  badge={
                    <EstadoBadge 
                      bg={getEstadoBackground(estado, PEDIDOS_ESTADOS)} 
                      color={getEstadoColor(estado, PEDIDOS_ESTADOS)} 
                      icono={getEstadoIcon(estado, PEDIDOS_ESTADOS)} 
                      texto={getEstadoTexto(estado, PEDIDOS_ESTADOS)} 
                    />
                  }
                />
                <CardDivider />
                
                <CardSection icono="fa-circle-user" titulo="Cliente">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <CardInfo icono="fa-user" label="Cliente" valor={nombreCliente} />
                    <CardInfo icono="fa-building" label="Ciudad de envío" valor={item.ciudad_envio} />
                    <div className="sm:col-span-2">
                      <CardInfo icono="fa-location-dot" label="Dirección" valor={item.direccion_entrega} />
                    </div>
                  </div>
                </CardSection>

                <CardDivider />
                
                <CardSection icono="fa-motorcycle" titulo="Repartidor">
                  <CardInfo icono="fa-user" label="Asignado a" valor={repartidorAsignado || 'No asignado'} />
                </CardSection>

                <CardDivider />

                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-calendar text-gray-400 text-sm"></i>
                    <span className="text-xs text-gray-500">{formatearFecha(item.fecha_estimada)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <i className="fa-solid fa-money-bill text-[#B90F0F] text-sm"></i>
                    <span className="text-sm font-bold text-[#B90F0F]">{item.totalFormateado}</span>
                  </div>
                  <div className="sm:ml-auto flex items-center gap-1">
                    <span className="text-sm font-semibold text-[#B90F0F]">Ver</span>
                    <i className="fa-solid fa-chevron-right text-[#B90F0F] text-xs"></i>
                  </div>
                </div>

                {puedeAsignar && (
                  <div className="px-5 pb-5">
                    <button onClick={(e) => { e.stopPropagation(); setPedidoSeleccionado(item); setMostrarRepartidores(true); }} className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#B90F0F] text-white font-semibold hover:bg-[#8a0b0b] transition">
                      <i className="fa-solid fa-users"></i> <span>{repartidorAsignado ? 'Cambiar asignación' : 'Asignar a'}</span>
                    </button>
                  </div>
                )}
              </BaseCard>
            );
          })}
        </div>

        <ModalBase visible={mostrarRepartidores} onClose={() => setMostrarRepartidores(false)} titulo="Asignar pedido a:" subtitulo="Selecciona un repartidor o administrador disponible.">
          <div className="space-y-2">
             {repartidores.map((usuario) => {
                const esAdmin = usuario.esAdmin || false;
                return (
                  <button key={usuario.id_usuario} onClick={() => handleAsignar(usuario)} className="w-full flex items-center gap-3 p-3 rounded-xl border border-gray-200 hover:bg-gray-50 transition text-left">
                     <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center"><i className={`fa-solid ${esAdmin ? 'fa-briefcase' : 'fa-circle-user'} text-[#B90F0F]`}></i></div>
                     <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{usuario.nombre_completo} {esAdmin && <span className="text-[#B90F0F] font-normal"> (Admin)</span>}</p>
                        <p className="text-xs text-gray-500 mt-1 truncate">{usuario.vehiculo ? `${usuario.vehiculo.tipo}${usuario.vehiculo.placa && usuario.vehiculo.placa !== 'N/A' ? ` - ${usuario.vehiculo.placa}` : ''}` : 'Sin vehículo'}</p>
                     </div>
                  </button>
                );
             })}
          </div>
        </ModalBase>
      </div>
    </div>
  );
};

export default GestionarPedidosAdmin;