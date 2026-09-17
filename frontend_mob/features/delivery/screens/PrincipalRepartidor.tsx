// src/features/delivery/screens/PrincipalRepartidor.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../auth/context/AuthContext';
import { DistribucionController } from '../../../core/controllers/DistribucionController';
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
  latitud: number | null;
  longitud: number | null;
  estado: EstadoPedido;
  fecha: string;
  fecha_asignacion: string;
};

interface Props {
  navigation: any;
}

// Formatea una fecha ISO a un string legible
const formatearFecha = (fecha: string): string => {
  if (!fecha) return '';
  try {
    const date = new Date(fecha);
    if (isNaN(date.getTime())) return fecha;
    return date.toLocaleDateString('es-CO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return fecha;
  }
};

export const PrincipalRepartidor = ({ navigation }: Props) => {
  const { user } = useAuth();
  const distribucionController = new DistribucionController();

  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string>('TODOS');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [nombreRepartidor, setNombreRepartidor] = useState('');

  // Ubicación actual del repartidor
  const [ubicacionUsuario, setUbicacionUsuario] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);

  // Pedido cuyo mapa se está mostrando en grande
  const [pedidoMapa, setPedidoMapa] = useState<Pedido | null>(null);

  useEffect(() => {
    cargarPedidos();
    obtenerUbicacion();
  }, []);

  // ============================================================
  // OBTENER UBICACIÓN DEL REPARTIDOR
  // ============================================================

  const obtenerUbicacion = async () => {
    try {
      const { status } =
        await Location.requestForegroundPermissionsAsync();

      if (status !== 'granted') {
        Alert.alert(
          'Ubicación',
          'Necesitamos permiso de ubicación para mostrar tu posición en el mapa.'
        );
        return;
      }

      const location =
        await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });

      setUbicacionUsuario({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    } catch (error) {
      console.error(
        'Error obteniendo ubicación:',
        error
      );
    }
  };

  // ============================================================
  // CARGAR PEDIDOS DESDE LA BASE DE DATOS
  // ============================================================

  const cargarPedidos = async () => {
    try {
      setLoading(true);

      if (user?.nombre_completo) {
        setNombreRepartidor(user.nombre_completo);
      }

      const pendientes =
        await distribucionController.getPendientes();

      const enEntrega =
        await distribucionController.getEnEntrega();

      const todasLasDistribuciones = [
        ...pendientes,
        ...enEntrega,
      ];

      const pedidosMapeados: Pedido[] =
        todasLasDistribuciones.map((d: any) => {
          const pedidoData = d.pedido || {};

          const clienteData =
            pedidoData.cliente ||
            d.cliente ||
            {};

          const latitud =
            pedidoData.latitud ??
            pedidoData.latitude ??
            d.latitud ??
            d.latitude ??
            null;

          const longitud =
            pedidoData.longitud ??
            pedidoData.longitude ??
            d.longitud ??
            d.longitude ??
            null;

          return {
            id:
              Number(
                pedidoData.id_pedido ??
                d.id_pedido ??
                d.id ??
                0
              ),

            id_distribucion:
              Number(
                d.id_distribucion ??
                d.id ??
                0
              ),

            cliente:
              clienteData?.nombre ??
              pedidoData.nombre_cliente ??
              'Sin nombre',

            direccion:
              pedidoData.direccion_entrega ??
              d.direccion_entrega ??
              'Sin dirección',

            ciudad:
              pedidoData.ciudad_envio ??
              d.ciudad_envio ??
              clienteData?.ciudad ??
              'Sin ciudad',

            // El modelo ya nos da d.repartidor.nombre cuando existe
            repartidor:
              d.repartidor?.nombre ??
              (typeof d.repartidor === 'string'
                ? d.repartidor
                : '') ??
              d.repartidor_nombre ??
              '',

            // El modelo ya nos da d.repartidor.vehiculo cuando existe
            vehiculo:
              d.repartidor?.vehiculo ??
              d.vehiculo ??
              '',

            latitud:
              latitud !== null
                ? Number(latitud)
                : null,

            longitud:
              longitud !== null
                ? Number(longitud)
                : null,

            estado:
              d.estado === 'EN_ENTREGA'
                ? 'EN_ENTREGA'
                : d.estado === 'ENTREGADO'
                ? 'ENTREGADO'
                : 'PENDIENTE',

            // Fecha estimada del pedido
            fecha:
              pedidoData.fecha_estimada ??
              d.pedido?.fecha_estimada ??
              d.fecha_estimada ??
              '',

            // Fecha en la que se asignó la distribución
            fecha_asignacion:
              d.fecha_asignacion ??
              d.created_at ??
              d.fecha_creacion ??
              '',
          };
        });

      setPedidos(pedidosMapeados);
    } catch (error) {
      console.error(
        'Error al cargar pedidos:',
        error
      );

      setPedidos([]);
    } finally {
      setLoading(false);
    }
  };

  // ============================================================
  // FILTRAR PEDIDOS
  // ============================================================

  const pedidosFiltrados =
    filtro === 'TODOS'
      ? pedidos
      : pedidos.filter(
          (pedido) =>
            pedido.estado === filtro
        );

  // ============================================================
  // ESTADO DEL PEDIDO
  // ============================================================

  const getEstadoTexto = (
    estado: EstadoPedido
  ) => {
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

  const getEstadoColor = (
    estado: EstadoPedido
  ) => {
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
  // ABRIR MAPA
  // ============================================================

  const abrirMapa = (pedido: Pedido) => {
    setPedidoMapa(pedido);
  };

  const cerrarMapa = () => {
    setPedidoMapa(null);
  };

  // ============================================================
  // MARCAR PEDIDO COMO ENTREGADO
  // ============================================================

  const marcarEntregado = async (
    pedido: Pedido
  ) => {
    try {
      const result =
        await distribucionController.marcarEntregado(
          pedido.id_distribucion
        );

      if (result.success) {
        Alert.alert(
          'Éxito',
          'Pedido entregado correctamente'
        );

        await cargarPedidos();
      } else {
        Alert.alert(
          'Error',
          result.message ||
            'No se pudo marcar como entregado'
        );
      }
    } catch (error) {
      console.error(
        'Error al marcar entregado:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudo marcar como entregado'
      );
    }
  };

  // ============================================================
  // LOADING
  // ============================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Cargando pedidos...
        </Text>
      </View>
    );
  }

  // ============================================================
  // INTERFAZ
  // ============================================================

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* TÍTULO */}

        <View style={styles.titleContainer}>
          <Text style={styles.title}>
            Bienvenido
            {nombreRepartidor
              ? `, ${nombreRepartidor}`
              : ''}
          </Text>

          <Text style={styles.subtitle}>
            Estos son tus pedidos del día de hoy
          </Text>
        </View>

        {/* FILTROS */}

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={
            styles.filtrosContainer
          }
        >
          {[
            'TODOS',
            'PENDIENTE',
            'EN_ENTREGA',
            'ENTREGADO',
          ].map((tipo) => (
            <TouchableOpacity
              key={tipo}
              style={[
                styles.filtro,
                filtro === tipo &&
                  styles.filtroActivo,
              ]}
              onPress={() =>
                setFiltro(tipo)
              }
            >
              <Text
                style={[
                  styles.filtroTexto,
                  filtro === tipo &&
                    styles.filtroTextoActivo,
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
              <Ionicons
                name="file-tray-outline"
                size={50}
                color="#999"
              />

              <Text
                style={styles.sinPedidosTitulo}
              >
                No hay pedidos
              </Text>

              <Text
                style={styles.sinPedidosTexto}
              >
                No hay pedidos para el filtro
                seleccionado.
              </Text>
            </View>
          ) : (
            pedidosFiltrados.map((pedido) => (
              <View
                key={pedido.id_distribucion}
                style={styles.cardPedido}
              >
                {/* ================================================= */}
                {/* MAPA */}
                {/* ================================================= */}

                <TouchableOpacity
                  activeOpacity={0.9}
                  onPress={() =>
                    abrirMapa(pedido)
                  }
                >
                  <View
                    style={
                      styles.mapaContainer
                    }
                  >
                    {pedido.latitud !== null &&
                    pedido.longitud !== null ? (
                      <MapView
                        style={styles.mapa}
                        initialRegion={{
                          latitude:
                            pedido.latitud,
                          longitude:
                            pedido.longitud,
                          latitudeDelta: 0.01,
                          longitudeDelta: 0.01,
                        }}
                        scrollEnabled={false}
                        zoomEnabled={false}
                        rotateEnabled={false}
                        pitchEnabled={false}
                        showsUserLocation={
                          true
                        }
                        showsMyLocationButton={
                          false
                        }
                      >
                        <Marker
                          coordinate={{
                            latitude:
                              pedido.latitud,
                            longitude:
                              pedido.longitud,
                          }}
                          title="Lugar de entrega"
                          description={`${pedido.direccion}, ${pedido.ciudad}`}
                        />
                      </MapView>
                    ) : (
                      <View
                        style={
                          styles.mapaSinUbicacion
                        }
                      >
                        <Ionicons
                          name="map-outline"
                          size={42}
                          color="#999"
                        />

                        <Text
                          style={
                            styles.mapaSinUbicacionTexto
                          }
                        >
                          Ubicación de entrega
                          no disponible
                        </Text>
                      </View>
                    )}

                    {/* ETIQUETA */}

                    <View
                      style={
                        styles.mapaEtiqueta
                      }
                    >
                      <Ionicons
                        name="location"
                        size={15}
                        color={COLORS.primary}
                      />

                      <Text
                        style={
                          styles.mapaEtiquetaTexto
                        }
                      >
                        Ubicación de entrega
                      </Text>
                    </View>

                    {/* BOTÓN PARA VER MAPA */}

                    <View
                      style={styles.mapaAbrir}
                    >
                      <Ionicons
                        name="expand-outline"
                        size={19}
                        color={COLORS.primary}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                {/* ================================================= */}
                {/* INFORMACIÓN DEL PEDIDO */}
                {/* ================================================= */}

                <View
                  style={styles.pedidoContent}
                >
                  {/* CABECERA */}

                  <View
                    style={
                      styles.pedidoHeader
                    }
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={
                          styles.pedidoTitulo
                        }
                      >
                        Pedido #{pedido.id}
                      </Text>

                      {pedido.fecha_asignacion ? (
                        <View
                          style={styles.fechaRow}
                        >
                          <Ionicons
                            name="calendar-outline"
                            size={12}
                            color="#999"
                          />
                          <Text
                            style={
                              styles.fechaPequena
                            }
                          >
                            Asignado:{' '}
                            {formatearFecha(
                              pedido.fecha_asignacion
                            )}
                          </Text>
                        </View>
                      ) : null}

                      {pedido.fecha ? (
                        <View
                          style={styles.fechaRow}
                        >
                          <Ionicons
                            name="time-outline"
                            size={12}
                            color="#999"
                          />
                          <Text
                            style={
                              styles.fechaPequena
                            }
                          >
                            Entrega estimada:{' '}
                            {pedido.fecha}
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    <View
                      style={[
                        styles.estadoContainer,
                        {
                          backgroundColor:
                            pedido.estado ===
                            'ENTREGADO'
                              ? '#E8F5E9'
                              : pedido.estado ===
                                'PENDIENTE'
                              ? '#FFF4E5'
                              : '#FDEEEE',
                        },
                      ]}
                    >
                      <Ionicons
                        name={getEstadoIcon(
                          pedido.estado
                        )}
                        size={16}
                        color={getEstadoColor(
                          pedido.estado
                        )}
                      />

                      <Text
                        style={[
                          styles.estadoTexto,
                          {
                            color:
                              getEstadoColor(
                                pedido.estado
                              ),
                          },
                        ]}
                      >
                        {getEstadoTexto(
                          pedido.estado
                        )}
                      </Text>
                    </View>
                  </View>

                  {/* CLIENTE */}

                  <View style={styles.infoRow}>
                    <View
                      style={styles.iconoInfo}
                    >
                      <Ionicons
                        name="person-outline"
                        size={19}
                        color={COLORS.primary}
                      />
                    </View>

                    <View
                      style={
                        styles.infoTextoContainer
                      }
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        Cliente
                      </Text>

                      <Text
                        style={
                          styles.infoTexto
                        }
                      >
                        {pedido.cliente}
                      </Text>
                    </View>
                  </View>

                  {/* DIRECCIÓN */}

                  <View style={styles.infoRow}>
                    <View
                      style={styles.iconoInfo}
                    >
                      <Ionicons
                        name="location-outline"
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>

                    <View
                      style={
                        styles.infoTextoContainer
                      }
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        Dirección de entrega
                      </Text>

                      <Text
                        style={
                          styles.infoTexto
                        }
                      >
                        {pedido.direccion}
                      </Text>

                      <Text
                        style={styles.ciudad}
                      >
                        {pedido.ciudad}
                      </Text>
                    </View>
                  </View>

                  {/* REPARTIDOR */}

                  <View style={styles.infoRow}>
                    <View
                      style={styles.iconoInfo}
                    >
                      <Ionicons
                        name="person-circle-outline"
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>

                    <View
                      style={
                        styles.infoTextoContainer
                      }
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        Repartidor
                      </Text>

                      <Text
                        style={
                          styles.infoTexto
                        }
                      >
                        {pedido.repartidor ||
                          'No asignado'}
                      </Text>
                    </View>
                  </View>

                  {/* VEHÍCULO */}

                  <View style={styles.infoRow}>
                    <View
                      style={styles.iconoInfo}
                    >
                      <Ionicons
                        name="bicycle-outline"
                        size={20}
                        color={COLORS.primary}
                      />
                    </View>

                    <View
                      style={
                        styles.infoTextoContainer
                      }
                    >
                      <Text
                        style={
                          styles.infoLabel
                        }
                      >
                        Vehículo
                      </Text>

                      <Text
                        style={
                          styles.infoTexto
                        }
                      >
                        {pedido.vehiculo ||
                          'No especificado'}
                      </Text>
                    </View>
                  </View>

                  {/* ================================================= */}
                  {/* VER DETALLE */}
                  {/* ================================================= */}

                  <TouchableOpacity
                    style={styles.btnPedido}
                    onPress={() => {
                      // La navegación será conectada
                      // posteriormente.
                    }}
                  >
                    <Ionicons
                      name="eye-outline"
                      size={20}
                      color="#fff"
                    />

                    <Text
                      style={
                        styles.btnPedidoTexto
                      }
                    >
                      Ver detalle
                    </Text>
                  </TouchableOpacity>

                  {/* ================================================= */}
                  {/* MARCAR ENTREGADO */}
                  {/* ================================================= */}

                  {pedido.estado ===
                    'EN_ENTREGA' && (
                    <TouchableOpacity
                      style={
                        styles.btnEntregado
                      }
                      onPress={() =>
                        marcarEntregado(
                          pedido
                        )
                      }
                    >
                      <Ionicons
                        name="checkmark-outline"
                        size={20}
                        color="#fff"
                      />

                      <Text
                        style={
                          styles.btnPedidoTexto
                        }
                      >
                        Marcar entregado
                      </Text>
                    </TouchableOpacity>
                  )}

                  {/* PEDIDO ENTREGADO */}

                  {pedido.estado ===
                    'ENTREGADO' && (
                    <View
                      style={
                        styles.entregadoContainer
                      }
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#008000"
                      />

                      <Text
                        style={
                          styles.entregadoTexto
                        }
                      >
                        Pedido entregado
                      </Text>
                    </View>
                  )}
                </View>
              </View>
            ))
          )}
        </View>
      </ScrollView>

      {/* ========================================================= */}
      {/* MAPA GRANDE */}
      {/* ========================================================= */}

      <Modal
        visible={pedidoMapa !== null}
        animationType="slide"
        transparent={false}
        onRequestClose={cerrarMapa}
      >
        <View
          style={styles.modalContainer}
        >
          {/* CABECERA */}

          <View
            style={styles.modalHeader}
          >
            <View style={{ flex: 1 }}>
              <Text
                style={styles.modalTitulo}
              >
                Ubicación de entrega
              </Text>

              {pedidoMapa && (
                <Text
                  style={
                    styles.modalDireccion
                  }
                >
                  {pedidoMapa.direccion},{' '}
                  {pedidoMapa.ciudad}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={
                styles.botonCerrarMapa
              }
              onPress={cerrarMapa}
            >
              <Ionicons
                name="close"
                size={25}
                color="#333"
              />
            </TouchableOpacity>
          </View>

          {/* MAPA */}

          {pedidoMapa &&
          pedidoMapa.latitud !== null &&
          pedidoMapa.longitud !== null ? (
            <MapView
              style={styles.mapaGrande}
              initialRegion={{
                latitude: ubicacionUsuario
                  ? ubicacionUsuario.latitude
                  : pedidoMapa.latitud,

                longitude: ubicacionUsuario
                  ? ubicacionUsuario.longitude
                  : pedidoMapa.longitud,

                latitudeDelta: 0.03,
                longitudeDelta: 0.03,
              }}
              showsUserLocation={true}
              showsMyLocationButton={true}
              zoomEnabled={true}
              scrollEnabled={true}
              rotateEnabled={true}
              pitchEnabled={true}
            >
              {/* MARCADOR DE ENTREGA */}

              <Marker
                coordinate={{
                  latitude:
                    pedidoMapa.latitud,
                  longitude:
                    pedidoMapa.longitud,
                }}
                title="Lugar de entrega"
                description={`${pedidoMapa.direccion}, ${pedidoMapa.ciudad}`}
              />

              {/* MARCADOR DEL REPARTIDOR */}

              {ubicacionUsuario && (
                <Marker
                  coordinate={{
                    latitude:
                      ubicacionUsuario.latitude,
                    longitude:
                      ubicacionUsuario.longitude,
                  }}
                  title="Mi ubicación"
                  description="Ubicación actual del repartidor"
                >
                  <View
                    style={
                      styles.markerUsuario
                    }
                  >
                    <Ionicons
                      name="navigate"
                      size={18}
                      color="#fff"
                    />
                  </View>
                </Marker>
              )}
            </MapView>
          ) : (
            <View
              style={
                styles.mapaGrandeSinUbicacion
              }
            >
              <Ionicons
                name="map-outline"
                size={65}
                color="#999"
              />

              <Text
                style={
                  styles.mapaGrandeSinTitulo
                }
              >
                Ubicación de entrega no disponible
              </Text>

              <Text
                style={
                  styles.mapaGrandeSinTexto
                }
              >
                Este pedido todavía no tiene
                coordenadas disponibles.
              </Text>

              {ubicacionUsuario && (
                <Text
                  style={
                    styles.mapaGrandeUbicacion
                  }
                >
                  Tu ubicación está disponible,
                  pero falta la ubicación de la
                  entrega.
                </Text>
              )}
            </View>
          )}

          {/* INFORMACIÓN DEL MAPA */}

          {pedidoMapa && (
            <View
              style={styles.modalInfo}
            >
              {/* MI UBICACIÓN */}

              <View
                style={styles.modalInfoFila}
              >
                <View
                  style={[
                    styles.puntoMapa,
                    styles.puntoUsuario,
                  ]}
                />

                <View
                  style={
                    styles.modalInfoTexto
                  }
                >
                  <Text
                    style={
                      styles.modalInfoTitulo
                    }
                  >
                    Mi ubicación
                  </Text>

                  <Text
                    style={
                      styles.modalInfoDescripcion
                    }
                  >
                    {ubicacionUsuario
                      ? 'Ubicación actual del repartidor'
                      : 'Ubicación no disponible'}
                  </Text>
                </View>
              </View>

              {/* ENTREGA */}

              <View
                style={styles.modalInfoFila}
              >
                <View
                  style={[
                    styles.puntoMapa,
                    styles.puntoEntrega,
                  ]}
                />

                <View
                  style={
                    styles.modalInfoTexto
                  }
                >
                  <Text
                    style={
                      styles.modalInfoTitulo
                    }
                  >
                    Lugar de entrega
                  </Text>

                  <Text
                    style={
                      styles.modalInfoDescripcion
                    }
                  >
                    {pedidoMapa.direccion},{' '}
                    {pedidoMapa.ciudad}
                  </Text>
                </View>
              </View>
            </View>
          )}
        </View>
      </Modal>
    </>
  );
};

// ================================================================
// ESTILOS
// ================================================================

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
    shadowOffset: {
      width: 0,
      height: 3,
    },
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

  mapaSinUbicacion: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E9ECEF',
  },

  mapaSinUbicacionTexto: {
    marginTop: 8,
    fontSize: 13,
    color: '#777',
    fontWeight: '600',
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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

  mapaAbrir: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
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

  fechaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 3,
  },

  fechaPequena: {
    fontSize: 11,
    color: '#999',
  },

  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 15,
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

  ciudad: {
    fontSize: 12,
    color: '#777',
    marginTop: 3,
  },

  btnPedido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 9,
    marginTop: 5,
  },

  btnEntregado: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#008000',
    paddingVertical: 13,
    borderRadius: 9,
    marginTop: 10,
  },

  btnPedidoTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  entregadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: '#E8F5E9',
    paddingVertical: 13,
    borderRadius: 9,
    marginTop: 10,
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

  // ============================================================
  // MODAL MAPA
  // ============================================================

  modalContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },

  modalHeader: {
    minHeight: 85,
    paddingHorizontal: 18,
    paddingTop: 45,
    paddingBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },

  modalTitulo: {
    fontSize: 19,
    fontWeight: 'bold',
    color: '#222',
  },

  modalDireccion: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
    maxWidth: 280,
  },

  botonCerrarMapa: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F1F1F1',
    alignItems: 'center',
    justifyContent: 'center',
  },

  mapaGrande: {
    flex: 1,
    width: '100%',
  },

  markerUsuario: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 3,
    borderColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },

  mapaGrandeSinUbicacion: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
    backgroundColor: '#F4F6F9',
  },

  mapaGrandeSinTitulo: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#444',
    marginTop: 15,
    textAlign: 'center',
  },

  mapaGrandeSinTexto: {
    fontSize: 14,
    color: '#777',
    marginTop: 8,
    textAlign: 'center',
  },

  mapaGrandeUbicacion: {
    fontSize: 13,
    color: COLORS.primary,
    marginTop: 15,
    textAlign: 'center',
  },

  modalInfo: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },

  modalInfoFila: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  puntoMapa: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 12,
  },

  puntoUsuario: {
    backgroundColor: COLORS.primary,
  },

  puntoEntrega: {
    backgroundColor: '#D32F2F',
  },

  modalInfoTexto: {
    flex: 1,
  },

  modalInfoTitulo: {
    fontSize: 13,
    fontWeight: '700',
    color: '#333',
  },

  modalInfoDescripcion: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },
});