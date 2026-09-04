// src/features/pedidos/screens/DetallePedidoAdmin.tsx

import React, { useCallback, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Modal,
} from 'react-native';

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { PedidoController } from '../../../core/controllers/PedidoController';
import { PedidoModel } from '../../../core/models/PedidoModel';
import { COLORS } from '../../../shared/constants/colors';

const pedidoController = new PedidoController();

const ESTADOS_ACTIVOS = [
  'Abonado',
  'Listo',
  'Pagado',
  'En Proceso',
  'Enviado',
  'Entregado',
];

export default function DetallePedido() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { id_pedido, esAdmin = false } = route.params || {};

  const [pedido, setPedido] = useState<PedidoModel | null>(null);
  const [loading, setLoading] = useState(true);

  const [marcandoListo, setMarcandoListo] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);

  const cargarPedido = useCallback(async () => {
    if (!id_pedido) {
      Alert.alert(
        'Error',
        'No se recibió el identificador del pedido.'
      );

      navigation.goBack();
      return;
    }

    try {
      setLoading(true);

      // CLIENTE
      if (!esAdmin) {
        const misPedidos = await pedidoController.getMisPedidos();

        const pedidoCliente = misPedidos.find(
          item =>
            Number(item.id_pedido) === Number(id_pedido)
        );

        if (!pedidoCliente) {
          Alert.alert(
            'Acceso denegado',
            'No puedes consultar este pedido porque no pertenece a tu cuenta.'
          );

          navigation.goBack();
          return;
        }

        const detalle =
          await pedidoController.getPedidoById(
            Number(id_pedido)
          );

        if (!detalle) {
          Alert.alert(
            'Pedido no encontrado',
            'No fue posible encontrar el pedido.'
          );

          navigation.goBack();
          return;
        }

        setPedido(detalle);
        return;
      }

      // PEDIDO
      const detalle =
        await pedidoController.getPedidoById(
          Number(id_pedido)
        );

      if (!detalle) {
        Alert.alert(
          'Pedido no encontrado',
          'No fue posible encontrar el pedido.'
        );

        navigation.goBack();
        return;
      }

      if (!ESTADOS_ACTIVOS.includes(detalle.estado)) {
        Alert.alert(
          'Pedido no disponible',
          'El administrador solo puede consultar pedidos activos.'
        );

        navigation.goBack();
        return;
      }

      setPedido(detalle);
    } catch (error) {
      console.error(
        'Error cargando detalle del pedido:',
        error
      );

      Alert.alert(
        'Error',
        'No fue posible cargar la información del pedido.'
      );
    } finally {
      setLoading(false);
    }
  }, [id_pedido, esAdmin, navigation]);

  useFocusEffect(
    useCallback(() => {
      cargarPedido();
    }, [cargarPedido])
  );

  const marcarComoListo = () => {
    if (!pedido) {
      return;
    }

    // El pedido debe estar ABONADO
    if (pedido.estado !== 'Abonado') {
      Alert.alert(
        'No se puede marcar como LISTO',
        'El pedido debe estar en estado ABONADO.'
      );

      return;
    }

    Alert.alert(
      'Confirmar pedido LISTO',
      '¿Estás seguro de que las gafas ya están listas para que el cliente pague el saldo restante?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Marcar como LISTO',
          onPress: async () => {
            try {
              setMarcandoListo(true);

              const resultado =
                await pedidoController.marcarPedidoComoListo(
                  Number(pedido.id_pedido)
                );

              if (!resultado.success) {
                Alert.alert(
                  'No se puede marcar como LISTO',
                  resultado.message ||
                    'No fue posible marcar el pedido como LISTO.'
                );

                return;
              }

              Alert.alert(
                'Pedido actualizado',
                resultado.message ||
                  'El pedido ha sido marcado como LISTO.',
                [
                  {
                    text: 'Aceptar',
                    onPress: async () => {
                      await cargarPedido();
                    },
                  },
                ]
              );
            } catch (error: any) {
              console.error(
                'Error marcando pedido como LISTO:',
                error
              );

              Alert.alert(
                'Error',
                error?.response?.data?.message ||
                  error?.message ||
                  'No fue posible marcar el pedido como LISTO.'
              );
            } finally {
              setMarcandoListo(false);
            }
          },
        },
      ]
    );
  };

  // FUNCIONES 
  const formatearDinero = (
    valor: number | undefined | null
  ) => {
    return `$${Number(valor || 0).toLocaleString('es-CO')}`;
  };

  const obtenerNombreProducto = (producto: any) => {
    return (
      producto?.nombre ||
      producto?.nombre_producto ||
      producto?.producto?.nombre ||
      'Producto'
    );
  };

  const obtenerCantidad = (producto: any) => {
    return (
      producto?.cantidad ||
      producto?.cantidad_producto ||
      producto?.producto?.cantidad ||
      1
    );
  };

  const obtenerPrecio = (producto: any) => {
    return Number(
      producto?.precio ||
      producto?.precio_unitario ||
      producto?.producto?.precio ||
      0
    );
  };

  const obtenerImagen = (producto: any) => {
    return (
      producto?.imagen ||
      producto?.imagen_producto ||
      producto?.producto?.imagen ||
      producto?.url_imagen ||
      null
    );
  };

  const obtenerIconoEstado = () => {
    if (!pedido) {
      return 'ellipse-outline';
    }

    switch (pedido.estado) {
      case 'Abonado':
        return 'card-outline';

      case 'Listo':
        return 'checkmark-circle-outline';

      case 'Pagado':
        return 'checkmark-done-outline';

      case 'En Proceso':
        return 'construct-outline';

      case 'Enviado':
        return 'car-outline';

      case 'Entregado':
        return 'checkmark-done-circle-outline';

      case 'Cancelado':
        return 'close-circle-outline';

      case 'Pendiente':
        return 'time-outline';

      default:
        return 'time-outline';
    }
  };

  const obtenerColorEstado = () => {
    if (!pedido) {
      return COLORS.gray;
    }

    return pedido.estadoColor;
  };

  // LOADING
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Cargando pedido...
        </Text>
      </View>
    );
  }

  if (!pedido) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="document-text-outline"
          size={55}
          color={COLORS.gray}
        />

        <Text style={styles.emptyTitle}>
          Pedido no encontrado
        </Text>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>
            Volver
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const colorEstado = obtenerColorEstado();

  return (
    <View style={styles.container}>

      {/* ======================================================
          VISOR DE IMAGEN COMPLETA
      ====================================================== */}

      <Modal
        visible={imagenAmpliada !== null}
        transparent
        animationType="fade"
        onRequestClose={() => setImagenAmpliada(null)}
      >
        <View style={styles.imageModalContainer}>

          <TouchableOpacity
            style={styles.imageModalClose}
            onPress={() => setImagenAmpliada(null)}
          >
            <Ionicons
              name="close"
              size={30}
              color={COLORS.white}
            />
          </TouchableOpacity>

          {imagenAmpliada && (
            <Image
              source={{ uri: imagenAmpliada }}
              style={styles.imageModal}
              resizeMode="contain"
            />
          )}

          <Text style={styles.imageModalHint}>
            Toca × para cerrar
          </Text>

        </View>
      </Modal>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={23}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>
            Detalle del pedido
          </Text>

          <Text style={styles.headerSubtitle}>
            Pedido #{pedido.id_pedido}
          </Text>
        </View>

        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >

        {/* ====================================================
            PRODUCTO / ESTADO PRINCIPAL
        ==================================================== */}

        <View style={styles.productMainCard}>

          <View style={styles.mainProductInfo}>
            <View style={styles.statusInline}>

              <View
                style={[
                  styles.statusDot,
                  {
                    backgroundColor: colorEstado,
                  },
                ]}
              />

              <Text
                style={[
                  styles.statusText,
                  {
                    color: colorEstado,
                  },
                ]}
              >
                {pedido.estadoDisplay}
              </Text>

            </View>

          </View>

        </View>

        {/* ====================================================
            ADMINISTRADOR - MARCAR COMO LISTO
        ==================================================== */}

        {esAdmin && pedido.estado === 'Abonado' && (
          <View style={styles.readyActionCard}>

            <View style={styles.readyActionInfo}>

              <View style={styles.readyActionIcon}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={24}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.readyActionTextContainer}>

                <Text style={styles.readyActionTitle}>
                  Pedido listo para continuar
                </Text>

                <Text style={styles.readyActionDescription}>
                  Marca el pedido como LISTO cuando las gafas
                  estén terminadas y el cliente pueda pagar
                  el saldo restante.
                </Text>

              </View>

            </View>

            <TouchableOpacity
              style={[
                styles.readyButton,
                marcandoListo && styles.readyButtonDisabled,
              ]}
              onPress={marcarComoListo}
              disabled={marcandoListo}
            >

              {marcandoListo ? (
                <>
                  <ActivityIndicator
                    size="small"
                    color={COLORS.white}
                  />

                  <Text style={styles.readyButtonText}>
                    Actualizando...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons
                    name="checkmark-circle"
                    size={20}
                    color={COLORS.white}
                  />

                  <Text style={styles.readyButtonText}>
                    Marcar como LISTO
                  </Text>
                </>
              )}

            </TouchableOpacity>

          </View>
        )}

        {/* ====================================================
            INFORMACIÓN DEL PEDIDO
        ==================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Información del pedido
          </Text>

          <View style={styles.simpleInfoRow}>

            <Text style={styles.simpleInfoLabel}>
              Fecha
            </Text>

            <Text style={styles.simpleInfoValue}>
              {pedido.fechaFormateada}
            </Text>

          </View>

          <View style={styles.simpleDivider} />

          <View style={styles.simpleInfoRow}>

            <Text style={styles.simpleInfoLabel}>
              Fecha estimada
            </Text>

            <Text style={styles.simpleInfoValue}>
              {pedido.fechaEstimadaFormateada}
            </Text>

          </View>

          <View style={styles.simpleDivider} />

          <View style={styles.simpleInfoRow}>

            <Text style={styles.simpleInfoLabel}>
              Productos
            </Text>

            <Text style={styles.simpleInfoValue}>
              {pedido.productos?.length || 0}
            </Text>

          </View>

        </View>

        {/* ====================================================
            PRODUCTOS
        ==================================================== */}

        {pedido.productos &&
        pedido.productos.length > 0 && (
          <View style={styles.section}>

            <View style={styles.sectionTitleRow}>

              <Text style={styles.sectionTitle}>
                Productos
              </Text>

              <View style={styles.countBadge}>

                <Text style={styles.countBadgeText}>
                  {pedido.productos.length}
                </Text>

              </View>

            </View>

            {pedido.productos.map(
              (producto: any, index: number) => {

                const nombre =
                  obtenerNombreProducto(producto);

                const cantidad =
                  obtenerCantidad(producto);

                const precio =
                  obtenerPrecio(producto);

                const imagen =
                  obtenerImagen(producto);

                return (
                  <View
                    key={
                      producto?.id_producto ||
                      producto?.producto?.id_producto ||
                      index
                    }
                    style={[
                      styles.productRow,
                      index === 0 &&
                        styles.productRowFirst,
                    ]}
                  >

                    {imagen ? (
                      <TouchableOpacity
                        activeOpacity={0.8}
                        onPress={() =>
                          setImagenAmpliada(imagen)
                        }
                      >
                        <Image
                          source={{ uri: imagen }}
                          style={styles.productRowImage}
                        />
                      </TouchableOpacity>
                    ) : (
                      <View
                        style={
                          styles.productRowImagePlaceholder
                        }
                      >
                        <Ionicons
                          name="cube-outline"
                          size={25}
                          color={COLORS.gray}
                        />
                      </View>
                    )}

                    <View style={styles.productRowInfo}>

                      <Text
                        style={styles.productRowName}
                        numberOfLines={2}
                      >
                        {nombre}
                      </Text>

                      <Text
                        style={styles.productRowQuantity}
                      >
                        Cantidad: {cantidad}
                      </Text>

                    </View>

                    <View style={styles.productRowPriceContainer}>

                      <Text
                        style={styles.productRowPrice}
                      >
                        {formatearDinero(
                          precio *
                            Number(cantidad)
                        )}
                      </Text>

                      <Text
                        style={
                          styles.productRowUnitPrice
                        }
                      >
                        {formatearDinero(precio)} c/u
                      </Text>

                    </View>

                  </View>
                );
              }
            )}

          </View>
        )}

        {/* ====================================================
            DATOS DEL CLIENTE
        ==================================================== */}

        {pedido.cliente && (
          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              Datos del cliente
            </Text>

            <View style={styles.clientRow}>

              <View style={styles.clientIcon}>
                <Ionicons
                  name="person-outline"
                  size={19}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.clientContent}>

                <Text style={styles.clientLabel}>
                  Nombre
                </Text>

                <Text style={styles.clientValue}>
                  {pedido.cliente.nombre}
                </Text>

              </View>

            </View>

            <View style={styles.clientRow}>

              <View style={styles.clientIcon}>
                <Ionicons
                  name="call-outline"
                  size={19}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.clientContent}>

                <Text style={styles.clientLabel}>
                  Teléfono
                </Text>

                <Text style={styles.clientValue}>
                  {pedido.cliente.telefono}
                </Text>

              </View>

            </View>

            <View style={styles.clientRow}>

              <View style={styles.clientIcon}>
                <Ionicons
                  name="mail-outline"
                  size={19}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.clientContent}>

                <Text style={styles.clientLabel}>
                  Correo electrónico
                </Text>

                <Text
                  style={styles.clientValue}
                  numberOfLines={2}
                >
                  {pedido.cliente.email}
                </Text>

              </View>

            </View>

          </View>
        )}

        {/* ====================================================
            INFORMACIÓN DE ENTREGA
        ==================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Información de entrega
          </Text>

          <View style={styles.deliveryRow}>

            <Ionicons
              name="location-outline"
              size={20}
              color={COLORS.primary}
            />

            <View style={styles.deliveryContent}>

              <Text style={styles.deliveryLabel}>
                Dirección
              </Text>

              <Text style={styles.deliveryValue}>
                {pedido.direccion_entrega ||
                  'No especificada'}
              </Text>

            </View>

          </View>

          <View style={styles.deliveryRow}>

            <Ionicons
              name="business-outline"
              size={20}
              color={COLORS.primary}
            />

            <View style={styles.deliveryContent}>

              <Text style={styles.deliveryLabel}>
                Ciudad
              </Text>

              <Text style={styles.deliveryValue}>
                {pedido.ciudad_envio ||
                  'No especificada'}
              </Text>

            </View>

          </View>

        </View>

        {/* ====================================================
            FÓRMULA ASOCIADA
        ==================================================== */}

        {pedido.formula && (
          <View style={styles.section}>

            <Text style={styles.sectionTitle}>
              Fórmula asociada
            </Text>

            <View style={styles.formulaBox}>

              {pedido.formula.imagen_formula ? (
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() =>
                    setImagenAmpliada(
                      pedido.formula?.imagen_formula || null
                    )
                  }
                >
                  <Image
                    source={{
                      uri: pedido.formula.imagen_formula,
                    }}
                    style={styles.formulaImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ) : null}

              <View
                style={[
                  styles.formulaData,
                  !pedido.formula.imagen_formula &&
                    styles.formulaDataFull,
                ]}
              >

                {pedido.formula.condicion ? (
                  <Text style={styles.formulaCondition}>
                    {pedido.formula.condicion}
                  </Text>
                ) : null}

                {pedido.formula.observaciones ? (
                  <View style={styles.observationBox}>

                    <Text style={styles.observationLabel}>
                      Observaciones
                    </Text>

                    <Text style={styles.observationText}>
                      {pedido.formula.observaciones}
                    </Text>

                  </View>
                ) : null}

                <View style={styles.formulaCostRow}>

                  <Text style={styles.formulaCostLabel}>
                    Costo de fórmula
                  </Text>

                  <Text style={styles.formulaCostValue}>
                    {formatearDinero(
                      pedido.formula.costo
                    )}
                  </Text>

                </View>

              </View>

            </View>

          </View>
        )}

        {/* ====================================================
            RESUMEN
        ==================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Resumen del pedido
          </Text>

          <View style={styles.summaryRow}>

            <Text style={styles.summaryLabel}>
              Costo de envío
            </Text>

            <Text style={styles.summaryValue}>
              {formatearDinero(
                pedido.costo_envio
              )}
            </Text>

          </View>

          <View style={styles.simpleDivider} />

          <View style={styles.summaryTotalRow}>

            <Text style={styles.summaryTotalLabel}>
              Total
            </Text>

            <Text style={styles.summaryTotalValue}>
              {pedido.totalFormateado}
            </Text>

          </View>

        </View>

        <View style={styles.bottomSpace} />

      </ScrollView>
    </View>
  );
}

// ESTILOS
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  clientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 48,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.text,
  },

  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  emptyTitle: {
    marginTop: 14,
    fontSize: 19,
    fontWeight: '700',
    color: COLORS.text,
  },

  backButton: {
    marginTop: 18,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 9,
  },

  backButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

  header: {
    height: 60,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E7E7E7',
  },

  backButtonHeader: {
    width: 38,
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerInfo: {
    flex: 1,
    marginLeft: 3,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  headerSubtitle: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 1,
  },

  headerRight: {
    width: 38,
  },

  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
  },

  productMainCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  mainProductImageContainer: {
    width: 92,
    height: 92,
    borderRadius: 9,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
  },

  mainProductImage: {
    width: '100%',
    height: '100%',
  },

  mainProductImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },

  mainProductInfo: {
    flex: 1,
    marginLeft: 13,
  },

  mainProductName: {
    fontSize: 17,
    lineHeight: 21,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },

  mainProductPrice: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.primary,
    marginBottom: 7,
  },

  statusInline: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  section: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 7,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  countBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },

  // INFORMACIÓN 
  simpleInfoRow: {
    minHeight: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  simpleInfoLabel: {
    fontSize: 13,
    color: COLORS.gray,
  },

  simpleInfoValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
    marginLeft: 15,
  },

  simpleDivider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 5,
  },

  // PRODUCTOS
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  productRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },

  productRowImage: {
    width: 55,
    height: 55,
    borderRadius: 8,
    backgroundColor: COLORS.background,
  },

  productRowImagePlaceholder: {
    width: 55,
    height: 55,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  productRowInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },

  productRowName: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: COLORS.text,
  },

  productRowQuantity: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 3,
  },

  productRowPriceContainer: {
    alignItems: 'flex-end',
  },

  productRowPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },

  productRowUnitPrice: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 2,
  },

  // INFO CLIENTE
  clientIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FDECEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  clientContent: {
    flex: 1,
  },

  clientLabel: {
    fontSize: 10,
    color: COLORS.gray,
    marginBottom: 2,
  },

  clientValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },

  // FÓRMULA
  formulaBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  formulaImage: {
    width: 82,
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.background,
    marginRight: 10,
  },

  formulaData: {
    flex: 1,
  },

  formulaDataFull: {
    width: '100%',
  },

  formulaCondition: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: -3,
  },

  observationBox: {
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  observationLabel: {
    fontSize: 10,
    color: COLORS.gray,
    marginBottom: 2,
  },

  observationText: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.text,
  },

  formulaCostRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  formulaCostLabel: {
    fontSize: 11,
    color: COLORS.gray,
  },

  formulaCostValue: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },

  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 7,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  deliveryContent: {
    flex: 1,
    marginLeft: 10,
  },

  deliveryLabel: {
    fontSize: 10,
    color: COLORS.gray,
    marginBottom: 2,
  },

  deliveryValue: {
    fontSize: 13,
    lineHeight: 18,
    fontWeight: '600',
    color: COLORS.text,
  },

  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 30,
  },

  summaryLabel: {
    fontSize: 13,
    color: COLORS.gray,
  },

  summaryValue: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },

  summaryTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 4,
  },

  summaryTotalLabel: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  summaryTotalValue: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.primary,
  },

  // BOTÓN DE MARCAR COMO LISTO
  readyActionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  readyActionInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  readyActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FDECEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  readyActionTextContainer: {
    flex: 1,
  },

  readyActionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },

  readyActionDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.gray,
  },

  readyButton: {
    minHeight: 46,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  readyButtonDisabled: {
    opacity: 0.6,
  },

  readyButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 7,
  },

  // VISOR DE IMAGEN COMPLETA
  imageModalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  imageModal: {
    width: '100%',
    height: '80%',
  },

  imageModalClose: {
    position: 'absolute',
    top: 45,
    right: 18,
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  imageModalHint: {
    position: 'absolute',
    bottom: 35,
    color: COLORS.white,
    fontSize: 12,
    opacity: 0.7,
  },

  // ESPACIO FINAL
  bottomSpace: {
    height: 10,
  },
});