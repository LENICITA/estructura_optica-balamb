
// src/features/pedidos/screens/DetallePedido.tsx

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

/*
 * Estados que un administrador puede consultar.
 *
 * Pendiente y Cancelado NO están incluidos porque los criterios
 * indican que el administrador solamente puede consultar pedidos
 * activos.
 */
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

  /*
   * Parámetros esperados:
   *
   * Cliente:
   *
   * navigation.navigate('DetallePedido', {
   *   id_pedido: pedido.id_pedido,
   *   esAdmin: false,
   * });
   *
   * Administrador:
   *
   * navigation.navigate('DetallePedido', {
   *   id_pedido: pedido.id_pedido,
   *   esAdmin: true,
   * });
   */

  const { id_pedido, esAdmin = false } = route.params || {};

  const [pedido, setPedido] = useState<PedidoModel | null>(null);
  const [loading, setLoading] = useState(true);

  // ============================================================
  // CARGAR PEDIDO
  // ============================================================

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

      // ========================================================
      // CLIENTE
      // ========================================================

      if (!esAdmin) {
        /*
         * Primero obtenemos los pedidos del cliente.
         * Esto permite comprobar que el pedido pertenece
         * a su cuenta.
         */
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

        /*
         * Una vez comprobada la pertenencia, obtenemos
         * nuevamente el detalle completo.
         */
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

      // ========================================================
      // ADMINISTRADOR
      // ========================================================

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

      /*
       * El administrador únicamente puede consultar
       * pedidos en estados activos.
       */
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

  /*
   * Cada vez que el usuario vuelve a entrar al screen,
   * se vuelve a consultar el pedido.
   */
  useFocusEffect(
    useCallback(() => {
      cargarPedido();
    }, [cargarPedido])
  );

  // ============================================================
  // FUNCIONES AUXILIARES
  // ============================================================

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

  /*
   * El PedidoModel tiene su propio estadoColor.
   * Se conserva ese color para representar el estado,
   * mientras que el resto de la interfaz utiliza COLORS.
   */
  const obtenerColorEstado = () => {
    if (!pedido) {
      return COLORS.gray;
    }

    return pedido.estadoColor;
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
          Cargando pedido...
        </Text>
      </View>
    );
  }

  // ============================================================
  // PEDIDO NO ENCONTRADO
  // ============================================================

  if (!pedido) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons
          name="document-text-outline"
          size={60}
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

  // ============================================================
  // RENDER
  // ============================================================

  const colorEstado = obtenerColorEstado();

  return (
    <View style={styles.container}>

      {/* ======================================================
          HEADER
      ====================================================== */}

      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backIcon}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="arrow-back"
            size={25}
            color={COLORS.text}
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={styles.headerTitle}>
            Detalle del pedido
          </Text>

          <Text style={styles.headerSubtitle}>
            Pedido #{pedido.id_pedido}
          </Text>
        </View>

        <View style={styles.headerPlaceholder} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ====================================================
            ESTADO
        ==================================================== */}

        <View style={styles.statusCard}>
          <View
            style={[
              styles.statusIconContainer,
              {
                backgroundColor: `${colorEstado}20`,
              },
            ]}
          >
            <Ionicons
              name={obtenerIconoEstado() as any}
              size={30}
              color={colorEstado}
            />
          </View>

          <View style={styles.statusInfo}>
            <Text style={styles.statusLabel}>
              Estado del pedido
            </Text>

            <Text
              style={[
                styles.statusValue,
                {
                  color: colorEstado,
                },
              ]}
            >
              {pedido.estadoDisplay}
            </Text>
          </View>
        </View>

        {/* ====================================================
            INFORMACIÓN DEL PEDIDO
        ==================================================== */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Información del pedido
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="calendar-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Fecha del pedido
              </Text>

              <Text style={styles.infoValue}>
                {pedido.fechaFormateada}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="time-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Fecha estimada
              </Text>

              <Text style={styles.infoValue}>
                {pedido.fechaEstimadaFormateada}
              </Text>
            </View>
          </View>
        </View>

        {/* ====================================================
            PRODUCTOS
        ==================================================== */}

        <View style={styles.card}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>
              Productos
            </Text>

            <View style={styles.productCountContainer}>
              <Text style={styles.productCount}>
                {pedido.productos?.length || 0}
              </Text>
            </View>
          </View>

          {pedido.productos &&
          pedido.productos.length > 0 ? (
            pedido.productos.map(
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
                    style={styles.productItem}
                  >

                    {imagen ? (
                      <Image
                        source={{ uri: imagen }}
                        style={styles.productImage}
                      />
                    ) : (
                      <View
                        style={
                          styles.productImagePlaceholder
                        }
                      >
                        <Ionicons
                          name="cube-outline"
                          size={27}
                          color={COLORS.gray}
                        />
                      </View>
                    )}

                    <View style={styles.productInfo}>
                      <Text
                        style={styles.productName}
                        numberOfLines={2}
                      >
                        {nombre}
                      </Text>

                      <Text
                        style={styles.productQuantity}
                      >
                        Cantidad: {cantidad}
                      </Text>

                      <Text
                        style={styles.productUnitPrice}
                      >
                        {formatearDinero(precio)} c/u
                      </Text>
                    </View>

                    <Text style={styles.productPrice}>
                      {formatearDinero(
                        precio * Number(cantidad)
                      )}
                    </Text>
                  </View>
                );
              }
            )
          ) : (
            <View style={styles.noProducts}>
              <Ionicons
                name="cube-outline"
                size={35}
                color={COLORS.gray}
              />

              <Text style={styles.noProductsText}>
                No hay productos registrados
              </Text>
            </View>
          )}
        </View>

        {/* ====================================================
            FÓRMULA
        ==================================================== */}

        {pedido.formula && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Fórmula asociada
            </Text>

            <View style={styles.formulaContainer}>

              {pedido.formula.imagen_formula ? (
                <Image
                  source={{
                    uri: pedido.formula.imagen_formula,
                  }}
                  style={styles.formulaImage}
                  resizeMode="cover"
                />
              ) : (
                <View style={styles.formulaPlaceholder}>
                  <Ionicons
                    name="eye-outline"
                    size={35}
                    color={COLORS.gray}
                  />

                  <Text style={styles.placeholderText}>
                    Sin imagen
                  </Text>
                </View>
              )}

              <View style={styles.formulaInfo}>
                <Text style={styles.formulaCondition}>
                  {pedido.formula.condicion ||
                    'Sin condición'}
                </Text>

                {pedido.formula.observaciones ? (
                  <View
                    style={styles.observationContainer}
                  >
                    <Text style={styles.infoLabel}>
                      Observaciones
                    </Text>

                    <Text
                      style={styles.observationText}
                    >
                      {pedido.formula.observaciones}
                    </Text>
                  </View>
                ) : null}

                <View style={styles.formulaCost}>
                  <Text style={styles.infoLabel}>
                    Costo de fórmula
                  </Text>

                  <Text
                    style={styles.formulaCostValue}
                  >
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
            DATOS DEL CLIENTE
        ==================================================== */}

        {pedido.cliente && (
          <View style={styles.card}>
            <Text style={styles.sectionTitle}>
              Datos del cliente
            </Text>

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="person-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  Nombre
                </Text>

                <Text style={styles.infoValue}>
                  {pedido.cliente.nombre}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  Correo electrónico
                </Text>

                <Text
                  style={styles.infoValue}
                  numberOfLines={2}
                >
                  {pedido.cliente.email}
                </Text>
              </View>
            </View>

            <View style={styles.divider} />

            <View style={styles.infoRow}>
              <View style={styles.infoIcon}>
                <Ionicons
                  name="call-outline"
                  size={20}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>
                  Teléfono
                </Text>

                <Text style={styles.infoValue}>
                  {pedido.cliente.telefono}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* ====================================================
            INFORMACIÓN DE ENTREGA
        ==================================================== */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Información de entrega
          </Text>

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="location-outline"
                size={21}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Dirección
              </Text>

              <Text style={styles.infoValue}>
                {pedido.direccion_entrega ||
                  'No especificada'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons
                name="business-outline"
                size={20}
                color={COLORS.primary}
              />
            </View>

            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>
                Ciudad
              </Text>

              <Text style={styles.infoValue}>
                {pedido.ciudad_envio ||
                  'No especificada'}
              </Text>
            </View>
          </View>
        </View>

        {/* ====================================================
            RESUMEN DE PAGO
        ==================================================== */}

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>
            Resumen del pedido
          </Text>

          <View style={styles.priceRow}>
            <Text style={styles.priceLabel}>
              Costo de envío
            </Text>

            <Text style={styles.priceValue}>
              {formatearDinero(
                pedido.costo_envio
              )}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.totalValue}>
              {pedido.totalFormateado}
            </Text>
          </View>
        </View>

        <View style={styles.bottomSpace} />

      </ScrollView>
    </View>
  );
}

// ================================================================
// ESTILOS
// ================================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  // ==============================================================
  // LOADING
  // ==============================================================

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },

  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.text,
  },

  // ==============================================================
  // EMPTY
  // ==============================================================

  emptyContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 25,
  },

  emptyTitle: {
    marginTop: 15,
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.text,
  },

  backButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 10,
  },

  backButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '700',
  },

  // ==============================================================
  // HEADER
  // ==============================================================

  header: {
    height: 72,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },

  backIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  headerSubtitle: {
    marginTop: 2,
    fontSize: 13,
    color: COLORS.gray,
  },

  headerPlaceholder: {
    width: 42,
  },

  // ==============================================================
  // SCROLL
  // ==============================================================

  scrollContent: {
    padding: 15,
    paddingBottom: 30,
  },

  // ==============================================================
  // STATUS
  // ==============================================================

  statusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
    elevation: 3,
  },

  statusIconContainer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusInfo: {
    flex: 1,
    marginLeft: 15,
  },

  statusLabel: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 4,
  },

  statusValue: {
    fontSize: 18,
    fontWeight: '800',
  },

  // ==============================================================
  // CARDS
  // ==============================================================

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 17,
    marginBottom: 15,

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 2,
  },

  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 16,
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  productCountContainer: {
    minWidth: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 8,
    marginBottom: 16,
  },

  productCount: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },

  // ==============================================================
  // INFORMATION ROW
  // ==============================================================

  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 55,
  },

  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FDECEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  infoContent: {
    flex: 1,
  },

  infoLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: COLORS.text,
  },

  divider: {
    height: 1,
    backgroundColor: '#EEEEEE',
    marginVertical: 12,
  },

  // ==============================================================
  // PRODUCTS
  // ==============================================================

  productItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  productImage: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },

  productImagePlaceholder: {
    width: 68,
    height: 68,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  productInfo: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
  },

  productName: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 5,
  },

  productQuantity: {
    fontSize: 13,
    color: COLORS.gray,
    marginBottom: 3,
  },

  productUnitPrice: {
    fontSize: 12,
    color: COLORS.gray,
  },

  productPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },

  noProducts: {
    alignItems: 'center',
    paddingVertical: 25,
  },

  noProductsText: {
    marginTop: 8,
    fontSize: 14,
    color: COLORS.gray,
  },

  // ==============================================================
  // FORMULA
  // ==============================================================

  formulaContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  formulaImage: {
    width: 105,
    height: 125,
    borderRadius: 10,
    backgroundColor: COLORS.background,
  },

  formulaPlaceholder: {
    width: 105,
    height: 125,
    borderRadius: 10,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  placeholderText: {
    marginTop: 7,
    fontSize: 12,
    color: COLORS.gray,
  },

  formulaInfo: {
    flex: 1,
    marginLeft: 13,
  },

  formulaCondition: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 12,
  },

  observationContainer: {
    marginBottom: 13,
  },

  observationText: {
    fontSize: 13,
    color: COLORS.text,
    lineHeight: 19,
    marginTop: 4,
  },

  formulaCost: {
    marginTop: 2,
  },

  formulaCostValue: {
    marginTop: 3,
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.primary,
  },

  // ==============================================================
  // PAYMENT
  // ==============================================================

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  priceLabel: {
    fontSize: 14,
    color: COLORS.gray,
  },

  priceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text,
  },

  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },

  totalLabel: {
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
  },

  totalValue: {
    fontSize: 21,
    fontWeight: '900',
    color: COLORS.primary,
  },

  bottomSpace: {
    height: 20,
  },
});