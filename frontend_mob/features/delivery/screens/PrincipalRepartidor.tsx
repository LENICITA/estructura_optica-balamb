// src/features/delivery/screens/PrincipalRepartidor.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
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
  latitud: number;
  longitud: number;
  estado: EstadoPedido;
  fecha: string;
};

interface Props {
  navigation: any;
}

export const PrincipalRepartidor = ({ navigation }: Props) => {
  const { user } = useAuth();
  const distribucionController = new DistribucionController();

  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<string>('TODOS');
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [nombreRepartidor, setNombreRepartidor] = useState('Repartidor');

  useEffect(() => {
    cargarPedidos();
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);

      if (user?.nombre_completo) {
        setNombreRepartidor(user.nombre_completo);
      }

      try {
        const pendientes = await distribucionController.getPendientes();
        const enEntrega = await distribucionController.getEnEntrega();

        const todasLasDistribuciones = [
          ...pendientes,
          ...enEntrega,
        ];

        if (
          todasLasDistribuciones &&
          todasLasDistribuciones.length > 0
        ) {
        const pedidosMapeados = todasLasDistribuciones.map(
            (d: any) => {
              const pedidoData = d.pedido || {};


              const direccionReal =
                pedidoData.direccion_entrega ||
                d.direccion_entrega ||
                'Sin dirección';

              const ciudadReal =
                pedidoData.ciudad_envio ||
                d.ciudad_envio ||
                'Sin ciudad';

                

              return {
                id: Number(
                  pedidoData.id_pedido ||
                  d.id_pedido ||
                  d.id ||
                  0
                ),

                id_distribucion: Number(
                  d.id_distribucion ||
                  d.id ||
                  0
                ),

                cliente:
                  pedidoData.cliente?.nombre ||
                  pedidoData.cliente ||
                  d.cliente?.nombre ||
                  'Cliente',

                direccion: direccionReal,

                ciudad: ciudadReal,

                latitud: 4.703215,
                longitud: -74.103664,

                estado:
                  d.estado === 'EN_ENTREGA'
                    ? 'EN_ENTREGA'
                    : 'PENDIENTE',

                fecha:
                  pedidoData.fecha_estimada ||
                  new Date().toLocaleDateString(),
              };
            }
          );

          setPedidos(pedidosMapeados);
        } else {
          setPedidos([]);
        }
      } catch (error) {
        console.log(
          'Error al cargar pedidos:',
          error
        );

        setPedidos([]);
      }
    } catch (error) {
      console.error(
        'Error al cargar datos del repartidor:',
        error
      );
    } finally {
      setLoading(false);
    }
  };

  /*
   * ABRIR GOOGLE MAPS CON LA DIRECCIÓN REAL
   *
   * Cada pedido tiene su propia:
   *
   * direccion
   * ciudad
   *
   * Por ejemplo:
   *
   * Calle 84 bis # 91a - 08, Bogotá
   *
   * Google Maps recibe esa dirección y abre la ruta.
   */
  const abrirRuta = async (
    direccion: string,
    ciudad: string
  ) => {
    try {
      if (
        !direccion ||
        direccion.trim() === '' ||
        direccion === 'Sin dirección'
      ) {
        Alert.alert(
          'Dirección no disponible',
          'Este pedido no tiene una dirección de entrega registrada.'
        );
        return;
      }

      const direccionCompleta =
        `${direccion}, ${ciudad}`;

      /*
       * Google Maps Directions API.
       *
       * destination recibe TEXTO, no coordenadas.
       * Por eso cada pedido puede abrir una dirección diferente.
       */
      const url =
        `https://www.google.com/maps/dir/?api=1` +
        `&destination=${encodeURIComponent(
          direccionCompleta
        )}`;

      console.log(
        'Abriendo Google Maps:',
        direccionCompleta
      );

      await Linking.openURL(url);
    } catch (error) {
      console.error(
        'Error al abrir Google Maps:',
        error
      );

      Alert.alert(
        'Error',
        'No fue posible abrir Google Maps.'
      );
    }
  };

  const pedidosFiltrados =
    filtro === 'TODOS'
      ? pedidos
      : pedidos.filter(
          (pedido) =>
            pedido.estado === filtro
        );

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

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.titleContainer}>
        <Text style={styles.title}>
          Bienvenido, {nombreRepartidor}
        </Text>

        <Text style={styles.subtitle}>
          Estos son tus pedidos del día de hoy
        </Text>
      </View>

      {/* FILTROS */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtrosContainer}
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
            onPress={() => setFiltro(tipo)}
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

      {/* LISTA DE PEDIDOS */}

      <View style={styles.pedidosContainer}>
        {pedidosFiltrados.length === 0 ? (
          <View style={styles.sinPedidos}>
            <Ionicons
              name="file-tray-outline"
              size={50}
              color="#999"
            />

            <Text style={styles.sinPedidosTitulo}>
              No hay pedidos
            </Text>

            <Text style={styles.sinPedidosTexto}>
              No hay pedidos para el filtro seleccionado.
            </Text>
          </View>
        ) : (
          pedidosFiltrados.map((pedido) => (
            <View
              key={pedido.id_distribucion}
              style={styles.cardPedido}
            >
              {/* MAPA */}

              <View style={styles.mapaContainer}>
                <MapView
                  style={styles.mapa}
                  initialRegion={{
                    latitude: pedido.latitud,
                    longitude: pedido.longitud,
                    latitudeDelta: 0.01,
                    longitudeDelta: 0.01,
                  }}
                  scrollEnabled={false}
                  zoomEnabled={false}
                  rotateEnabled={false}
                  pitchEnabled={false}
                >
                  <Marker
                    coordinate={{
                      latitude: pedido.latitud,
                      longitude: pedido.longitud,
                    }}
                    title={pedido.cliente}
                    description={`${pedido.direccion}, ${pedido.ciudad}`}
                  />
                </MapView>

                <View
                  style={styles.mapaEtiqueta}
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
              </View>

              {/* CONTENIDO DEL PEDIDO */}

              <View style={styles.pedidoContent}>
                <View
                  style={styles.pedidoHeader}
                >
                  <View>
                    <Text
                      style={
                        styles.pedidoTitulo
                      }
                    >
                      Distribucion #{pedido.id}
                    </Text>

                    <Text
                      style={
                        styles.fechaPequena
                      }
                    >
                      {pedido.fecha}
                    </Text>
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
                      style={styles.infoLabel}
                    >
                      Cliente
                    </Text>

                    <Text
                      style={styles.infoTexto}
                    >
                      {pedido.cliente}
                    </Text>
                  </View>
                </View>


                {/* DIRECCIÓN REAL */}

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
                      style={styles.infoLabel}
                    >
                      Dirección de entrega
                    </Text>

                    <Text
                      style={styles.infoTexto}
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

                {/* REPARTIDOR*/}
                <View style={styles.infoRow}>
                  <View
                    style={styles.iconoInfo}
                  >
                    <Ionicons
                      name="person-outline"
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
                      style={styles.infoLabel}
                    >
                      Repartidor
                    </Text>

                    <Text
                      style={styles.infoTexto}
                    >
                      {pedido.repartidor}
                    </Text>
                  </View>
                </View>

                {/* VEHICULO */}

                <View style={styles.infoRow}>
                  <View
                    style={styles.iconoInfo}
                  >
                    <Ionicons
                      name="car-outline"
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
                      style={styles.infoLabel}
                    >
                      Vehículo
                    </Text>

                    <Text
                      style={styles.infoTexto}
                    >
                      {pedido.vehiculo}
                    </Text>
                  </View>
                </View>

                {/* BOTÓN IR A LA ENTREGA */}

                {pedido.estado !== 'ENTREGADO' && (
                  <TouchableOpacity
                    style={styles.btnRuta}
                    onPress={() =>
                      abrirRuta(
                        pedido.direccion,
                        pedido.ciudad
                      )
                    }
                    activeOpacity={0.8}
                  >
                    <Ionicons
                      name="navigate"
                      size={21}
                      color="#fff"
                    />

                    <Text
                      style={styles.btnRutaTexto}
                    >
                      Ir a la entrega
                    </Text>
                  </TouchableOpacity>
                )}

              
                {/* MARCAR ENTREGADO */}

                {pedido.estado ===
                  'EN_ENTREGA' && (
                  <TouchableOpacity
                    style={styles.btnPedido}
                    onPress={async () => {
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

                          cargarPedidos();
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
                    }}
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

                {/* ENTREGADO */}

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
  );
};

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
    marginTop: 3,
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

  /*
   * BOTÓN PARA ABRIR GOOGLE MAPS
   */

  btnRuta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 9,
    backgroundColor: '#4285F4',
    paddingVertical: 14,
    borderRadius: 9,
    marginTop: 5,
    marginBottom: 5,
  },

  btnRutaTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  btnPedido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 9,
    marginTop: 16,
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
});