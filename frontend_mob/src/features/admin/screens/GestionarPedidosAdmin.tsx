// src/features/admin/screens/GestionarPedidosAdmin.tsx

import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Alert,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';

import { PedidoController } from '../../../core/controllers/PedidoController';
import { UserController } from '../../../core/controllers/UserController';
import { AuthController } from '../../../core/controllers/AuthController';
import { PedidoModel } from '../../../core/models/PedidoModel';
import { UserModel } from '../../../core/models/UserModel';
import { COLORS } from '../../../shared/constants/colors';

type FiltroEstado =
  | 'TODOS'
  | 'Abonado'
  | 'Listo'
  | 'Pagado'
  | 'En Proceso'
  | 'Enviado'
  | 'Entregado';

const ESTADOS_VALIDOS: FiltroEstado[] = [
  'TODOS',
  'Abonado',
  'Listo',
  'Pagado',
  'En Proceso',
  'Enviado',
  'Entregado',
];

const ESTADOS_MAP: Record<string, string> = {
  'Abonado': 'Abonado (50%)',
  'Listo': 'Listo para pagar',
  'Pagado': 'Pagado (100%)',
  'En Proceso': 'En proceso',
  'Enviado': 'Enviado',
  'Entregado': 'Entregado',
};

interface Props {
  navigation: any;
  route?: any;
}

export const GestionarPedidosAdmin = ({ navigation }: Props) => {
  const pedidoController = new PedidoController();
  const userController = new UserController();
  const authController = new AuthController();

  const [pedidos, setPedidos] = useState<PedidoModel[]>([]);
  const [repartidores, setRepartidores] = useState<UserModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<FiltroEstado>('TODOS');

  const [mostrarRepartidores, setMostrarRepartidores] = useState(false);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<PedidoModel | null>(null);

  const cargarPedidos = useCallback(async () => {
    try {
      setError(null);
      const data = await pedidoController.getTodosLosPedidos();

      if (!Array.isArray(data)) {
        setPedidos([]);
        return;
      }

      setPedidos(data);
    } catch (err: any) {
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

      let listaUsuarios: UserModel[] = [];

      if (repartidoresData && repartidoresData.length > 0) {
        listaUsuarios = [...repartidoresData];
      }

      if (admin) {
        const adminExiste = listaUsuarios.some(u => u.id_usuario === admin.id_usuario);
        if (!adminExiste) {
          const adminConFlag = {
            ...admin,
            esAdmin: true,
          };
          if (!adminConFlag.vehiculo) {
            adminConFlag.vehiculo = {
              tipo: 'Distribuidora externa',
              modelo: '',
              placa: 'N/A',
              color: '',
            };
          }
          listaUsuarios.push(adminConFlag);
        }
      }

      setRepartidores(listaUsuarios);
    } catch (err) {
      console.error('Error cargando repartidores:', err);
      setRepartidores([]);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      cargarPedidos();
      cargarRepartidores();
    }, [cargarPedidos, cargarRepartidores])
  );

  const onRefresh = () => {
    setRefreshing(true);
    cargarPedidos();
    cargarRepartidores();
  };

  const pedidosFiltrados = useMemo(() => {
    let resultado = [...pedidos];

    if (filtroEstado !== 'TODOS') {
      resultado = resultado.filter(
        (pedido) => pedido.estado === filtroEstado
      );
    }

    if (busqueda.trim()) {
      const texto = busqueda.toLowerCase().trim();
      resultado = resultado.filter(
        (pedido) =>
          String(pedido.id_pedido).includes(texto) ||
          pedido.cliente?.nombre?.toLowerCase().includes(texto) ||
          pedido.ciudad_envio?.toLowerCase().includes(texto) ||
          pedido.direccion_entrega?.toLowerCase().includes(texto)
      );
    }

    return resultado;
  }, [pedidos, busqueda, filtroEstado]);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'Abonado': return '#2563EB';
      case 'Listo': return '#7C3AED';
      case 'Pagado': return '#059669';
      case 'En Proceso': return '#0284C7';
      case 'Enviado': return '#6366F1';
      case 'Entregado': return '#22C55E';
      default: return '#6B7280';
    }
  };

  const getEstadoBackground = (estado: string) => {
    const color = getEstadoColor(estado);
    return `${color}20`;
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'Abonado': return 'cash-outline';
      case 'Listo': return 'checkmark-circle-outline';
      case 'Pagado': return 'card-outline';
      case 'En Proceso': return 'sync-outline';
      case 'Enviado': return 'rocket-outline';
      case 'Entregado': return 'checkmark-done-outline';
      default: return 'help-circle-outline';
    }
  };

  const abrirDetalle = (pedido: PedidoModel) => {
     navigation.navigate('DetallePedidosAdmin', {
    id_pedido: pedido.id_pedido,
    esAdmin: true,
   });
  };

  const formatearFecha = (fecha: string) => {
    if (!fecha) return 'Sin fecha estimada';
    const date = new Date(fecha + 'T00:00:00');
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const abrirAsignarRepartidor = (pedido: PedidoModel) => {
    setPedidoSeleccionado(pedido);
    setMostrarRepartidores(true);
  };

  const renderPedido = ({ item }: { item: PedidoModel }) => {
    const estado = item.estado || 'Pendiente';
    const estadoColor = getEstadoColor(estado);
    const estadoBackground = getEstadoBackground(estado);
    const estadoIcon = getEstadoIcon(estado);
   const repartidorAsignado = item.repartidor_nombre || item.repartidor?.nombre || null;
    const puedeAsignar = estado === 'Pagado' || estado === 'En Proceso';
    const nombreCliente =
      item.cliente ||
      item.nombre_completo ||
      'Sin nombre';

    return (
      <View style={styles.pedidoCard}>
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => abrirDetalle(item)}
        >
          <View style={styles.cardHeader}>
            <View style={styles.pedidoTitleContainer}>
              <View style={styles.pedidoIcon}>
                <Ionicons name="receipt-outline" size={18} color={COLORS.primary} />
              </View>
              <View style={styles.pedidoTitle}>
                <Text style={styles.pedidoId}>Pedido #{item.id_pedido}</Text>
                <Text style={styles.pedidoFecha}>
                  {item.fechaFormateada}
                </Text>
              </View>
            </View>

            <View style={[styles.estadoBadge, { backgroundColor: estadoBackground }]}>
              <Ionicons name={estadoIcon} size={15} color={estadoColor} />
              <Text style={[styles.estadoText, { color: estadoColor }]}>
                {ESTADOS_MAP[estado] || estado}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.clienteSection}>
            <View style={styles.clienteHeader}>
              <Ionicons name="person-circle-outline" size={18} color={COLORS.primary} />
              <Text style={styles.clienteTitle}>Cliente</Text>
            </View>

            <View style={styles.clienteInfo}>
              <View style={styles.infoRow}>
                <Ionicons name="person-outline" size={14} color="#777" />
                <Text style={styles.infoText} numberOfLines={1}>
                  {nombreCliente}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="location-outline" size={14} color="#777" />
                <Text style={styles.infoText} numberOfLines={1}>
                  {item.direccion_entrega || 'Sin dirección'}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Ionicons name="business-outline" size={14} color="#777" />
                <Text style={styles.infoText} numberOfLines={1}>
                  {item.ciudad_envio || 'Sin ciudad'}
                </Text>
              </View>
            </View>
          </View>

          {/* REPARTIDOR ASIGNADO */}
          <View style={styles.repartidorSection}>
            <View style={styles.repartidorHeader}>
              <Ionicons name="bicycle-outline" size={16} color={COLORS.primary} />
              <Text style={styles.repartidorTitle}>Repartidor</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={14} color="#777" />
              <Text style={styles.infoText} numberOfLines={1}>
                {repartidorAsignado || 'No asignado'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.bottomInfo}>
            <View style={styles.bottomItem}>
              <Ionicons name="calendar-outline" size={14} color="#777" />
              <Text style={styles.bottomText}>
                {formatearFecha(item.fecha_estimada)}
              </Text>
            </View>

            <View style={styles.bottomItem}>
              <Ionicons name="cash-outline" size={14} color={COLORS.primary} />
              <Text style={styles.costo}>{item.totalFormateado}</Text>
            </View>

            <View style={styles.detalleContainer}>
              <Text style={styles.detalleText}>Ver</Text>
              <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
            </View>
          </View>
        </TouchableOpacity>

        {/* Botón "Asignar a"  */}
        {puedeAsignar && (
        <TouchableOpacity
          style={styles.asignarButton}
          onPress={() => abrirAsignarRepartidor(item)}
        >
          <Ionicons name="people-outline" size={16} color={COLORS.white} />
          <Text style={styles.asignarButtonText}>
                {repartidorAsignado ? 'Cambiar asignación' : 'Asignar a'}
              </Text>
            </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando pedidos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={55} color="#EF4444" />
          <Text style={styles.errorTitle}>Ocurrió un error</Text>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity
            style={styles.retryButton}
            onPress={() => {
              setLoading(true);
              cargarPedidos();
            }}
          >
            <Ionicons name="refresh-outline" size={19} color="#FFFFFF" />
            <Text style={styles.retryText}>Intentar nuevamente</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* BUSCADOR */}
      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={19} color="#777" />
        <TextInput
          style={styles.searchInput}
          placeholder="Buscar pedido, cliente o ciudad..."
          placeholderTextColor="#999"
          value={busqueda}
          onChangeText={setBusqueda}
        />
        {busqueda.length > 0 && (
          <TouchableOpacity onPress={() => setBusqueda('')}>
            <Ionicons name="close-circle" size={18} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* FILTROS */}
      <View style={styles.filtersContainer}>
        <View style={styles.filtersRow}>
          {ESTADOS_VALIDOS.slice(0, 3).map((estado) => (
            <TouchableOpacity
              key={estado}
              style={[
                styles.filterButton,
                filtroEstado === estado && styles.filterButtonActive,
              ]}
              onPress={() => setFiltroEstado(estado)}
            >
              <Text
                style={[
                  styles.filterText,
                  filtroEstado === estado && styles.filterTextActive,
                ]}
                numberOfLines={1}
              >
                {estado === 'TODOS' ? 'Todos' : ESTADOS_MAP[estado] || estado}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.filtersRow}>
          {ESTADOS_VALIDOS.slice(3).map((estado) => (
            <TouchableOpacity
              key={estado}
              style={[
                styles.filterButton,
                filtroEstado === estado && styles.filterButtonActive,
              ]}
              onPress={() => setFiltroEstado(estado)}
            >
              <Text
                style={[
                  styles.filterText,
                  filtroEstado === estado && styles.filterTextActive,
                ]}
                numberOfLines={1}
              >
                {ESTADOS_MAP[estado] || estado}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* CONTADOR */}
      <View style={styles.resultsContainer}>
        <Text style={styles.resultsText}>
          {pedidosFiltrados.length}{' '}
          {pedidosFiltrados.length === 1 ? 'pedido encontrado' : 'pedidos encontrados'}
        </Text>
      </View>

      {/* LISTA */}
      <FlatList
        data={pedidosFiltrados}
        keyExtractor={(item) => String(item.id_pedido)}
        renderItem={renderPedido}
        contentContainerStyle={
          pedidosFiltrados.length === 0 ? styles.emptyList : styles.listContent
        }
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={60} color="#CCCCCC" />
            <Text style={styles.emptyTitle}>No hay pedidos</Text>
            <Text style={styles.emptyText}>
              No se encontraron pedidos con los filtros seleccionados.
            </Text>
          </View>
        }
      />

      {/* MODAL REPARTIDORES + ADMIN */}
      <Modal
        visible={mostrarRepartidores}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarRepartidores(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Asignar pedido a:</Text>
              <TouchableOpacity onPress={() => setMostrarRepartidores(false)}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              {repartidores.length === 0 ? (
                <View style={styles.emptyRepartidores}>
                  <Text style={styles.emptyRepartidoresText}>
                    No hay repartidores ni administradores disponibles
                  </Text>
                </View>
              ) : (
                repartidores.map((usuario) => {
                  const esAdmin = (usuario as any).esAdmin || false;
                  return (
                    <TouchableOpacity
                      key={usuario.id_usuario}
                      style={styles.repartidorItem}
                      onPress={() => {
                        Alert.alert(
                          'Asignar pedido',
                          `¿Asignar pedido #${pedidoSeleccionado?.id_pedido} a ${usuario.nombre_completo}?`,
                          [
                            { text: 'Cancelar', style: 'cancel' },
                            {
                              text: 'Asignar',
                              onPress: () => {
                                setMostrarRepartidores(false);
                                Alert.alert(
                                  ' Asignado',
                                  `Pedido #${pedidoSeleccionado?.id_pedido} asignado a ${usuario.nombre_completo}`
                                );
                              }
                            }
                          ]
                        );
                      }}
                    >
                      <Ionicons
                        name={esAdmin ? "business-outline" : "person-circle-outline"}
                        size={28}
                        color={esAdmin ? "#B90F0F" : COLORS.primary}
                      />
                      <View style={styles.repartidorInfo}>
                        <Text style={styles.repartidorNombre}>
                          {usuario.nombre_completo}
                          {esAdmin && (
                            <Text style={styles.adminTag}> (Admin - Distribuidor externo)</Text>
                          )}
                        </Text>
                        <Text style={styles.repartidorDetalle}>
                          {usuario.vehiculo
                            ? `${usuario.vehiculo.tipo}${usuario.vehiculo.placa && usuario.vehiculo.placa !== 'N/A' ? ` - ${usuario.vehiculo.placa}` : ''}`
                            : 'Sin vehículo asignado'}
                        </Text>
                      </View>
                      <View style={styles.repartidorEstado}>
                        <Text
                          style={[
                            styles.repartidorEstadoText,
                            {
                              color: usuario.estado === 'ACTIVO' ? '#22C55E' : '#EF4444',
                            },
                          ]}
                        >
                          {usuario.estado === 'ACTIVO' ? 'Activo' : 'Inactivo'}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F6F6F6',
  },

  searchContainer: {
    marginHorizontal: 14,
    marginTop: 10,
    height: 43,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    elevation: 1,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: '#333',
  },

  filtersContainer: {
    paddingHorizontal: 14,
      paddingTop: 9,
      gap: 5,
  },

filtersRow: {
  flexDirection: 'row',
  gap: 5,
  marginBottom: 5,
},

  filterButton: {
    flex: 1,
      paddingVertical: 6,
      paddingHorizontal: 4,
      borderRadius: 16,
      backgroundColor: '#E8E8E8',
      alignItems: 'center',
  },

  filterButtonActive: {
    backgroundColor: COLORS.primary,
  },

  filterText: {
    fontSize: 9,
    color: '#666',
    fontWeight: '600',
    textAlign: 'center',
  },

  filterTextActive: {
    color: '#FFFFFF',
  },

  resultsContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },

  resultsText: {
    color: '#777',
    fontSize: 12,
  },

  listContent: {
    paddingHorizontal: 14,
    paddingBottom: 25,
  },

  emptyList: {
    flexGrow: 1,
  },

  pedidoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 9,
    overflow: 'hidden',
    elevation: 2,
    position: 'relative',
  },

  cardHeader: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  pedidoTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 9,
  },

  pedidoIcon: {
    width: 34,
    height: 34,
    borderRadius: 9,
    backgroundColor: '#FDECEC',
    alignItems: 'center',
    justifyContent: 'center',
  },

  pedidoTitle: {
    flex: 1,
  },

  pedidoId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
  },

  pedidoFecha: {
    fontSize: 11,
    color: '#777',
    marginTop: 2,
  },

  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 15,
    marginLeft: 5,
  },

  estadoText: {
    fontSize: 10,
    fontWeight: '700',
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
  },

  clienteSection: {
    paddingHorizontal: 12,
    paddingVertical: 8,
  },

  clienteHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 5,
  },

  clienteTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#444',
  },

  clienteInfo: {
    gap: 4,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
  },

  infoText: {
    flex: 1,
    fontSize: 11,
    color: '#666',
  },

  bottomInfo: {
    minHeight: 36,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },

  bottomItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },

  bottomText: {
    fontSize: 10,
    color: '#777',
  },

  costo: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },

  detalleContainer: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 1,
  },

  detalleText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },

  asignarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    marginHorizontal: 12,
    marginBottom: 12,
    borderRadius: 8,
    gap: 6,
  },

  asignarButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },

  loadingText: {
    color: '#777',
    fontSize: 14,
  },

  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  errorTitle: {
    marginTop: 12,
    fontSize: 19,
    fontWeight: '700',
    color: '#333',
  },

  errorText: {
    marginTop: 7,
    textAlign: 'center',
    color: '#777',
    fontSize: 13,
  },

  retryButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    gap: 7,
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 9,
  },

  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 13,
  },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 60,
    paddingHorizontal: 35,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 17,
    fontWeight: '700',
    color: '#555',
  },

  emptyText: {
    marginTop: 5,
    textAlign: 'center',
    color: '#888',
    fontSize: 12,
    lineHeight: 17,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },

  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.black,
  },

  repartidorItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },

  repartidorInfo: {
    flex: 1,
  },

  repartidorNombre: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },

  adminTag: {
    fontSize: 12,
    fontWeight: '400',
    color: '#B90F0F',
  },

  repartidorDetalle: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },

  repartidorEstado: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },

  repartidorEstadoText: {
    fontSize: 11,
    fontWeight: '600',
  },

  emptyRepartidores: {
    paddingVertical: 40,
    alignItems: 'center',
  },

  emptyRepartidoresText: {
    color: '#999',
    fontSize: 14,
  },
repartidorSection: {
  paddingHorizontal: 12,
  paddingVertical: 4,
},

repartidorHeader: {
  flexDirection: 'row',
  alignItems: 'center',
  gap: 6,
  marginBottom: 3,
},

repartidorTitle: {
  fontSize: 12,
  fontWeight: '700',
  color: '#444',
},
});