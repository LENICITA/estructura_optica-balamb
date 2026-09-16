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
import { DistribucionController } from '../../../core/controllers/DistribucionController';

const pedidoController = new PedidoController();
const distribucionController = new DistribucionController();

const ESTADOS_ACTIVOS = [
  'Abonado',
  'Listo',
  'Pagado',
  'En Proceso',
  'Enviado',
  'Entregado',
];

const ESTADOS_EDITABLES = [
  'Abonado',
  'Listo',
  'Pagado',
  'En Proceso',
];

const ESTADOS_CANCELABLES = [
  'En Proceso',
  'Enviado',
];

export default function DetallePedido() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { id_pedido, esAdmin = false } = route.params || {};

  const [pedido, setPedido] = useState<PedidoModel | null>(null);
  const [loading, setLoading] = useState(true);

  const [marcandoListo, setMarcandoListo] = useState(false);
  const [imagenAmpliada, setImagenAmpliada] = useState<string | null>(null);

  const [cancelando, setCancelando] = useState(false);

  const [modalFechaEstimada, setModalFechaEstimada] = useState(false);
  const [fechaEstimadaInput, setFechaEstimadaInput] = useState('');
  const [mesCalendario, setMesCalendario] = useState(new Date());
  const [guardandoFechaEstimada, setGuardandoFechaEstimada] = useState(false);

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

      // PEDIDO (ADMIN)
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

  // ======================================================
  // CANCELAR ENTREGA
  // ======================================================

  const cancelarEntrega = () => {
    if (!pedido) {
      return;
    }

    if (!pedido.id_distribucion) {
      Alert.alert(
        'Sin distribución',
        'Este pedido no tiene una entrega asociada para cancelar.'
      );
      return;
    }

    Alert.alert(
      'Cancelar entrega',
      '¿Estás seguro de que deseas cancelar esta entrega? El pedido volverá a estado PAGADO.',
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Sí, cancelar',
          style: 'destructive',
          onPress: async () => {
            try {
              setCancelando(true);

              const result = await distribucionController.cancelarEntrega(
                Number(pedido.id_distribucion),
                'Cancelada por el administrador'
              );

              if (result.success) {
                Alert.alert(
                  'Entrega cancelada',
                  result.message || 'La entrega fue cancelada correctamente.',
                  [
                    {
                      text: 'Aceptar',
                      onPress: async () => {
                        await cargarPedido();
                      },
                    },
                  ]
                );
              } else {
                Alert.alert(
                  'No se puede cancelar',
                  result.message || 'No fue posible cancelar la entrega.'
                );
              }
            } catch (error: any) {
              console.error('Error al cancelar entrega:', error);

              Alert.alert(
                'Error',
                error?.response?.data?.message ||
                  error?.message ||
                  'No fue posible cancelar la entrega.'
              );
            } finally {
              setCancelando(false);
            }
          },
        },
      ]
    );
  };

  // ======================================================
  // FECHA ESTIMADA
  // ======================================================

  const abrirModalFechaEstimada = () => {
    if (!pedido) {
      return;
    }
    if (!ESTADOS_EDITABLES.includes(pedido.estado)) {
      Alert.alert(
        'No se puede editar la fecha',
        `El pedido está en estado "${pedido.estadoDisplay}". Solo se puede editar la fecha estimada cuando el pedido está en: Abonado, Listo, Pagado o En Proceso.`
      );
      return;
    }

    let fechaInicial = '';

    if (pedido.fecha_estimada) {
      const fecha = new Date(pedido.fecha_estimada);

      if (!isNaN(fecha.getTime())) {
        fechaInicial = fecha.toISOString().split('T')[0];
      }
    }

    setFechaEstimadaInput(fechaInicial);

    const fechaCalendario = fechaInicial
      ? new Date(`${fechaInicial}T00:00:00`)
      : new Date();

    setMesCalendario(
      isNaN(fechaCalendario.getTime()) ? new Date() : fechaCalendario
    );
    setModalFechaEstimada(true);
  };

  const formatearFechaSeleccionada = (fecha: Date) => {
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, '0');
    const day = String(fecha.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const seleccionarFechaCalendario = (fecha: Date) => {
    setFechaEstimadaInput(formatearFechaSeleccionada(fecha));
  };

  const cambiarMesCalendario = (cantidad: number) => {
    setMesCalendario(prev => {
      const nuevaFecha = new Date(prev);
      nuevaFecha.setMonth(nuevaFecha.getMonth() + cantidad);
      return nuevaFecha;
    });
  };

  const obtenerDiasCalendario = () => {
    const year = mesCalendario.getFullYear();
    const month = mesCalendario.getMonth();
    const primerDia = new Date(year, month, 1).getDay();
    const diasDelMes = new Date(year, month + 1, 0).getDate();
    const diasMesAnterior = new Date(year, month, 0).getDate();
    const dias: { fecha: Date; otroMes: boolean }[] = [];

    const inicioLunes = primerDia === 0 ? 6 : primerDia - 1;

    for (let i = inicioLunes - 1; i >= 0; i--) {
      dias.push({
        fecha: new Date(year, month - 1, diasMesAnterior - i),
        otroMes: true,
      });
    }

    for (let dia = 1; dia <= diasDelMes; dia++) {
      dias.push({
        fecha: new Date(year, month, dia),
        otroMes: false,
      });
    }

    let siguienteDia = 1;
    while (dias.length < 42) {
      dias.push({
        fecha: new Date(year, month + 1, siguienteDia++),
        otroMes: true,
      });
    }

    return dias;
  };

  const esFechaAnteriorAHoy = (fecha: Date) => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const fechaComparar = new Date(fecha);
    fechaComparar.setHours(0, 0, 0, 0);
    return fechaComparar < hoy;
  };

  const esFechaSeleccionada = (fecha: Date) => {
    if (!fechaEstimadaInput) {
      return false;
    }
    return formatearFechaSeleccionada(fecha) === fechaEstimadaInput;
  };

  const guardarFechaEstimada = async () => {
    if (!pedido) {
      return;
    }

    const fecha = fechaEstimadaInput.trim();

    if (!/^\d{4}-\d{2}-\d{2}$/.test(fecha)) {
      Alert.alert(
        'Fecha inválida',
        'Selecciona una fecha en el calendario.'
      );
      return;
    }

    const fechaComprobacion = new Date(
      `${fecha}T00:00:00`
    );

    if (isNaN(fechaComprobacion.getTime()) || esFechaAnteriorAHoy(fechaComprobacion)) {
      Alert.alert(
        'Fecha inválida',
        'Selecciona hoy o una fecha posterior.'
      );
      return;
    }

    try {
      setGuardandoFechaEstimada(true);

      const resultado =
        await pedidoController.actualizarFechaEstimada(
          Number(pedido.id_pedido),
          fecha
        );

      if (!resultado.success) {
        Alert.alert(
          'No se pudo actualizar',
          resultado.message ||
            'No fue posible actualizar la fecha estimada.'
        );

        return;
      }

      setModalFechaEstimada(false);

      Alert.alert(
        'Fecha actualizada',
        resultado.message ||
          'La fecha estimada del pedido fue actualizada correctamente.',
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
        'Error actualizando fecha estimada:',
        error
      );

      Alert.alert(
        'Error',
        error?.response?.data?.message ||
          error?.message ||
          'No fue posible actualizar la fecha estimada.'
      );
    } finally {
      setGuardandoFechaEstimada(false);
    }
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

      {/* VISOR DE IMAGEN COMPLETA */}
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
            <Ionicons name="close" size={30} color={COLORS.white} />
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

      {/* MODAL FECHA ESTIMADA */}
      <Modal
        visible={modalFechaEstimada}
        transparent
        animationType="fade"
        onRequestClose={() => {
          if (!guardandoFechaEstimada) {
            setModalFechaEstimada(false);
          }
        }}
      >
        <View style={styles.dateModalOverlay}>
          <View style={styles.dateModalContainer}>
            <View style={styles.dateModalHeader}>
              <View style={styles.dateModalIcon}>
                <Ionicons
                  name="calendar-outline"
                  size={23}
                  color={COLORS.primary}
                />
              </View>

              <View style={styles.dateModalTitleContainer}>
                <Text style={styles.dateModalTitle}>
                  Fecha estimada
                </Text>

                <Text style={styles.dateModalSubtitle}>
                  Define cuándo estará listo el pedido.
                </Text>
              </View>
            </View>

            <Text style={styles.dateInputLabel}>
              Selecciona la fecha
            </Text>

            <View style={styles.calendarContainer}>
              <View style={styles.calendarHeader}>
                <TouchableOpacity
                  style={styles.calendarArrowButton}
                  onPress={() => cambiarMesCalendario(-1)}
                  disabled={guardandoFechaEstimada}
                >
                  <Ionicons name="chevron-back" size={20} color={COLORS.text} />
                </TouchableOpacity>

                <Text style={styles.calendarMonthTitle}>
                  {mesCalendario.toLocaleDateString('es-CO', {
                    month: 'long',
                    year: 'numeric',
                  }).replace(/^./, letra => letra.toUpperCase())}
                </Text>

                <TouchableOpacity
                  style={styles.calendarArrowButton}
                  onPress={() => cambiarMesCalendario(1)}
                  disabled={guardandoFechaEstimada}
                >
                  <Ionicons name="chevron-forward" size={20} color={COLORS.text} />
                </TouchableOpacity>
              </View>

              <View style={styles.calendarWeekRow}>
                {['L', 'M', 'M', 'J', 'V', 'S', 'D'].map((dia, index) => (
                  <Text key={`${dia}-${index}`} style={styles.calendarWeekDay}>
                    {dia}
                  </Text>
                ))}
              </View>

              <View style={styles.calendarGrid}>
                {obtenerDiasCalendario().map(({ fecha, otroMes }, index) => {
                  const deshabilitada = esFechaAnteriorAHoy(fecha);
                  const seleccionada = esFechaSeleccionada(fecha);

                  return (
                    <TouchableOpacity
                      key={`${formatearFechaSeleccionada(fecha)}-${index}`}
                      style={[
                        styles.calendarDay,
                        otroMes && styles.calendarDayOtherMonth,
                        seleccionada && styles.calendarDaySelected,
                      ]}
                      onPress={() => {
                        if (!deshabilitada && !guardandoFechaEstimada) {
                          seleccionarFechaCalendario(fecha);
                        }
                      }}
                      disabled={deshabilitada || guardandoFechaEstimada}
                    >
                      <Text
                        style={[
                          styles.calendarDayText,
                          otroMes && styles.calendarDayTextOtherMonth,
                          deshabilitada && styles.calendarDayTextDisabled,
                          seleccionada && styles.calendarDayTextSelected,
                        ]}
                      >
                        {fecha.getDate()}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.selectedDateBox}>
              <Ionicons
                name="calendar-outline"
                size={18}
                color={COLORS.primary}
              />
              <Text style={styles.selectedDateText}>
                {fechaEstimadaInput
                  ? new Date(`${fechaEstimadaInput}T00:00:00`).toLocaleDateString('es-CO', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                    })
                  : 'Selecciona un día'}
              </Text>
            </View>

            <View style={styles.dateModalButtons}>
              <TouchableOpacity
                style={styles.dateCancelButton}
                onPress={() => setModalFechaEstimada(false)}
                disabled={guardandoFechaEstimada}
              >
                <Text style={styles.dateCancelButtonText}>
                  Cancelar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.dateSaveButton,
                  guardandoFechaEstimada && styles.dateSaveButtonDisabled,
                ]}
                onPress={guardarFechaEstimada}
                disabled={guardandoFechaEstimada}
              >
                {guardandoFechaEstimada ? (
                  <>
                    <ActivityIndicator size="small" color={COLORS.white} />
                    <Text style={styles.dateSaveButtonText}>
                      Guardando...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="checkmark" size={19} color={COLORS.white} />
                    <Text style={styles.dateSaveButtonText}>
                      Guardar
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* HEADER */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButtonHeader}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={23} color={COLORS.text} />
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
        {/* PRODUCTO / ESTADO PRINCIPAL */}
        <View style={styles.productMainCard}>
          <View style={styles.mainProductInfo}>
            <View style={styles.statusInline}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: colorEstado },
                ]}
              />
              <Text
                style={[
                  styles.statusText,
                  { color: colorEstado },
                ]}
              >
                {pedido.estadoDisplay}
              </Text>
            </View>
          </View>
        </View>

        {/* ADMINISTRADOR - MARCAR COMO LISTO */}
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
                  <ActivityIndicator size="small" color={COLORS.white} />
                  <Text style={styles.readyButtonText}>
                    Actualizando...
                  </Text>
                </>
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                  <Text style={styles.readyButtonText}>
                    Marcar como LISTO
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

        {/* ADMINISTRADOR - CANCELAR ENTREGA */}
        {esAdmin &&
          ESTADOS_CANCELABLES.includes(pedido.estado) &&
          pedido.id_distribucion && (
            <View style={styles.cancelActionCard}>
              <View style={styles.cancelActionInfo}>
                <View style={styles.cancelActionIcon}>
                  <Ionicons
                    name="close-circle-outline"
                    size={24}
                    color="#DC2626"
                  />
                </View>

                <View style={styles.cancelActionTextContainer}>
                  <Text style={styles.cancelActionTitle}>
                    Cancelar entrega
                  </Text>

                  <Text style={styles.cancelActionDescription}>
                    Detiene el proceso de entrega y devuelve
                    el pedido a estado PAGADO.
                  </Text>
                </View>
              </View>

              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  cancelando && styles.cancelButtonDisabled,
                ]}
                onPress={cancelarEntrega}
                disabled={cancelando}
              >
                {cancelando ? (
                  <>
                    <ActivityIndicator size="small" color={COLORS.white} />
                    <Text style={styles.cancelButtonText}>
                      Cancelando...
                    </Text>
                  </>
                ) : (
                  <>
                    <Ionicons name="close-circle" size={20} color={COLORS.white} />
                    <Text style={styles.cancelButtonText}>
                      Cancelar entrega
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
        )}

        {/* INFORMACIÓN DEL PEDIDO */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Información del pedido
          </Text>

          <View style={styles.simpleInfoRow}>
            <Text style={styles.simpleInfoLabel}>Fecha</Text>
            <Text style={styles.simpleInfoValue}>
              {pedido.fechaFormateada}
            </Text>
          </View>

          <View style={styles.simpleDivider} />

          <View style={styles.simpleInfoRow}>
            <Text style={styles.simpleInfoLabel}>
              Fecha estimada
            </Text>

            <View style={styles.estimatedDateContainer}>
              <Text style={styles.simpleInfoValue}>
                {pedido.fecha_estimada
                  ? pedido.fechaEstimadaFormateada
                  : 'No establecida'}
              </Text>

              {esAdmin && ESTADOS_EDITABLES.includes(pedido.estado) && (
                <TouchableOpacity
                  style={styles.editDateButton}
                  onPress={abrirModalFechaEstimada}
                >
                  <Ionicons
                    name="calendar-outline"
                    size={18}
                    color={COLORS.primary}
                  />
                </TouchableOpacity>
              )}
            </View>
          </View>

          <View style={styles.simpleDivider} />

          <View style={styles.simpleInfoRow}>
            <Text style={styles.simpleInfoLabel}>Productos</Text>
            <Text style={styles.simpleInfoValue}>
              {pedido.productos?.length || 0}
            </Text>
          </View>
        </View>

        {/* PRODUCTOS */}
        {pedido.productos && pedido.productos.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionTitleRow}>
              <Text style={styles.sectionTitle}>Productos</Text>
              <View style={styles.countBadge}>
                <Text style={styles.countBadgeText}>
                  {pedido.productos.length}
                </Text>
              </View>
            </View>

            {pedido.productos.map((producto: any, index: number) => {
              const nombre = obtenerNombreProducto(producto);
              const cantidad = obtenerCantidad(producto);
              const precio = obtenerPrecio(producto);
              const imagen = obtenerImagen(producto);

              return (
                <View
                  key={
                    producto?.id_producto ||
                    producto?.producto?.id_producto ||
                    index
                  }
                  style={[
                    styles.productRow,
                    index === 0 && styles.productRowFirst,
                  ]}
                >
                  {imagen ? (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => setImagenAmpliada(imagen)}
                    >
                      <Image
                        source={{ uri: imagen }}
                        style={styles.productRowImage}
                      />
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.productRowImagePlaceholder}>
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

                    <Text style={styles.productRowQuantity}>
                      Cantidad: {cantidad}
                    </Text>
                  </View>

                  <View style={styles.productRowPriceContainer}>
                    <Text style={styles.productRowPrice}>
                      {formatearDinero(precio * Number(cantidad))}
                    </Text>

                    <Text style={styles.productRowUnitPrice}>
                      {formatearDinero(precio)} c/u
                    </Text>
                  </View>
                </View>
              );
            })}
          </View>
        )}

        {/* DATOS DEL CLIENTE */}
        {pedido.cliente && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Datos del cliente
            </Text>

            <View style={styles.clientRow}>
              <View style={styles.clientIcon}>
                <Ionicons name="person-outline" size={19} color={COLORS.primary} />
              </View>

              <View style={styles.clientContent}>
                <Text style={styles.clientLabel}>Nombre</Text>
                <Text style={styles.clientValue}>
                  {pedido.cliente.nombre}
                </Text>
              </View>
            </View>

            <View style={styles.clientRow}>
              <View style={styles.clientIcon}>
                <Ionicons name="call-outline" size={19} color={COLORS.primary} />
              </View>

              <View style={styles.clientContent}>
                <Text style={styles.clientLabel}>Teléfono</Text>
                <Text style={styles.clientValue}>
                  {pedido.cliente.telefono}
                </Text>
              </View>
            </View>

            <View style={styles.clientRow}>
              <View style={styles.clientIcon}>
                <Ionicons name="mail-outline" size={19} color={COLORS.primary} />
              </View>

              <View style={styles.clientContent}>
                <Text style={styles.clientLabel}>
                  Correo electrónico
                </Text>
                <Text style={styles.clientValue} numberOfLines={2}>
                  {pedido.cliente.email}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* INFORMACIÓN DE ENTREGA */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Información de entrega
          </Text>

          <View style={styles.deliveryRow}>
            <Ionicons name="location-outline" size={20} color={COLORS.primary} />

            <View style={styles.deliveryContent}>
              <Text style={styles.deliveryLabel}>Dirección</Text>
              <Text style={styles.deliveryValue}>
                {pedido.direccion_entrega || 'No especificada'}
              </Text>
            </View>
          </View>

          <View style={styles.deliveryRow}>
            <Ionicons name="business-outline" size={20} color={COLORS.primary} />

            <View style={styles.deliveryContent}>
              <Text style={styles.deliveryLabel}>Ciudad</Text>
              <Text style={styles.deliveryValue}>
                {pedido.ciudad_envio || 'No especificada'}
              </Text>
            </View>
          </View>
        </View>

        {/* FÓRMULA ASOCIADA */}
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
                    source={{ uri: pedido.formula.imagen_formula }}
                    style={styles.formulaImage}
                    resizeMode="cover"
                  />
                </TouchableOpacity>
              ) : null}

              <View
                style={[
                  styles.formulaData,
                  !pedido.formula.imagen_formula && styles.formulaDataFull,
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
                    {formatearDinero(pedido.formula.costo)}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* RESUMEN */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            Resumen del pedido
          </Text>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>
              Costo de envío
            </Text>
            <Text style={styles.summaryValue}>
              {formatearDinero(pedido.costo_envio)}
            </Text>
          </View>

          <View style={styles.simpleDivider} />

          <View style={styles.summaryTotalRow}>
            <Text style={styles.summaryTotalLabel}>Total</Text>
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
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  mainProductInfo: {
    flex: 1,
    marginLeft: 13,
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
    shadowOffset: { width: 0, height: 1 },
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

  estimatedDateContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
  },

  editDateButton: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#FDECEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },

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
    shadowOffset: { width: 0, height: 1 },
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

  // MODAL FECHA ESTIMADA
  dateModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },

  dateModalContainer: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 18,
  },

  dateModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },

  dateModalIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FDECEC',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 11,
  },

  dateModalTitleContainer: {
    flex: 1,
  },

  dateModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
  },

  dateModalSubtitle: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.gray,
    marginTop: 2,
  },

  dateInputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
    marginBottom: 6,
  },

  calendarContainer: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 10,
    backgroundColor: '#FAFAFA',
  },

  calendarHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  calendarArrowButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },

  calendarMonthTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
  },

  calendarWeekRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },

  calendarWeekDay: {
    width: '14.2857%',
    textAlign: 'center',
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.gray,
    paddingVertical: 5,
  },

  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  calendarDay: {
    width: '14.2857%',
    height: 38,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 19,
  },

  calendarDayOtherMonth: {
    opacity: 0.35,
  },

  calendarDaySelected: {
    backgroundColor: COLORS.primary,
  },

  calendarDayText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text,
  },

  calendarDayTextOtherMonth: {
    color: COLORS.gray,
  },

  calendarDayTextDisabled: {
    color: '#BDBDBD',
  },

  calendarDayTextSelected: {
    color: COLORS.white,
    fontWeight: '800',
  },

  selectedDateBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    paddingHorizontal: 11,
    minHeight: 40,
    borderRadius: 9,
    backgroundColor: '#FDECEC',
  },

  selectedDateText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.text,
  },

  dateModalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 18,
  },

  dateCancelButton: {
    minHeight: 44,
    paddingHorizontal: 16,
    borderRadius: 9,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },

  dateCancelButtonText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.gray,
  },

  dateSaveButton: {
    minHeight: 44,
    paddingHorizontal: 17,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },

  dateSaveButtonDisabled: {
    opacity: 0.6,
  },

  dateSaveButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 6,
  },

  // BOTÓN DE CANCELAR ENTREGA
  cancelActionCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FECACA',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },

  cancelActionInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },

  cancelActionIcon: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FEE2E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },

  cancelActionTextContainer: {
    flex: 1,
  },

  cancelActionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 4,
  },

  cancelActionDescription: {
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.gray,
  },

  cancelButton: {
    minHeight: 46,
    borderRadius: 9,
    backgroundColor: '#DC2626',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 15,
  },

  cancelButtonDisabled: {
    opacity: 0.6,
  },

  cancelButtonText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
    marginLeft: 7,
  },

  // ESPACIO FINAL
  bottomSpace: {
    height: 10,
  },
});