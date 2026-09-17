// src/features/delivery/screens/PrincipalRepartidor.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import Ionicons from '@expo/vector-icons/Ionicons';  

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
  latitud?: number;
  longitud?: number;
  estado: EstadoPedido;
  fecha: string;
};

const PrincipalRepartidor = ({ navigation }: any) => {
  const { user } = useAuth();
  const distribucionController = new DistribucionController();

  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState<
    'TODOS' | 'PENDIENTE' | 'EN_ENTREGA' | 'ENTREGADO'
  >('TODOS');

  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [nombreRepartidor, setNombreRepartidor] = useState('');

  const obtenerLista = (respuesta: any): any[] => {
    if (Array.isArray(respuesta)) {
      return respuesta;
    }

    if (Array.isArray(respuesta?.data)) {
      return respuesta.data;
    }

    if (Array.isArray(respuesta?.distribuciones)) {
      return respuesta.distribuciones;
    }

    if (Array.isArray(respuesta?.distribuciones?.data)) {
      return respuesta.distribuciones.data;
    }

    return [];
  };

  // Convierte la dirección de la BD en coordenadas
  const obtenerCoordenadasDireccion = async (
    direccion: string,
    ciudad: string
  ) => {
    try {
      if (
        !direccion ||
        direccion === 'Sin dirección' ||
        !ciudad ||
        ciudad === 'Sin ciudad'
      ) {
        return null;
      }

      const direccionCompleta =
        direccion + ', ' + ciudad + ', Colombia';

      const url =
        'https://nominatim.openstreetmap.org/search' +
        '?format=json' +
        '&limit=1' +
        '&countrycodes=co' +
        '&q=' +
        encodeURIComponent(direccionCompleta);

      const respuesta = await fetch(url, {
        headers: {
          'User-Agent': 'OpticamMobile/1.0',
          'Accept-Language': 'es',
        },
      });

      if (!respuesta.ok) {
        console.error(
          'Error HTTP geocodificando:',
          respuesta.status
        );
        return null;
      }

      const datos = await respuesta.json();

      if (
        Array.isArray(datos) &&
        datos.length > 0 &&
        datos[0]?.lat &&
        datos[0]?.lon
      ) {
        const latitude = Number(datos[0].lat);
        const longitude = Number(datos[0].lon);

        if (
          Number.isFinite(latitude) &&
          Number.isFinite(longitude)
        ) {
          return {
            latitude,
            longitude,
          };
        }
      }

      console.log(
        'No se encontró ubicación para:',
        direccionCompleta
      );

      return null;
    } catch (error) {
      console.error(
        'Error geocodificando dirección:',
        direccion,
        error
      );

      return null;
    }
  };

  // Agrega coordenadas a los pedidos que no las tengan
  const geocodificarPedidos = async (
    listaPedidos: Pedido[]
  ) => {
    const pedidosConUbicacion: Pedido[] = [];
    let ultimaSolicitud = 0;

    for (const pedido of listaPedidos) {
      if (
        typeof pedido.latitud === 'number' &&
        typeof pedido.longitud === 'number' &&
        Number.isFinite(pedido.latitud) &&
        Number.isFinite(pedido.longitud)
      ) {
        pedidosConUbicacion.push(pedido);
        continue;
      }

      const tiempoDesdeUltimaSolicitud =
        Date.now() - ultimaSolicitud;
      const espera = Math.max(
        0,
        1000 - tiempoDesdeUltimaSolicitud
      );

      if (espera > 0) {
        await new Promise(resolve =>
          setTimeout(resolve, espera)
        );
      }

      const coordenadas =
        await obtenerCoordenadasDireccion(
          pedido.direccion,
          pedido.ciudad
        );
      ultimaSolicitud = Date.now();

      pedidosConUbicacion.push(
        coordenadas
          ? {
              ...pedido,
              latitud: coordenadas.latitude,
              longitud: coordenadas.longitude,
            }
          : pedido
      );
    }

    return pedidosConUbicacion;
  };

  const mapearDistribucion = (
    d: any,
    estadoForzado?: EstadoPedido
  ): Pedido => {
    const pedido =
      d?.pedido ||
      d?.Pedido ||
      {};

    const cliente =
      pedido?.cliente ||
      pedido?.Cliente ||
      {};

    const id =
      pedido?.id_pedido ??
      d?.id_pedido ??
      d?.pedido_id ??
      0;

    const id_distribucion =
      d?.id_distribucion ??
      d?.id ??
      0;

    const direccion =
      pedido?.direccion_entrega ||
      pedido?.direccion ||
      cliente?.direccion ||
      'Sin dirección';

    const ciudad =
      pedido?.ciudad_envio ||
      pedido?.ciudad ||
      cliente?.ciudad ||
      'Sin ciudad';

    const latitud =
      pedido?.latitud ??
      pedido?.latitude ??
      d?.latitud ??
      d?.latitude;

    const longitud =
      pedido?.longitud ??
      pedido?.longitude ??
      d?.longitud ??
      d?.longitude;

    const nombreCliente =
      cliente?.nombre_completo ||
      cliente?.nombre ||
      pedido?.nombre_cliente ||
      (
        (cliente?.nombre || '') +
        ' ' +
        (cliente?.apellido || '')
      ).trim() ||
      'Cliente';

    const fecha =
      pedido?.fecha_estimada ||
      d?.fecha_entrega ||
      d?.fecha_asignacion ||
      pedido?.fecha_pedido ||
      'Sin fecha';

    let estado: EstadoPedido =
      estadoForzado || 'PENDIENTE';

    if (!estadoForzado) {
      const estadoBD = String(
        d?.estado ||
        d?.estado_distribucion ||
        pedido?.estado ||
        ''
      ).toUpperCase();

      if (
        estadoBD === 'EN_ENTREGA' ||
        estadoBD === 'EN ENTREGA'
      ) {
        estado = 'EN_ENTREGA';
      } else if (
        estadoBD === 'ENTREGADO'
      ) {
        estado = 'ENTREGADO';
      } else {
        estado = 'PENDIENTE';
      }
    }

    return {
      id: Number(id),
      id_distribucion: Number(id_distribucion),
      cliente: nombreCliente,
      direccion,
      ciudad,
      latitud:
        latitud !== undefined &&
        latitud !== null
          ? Number(latitud)
          : undefined,
      longitud:
        longitud !== undefined &&
        longitud !== null
          ? Number(longitud)
          : undefined,
      estado,
      fecha,
    };
  };

  const cargarPedidos = async () => {
    try {
      setLoading(true);

      const [
        respuestaPendientes,
        respuestaEnEntrega,
        respuestaHistorial,
      ] = await Promise.all([
        distribucionController.getPendientes(),
        distribucionController.getEnEntrega(),
        distribucionController.getHistorial(),
      ]);

      const pendientes = obtenerLista(
        respuestaPendientes
      ).map(item =>
        mapearDistribucion(
          item,
          'PENDIENTE'
        )
      );

      const enEntrega = obtenerLista(
        respuestaEnEntrega
      ).map(item =>
        mapearDistribucion(
          item,
          'EN_ENTREGA'
        )
      );

      const entregados = obtenerLista(
        respuestaHistorial
      ).map(item =>
        mapearDistribucion(
          item,
          'ENTREGADO'
        )
      );

      const todos = [
        ...pendientes,
        ...enEntrega,
        ...entregados,
      ];

      const unicos = todos.filter(
        (pedido, index, array) =>
          index ===
          array.findIndex(
            item =>
              item.id_distribucion ===
              pedido.id_distribucion
          )
      );

      const pedidosConUbicacion =
        await geocodificarPedidos(
          unicos
        );

      setPedidos(
        pedidosConUbicacion
      );

      const nombre =
        user?.nombre_completo ||
        '';

      setNombreRepartidor(nombre);
    } catch (error) {
      console.error(
        'Error cargando pedidos:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudieron cargar los pedidos.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarPedidos();
  }, []);

  const pedidosFiltrados =
    filtro === 'TODOS'
      ? pedidos
      : pedidos.filter(
          pedido =>
            pedido.estado === filtro
        );

  if (loading) {
    return (
      <View
        style={styles.loadingContainer}
      >
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text
          style={styles.loadingText}
        >
          Cargando pedidos...
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={
          styles.scrollContent
        }
        showsVerticalScrollIndicator={
          false
        }
      >
        <Text style={styles.titulo}>
          Hola
          {nombreRepartidor
            ? ', ' + nombreRepartidor
            : ''}
        </Text>

        <Text style={styles.subtitulo}>
          Gestiona tus entregas
        </Text>

        <View style={styles.filtros}>
          {[
            'TODOS',
            'PENDIENTE',
            'EN_ENTREGA',
            'ENTREGADO',
          ].map(item => (
            <TouchableOpacity
              key={item}
              style={[
                styles.filtro,
                filtro === item &&
                  styles.filtroActivo,
              ]}
              onPress={() =>
                setFiltro(
                  item as
                    | 'TODOS'
                    | 'PENDIENTE'
                    | 'EN_ENTREGA'
                    | 'ENTREGADO'
                )
              }
            >
              <Text
                style={[
                  styles.filtroTexto,
                  filtro === item &&
                    styles.filtroTextoActivo,
                ]}
              >
                {item === 'EN_ENTREGA'
                  ? 'EN ENTREGA'
                  : item}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {pedidosFiltrados.length === 0 ? (
          <View
            style={styles.sinPedidos}
          >
            <Ionicons
              name="cube-outline"
              size={50}
              color="#999"
            />

            <Text
              style={
                styles.sinPedidosTexto
              }
            >
              No hay pedidos disponibles
            </Text>
          </View>
        ) : (
          pedidosFiltrados.map(pedido => {
            const tieneCoordenadas =
              typeof pedido.latitud ===
                'number' &&
              typeof pedido.longitud ===
                'number' &&
              Number.isFinite(
                pedido.latitud
              ) &&
              Number.isFinite(
                pedido.longitud
              );

            return (
              <View
                key={
                  pedido.id_distribucion
                }
                style={styles.card}
              >
                <View
                  style={
                    styles.mapaContainer
                  }
                >
                  {tieneCoordenadas ? (
                    <MapView
                      style={styles.mapa}
                      initialRegion={{
                        latitude:
                          pedido.latitud!,
                        longitude:
                          pedido.longitud!,
                        latitudeDelta: 0.008,
                        longitudeDelta: 0.008,
                      }}
                      scrollEnabled={false}
                      zoomEnabled={false}
                      rotateEnabled={false}
                      pitchEnabled={false}
                    >
                      <Marker
                        coordinate={{
                          latitude:
                            pedido.latitud!,
                          longitude:
                            pedido.longitud!,
                        }}
                        title={
                          pedido.cliente
                        }
                        description={
                          pedido.direccion +
                          ', ' +
                          pedido.ciudad
                        }
                      />
                    </MapView>
                  ) : (
                    <View
                      style={
                        styles.mapaSinUbicacion
                      }
                    >
                      <Ionicons
                        name="location-outline"
                        size={35}
                        color="#999"
                      />

                      <Text
                        style={
                          styles.mapaSinUbicacionTexto
                        }
                      >
                        No se pudo localizar
                        la dirección
                      </Text>
                    </View>
                  )}
                </View>

                <View
                  style={
                    styles.cardContenido
                  }
                >
                  <View
                    style={
                      styles.encabezadoCard
                    }
                  >
                    <Text
                      style={
                        styles.numeroPedido
                      }
                    >
                      Pedido #{pedido.id}
                    </Text>

                    <View
                      style={[
                        styles.estado,
                        pedido.estado ===
                          'ENTREGADO'
                          ? styles.estadoEntregado
                          : pedido.estado ===
                            'EN_ENTREGA'
                          ? styles.estadoEnEntrega
                          : styles.estadoPendiente,
                      ]}
                    >
                      <Text
                        style={
                          styles.estadoTexto
                        }
                      >
                        {pedido.estado ===
                        'EN_ENTREGA'
                          ? 'EN ENTREGA'
                          : pedido.estado}
                      </Text>
                    </View>
                  </View>

                  <Text
                    style={styles.fecha}
                  >
                    {pedido.fecha}
                  </Text>

                  <View
                    style={styles.info}
                  >
                    <Ionicons
                      name="person-outline"
                      size={18}
                      color={
                        COLORS.primary
                      }
                    />

                    <Text
                      style={
                        styles.infoTexto
                      }
                    >
                      {pedido.cliente}
                    </Text>
                  </View>

                  <View
                    style={styles.info}
                  >
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color={
                        COLORS.primary
                      }
                    />

                    <View
                      style={
                        styles.direccionContainer
                      }
                    >
                      <Text
                        style={
                          styles.infoTexto
                        }
                      >
                        {pedido.direccion}
                      </Text>

                      <Text
                        style={
                          styles.ciudadTexto
                        }
                      >
                        {pedido.ciudad}
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={
                      styles.botonDetalles
                    }
                    onPress={() =>
                      navigation.navigate(
                        'DetalleEntrega',
                        {
                          id_distribucion:
                            pedido.id_distribucion,
                        }
                      )
                    }
                  >
                    <Ionicons
                      name="eye-outline"
                      size={18}
                      color={COLORS.primary}
                    />

                    <Text
                      style={
                        styles.botonDetallesTexto
                      }
                    >
                      Ver detalles
                    </Text>
                  </TouchableOpacity>

                </View>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },

  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 4,
  },

  subtitulo: {
    fontSize: 15,
    color: COLORS.gray,
    marginBottom: 18,
  },

  filtros: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },

  filtro: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#DDDDDD',
    backgroundColor: '#FFFFFF',
    marginRight: 7,
    marginBottom: 7,
  },

  filtroActivo: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },

  filtroTexto: {
    fontSize: 12,
    color: COLORS.text,
    fontWeight: '600',
  },

  filtroTextoActivo: {
    color: '#FFFFFF',
  },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  mapaContainer: {
    width: '100%',
    height: 180,
  },

  mapa: {
    width: '100%',
    height: '100%',
  },

  mapaSinUbicacion: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#E9ECEF',
  },

  mapaSinUbicacionTexto: {
    marginTop: 6,
    fontSize: 12,
    color: '#777',
    textAlign: 'center',
  },

  cardContenido: {
    padding: 14,
  },

  encabezadoCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  numeroPedido: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  estado: {
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },

  estadoPendiente: {
    backgroundColor: '#FFF3CD',
  },

  estadoEnEntrega: {
    backgroundColor: '#D1ECF1',
  },

  estadoEntregado: {
    backgroundColor: '#D4EDDA',
  },

  estadoTexto: {
    fontSize: 10,
    fontWeight: 'bold',
    color: COLORS.text,
  },

  fecha: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 4,
    marginBottom: 12,
  },

  info: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 9,
  },

  infoTexto: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text,
    marginLeft: 8,
  },

  direccionContainer: {
    flex: 1,
  },

  ciudadTexto: {
    fontSize: 12,
    color: COLORS.gray,
    marginLeft: 8,
    marginTop: 2,
  },

  botonDetalles: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 10,
    marginTop: 12,
  },

  botonDetallesTexto: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: 'bold',
    marginLeft: 6,
  },

  botonAccion: {
    backgroundColor: '#333333',
    borderRadius: 8,
    paddingVertical: 11,
    alignItems: 'center',
    marginTop: 9,
  },

  botonAccionTexto: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },

  sinPedidos: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },

  sinPedidosTexto: {
    marginTop: 10,
    color: '#999999',
    fontSize: 14,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },

  loadingText: {
    marginTop: 10,
    color: COLORS.gray,
    fontSize: 14,
  },
});

export default PrincipalRepartidor;