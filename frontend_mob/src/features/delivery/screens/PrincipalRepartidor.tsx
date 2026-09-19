// src/features/delivery/screens/PrincipalRepartidor.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Linking,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { DistribucionController } from '../../../core/controllers/DistribucionController';
import { DistribucionModel } from '../../../core/models/DistribucionModel';
import { COLORS } from '../../../shared/constants/colors';

type EstadoPedido = 'PENDIENTE' | 'EN_ENTREGA' | 'ENTREGADO';

type Pedido = {
  id: number;
  id_distribucion: number;
  cliente: string;
  direccion: string;
  ciudad: string;
  repartidor: string;
  vehiculo: string;
  latitud?: number;
  longitud?: number;
  estado: EstadoPedido;
  fecha: string;
  telefono?: string;
  fecha_estimada?: string;
};

interface Props {
  navigation: any;
}

export const PrincipalRepartidor = ({ navigation }: Props) => {

  const distribucionController = new DistribucionController();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filtro, setFiltro] = useState<string>('TODOS');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [nombreRepartidor, setNombreRepartidor] = useState('Repartidor');
  const [vehiculoRepartidor, setVehiculoRepartidor] = useState('No asignado');

  // ============================================================
  // CARGAR DISTRIBUCIONES DEL REPARTIDOR
  // ============================================================

  const cargarPedidos = useCallback(async () => {
    try {
      setLoading(true);

      const distribuciones =
        await distribucionController.getMisDistribuciones();

      console.log(
        'DISTRIBUCIONES DEL REPARTIDOR:',
        JSON.stringify(distribuciones, null, 2)
      );

      if (
        !distribuciones ||
        !Array.isArray(distribuciones) ||
        distribuciones.length === 0
      ) {
        setPedidos([]);
        return;
      }

      const pedidosMapeados: Pedido[] = distribuciones
        .filter((d: DistribucionModel) => d.estado !== 'CANCELADO')
        .map((d: DistribucionModel) => {
          const cliente = d.pedido?.cliente?.nombre || 'Cliente';
          const telefono = d.pedido?.cliente?.telefono || '';
          const direccion = d.pedido?.direccion_entrega || '';
          const ciudad = d.pedido?.ciudad_envio || '';
          const repartidor = d.repartidor?.nombre || 'Repartidor';
          const vehiculo = d.repartidor?.vehiculo || 'No asignado';
          const fechaEstimada = d.pedido?.fecha_estimada || '';

          // Fecha
          let fechaMostrar = 'Sin fecha';
          if (fechaEstimada) {
            try {
              const fecha = new Date(fechaEstimada);
              if (!isNaN(fecha.getTime())) {
                fechaMostrar = fecha.toLocaleDateString('es-CO', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                });
              } else {
                fechaMostrar = fechaEstimada;
              }
            } catch {
              fechaMostrar = fechaEstimada;
            }
          }

          const latitudRaw = (d as any).latitud ?? (d as any).latitude;
          const longitudRaw = (d as any).longitud ?? (d as any).longitude;

          const latitud = latitudRaw ? Number(latitudRaw) : NaN;
          const longitud = longitudRaw ? Number(longitudRaw) : NaN;

          // Estado
          let estado: EstadoPedido = 'PENDIENTE';
          if (d.estado === 'EN_ENTREGA') estado = 'EN_ENTREGA';
          else if (d.estado === 'ENTREGADO') estado = 'ENTREGADO';

          return {
            id: Number(d.id_pedido || d.id_distribucion || 0),
            id_distribucion: Number(d.id_distribucion || 0),
            cliente,
            direccion,
            ciudad,
            repartidor,
            vehiculo,
            latitud,
            longitud,
            estado,
            fecha: fechaMostrar,
            telefono,
            fecha_estimada: fechaEstimada,
          };
        });

      console.log(
        'PEDIDOS MAPEADOS:',
        JSON.stringify(pedidosMapeados, null, 2)
      );

      if (pedidosMapeados.length > 0) {
        setNombreRepartidor(pedidosMapeados[0].repartidor);
        setVehiculoRepartidor(pedidosMapeados[0].vehiculo);
      }

      setPedidos(pedidosMapeados);
    } catch (error) {
      console.error('Error al cargar datos del repartidor:', error);
      setPedidos([]);
      Alert.alert('Error', 'No se pudieron cargar las entregas asignadas.');
    } finally {
      setLoading(false);
    }
  }, []);

  // ============================================================
  // CARGA INICIAL
  // ============================================================

  useEffect(() => {
    cargarPedidos();
  }, [cargarPedidos]);

  // ============================================================
  // ACTUALIZAR
  // ============================================================

  const actualizarPedidos = async () => {
    try {
      setRefreshing(true);
      await cargarPedidos();
    } finally {
      setRefreshing(false);
    }
  };

  // ============================================================
  // ABRIR DETALLE
  // ============================================================

  const verDetalleDistribucion = (pedido: Pedido) => {
    if (!pedido.id_distribucion) {
      Alert.alert('Error', 'No se encontró el ID de la distribución.');
      return;
    }
    navigation.navigate('DetalleEntrega', {
      id_distribucion: pedido.id_distribucion,
    });
  };

  // ============================================================
  // ABRIR GOOGLE MAPS
  // ============================================================

  const abrirRutaEnMaps = async (pedido: Pedido) => {
    const tieneCoords =
      Number.isFinite(pedido.latitud) && Number.isFinite(pedido.longitud);

    const destino = tieneCoords
      ? `${pedido.latitud},${pedido.longitud}`
      : `${pedido.direccion || ''}, ${pedido.ciudad || ''}, Colombia`;

    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destino)}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert('Error', 'No se pudo abrir Google Maps.');
    }
  };

  // ============================================================
  // FILTRAR
  // ============================================================

  const pedidosFiltrados =
    filtro === 'TODOS'
      ? pedidos
      : pedidos.filter((pedido) => pedido.estado === filtro);

  // ============================================================
  // HELPERS ESTADO
  // ============================================================

  const getEstadoTexto = (estado: EstadoPedido) => {
    switch (estado) {
      case 'PENDIENTE':
        return 'Pendiente';
      case 'EN_ENTREGA':
        return 'En entrega';
      case 'ENTREGADO':
        return 'Entregado';
      default:
        return estado;
    }
  };

  const getEstadoIcon = (
    estado: EstadoPedido
  ): keyof typeof Ionicons.glyphMap => {
    switch (estado) {
      case 'PENDIENTE':
        return 'time-outline';
      case 'EN_ENTREGA':
        return 'bicycle-outline';
      case 'ENTREGADO':
        return 'checkmark-circle-outline';
      default:
        return 'information-circle-outline';
    }
  };

  const getEstadoColor = (estado: EstadoPedido) => {
    switch (estado) {
      case 'PENDIENTE':
        return '#D97706';
      case 'EN_ENTREGA':
        return COLORS.primary;
      case 'ENTREGADO':
        return '#008000';
      default:
        return '#777';
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando pedidos...</Text>
      </View>
    );
  }

  // ============================================================
  // INTERFAZ
  // ============================================================

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={actualizarPedidos}
          colors={[COLORS.primary]}
          tintColor={COLORS.primary}
        />
      }
    >
      {/* ENCABEZADO */}
      <View style={styles.titleContainer}>
        <Text style={styles.title}>Bienvenido, {nombreRepartidor}</Text>
        <Text style={styles.subtitle}>
          Estos son tus pedidos del día de hoy
        </Text>
      </View>

      {/* INFORMACIÓN DEL REPARTIDOR */}
      <View style={styles.repartidorCard}>
        <View style={styles.repartidorIcon}>
          <Ionicons name="person-outline" size={24} color={COLORS.primary} />
        </View>

        <View style={styles.repartidorInfo}>
          <Text style={styles.repartidorLabel}>Repartidor</Text>
          <Text style={styles.repartidorNombre}>{nombreRepartidor}</Text>
        </View>

        <View style={styles.vehiculoInfo}>
          <Ionicons name="car-outline" size={22} color={COLORS.primary} />
          <View style={{ marginLeft: 8, flexShrink: 1 }}>
            <Text style={styles.repartidorLabel}>Vehículo</Text>
            <Text style={styles.vehiculoTexto} numberOfLines={3}>
              {vehiculoRepartidor}
            </Text>
          </View>
        </View>
      </View>

      {/* FILTROS */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtrosContainer}
      >
        {['TODOS', 'PENDIENTE', 'EN_ENTREGA', 'ENTREGADO'].map((tipo) => (
          <TouchableOpacity
            key={tipo}
            style={[styles.filtro, filtro === tipo && styles.filtroActivo]}
            onPress={() => setFiltro(tipo)}
          >
            <Text
              style={[
                styles.filtroTexto,
                filtro === tipo && styles.filtroTextoActivo,
              ]}
            >
              {tipo === 'TODOS'
                ? 'Todos'
                : tipo === 'PENDIENTE'
                ? 'Pendientes'
                : tipo === 'EN_ENTREGA'
                ? 'En entrega'
                : 'Entregados'}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* LISTA */}
      <View style={styles.pedidosContainer}>
        {pedidosFiltrados.length === 0 ? (
          <View style={styles.sinPedidos}>
            <Ionicons name="file-tray-outline" size={50} color="#999" />
            <Text style={styles.sinPedidosTitulo}>No hay pedidos</Text>
            <Text style={styles.sinPedidosTexto}>
              No hay pedidos para el filtro seleccionado.
            </Text>
          </View>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <View key={pedido.id_distribucion} style={styles.cardPedido}>
              {/* MAPA COMO BOTÓN */}
              <TouchableOpacity
                style={styles.mapaContainer}
                activeOpacity={0.85}
                onPress={() => abrirRutaEnMaps(pedido)}
              >
                {Number.isFinite(pedido.latitud) && Number.isFinite(pedido.longitud) ? (
                  <MapView
                    style={styles.mapa}
                    pointerEvents="none"
                    initialRegion={{
                      latitude: pedido.latitud!,
                      longitude: pedido.longitud!,
                      latitudeDelta: 0.01,
                      longitudeDelta: 0.01,
                    }}
                    scrollEnabled={false}
                    zoomEnabled={false}
                    rotateEnabled={false}
                    pitchEnabled={false}
                    liteMode={true}
                  >
                    <Marker
                      coordinate={{
                        latitude: pedido.latitud!,
                        longitude: pedido.longitud!,
                      }}
                      title={pedido.cliente}
                      description={`${pedido.direccion}, ${pedido.ciudad}`}
                    />
                  </MapView>
                ) : (
                  <View style={styles.mapaPlaceholder}>
                    <Ionicons name="location-outline" size={40} color={COLORS.primary} />
                    <Text style={styles.mapaPlaceholderTexto}>
                      {pedido.direccion || 'Sin dirección'}
                    </Text>
                    <Text style={styles.mapaPlaceholderCiudad}>
                      {pedido.ciudad || 'Sin ciudad'}
                    </Text>
                  </View>
                )}

                <View style={styles.mapaEtiqueta} pointerEvents="none">
                  <Ionicons name="location" size={15} color={COLORS.primary} />
                  <Text style={styles.mapaEtiquetaTexto}>Toca para ver la ruta</Text>
                </View>
              </TouchableOpacity>

              {/* CONTENIDO */}
              <View style={styles.pedidoContent}>
                <View style={styles.pedidoHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.pedidoTitulo}>Distribución #{pedido.id_distribucion}</Text>
                    <Text style={styles.fechaPequena}>
                      Fecha estimada: {pedido.fecha}
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.estadoContainer,
                      {
                        backgroundColor:
                          pedido.estado === 'ENTREGADO'
                            ? '#E8F5E9'
                            : pedido.estado === 'PENDIENTE'
                            ? '#FFF4E5'
                            : '#EAF2FF',
                      },
                    ]}
                  >
                    <Ionicons
                      name={getEstadoIcon(pedido.estado)}
                      size={16}
                      color={getEstadoColor(pedido.estado)}
                    />
                    <Text
                      style={[
                        styles.estadoTexto,
                        { color: getEstadoColor(pedido.estado) },
                      ]}
                    >
                      {getEstadoTexto(pedido.estado)}
                    </Text>
                  </View>
                </View>

                {/* CLIENTE */}
                <View style={styles.infoRow}>
                  <View style={styles.iconoInfo}>
                    <Ionicons
                      name="person-outline"
                      size={19}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.infoTextoContainer}>
                    <Text style={styles.infoLabel}>Cliente</Text>
                    <Text style={styles.infoTexto}>{pedido.cliente}</Text>
                    {pedido.telefono ? (
                      <Text style={styles.infoSecundario}>
                        {pedido.telefono}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* DIRECCIÓN */}
                <View style={styles.infoRow}>
                  <View style={styles.iconoInfo}>
                    <Ionicons
                      name="location-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.infoTextoContainer}>
                    <Text style={styles.infoLabel}>Dirección de entrega</Text>
                    <Text style={styles.infoTexto}>
                      {pedido.direccion || 'Sin dirección'}
                    </Text>
                    <Text style={styles.ciudad}>
                      {pedido.ciudad || 'Sin ciudad'}
                    </Text>
                  </View>
                </View>

                {/* REPARTIDOR */}
                <View style={styles.infoRow}>
                  <View style={styles.iconoInfo}>
                    <Ionicons
                      name="person-circle-outline"
                      size={21}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.infoTextoContainer}>
                    <Text style={styles.infoLabel}>Repartidor</Text>
                    <Text style={styles.infoTexto}>
                      {pedido.repartidor || 'No asignado'}
                    </Text>
                  </View>
                </View>

                {/* VEHÍCULO */}
                <View style={styles.infoRow}>
                  <View style={styles.iconoInfo}>
                    <Ionicons
                      name="car-outline"
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.infoTextoContainer}>
                    <Text style={styles.infoLabel}>Vehículo</Text>
                    <Text style={styles.infoTexto}>
                      {pedido.vehiculo || 'No asignado'}
                    </Text>
                  </View>
                </View>

                {/* BOTÓN DETALLE */}
                <TouchableOpacity
                  style={styles.detalleButton}
                  onPress={() => verDetalleDistribucion(pedido)}
                  activeOpacity={0.8}
                >
                  <Ionicons name="eye-outline" size={18} color={COLORS.primary} />
                  <Text style={styles.detalleButtonText}>Ver detalle</Text>
                </TouchableOpacity>

                {/* ENTREGADO */}
                {pedido.estado === 'ENTREGADO' && (
                  <View style={styles.entregadoContainer}>
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#008000"
                    />
                    <Text style={styles.entregadoTexto}>Pedido entregado</Text>
                  </View>
                )}
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
};

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },

  scrollContent: {
    paddingBottom: 40,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F4F6F9',
  },

  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },

  titleContainer: {
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 18,
  },

  title: {
    fontSize: 27,
    fontWeight: 'bold',
    color: '#171717',
  },

  subtitle: {
    fontSize: 15,
    color: '#666',
    marginTop: 6,
  },

  repartidorCard: {
    marginHorizontal: 20,
    marginBottom: 18,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  repartidorIcon: {
    width: 45,
    height: 45,
    borderRadius: 23,
    backgroundColor: '#FDEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  repartidorInfo: {
    flex: 1,
    marginLeft: 12,
  },

  repartidorLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 3,
  },

  repartidorNombre: {
    fontSize: 15,
    fontWeight: '700',
    color: '#333',
  },

  vehiculoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 160,
  },

  vehiculoTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#333',
  },

  filtrosContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 10,
  },

  filtro: {
    paddingHorizontal: 17,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: '#E8E8E8',
  },

  filtroActivo: {
    backgroundColor: '#802828',
  },

  filtroTexto: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },

  filtroTextoActivo: {
    color: '#fff',
    fontWeight: '600',
  },

  pedidosContainer: {
    paddingHorizontal: 20,
    gap: 20,
  },

  cardPedido: {
    backgroundColor: '#fff',
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 7,
    elevation: 4,
  },

  mapaContainer: {
    height: 180,
    width: '100%',
    position: 'relative',
  },

  mapa: {
    width: '100%',
    height: '100%',
  },

  mapaEtiqueta: {
    position: 'absolute',
    left: 12,
    top: 12,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  mapaEtiquetaTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: '#333',
    marginLeft: 5,
  },

  pedidoContent: {
    padding: 17,
  },

  pedidoHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 17,
  },

  pedidoTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },

  fechaPequena: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },

  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 15,
    marginLeft: 8,
  },

  estadoTexto: {
    fontSize: 11,
    fontWeight: '600',
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },

  iconoInfo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoTextoContainer: {
    marginLeft: 10,
    flex: 1,
  },

  infoLabel: {
    fontSize: 11,
    color: '#999',
    marginBottom: 3,
  },

  infoTexto: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },

  infoSecundario: {
    fontSize: 12,
    color: '#777',
    marginTop: 3,
  },

  ciudad: {
    fontSize: 12,
    color: '#777',
    marginTop: 3,
  },

  detalleButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 9,
    paddingVertical: 10,
    marginTop: 14,
    gap: 7,
  },

  detalleButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '700',
  },

  entregadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#E8F5E9',
    paddingVertical: 13,
    borderRadius: 9,
    marginTop: 16,
  },

  entregadoTexto: {
    color: '#008000',
    fontSize: 14,
    fontWeight: '600',
  },

  sinPedidos: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 50,
    paddingHorizontal: 20,
  },

  sinPedidosTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 12,
  },

  sinPedidosTexto: {
    fontSize: 14,
    color: '#777',
    marginTop: 5,
    textAlign: 'center',
  },

  mapaPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#F4F6F9',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  mapaPlaceholderTexto: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },

  mapaPlaceholderCiudad: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    textAlign: 'center',
  },
});