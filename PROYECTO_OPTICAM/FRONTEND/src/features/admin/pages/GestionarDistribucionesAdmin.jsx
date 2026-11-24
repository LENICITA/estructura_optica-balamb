import React, { useCallback, useState, useEffect } from 'react';
import { DistribucionController } from '../../../core/controllers/DistribucionController';
import { PageHeader } from '../../../shared/components/ui/PageHeader';
import { SearchFilters } from '../../../shared/components/ui/SearchFilters';
import { ModalBase } from '../../../shared/components/ui/ModalBase';
import { CardInfo, EstadoBadge } from '../../../shared/components/ui/CardInfo';
import { BaseCard, CardHeader, CardDivider } from '../../../shared/components/ui/BaseCard';
// ✅ Importamos las funciones y el diccionario
import { 
  DISTRIBUCIONES_ESTADOS, 
  getEstadoColor, 
  getEstadoBackground, 
  getEstadoIcon, 
  getEstadoTexto 
} from '../../../shared/utils/estadosUI';

const ESTADOS_FILTRO = [
  { label: 'Todos', value: 'TODOS' },
  { label: 'Pendiente', value: 'PENDIENTE' },
  { label: 'En entrega', value: 'EN_ENTREGA' },
  { label: 'Entregado', value: 'ENTREGADO' },
];

export const GestionarDistribucionesAdmin = () => {
  const distribucionController = new DistribucionController();

  const [distribuciones, setDistribuciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [menuVisible, setMenuVisible] = useState(false);
  const [distribucionSeleccionada, setDistribucionSeleccionada] = useState(null);

  const cargarDistribuciones = useCallback(async () => {
    try {
      setError(null);
      const data = await distribucionController.getTodasDistribuciones();
      setDistribuciones(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error cargando distribuciones:', err);
      setError(err?.message || 'No fue posible cargar las distribuciones');
      setDistribuciones([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    setLoading(true);
    void cargarDistribuciones();
  }, [cargarDistribuciones]);

  const onRefresh = () => {
    setRefreshing(true);
    void cargarDistribuciones();
  };

  const distribucionesFiltradas = distribuciones.filter((item) => {
    if (item.estado === 'CANCELADO') return false;
    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase().trim();
      const cliente = item.pedido?.cliente?.nombre?.toLowerCase() || '';
      const ciudad = item.pedido?.ciudad_envio?.toLowerCase() || '';
      const repartidor = item.repartidor?.nombre?.toLowerCase() || '';
      if (!cliente.includes(texto) && !ciudad.includes(texto) && !repartidor.includes(texto)) return false;
    }
    if (filtroEstado !== 'TODOS') return item.estado === filtroEstado;
    return true;
  });

  const formatearFecha = (fecha) => {
    if (!fecha) return 'Sin fecha';
    return new Date(fecha).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const abrirMenu = (distribucion) => {
    setDistribucionSeleccionada(distribucion);
    setMenuVisible(true);
  };

  const cerrarMenu = () => {
    setMenuVisible(false);
    setDistribucionSeleccionada(null);
  };

  const handleCancelar = async () => {
    if (!distribucionSeleccionada) return;
    const id = distribucionSeleccionada.id_distribucion;
    cerrarMenu();
    if (!window.confirm(`¿Estás seguro de cancelar la distribución #${id}? El pedido volverá a estado "Pagado".`)) return;
    try {
      const result = await distribucionController.cancelarEntrega(id);
      if (result.success) {
        alert(result.message || 'Distribución cancelada exitosamente');
        void cargarDistribuciones();
      } else {
        alert(result.message || 'No se pudo cancelar la distribución');
      }
    } catch (error) {
      console.error('Error al cancelar:', error);
      alert(error.message || 'Error al cancelar la distribución');
    }
  };

  if (loading) return <div className="flex flex-col items-center justify-center h-[60vh]"><div className="w-12 h-12 border-4 border-[#B90F0F] border-t-transparent rounded-full animate-spin"></div><p className="mt-3 text-gray-500 text-sm">Cargando...</p></div>;
  if (error) return <div className="text-center mt-10"><p className="text-red-500">{error}</p><button onClick={cargarDistribuciones} className="mt-4 bg-[#B90F0F] text-white px-4 py-2 rounded-lg">Reintentar</button></div>;

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader icono="fa-truck" titulo="Gestionar distribuciones" subtitulo="Consulta y administra las distribuciones de los pedidos." onRefresh={onRefresh} refreshing={refreshing} />

        <SearchFilters 
          busqueda={busqueda} setBusqueda={setBusqueda} placeholder="Buscar por cliente, ciudad o repartidor..." 
          filtros={ESTADOS_FILTRO} filtroActivo={filtroEstado} setFiltroActivo={setFiltroEstado}
          textoBotonExtra="Ver distribuciones externas" onBotonExtra={() => {}} 
        />

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
          {distribucionesFiltradas.map((item) => {
            const estado = item.estado || 'PENDIENTE';
            const clienteNombre = item.pedido?.cliente?.nombre || 'Sin cliente';
            const ciudad = item.pedido?.ciudad_envio || 'Sin ciudad';
            const repartidorNombre = item.repartidor?.nombre || 'No asignado';
            const vehiculo = item.repartidor?.vehiculo || 'N/A';

            return (
              <BaseCard key={item.id_distribucion}>
                <CardHeader 
                  icono="fa-cube" 
                  titulo={`Distribución #${item.id_distribucion}`} 
                  badge={
                    <div className="flex items-center gap-2">
                      <EstadoBadge 
                        bg={getEstadoBackground(estado, DISTRIBUCIONES_ESTADOS)} 
                        color={getEstadoColor(estado, DISTRIBUCIONES_ESTADOS)} 
                        icono={getEstadoIcon(estado, DISTRIBUCIONES_ESTADOS)} 
                        texto={getEstadoTexto(estado, DISTRIBUCIONES_ESTADOS)} 
                      />
                      {estado === 'PENDIENTE' && (
                        <button onClick={() => abrirMenu(item)} className="w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 transition">
                          <i className="fa-solid fa-ellipsis-vertical"></i>
                        </button>
                      )}
                    </div>
                  }
                />
                <CardDivider />
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <CardInfo icono="fa-user" label="Cliente" valor={clienteNombre} />
                  <CardInfo icono="fa-location-dot" label="Ciudad de envío" valor={ciudad} />
                  <CardInfo icono="fa-motorcycle" label="Repartidor" valor={repartidorNombre} />
                  <CardInfo icono="fa-car" label="Vehículo" valor={vehiculo} />
                </div>
                <div className="px-5 pb-5">
                  <CardInfo icono="fa-calendar" label="Fecha asignación" valor={formatearFecha(item.fecha_asignacion)} />
                </div>
                {item.observaciones && (
                  <div className="px-5 pb-5 pt-4 border-t border-gray-100">
                    <p className="text-[10px] text-gray-400 uppercase tracking-wide mb-1">Observaciones</p>
                    <p className="text-sm text-gray-600 leading-5">{item.observaciones}</p>
                  </div>
                )}
              </BaseCard>
            );
          })}
        </div>

        <ModalBase visible={menuVisible} onClose={cerrarMenu} titulo={`Distribución #${distribucionSeleccionada?.id_distribucion}`} subtitulo="Acciones disponibles">
           <button onClick={handleCancelar} className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-red-50 transition">
              <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center"><i className="fa-solid fa-circle-xmark text-red-500 text-xl"></i></div>
              <span className="text-sm font-semibold text-red-500">Cancelar distribución</span>
           </button>
        </ModalBase>
      </div>
    </div>
  );
};

export default GestionarDistribucionesAdmin;