import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';

import MapView, { Marker } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';

/* ============================================================
   TIPOS
============================================================ */

type EstadoPedido =
  | 'PENDIENTE'
  | 'EN_ENTREGA'
  | 'ENTREGADO';

type Pedido = {
  id: number;
  cliente: string;
  direccion: string;
  ciudad: string;

  // Coordenadas de prueba.
  // Después pueden venir desde tu backend.
  latitud: number;
  longitud: number;

  estado: EstadoPedido;
  fecha: string;
};

/* ============================================================
   DATOS DE PRUEBA
============================================================ */

const pedidosPrueba: Pedido[] = [
  {
    id: 1,
    cliente: 'Juan Pérez',
    direccion: 'Calle 84 bis # 91a - 08',
    ciudad: 'Bogotá',

    latitud: 4.703215,
    longitud: -74.103664,

    estado: 'PENDIENTE',
    fecha: '12/08/2026',
  },

  {
    id: 2,
    cliente: 'María Gómez',
    direccion: 'Carrera 80 # 20-15',
    ciudad: 'Bogotá',

    latitud: 4.678900,
    longitud: -74.085500,

    estado: 'EN_ENTREGA',
    fecha: '12/08/2026',
  },

  {
    id: 3,
    cliente: 'Carlos Rodríguez',
    direccion: 'Calle 72 # 10-30',
    ciudad: 'Bogotá',

    latitud: 4.658300,
    longitud: -74.060000,

    estado: 'ENTREGADO',
    fecha: '11/08/2026',
  },
];

/* ============================================================
   COMPONENTE
============================================================ */

const InicioRepartidor = () => {
  const [filtro, setFiltro] = useState<string>('TODOS');

  /* ==========================================================
     DATOS DEL REPARTIDOR
  ========================================================== */

  // Por ahora son datos de prueba.
  // Después puedes traerlos desde tu backend.
  const formData = {
    datosPersonales: {
      nombre_completo: 'Daniel Lopez',
    },
  };

  /* ==========================================================
     ABRIR GOOGLE MAPS
  ========================================================== */

  const abrirRuta = async (
    direccion: string,
    ciudad: string
  ) => {
    try {
      const destino = encodeURIComponent(
        `${direccion}, ${ciudad}`
      );

      const url =
        `https://www.google.com/maps/dir/?api=1` +
        `&destination=${destino}`;

      const puedeAbrir =
        await Linking.canOpenURL(url);

      if (puedeAbrir) {
        await Linking.openURL(url);
      } else {
        Alert.alert(
          'Error',
          'No se pudo abrir Google Maps.'
        );
      }
    } catch (error) {
      console.error(
        'Error al abrir Google Maps:',
        error
      );

      Alert.alert(
        'Error',
        'No fue posible abrir la ubicación.'
      );
    }
  };

  /* ==========================================================
     FILTRAR PEDIDOS
  ========================================================== */

  const pedidosFiltrados =
    filtro === 'TODOS'
      ? pedidosPrueba
      : pedidosPrueba.filter(
          (pedido) => pedido.estado === filtro
        );

  /* ==========================================================
     TEXTO DEL ESTADO
  ========================================================== */

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

  /* ==========================================================
     ICONO DEL ESTADO
  ========================================================== */

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

  /* ==========================================================
     COLOR DEL ESTADO
  ========================================================== */

  const getEstadoColor = (
    estado: EstadoPedido
  ) => {
    switch (estado) {
      case 'PENDIENTE':
        return '#D97706';

      case 'EN_ENTREGA':
        return '#B90F0F';

      case 'ENTREGADO':
        return '#008000';

      default:
        return '#777';
    }
  };

  /* ==========================================================
     RENDER
  ========================================================== */

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
    >

      {/* ====================================================
          ENCABEZADO
      ===================================================== */}

      <View style={styles.titleContainer}>

        <Text style={styles.title}>
          Bienvenido,{' '}
          {formData.datosPersonales.nombre_completo}
        </Text>

        <Text style={styles.subtitle}>
          Estos son tus pedidos del día de hoy
        </Text>

      </View>

      {/* ====================================================
          FILTROS
      ===================================================== */}

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filtrosContainer}
      >

        {/* TODOS */}

        <TouchableOpacity
          style={[
            styles.filtro,
            filtro === 'TODOS' &&
              styles.filtroActivo,
          ]}
          onPress={() =>
            setFiltro('TODOS')
          }
        >
          <Text
            style={[
              styles.filtroTexto,
              filtro === 'TODOS' &&
                styles.filtroTextoActivo,
            ]}
          >
            Todos
          </Text>
        </TouchableOpacity>

        {/* PENDIENTES */}

        <TouchableOpacity
          style={[
            styles.filtro,
            filtro === 'PENDIENTE' &&
              styles.filtroActivo,
          ]}
          onPress={() =>
            setFiltro('PENDIENTE')
          }
        >
          <Text
            style={[
              styles.filtroTexto,
              filtro === 'PENDIENTE' &&
                styles.filtroTextoActivo,
            ]}
          >
            Pendientes
          </Text>
        </TouchableOpacity>

        {/* EN ENTREGA */}

        <TouchableOpacity
          style={[
            styles.filtro,
            filtro === 'EN_ENTREGA' &&
              styles.filtroActivo,
          ]}
          onPress={() =>
            setFiltro('EN_ENTREGA')
          }
        >
          <Text
            style={[
              styles.filtroTexto,
              filtro === 'EN_ENTREGA' &&
                styles.filtroTextoActivo,
            ]}
          >
            En entrega
          </Text>
        </TouchableOpacity>

        {/* ENTREGADOS */}

        <TouchableOpacity
          style={[
            styles.filtro,
            filtro === 'ENTREGADO' &&
              styles.filtroActivo,
          ]}
          onPress={() =>
            setFiltro('ENTREGADO')
          }
        >
          <Text
            style={[
              styles.filtroTexto,
              filtro === 'ENTREGADO' &&
                styles.filtroTextoActivo,
            ]}
          >
            Entregados
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ====================================================
          LISTA DE PEDIDOS
      ===================================================== */}

      <View style={styles.pedidosContainer}>

        {pedidosFiltrados.length === 0 ? (

          /* ==================================================
             SIN PEDIDOS
          ================================================== */

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
              No hay pedidos para el filtro
              seleccionado.
            </Text>

          </View>

        ) : (

          pedidosFiltrados.map((pedido) => (

            <View
              key={pedido.id}
              style={styles.cardPedido}
            >

              {/* ==================================================
                  MAPA
              ================================================== */}

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

                    description={
                      `${pedido.direccion}, ` +
                      `${pedido.ciudad}`
                    }
                  />

                </MapView>

                {/* ETIQUETA DEL MAPA */}

                <View style={styles.mapaEtiqueta}>

                  <Ionicons
                    name="location"
                    size={15}
                    color="#B90F0F"
                  />

                  <Text
                    style={styles.mapaEtiquetaTexto}
                  >
                    Ubicación de entrega
                  </Text>

                </View>

                {/* BOTÓN PARA ABRIR MAPA */}

                <TouchableOpacity
                  style={styles.mapaBoton}
                  onPress={() =>
                    abrirRuta(
                      pedido.direccion,
                      pedido.ciudad
                    )
                  }
                >

                  <Ionicons
                    name="navigate"
                    size={18}
                    color="#B90F0F"
                  />

                </TouchableOpacity>

              </View>

              {/* ==================================================
                  CONTENIDO DEL PEDIDO
              ================================================== */}

              <View style={styles.pedidoContent}>

                {/* =================================================
                    HEADER
                ================================================== */}

                <View style={styles.pedidoHeader}>

                  <View>

                    <Text
                      style={styles.pedidoTitulo}
                    >
                      Pedido #{pedido.id}
                    </Text>

                    <Text
                      style={styles.fechaPequena}
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

                {/* =================================================
                    CLIENTE
                ================================================== */}

                <View style={styles.infoRow}>

                  <View style={styles.iconoInfo}>

                    <Ionicons
                      name="person-outline"
                      size={19}
                      color="#B90F0F"
                    />

                  </View>

                  <View
                    style={styles.infoTextoContainer}
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

                {/* =================================================
                    DIRECCIÓN
                ================================================== */}

                <View style={styles.infoRow}>

                  <View style={styles.iconoInfo}>

                    <Ionicons
                      name="location-outline"
                      size={20}
                      color="#B90F0F"
                    />

                  </View>

                  <View
                    style={styles.infoTextoContainer}
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

                {/* =================================================
                    BOTÓN PENDIENTE
                ================================================== */}

                {pedido.estado ===
                  'PENDIENTE' && (

                  <TouchableOpacity
                    style={styles.btnPedido}
                    onPress={() => {

                      console.log(
                        'Iniciar entrega:',
                        pedido.id
                      );

                    }}
                  >

                    <Ionicons
                      name="play-outline"
                      size={20}
                      color="#fff"
                    />

                    <Text
                      style={styles.btnPedidoTexto}
                    >
                      Iniciar entrega
                    </Text>

                  </TouchableOpacity>

                )}

                {/* =================================================
                    BOTÓN EN ENTREGA
                ================================================== */}

                {pedido.estado ===
                  'EN_ENTREGA' && (

                  <TouchableOpacity
                    style={styles.btnPedido}
                    onPress={() => {

                      console.log(
                        'Ver pedido:',
                        pedido.id
                      );

                    }}
                  >

                    <Ionicons
                      name="eye-outline"
                      size={20}
                      color="#fff"
                    />

                    <Text
                      style={styles.btnPedidoTexto}
                    >
                      Ver pedido
                    </Text>

                  </TouchableOpacity>

                )}

                {/* =================================================
                    ENTREGADO
                ================================================== */}

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

/* ============================================================
   ESTILOS
============================================================ */

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F4F6F9',
  },

  scrollContent: {
    paddingBottom: 40,
  },

  /* ==========================================================
     TÍTULO
  ========================================================== */

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

  /* ==========================================================
     FILTROS
  ========================================================== */

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

  /* ==========================================================
     PEDIDOS
  ========================================================== */

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

  /* ==========================================================
     MAPA
  ========================================================== */

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

  mapaBoton: {
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

  /* ==========================================================
     CONTENIDO
  ========================================================== */

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

  /* ==========================================================
     ESTADO
  ========================================================== */

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

  /* ==========================================================
     INFORMACIÓN
  ========================================================== */

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

  /* ==========================================================
     BOTÓN MAPA
  ========================================================== */

  botonMapa: {
    flexDirection: 'row',
    alignItems: 'center',

    alignSelf: 'flex-start',

    marginTop: 8,

    paddingVertical: 4,
  },

  botonMapaTexto: {
    color: '#B90F0F',

    fontSize: 13,

    fontWeight: '700',

    marginLeft: 5,
  },

  /* ==========================================================
     TOTAL
  ========================================================== */

  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',

    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',

    paddingTop: 13,
    marginTop: 3,
  },

  totalLabel: {
    fontSize: 13,
    color: '#777',
  },

  total: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
  },

  /* ==========================================================
     BOTÓN PEDIDO
  ========================================================== */

  btnPedido: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',

    gap: 8,

    backgroundColor: '#B90F0F',

    paddingVertical: 13,

    borderRadius: 9,

    marginTop: 16,
  },

  btnPedidoTexto: {
    color: '#fff',
    fontSize: 15,
    fontWeight: 'bold',
  },

  /* ==========================================================
     ENTREGADO
  ========================================================== */

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

  /* ==========================================================
     SIN PEDIDOS
  ========================================================== */

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

export default InicioRepartidor;