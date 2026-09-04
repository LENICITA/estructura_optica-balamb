// src/features/client/screens/DetallePedidoCliente.tsx

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
  'Pendiente',
  'Abonado',
  'Listo',
  'Pagado',
  'En Proceso',
  'Enviado',
  'Entregado',
];

export default function DetallePedidoCliente() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { id_pedido } = route.params || {};

  const [pedido, setPedido] = useState<PedidoModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [imagenAmpliada, setImagenAmpliada] =
    useState<string | null>(null);

  // =========================================================
  // CARGAR PEDIDO
  // =========================================================

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

      const misPedidos =
        await pedidoController.getMisPedidos();

      const pedidoCliente = misPedidos.find(
        item =>
          Number(item.id_pedido) ===
          Number(id_pedido)
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
          'No fue posible encontrar la información del pedido.'
        );

        navigation.goBack();
        return;
      }

      if (
        !ESTADOS_ACTIVOS.includes(
          detalle.estado
        )
      ) {
        Alert.alert(
          'Pedido no disponible',
          'Este pedido ya no se encuentra disponible.'
        );

        navigation.goBack();
        return;
      }

      console.log(
        'DETALLE PEDIDO CLIENTE:',
        JSON.stringify(
          detalle,
          null,
          2
        )
      );

      console.log(
        'FORMULA:',
        JSON.stringify(
          detalle.formula,
          null,
          2
        )
      );

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
  }, [
    id_pedido,
    navigation,
  ]);

  // =========================================================
  // RECARGAR AL VOLVER
  // =========================================================

  useFocusEffect(
    useCallback(() => {
      cargarPedido();
    }, [cargarPedido])
  );

  // =========================================================
  // FORMATEAR DINERO
  // =========================================================

  const formatearDinero = (
    valor:
      | number
      | string
      | undefined
      | null
  ) => {
    const numero = Number(
      valor || 0
    );

    return numero.toLocaleString(
      'es-CO',
      {
        style: 'currency',
        currency: 'COP',
        maximumFractionDigits: 0,
      }
    );
  };

  // =========================================================
  // PRODUCTOS
  // =========================================================

  const obtenerNombreProducto = (
    producto: any
  ) => {
    return (
      producto?.nombre ||
      producto?.nombre_producto ||
      producto?.producto?.nombre ||
      producto?.producto?.nombre_producto ||
      'Producto'
    );
  };

  const obtenerCantidad = (
    producto: any
  ) => {
    return Number(
      producto?.cantidad ||
      producto?.cantidad_producto ||
      producto?.producto?.cantidad ||
      1
    );
  };

  const obtenerPrecio = (
    producto: any
  ) => {
    return Number(
      producto?.precio ||
      producto?.precio_unitario ||
      producto?.producto?.precio ||
      0
    );
  };

  const obtenerImagenProducto = (
    producto: any
  ) => {
    return (
      producto?.imagen ||
      producto?.imagen_producto ||
      producto?.producto?.imagen ||
      producto?.producto?.imagen_producto ||
      producto?.url_imagen ||
      null
    );
  };

  // =========================================================
  // FORMULA
  // =========================================================

  const obtenerFormula = () => {
    if (!pedido) {
      return null;
    }

    return pedido.formula || null;
  };

  const obtenerDescripcionFormula = () => {
    const formula =
      obtenerFormula();

    if (!formula) {
      return '';
    }

    if (formula.observaciones) {
      return formula.observaciones;
    }

    if (formula.condicion) {
      return formula.condicion;
    }

    return 'Fórmula óptica asociada al pedido.';
  };

  // =========================================================
  // CALCULAR SALDO RESTANTE
  // =========================================================

  const obtenerTotalPedido = () => {
    if (!pedido) {
      return 0;
    }

    return Number(
      pedido.total ??
      0
    );
  };

  const obtenerAbonoPedido = () => {
    if (!pedido) {
      return 0;
    }

    return Number(
      pedido.abono ??
      0
    );
  };

  const obtenerSaldoRestante = () => {
    const total =
      obtenerTotalPedido();

    const abono =
      obtenerAbonoPedido();

    const saldo =
      total - abono;

    return saldo > 0
      ? saldo
      : 0;
  };

  // =========================================================
  // ICONO ESTADO
  // =========================================================

  const obtenerIconoEstado = () => {
    if (!pedido) {
      return 'ellipse-outline';
    }

    switch (pedido.estado) {
      case 'Pendiente':
        return 'time-outline';

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

      default:
        return 'time-outline';
    }
  };

  // =========================================================
  // COLOR ESTADO
  // =========================================================

  const obtenerColorEstado = () => {
    if (!pedido) {
      return COLORS.gray;
    }

    switch (pedido.estado) {
      case 'Pendiente':
        return '#D97706';

      case 'Abonado':
        return '#2563EB';

      case 'Listo':
        return '#7C3AED';

      case 'Pagado':
        return '#059669';

      case 'En Proceso':
        return '#0284C7';

      case 'Enviado':
        return '#6366F1';

      case 'Entregado':
        return '#22C55E';

      default:
        return COLORS.gray;
    }
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <View
        style={
          styles.loadingContainer
        }
      >
        <ActivityIndicator
          size="large"
          color={
            COLORS.primary
          }
        />

        <Text
          style={
            styles.loadingText
          }
        >
          Cargando pedido...
        </Text>
      </View>
    );
  }

  // =========================================================
  // SIN PEDIDO
  // =========================================================

  if (!pedido) {
    return (
      <View
        style={
          styles.emptyContainer
        }
      >
        <Ionicons
          name="document-text-outline"
          size={55}
          color={COLORS.gray}
        />

        <Text
          style={
            styles.emptyTitle
          }
        >
          Pedido no encontrado
        </Text>

        <TouchableOpacity
          style={
            styles.backButton
          }
          onPress={() =>
            navigation.goBack()
          }
        >
          <Text
            style={
              styles.backButtonText
            }
          >
            Volver
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const colorEstado =
    obtenerColorEstado();

  const formula =
    obtenerFormula();

  const totalPedido =
    obtenerTotalPedido();

  const abonoPedido =
    obtenerAbonoPedido();

  const saldoRestante =
    obtenerSaldoRestante();

  // =========================================================
  // INTERFAZ
  // =========================================================

  return (
    <View
      style={styles.container}
    >

      {/* =====================================================
          MODAL IMAGEN
      ===================================================== */}

      <Modal
        visible={
          imagenAmpliada !== null
        }
        transparent
        animationType="fade"
        onRequestClose={() =>
          setImagenAmpliada(null)
        }
      >
        <View
          style={
            styles.imageModalContainer
          }
        >

          <TouchableOpacity
            style={
              styles.imageModalClose
            }
            onPress={() =>
              setImagenAmpliada(null)
            }
          >
            <Ionicons
              name="close"
              size={30}
              color={
                COLORS.white
              }
            />
          </TouchableOpacity>

          {imagenAmpliada && (
            <Image
              source={{
                uri: imagenAmpliada,
              }}
              style={
                styles.imageModal
              }
              resizeMode="contain"
            />
          )}

        </View>
      </Modal>

      {/* =====================================================
          HEADER
      ===================================================== */}

      <View
        style={styles.header}
      >

        <TouchableOpacity
          style={
            styles.backButtonHeader
          }
          onPress={() =>
            navigation.goBack()
          }
        >
          <Ionicons
            name="arrow-back"
            size={24}
            color={
              COLORS.text
            }
          />
        </TouchableOpacity>

        <View
          style={styles.headerInfo}
        >

          <Text
            style={
              styles.headerTitle
            }
          >
            Detalle del pedido
          </Text>

          <Text
            style={
              styles.headerSubtitle
            }
          >
            Pedido #{pedido.id_pedido}
          </Text>

        </View>

        <View
          style={
            styles.headerSpacer
          }
        />

      </View>

      <ScrollView
        showsVerticalScrollIndicator={
          false
        }
        contentContainerStyle={
          styles.scrollContent
        }
      >

        {/* ===================================================
            ESTADO
        =================================================== */}

        <View
          style={styles.statusCard}
        >

          <View
            style={[
              styles.statusIcon,
              {
                backgroundColor:
                  `${colorEstado}18`,
              },
            ]}
          >

            <Ionicons
              name={
                obtenerIconoEstado() as any
              }
              size={30}
              color={
                colorEstado
              }
            />

          </View>

          <View
            style={
              styles.statusInfo
            }
          >

            <Text
              style={
                styles.statusLabel
              }
            >
              Estado del pedido
            </Text>

            <Text
              style={[
                styles.statusText,
                {
                  color:
                    colorEstado,
                },
              ]}
            >
              {pedido.estado}
            </Text>

          </View>

        </View>

        {/* ===================================================
            INFORMACIÓN DEL PEDIDO
        =================================================== */}

        <View
          style={styles.section}
        >

          <View
            style={
              styles.sectionTitleContainer
            }
          >

            <Ionicons
              name="receipt-outline"
              size={20}
              color={
                COLORS.primary
              }
            />

            <Text
              style={
                styles.sectionTitle
              }
            >
              Información del pedido
            </Text>

          </View>

          <View
            style={
              styles.infoRow
            }
          >

            <Text
              style={
                styles.infoLabel
              }
            >
              Fecha
            </Text>

            <Text
              style={
                styles.infoValue
              }
            >
              {pedido.fechaFormateada ||
                'No disponible'}
            </Text>

          </View>

          <View
            style={
              styles.divider
            }
          />

          <View
            style={
              styles.infoRow
            }
          >

            <Text
              style={
                styles.infoLabel
              }
            >
              Fecha estimada
            </Text>

            <Text
              style={
                styles.infoValue
              }
            >
              {pedido.fechaEstimadaFormateada ||
                'No disponible'}
            </Text>

          </View>

          <View
            style={
              styles.divider
            }
          />

          <View
            style={
              styles.infoRow
            }
          >

            <Text
              style={
                styles.infoLabel
              }
            >
              Productos
            </Text>

            <Text
              style={
                styles.infoValue
              }
            >
              {pedido.productos?.length ||
                0}
            </Text>

          </View>

        </View>

        {/* ===================================================
            PRODUCTOS
        =================================================== */}

        {pedido.productos &&
          pedido.productos.length >
            0 && (
            <View
              style={styles.section}
            >

              <View
                style={
                  styles.sectionTitleRow
                }
              >

                <View
                  style={
                    styles.sectionTitleContainer
                  }
                >

                  <Ionicons
                    name="glasses-outline"
                    size={20}
                    color={
                      COLORS.primary
                    }
                  />

                  <Text
                    style={
                      styles.sectionTitle
                    }
                  >
                    Productos
                  </Text>

                </View>

                <View
                  style={
                    styles.countBadge
                  }
                >

                  <Text
                    style={
                      styles.countBadgeText
                    }
                  >
                    {
                      pedido.productos
                        .length
                    }
                  </Text>

                </View>

              </View>

              {pedido.productos.map(
                (
                  producto: any,
                  index: number
                ) => {

                  const nombre =
                    obtenerNombreProducto(
                      producto
                    );

                  const cantidad =
                    obtenerCantidad(
                      producto
                    );

                  const precio =
                    obtenerPrecio(
                      producto
                    );

                  const imagen =
                    obtenerImagenProducto(
                      producto
                    );

                  return (
                    <View
                      key={
                        producto?.id_pedido_producto ||
                        producto?.id_producto ||
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
                          activeOpacity={
                            0.85
                          }
                          onPress={() =>
                            setImagenAmpliada(
                              imagen
                            )
                          }
                        >

                          <Image
                            source={{
                              uri: imagen,
                            }}
                            style={
                              styles.productImage
                            }
                            resizeMode="contain"
                          />

                        </TouchableOpacity>
                      ) : (

                        <View
                          style={
                            styles.productPlaceholder
                          }
                        >

                          <Ionicons
                            name="glasses-outline"
                            size={28}
                            color={
                              COLORS.gray
                            }
                          />

                        </View>
                      )}

                      <View
                        style={
                          styles.productInfo
                        }
                      >

                        <Text
                          style={
                            styles.productName
                          }
                          numberOfLines={
                            2
                          }
                        >
                          {nombre}
                        </Text>

                        <Text
                          style={
                            styles.productQuantity
                          }
                        >
                          Cantidad: {cantidad}
                        </Text>

                        <Text
                          style={
                            styles.productUnitPrice
                          }
                        >
                          {formatearDinero(
                            precio
                          )}{' '}
                          c/u
                        </Text>

                      </View>

                      <View
                        style={
                          styles.productTotalContainer
                        }
                      >

                        <Text
                          style={
                            styles.productTotalLabel
                          }
                        >
                          Total
                        </Text>

                        <Text
                          style={
                            styles.productTotal
                          }
                        >
                          {formatearDinero(
                            precio *
                              cantidad
                          )}
                        </Text>

                      </View>

                    </View>
                  );
                }
              )}

            </View>
          )}

        {/* ===================================================
            DATOS DEL CLIENTE
        =================================================== */}

        {pedido.cliente && (
          <View
            style={styles.section}
          >

            <View
              style={
                styles.sectionTitleContainer
              }
            >

              <Ionicons
                name="person-outline"
                size={20}
                color={
                  COLORS.primary
                }
              />

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Datos del cliente
              </Text>

            </View>

            <View
              style={
                styles.clientRow
              }
            >

              <View
                style={
                  styles.clientIcon
                }
              >

                <Ionicons
                  name="person-outline"
                  size={18}
                  color={
                    COLORS.primary
                  }
                />

              </View>

              <View
                style={
                  styles.clientContent
                }
              >

                <Text
                  style={
                    styles.clientLabel
                  }
                >
                  Nombre
                </Text>

                <Text
                  style={
                    styles.clientValue
                  }
                >
                  {pedido.cliente.nombre ||
                    'No especificado'}
                </Text>

              </View>

            </View>

            <View
              style={
                styles.clientRow
              }
            >

              <View
                style={
                  styles.clientIcon
                }
              >

                <Ionicons
                  name="call-outline"
                  size={18}
                  color={
                    COLORS.primary
                  }
                />

              </View>

              <View
                style={
                  styles.clientContent
                }
              >

                <Text
                  style={
                    styles.clientLabel
                  }
                >
                  Teléfono
                </Text>

                <Text
                  style={
                    styles.clientValue
                  }
                >
                  {pedido.cliente.telefono ||
                    'No especificado'}
                </Text>

              </View>

            </View>

            <View
              style={
                styles.clientRow
              }
            >

              <View
                style={
                  styles.clientIcon
                }
              >

                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={
                    COLORS.primary
                  }
                />

              </View>

              <View
                style={
                  styles.clientContent
                }
              >

                <Text
                  style={
                    styles.clientLabel
                  }
                >
                  Correo electrónico
                </Text>

                <Text
                  style={
                    styles.clientValue
                  }
                  numberOfLines={
                    2
                  }
                >
                  {pedido.cliente.email ||
                    pedido.cliente.correo ||
                    'No especificado'}
                </Text>

              </View>

            </View>

          </View>
        )}

        {/* ===================================================
            INFORMACIÓN DE ENTREGA
        =================================================== */}

        <View
          style={styles.section}
        >

          <View
            style={
              styles.sectionTitleContainer
            }
          >

            <Ionicons
              name="location-outline"
              size={20}
              color={
                COLORS.primary
              }
            />

            <Text
              style={
                styles.sectionTitle
              }
            >
              Información de entrega
            </Text>

          </View>

          <View
            style={
              styles.deliveryRow
            }
          >

            <Ionicons
              name="location-outline"
              size={20}
              color={
                COLORS.primary
              }
            />

            <View
              style={
                styles.deliveryContent
              }
            >

              <Text
                style={
                  styles.deliveryLabel
                }
              >
                Dirección
              </Text>

              <Text
                style={
                  styles.deliveryValue
                }
              >
                {pedido.direccion_entrega ||
                  'No especificada'}
              </Text>

            </View>

          </View>

          <View
            style={
              styles.deliveryRow
            }
          >

            <Ionicons
              name="business-outline"
              size={20}
              color={
                COLORS.primary
              }
            />

            <View
              style={
                styles.deliveryContent
              }
            >

              <Text
                style={
                  styles.deliveryLabel
                }
              >
                Ciudad
              </Text>

              <Text
                style={
                  styles.deliveryValue
                }
              >
                {pedido.ciudad_envio ||
                  'No especificada'}
              </Text>

            </View>

          </View>

        </View>

        {/* ===================================================
            FORMULA OPTICA
        =================================================== */}

        {formula && (
          <View
            style={styles.section}
          >

            <View
              style={
                styles.sectionTitleContainer
              }
            >

              <Ionicons
                name="eye-outline"
                size={20}
                color={
                  COLORS.primary
                }
              />

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Fórmula óptica
              </Text>

            </View>

            <View
              style={
                styles.formulaCard
              }
            >

              {/* IMAGEN */}

              {formula.imagen_formula ? (

                <TouchableOpacity
                  activeOpacity={
                    0.85
                  }
                  style={
                    styles.formulaImageContainer
                  }
                  onPress={() =>
                    setImagenAmpliada(
                      formula.imagen_formula
                    )
                  }
                >

                  <Image
                    source={{
                      uri:
                        formula.imagen_formula,
                    }}
                    style={
                      styles.formulaImage
                    }
                    resizeMode="cover"
                  />

                  <View
                    style={
                      styles.formulaExpandButton
                    }
                  >

                    <Ionicons
                      name="expand-outline"
                      size={18}
                      color={
                        COLORS.white
                      }
                    />

                  </View>

                </TouchableOpacity>

              ) : (

                <View
                  style={
                    styles.formulaImagePlaceholder
                  }
                >

                  <Ionicons
                    name="document-text-outline"
                    size={34}
                    color={
                      COLORS.gray
                    }
                  />

                  <Text
                    style={
                      styles.formulaNoImageText
                    }
                  >
                    Sin imagen
                  </Text>

                </View>
              )}

              {/* DESCRIPCIÓN CORTA */}

              <View
                style={
                  styles.formulaInfo
                }
              >

                <Text
                  style={
                    styles.formulaTitle
                  }
                  numberOfLines={
                    2
                  }
                >
                  {formula.condicion ||
                    'Fórmula óptica'}
                </Text>

                <Text
                  style={
                    styles.formulaDescription
                  }
                  numberOfLines={
                    5
                  }
                >
                  {obtenerDescripcionFormula()}
                </Text>

                {formula.costo !==
                  undefined &&
                  formula.costo !==
                    null && (

                    <View
                      style={
                        styles.formulaCost
                      }
                    >

                      <Text
                        style={
                          styles.formulaCostLabel
                        }
                      >
                        Costo
                      </Text>

                      <Text
                        style={
                          styles.formulaCostValue
                        }
                      >
                        {formatearDinero(
                          formula.costo
                        )}
                      </Text>

                    </View>
                  )}

              </View>

            </View>

          </View>
        )}

        {/* ===================================================
            SIN FORMULA
        =================================================== */}

        {!formula && (
          <View
            style={styles.section}
          >

            <View
              style={
                styles.sectionTitleContainer
              }
            >

              <Ionicons
                name="eye-outline"
                size={20}
                color={
                  COLORS.primary
                }
              />

              <Text
                style={
                  styles.sectionTitle
                }
              >
                Fórmula óptica
              </Text>

            </View>

            <View
              style={
                styles.noFormulaContainer
              }
            >

              <Ionicons
                name="document-text-outline"
                size={32}
                color={
                  COLORS.gray
                }
              />

              <Text
                style={
                  styles.noFormulaTitle
                }
              >
                No hay fórmula asociada
              </Text>

              <Text
                style={
                  styles.noFormulaText
                }
              >
                Este pedido todavía no
                tiene una fórmula óptica
                asociada.
              </Text>

            </View>

          </View>
        )}

        {/* ===================================================
            RESUMEN DE PAGO
        =================================================== */}

        <View
          style={styles.section}
        >

          <View
            style={
              styles.sectionTitleContainer
            }
          >

            <Ionicons
              name="card-outline"
              size={20}
              color={
                COLORS.primary
              }
            />

            <Text
              style={
                styles.sectionTitle
              }
            >
              Resumen de pago
            </Text>

          </View>

          {/* TOTAL */}

          <View
            style={
              styles.paymentRow
            }
          >

            <Text
              style={
                styles.paymentLabel
              }
            >
              Total del pedido
            </Text>

            <Text
              style={
                styles.paymentValue
              }
            >
              {pedido.totalFormateado ||
                formatearDinero(
                  totalPedido
                )}
            </Text>

          </View>

          <View
            style={
              styles.divider
            }
          />

          {/* ABONO */}

          <View
            style={
              styles.paymentRow
            }
          >

            <Text
              style={
                styles.paymentLabel
              }
            >
              Abono
            </Text>

            <Text
              style={
                styles.paymentValue
              }
            >
              {formatearDinero(
                abonoPedido
              )}
            </Text>

          </View>

          <View
            style={
              styles.divider
            }
          />

          {/* SALDO RESTANTE */}

          <View
            style={
              styles.balanceRow
            }
          >

            <View>
              <Text
                style={
                  styles.balanceLabel
                }
              >
                Saldo restante
              </Text>

              <Text
                style={
                  styles.balanceDescription
                }
              >
                Total - Abono
              </Text>
            </View>

            <Text
              style={
                styles.balanceValue
              }
            >
              {formatearDinero(
                saldoRestante
              )}
            </Text>

          </View>

        </View>

        <View
          style={
            styles.bottomSpace
          }
        />

      </ScrollView>
    </View>
  );
}

// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor:
      COLORS.background,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor:
      COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.text,
  },

  emptyContainer: {
    flex: 1,
    backgroundColor:
      COLORS.background,
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
    backgroundColor:
      COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 9,
  },

  backButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

  // ==========================================================
  // HEADER
  // ==========================================================

  header: {
    height: 60,
    backgroundColor:
      COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor:
      '#E7E7E7',
  },

  backButtonHeader: {
    width: 40,
    height: 40,
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

  headerSpacer: {
    width: 40,
  },

  // ==========================================================
  // SCROLL
  // ==========================================================

  scrollContent: {
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 15,
  },

  // ==========================================================
  // ESTADO
  // ==========================================================

  statusCard: {
    backgroundColor:
      COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',

    shadowColor:
      COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  statusIcon: {
    width: 54,
    height: 54,
    borderRadius: 27,
    justifyContent: 'center',
    alignItems: 'center',
  },

  statusInfo: {
    marginLeft: 13,
    flex: 1,
  },

  statusLabel: {
    fontSize: 12,
    color: COLORS.gray,
    marginBottom: 3,
  },

  statusText: {
    fontSize: 19,
    fontWeight: '800',
  },

  // ==========================================================
  // SECCIONES
  // ==========================================================

  section: {
    backgroundColor:
      COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 13,
    marginBottom: 10,

    shadowColor:
      COLORS.black,
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },

  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  sectionTitle: {
    marginLeft: 7,
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },

  // ==========================================================
  // INFORMACIÓN
  // ==========================================================

  infoRow: {
    minHeight: 31,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  infoLabel: {
    fontSize: 13,
    color: COLORS.gray,
  },

  infoValue: {
    flex: 1,
    marginLeft: 15,
    textAlign: 'right',
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.text,
  },

  divider: {
    height: 1,
    backgroundColor:
      '#EEEEEE',
    marginVertical: 5,
  },

  countBadge: {
    minWidth: 24,
    height: 24,
    borderRadius: 12,
    paddingHorizontal: 7,
    backgroundColor:
      COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },

  countBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '800',
  },

  // ==========================================================
  // PRODUCTOS
  // ==========================================================

  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    borderTopWidth: 1,
    borderTopColor:
      '#EEEEEE',
  },

  productRowFirst: {
    borderTopWidth: 0,
    paddingTop: 0,
  },

  productImage: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor:
      COLORS.background,
  },

  productPlaceholder: {
    width: 58,
    height: 58,
    borderRadius: 8,
    backgroundColor:
      COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
  },

  productInfo: {
    flex: 1,
    marginLeft: 10,
    marginRight: 8,
  },

  productName: {
    fontSize: 13,
    lineHeight: 17,
    fontWeight: '700',
    color: COLORS.text,
  },

  productQuantity: {
    marginTop: 3,
    fontSize: 11,
    color: COLORS.gray,
  },

  productUnitPrice: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.gray,
  },

  productTotalContainer: {
    alignItems: 'flex-end',
  },

  productTotalLabel: {
    fontSize: 10,
    color: COLORS.gray,
    marginBottom: 2,
  },

  productTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.primary,
  },

  // ==========================================================
  // CLIENTE
  // ==========================================================

  clientRow: {
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor:
      '#EEEEEE',
  },

  clientIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor:
      '#FDECEC',
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

  // ==========================================================
  // ENTREGA
  // ==========================================================

  deliveryRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor:
      '#EEEEEE',
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

  // ==========================================================
  // FORMULA
  // ==========================================================

  formulaCard: {
    backgroundColor:
      '#F9FAFB',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },

  formulaImageContainer: {
    width: 105,
    height: 125,
    borderRadius: 9,
    overflow: 'hidden',
    position: 'relative',
    backgroundColor:
      COLORS.background,
  },

  formulaImage: {
    width: '100%',
    height: '100%',
  },

  formulaExpandButton: {
    position: 'absolute',
    right: 6,
    bottom: 6,
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor:
      'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },

  formulaImagePlaceholder: {
    width: 105,
    height: 125,
    borderRadius: 9,
    backgroundColor:
      '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
  },

  formulaNoImageText: {
    marginTop: 5,
    fontSize: 10,
    color: COLORS.gray,
  },

  formulaInfo: {
    flex: 1,
    marginLeft: 12,
  },

  formulaTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 6,
  },

  formulaDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.gray,
  },

  formulaCost: {
    marginTop: 9,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor:
      '#E5E7EB',
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  formulaCostLabel: {
    fontSize: 10,
    color: COLORS.gray,
  },

  formulaCostValue: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },

  noFormulaContainer: {
    backgroundColor:
      '#F9FAFB',
    borderRadius: 10,
    padding: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },

  noFormulaTitle: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.text,
  },

  noFormulaText: {
    marginTop: 4,
    fontSize: 11,
    lineHeight: 16,
    textAlign: 'center',
    color: COLORS.gray,
  },

  // ==========================================================
  // PAGO
  // ==========================================================

  paymentRow: {
    minHeight: 34,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  paymentLabel: {
    fontSize: 13,
    color: COLORS.gray,
  },

  paymentValue: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.text,
  },

  balanceRow: {
    minHeight: 42,
    flexDirection: 'row',
    justifyContent:
      'space-between',
    alignItems: 'center',
  },

  balanceLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.text,
  },

  balanceDescription: {
    marginTop: 2,
    fontSize: 10,
    color: COLORS.gray,
  },

  balanceValue: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.primary,
  },

  // ==========================================================
  // MODAL IMAGEN
  // ==========================================================

  imageModalContainer: {
    flex: 1,
    backgroundColor:
      'rgba(0,0,0,0.95)',
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
    backgroundColor:
      'rgba(255,255,255,0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },

  bottomSpace: {
    height: 15,
  },
});