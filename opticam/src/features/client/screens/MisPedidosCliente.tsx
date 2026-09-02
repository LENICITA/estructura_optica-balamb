// src/features/pedidos/screens/MisPedidosCliente.tsx

import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  RefreshControl,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Modal,
  Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';

import { PedidoController } from '../../../core/controllers/PedidoController';
import { PedidoModel } from '../../../core/models/PedidoModel';
import { COLORS } from '../../../shared/constants/colors';

interface Props {
  navigation: any;
  route?: any;
}

export const MisPedidosCliente = ({ navigation }: Props) => {
  const pedidoController = new PedidoController();

  const [pedidos, setPedidos] = useState<PedidoModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);
  const [error, setError] = useState('');

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedPedido, setSelectedPedido] = useState<PedidoModel | null>(null);

  const cargarPedidos = async () => {
    try {
      setError('');
      const resultado = await pedidoController.getMisPedidos();
      console.log(' Pedidos cargados:', resultado.length);
      const pedidosActivos = resultado.filter(
            (pedido) => pedido.estado !== 'Cancelado'
          );

          console.log(' Pedidos activos:', pedidosActivos.length);
          setPedidos(pedidosActivos);
    } catch (e) {
      console.error('Error al cargar pedidos:', e);
      setError('No se pudieron cargar tus pedidos.');
    } finally {
      setLoading(false);
      setActualizando(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarPedidos();
    }, [])
  );

  const actualizarLista = () => {
    setActualizando(true);
    cargarPedidos();
  };

  const irADetalle = (pedido: PedidoModel) => {
    navigation.navigate('DetallePedidoCliente', {
      id_pedido: pedido.id_pedido,
    });
  };

  const mostrarMenu = (pedido: PedidoModel) => {
    setSelectedPedido(pedido);
    setMenuVisible(true);
  };

  const cerrarMenu = () => {
    setMenuVisible(false);
    setSelectedPedido(null);
  };

  const cancelarPedido = async () => {
    if (!selectedPedido) return;

    Alert.alert(
      'Cancelar pedido',
      `¿Estás seguro de cancelar el pedido #${selectedPedido.id_pedido}? Esta acción no se puede deshacer.`,
      [
        { text: 'Seguir con el pedido', style: 'cancel' },
        {
          text: 'Cancelar pedido',
          style: 'destructive',
          onPress: async () => {
            try {
              const result = await pedidoController.cancelarPedido(selectedPedido.id_pedido);

              if (result.success) {
                Alert.alert(' Pedido cancelado', 'Tu pedido ha sido cancelado exitosamente.');
                setPedidos((prevPedidos) =>
                                prevPedidos.filter((p) => p.id_pedido !== selectedPedido.id_pedido)
                              );

                              cerrarMenu();
                            } else {
                              Alert.alert('Error', result.message || 'No se pudo cancelar el pedido');
                            }
            } catch (error: any) {
              console.error('Error cancelando pedido:', error);
              Alert.alert('Error', error.message || 'Error al cancelar el pedido');
            }
          },
        },
      ]
    );
  };

  const obtenerColorEstado = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return '#D97706';
      case 'Abonado': return '#2563EB';
      case 'Listo': return '#7C3AED';
      case 'Pagado': return '#059669';
      case 'En Proceso': return '#0284C7';
      case 'Enviado': return '#6366F1';
      case 'Entregado': return '#22C55E';
      case 'Cancelado': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const obtenerFondoEstado = (estado: string) => {
    const color = obtenerColorEstado(estado);
    return `${color}20`;
  };

  const obtenerIconoEstado = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'time-outline';
      case 'Abonado': return 'cash-outline';
      case 'Listo': return 'checkmark-circle-outline';
      case 'Pagado': return 'card-outline';
      case 'En Proceso': return 'sync-outline';
      case 'Enviado': return 'rocket-outline';
      case 'Entregado': return 'checkmark-done-outline';
      case 'Cancelado': return 'close-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  const obtenerEstadoTexto = (estado: string) => {
    switch (estado) {
      case 'Pendiente': return 'Pendiente';
      case 'Abonado': return 'Abonado (50%)';
      case 'Listo': return 'Listo para pagar';
      case 'Pagado': return 'Pagado';
      case 'En Proceso': return 'En proceso';
      case 'Enviado': return 'Enviado';
      case 'Entregado': return 'Entregado';
      case 'Cancelado': return 'Cancelado';
      default: return estado;
    }
  };

  // ===== RENDER PEDIDO =====
  const renderPedido = ({ item }: { item: PedidoModel }) => {
    const estadoColor = obtenerColorEstado(item.estado);
    const estadoFondo = obtenerFondoEstado(item.estado);
    const estadoIcono = obtenerIconoEstado(item.estado);
    const puedeCancelar = item.estado === 'Pendiente';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.7}
        onPress={() => irADetalle(item)}
      >
        {/* CANCELAR PEDIDO */}
        {puedeCancelar && (
          <TouchableOpacity
            style={styles.menuButton}
            onPress={(e) => {
              e.stopPropagation();
              mostrarMenu(item);
            }}
          >
            <Ionicons name="ellipsis-vertical" size={20} color="#999" />
          </TouchableOpacity>
        )}

        <View style={styles.cardContent}>
          {/* NÚMERO Y FECHA */}
          <View style={styles.cardHeader}>
            <View>
              <Text style={styles.pedidoNumero}>
                Pedido #{item.id_pedido}
              </Text>
              <Text style={styles.fecha}>
                {item.fechaFormateada}
              </Text>
            </View>

            {/* ESTADO */}
            <View style={[styles.estadoBadge, { backgroundColor: estadoFondo }]}>
              <Ionicons name={estadoIcono} size={14} color={estadoColor} />
              <Text style={[styles.estadoTexto, { color: estadoColor }]}>
                {obtenerEstadoTexto(item.estado)}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  // ===== LOADING =====
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Cargando tus pedidos...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ===== PANTALLA =====
  return (
    <SafeAreaView style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Mis pedidos</Text>
        <Text style={styles.subtitulo}>Historial de tus compras</Text>
      </View>

      {/* ERROR */}
      {error !== '' && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTexto}>{error}</Text>
          <TouchableOpacity onPress={cargarPedidos}>
            <Text style={styles.reintentar}>Reintentar</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* SIN PEDIDOS */}
      {!error && pedidos.length === 0 && (
        <View style={styles.vacio}>
          <Ionicons name="receipt-outline" size={60} color="#CCCCCC" />
          <Text style={styles.vacioTitulo}>No tienes pedidos</Text>
          <Text style={styles.vacioTexto}>
            Cuando realices una compra, aparecerá aquí tu historial de pedidos.
          </Text>
          <TouchableOpacity
            style={styles.irCatalogoButton}
            onPress={() => navigation.navigate('CatalogoCliente')}
          >
            <Text style={styles.irCatalogoText}>Ir al catálogo</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* LISTA DE PEDIDOS */}
      {pedidos.length > 0 && (
        <FlatList
          data={pedidos.filter(p => p.estado !== 'Cancelado')}
          keyExtractor={(item) => item.id_pedido.toString()}
          renderItem={renderPedido}
          contentContainerStyle={styles.lista}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={actualizando}
              onRefresh={actualizarLista}
              colors={[COLORS.primary]}
            />
          }
        />
      )}

      {/* MODAL DE MENÚ  */}
      <Modal
        visible={menuVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={cerrarMenu}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={cerrarMenu}
        >
          <View style={styles.modalContent}>
            {selectedPedido && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Opciones</Text>
                  <TouchableOpacity onPress={cerrarMenu}>
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <TouchableOpacity
                  style={styles.modalOption}
                  onPress={() => {
                    cerrarMenu();
                    setTimeout(() => {
                      cancelarPedido();
                    }, 300);
                  }}
                >
                  <Ionicons name="close-circle-outline" size={24} color="#dc3545" />
                  <Text style={[styles.modalOptionText, { color: '#dc3545' }]}>
                    Cancelar pedido
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },

  header: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },

  titulo: {
    fontSize: 26,
    fontWeight: '700',
    color: '#111827',
  },

  subtitulo: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 4,
  },

  lista: {
    padding: 16,
    paddingBottom: 30,
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 15,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
    position: 'relative',
  },

  menuButton: {
    position: 'absolute',
      top: 8,
      right: 3,
      zIndex: 10,
      padding: 0,
  },

  cardContent: {
    paddingRight: 0,
  },

  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingRight: 4,
  },

  pedidoNumero: {
    fontSize: 17,
    fontWeight: '700',
    color: '#111827',
  },

  fecha: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 4,
  },

  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 4,
  },

  estadoTexto: {
    fontSize: 11,
    fontWeight: '700',
  },

  // LOADING
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: '#6B7280',
  },

  // ERROR
  errorContainer: {
    margin: 16,
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#FEF2F2',
    alignItems: 'center',
  },

  errorTexto: {
    color: '#B91C1C',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 8,
  },

  reintentar: {
    color: '#2563EB',
    fontSize: 14,
    fontWeight: '700',
  },

  // VACÍO
  vacio: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },

  vacioTitulo: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    marginTop: 15,
  },

  vacioTexto: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 21,
    marginTop: 8,
  },

  irCatalogoButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },

  irCatalogoText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },

  // MODAL
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  modalContent: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    width: '85%',
    maxWidth: 350,
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.black,
  },

  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 2,
    backgroundColor: 'transparent',
  },

  modalOptionText: {
    fontSize: 16,
    marginLeft: 14,
    color: '#333',
  },
});