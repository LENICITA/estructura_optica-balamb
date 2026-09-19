// src/features/admin/screens/DetalleEntrega.tsx

import React, { useCallback, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  TextInput,
} from 'react-native';

import {
  useFocusEffect,
  useNavigation,
  useRoute,
} from '@react-navigation/native';

import Ionicons from '@expo/vector-icons/Ionicons';

import { DistribucionController } from '../../../core/controllers/DistribucionController';
import { DistribucionModel } from '../../../core/models/DistribucionModel';
import { checkObservacion } from '../../../shared/validators/distribucionValidators';
import { COLORS } from '../../../shared/constants/colors';


// ============================================================
// TIPOS
// ============================================================

type RouteParams = {
  id_distribucion: number;
};


// ============================================================
// COMPONENTE
// ============================================================

const DetalleEntrega = () => {

  const navigation = useNavigation<any>();
  const route = useRoute<any>();

  const { id_distribucion } =
    route.params as RouteParams;

  const [distribucion, setDistribucion] =
    useState<DistribucionModel | null>(null);

  const [loading, setLoading] = useState(true);
  const [observacionModalVisible, setObservacionModalVisible] = useState(false);
  const [observacion, setObservacion] = useState('');
  const [actionLoading, setActionLoading] = useState(false);


  const distribucionController =
    new DistribucionController();


  // ==========================================================
  // CARGAR DISTRIBUCIÓN
  // ==========================================================

  const cargarDistribucion = async () => {

    try {

      setLoading(true);

      if (!id_distribucion) {

        Alert.alert(
          'Error',
          'No se recibió el ID de la distribución.'
        );

        return;
      }


      const resultado =
        await distribucionController.getDistribucionById(
          id_distribucion
        );


      if (!resultado) {

        Alert.alert(
          'Sin acceso',
          'No se encontró la distribución o no tienes acceso a ella.'
        );

        setDistribucion(null);

        return;
      }


      /*
       * El controller actualmente retorna directamente
       * DistribucionModel | null.
       *
       * Si el service devuelve el objeto directamente,
       * lo convertimos al modelo.
       */

      const modelo =
        resultado instanceof DistribucionModel
          ? resultado
          : DistribucionModel.fromJSON(resultado);


      setDistribucion(modelo);

    } catch (error) {

      console.error(
        'Error al cargar detalle de entrega:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudo cargar la información de la entrega.'
      );

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // RECARGAR AL ENTRAR EN LA PANTALLA
  // ==========================================================

  const iniciarEntrega = async () => {
    try {
      setActionLoading(true);
      const resultado = await distribucionController.iniciarEntrega(id_distribucion);
      if (!resultado.success) {
        Alert.alert('No se pudo iniciar la entrega', resultado.message || 'Intenta nuevamente.');
        return;
      }
      await cargarDistribucion();
    } finally {
      setActionLoading(false);
    }
  };

  const marcarEntregado = async (textoObservacion?: string) => {
    const check = checkObservacion(textoObservacion);
    if (!check.valido) {
      Alert.alert('Observación inválida', check.mensaje || 'Observación inválida');
      return;
    }

    try {
      setActionLoading(true);
      const resultado = await distribucionController.marcarEntregado(
        id_distribucion,
        textoObservacion?.trim() || undefined
      );
      if (!resultado.success) {
        Alert.alert('No se pudo marcar como entregado', resultado.message || 'Intenta nuevamente.');
        return;
      }
      setObservacion('');
      setObservacionModalVisible(false);
      await cargarDistribucion();
    } finally {
      setActionLoading(false);
    }
  };

  const confirmarEntrega = () => {
    Alert.alert(
      'Confirmar entrega',
      '¿El pedido ya fue entregado al cliente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Sí, entregar', onPress: () => setObservacionModalVisible(true) },
      ]
    );
  };

  const abrirRuta = () => {
    const direccion = `${distribucion?.pedido?.direccion_entrega || ''}, ${distribucion?.pedido?.ciudad_envio || ''}, Colombia`;
    Linking.openURL(
      `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(direccion)}`
    );
  };

  useFocusEffect(
    useCallback(() => {

      cargarDistribucion();

    }, [id_distribucion])
  );


  // ==========================================================
  // FORMATO DE DINERO
  // ==========================================================

  const formatearPrecio = (
    precio: number
  ) => {

    return `$${Number(precio || 0).toLocaleString(
      'es-CO'
    )}`;

  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <View style={styles.loadingContainer}>

        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Cargando detalle de distribución...
        </Text>

      </View>

    );

  }


  // ==========================================================
  // SIN DISTRIBUCIÓN
  // ==========================================================

  if (!distribucion) {

    return (

      <View style={styles.errorContainer}>

        <Ionicons
          name="alert-circle-outline"
          size={55}
          color={COLORS.gray}
        />

        <Text style={styles.errorTitle}>
          Distribución no encontrada
        </Text>

        <Text style={styles.errorText}>
          No fue posible encontrar esta distribución.
        </Text>

        <TouchableOpacity
          style={styles.errorButton}
          onPress={() => navigation.goBack()}
        >

          <Text style={styles.errorButtonText}>
            Volver
          </Text>

        </TouchableOpacity>

      </View>

    );

  }


  // ==========================================================
  // DATOS
  // ==========================================================

  const pedido = distribucion.pedido;

  const cliente = pedido?.cliente;

  const repartidor =
    distribucion.repartidor;


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <View style={styles.container}>

      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <View style={styles.header}>

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >

          <Ionicons
            name="chevron-back"
            size={27}
            color={COLORS.black}
          />

        </TouchableOpacity>

        <Text style={styles.headerTitle}>
          Detalle de distribución
        </Text>

        <View style={styles.headerRight} />

      </View>


      {/* ==================================================== */}
      {/* CONTENIDO */}
      {/* ==================================================== */}

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >

        {/* ================================================== */}
        {/* ENCABEZADO DE LA DISTRIBUCIÓN */}
        {/* ================================================== */}

        <View style={styles.mainCard}>

          <View style={styles.mainTop}>

            <View style={styles.deliveryIcon}>

              <Ionicons
                name="bicycle-outline"
                size={28}
                color={COLORS.primary}
              />

            </View>

            <View style={styles.mainInfo}>

              <Text style={styles.mainTitle}>
                Entrega #{distribucion.id_distribucion}
              </Text>

              <Text style={styles.pedidoNumber}>
                Pedido #{distribucion.id_pedido}
              </Text>

            </View>

          </View>


          {/* ESTADO */}

          <View
            style={[
              styles.statusContainer,
              {
                backgroundColor:
                  distribucion.estado === 'PENDIENTE'
                    ? '#FFF4E5'
                    : distribucion.estado === 'EN_ENTREGA'
                      ? '#EEF4FF'
                      : distribucion.estado === 'ENTREGADO'
                        ? '#E8F5E9'
                        : '#FDECEC',
              },
            ]}
          >

            <Ionicons
              name={
                distribucion.estadoIcon as keyof typeof Ionicons.glyphMap
              }
              size={17}
              color={distribucion.estadoColor}
            />

            <Text
              style={[
                styles.statusText,
                {
                  color:
                    distribucion.estadoColor,
                },
              ]}
            >
              {distribucion.estadoDisplay}
            </Text>

          </View>

        </View>


        {/* ================================================== */}
        {/* DATOS DEL PEDIDO */}
        {/* ================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Datos del pedido
          </Text>


          <View style={styles.card}>

            {/* DIRECCIÓN */}

            <View style={styles.infoRow}>

              <View style={styles.infoIcon}>

                <Ionicons
                  name="location-outline"
                  size={20}
                  color={COLORS.primary}
                />

              </View>

              <View style={styles.infoContent}>

                <Text style={styles.infoLabel}>
                  Dirección de entrega
                </Text>

                <Text style={styles.infoValue}>
                  {pedido?.direccion_entrega || 'N/A'}
                </Text>

              </View>

            </View>


            {/* CIUDAD */}

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
                  {pedido?.ciudad_envio || 'N/A'}
                </Text>

              </View>

            </View>


            {/* TOTAL */}

            <View style={styles.infoRow}>

              <View style={styles.infoIcon}>

                <Ionicons
                  name="cash-outline"
                  size={20}
                  color={COLORS.primary}
                />

              </View>

              <View style={styles.infoContent}>

                <Text style={styles.infoLabel}>
                  Total del pedido
                </Text>

                <Text style={styles.totalValue}>
                  {formatearPrecio(
                    pedido?.total || 0
                  )}
                </Text>

              </View>

            </View>


            {distribucion.estado === 'ENTREGADO' && (
              <View style={styles.infoRowLast}>
                <View style={styles.infoIcon}>
                  <Ionicons name="calendar-outline" size={20} color={COLORS.primary} />
                </View>
                <View style={styles.infoContent}>
                  <Text style={styles.infoLabel}>Fecha estimada de entrega</Text>
                  <Text style={styles.infoValue}>{pedido?.fecha_estimada || 'N/A'}</Text>
                </View>
              </View>
            )}

          </View>

        </View>

        {(distribucion.estado === 'EN_ENTREGA' || distribucion.estado === 'ENTREGADO') && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Observaciones</Text>
            <View style={styles.card}>
              <Text style={styles.infoValue}>{distribucion.observaciones || 'Sin observaciones'}</Text>
            </View>
          </View>
        )}


        {/* ================================================== */}
        {/* DATOS DEL CLIENTE */}
        {/* ================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Datos del cliente
          </Text>


          <View style={styles.card}>

            {/* NOMBRE */}

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
                  {cliente?.nombre || 'N/A'}
                </Text>

              </View>

            </View>


            {/* TELÉFONO */}

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
                  {cliente?.telefono || 'N/A'}
                </Text>

              </View>

            </View>


            <View style={styles.infoRowLast} />

          </View>

        </View>


        {/* ================================================== */}
        {/* DATOS DEL REPARTIDOR */}
        {/* ================================================== */}

        <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Datos del repartidor o administrador
          </Text>


          <View style={styles.card}>

            {/* NOMBRE */}

            <View style={styles.infoRow}>

              <View style={styles.infoIcon}>

                <Ionicons
                  name="person-circle-outline"
                  size={20}
                  color={COLORS.primary}
                />

              </View>

              <View style={styles.infoContent}>

                <Text style={styles.infoLabel}>
                  Repartidor
                </Text>

                <Text style={styles.infoValue}>
                  {repartidor?.nombre || 'N/A'}
                </Text>

              </View>

            </View>


            {/* TELÉFONO */}

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
                  {repartidor?.telefono || 'N/A'}
                </Text>

              </View>

            </View>


            {/* VEHÍCULO */}

            <View style={styles.infoRowLast}>

              <View style={styles.infoIcon}>

                <Ionicons
                  name="car-outline"
                  size={20}
                  color={COLORS.primary}
                />

              </View>

              <View style={styles.infoContent}>

                <Text style={styles.infoLabel}>
                  Vehículo
                </Text>

                <Text style={styles.infoValue}>
                  {(() => {
                    const ciudad = pedido?.ciudad_envio?.toLowerCase().trim();
                    return ciudad === 'bogotá' || ciudad === 'bogota'
                      ? distribucion.vehiculoRepartidor
                      : 'N/A';
                  })()}
                </Text>

              </View>

            </View>

          </View>

        </View>


        {/* ================================================== */}
        {/* INFORMACIÓN DE LA DISTRIBUCIÓN */}
        {/* ================================================== */}

        {distribucion.estado === 'ENTREGADO' && <View style={styles.section}>

          <Text style={styles.sectionTitle}>
            Información de la distribución
          </Text>


          <View style={styles.card}>

            {/* FECHA ASIGNACIÓN */}

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
                  Fecha de asignación
                </Text>

                <Text style={styles.infoValue}>
                  {distribucion.fechaAsignacionFormateada}
                </Text>

              </View>

            </View>


            <View style={styles.infoRowLast}>
              <View style={styles.infoIcon}>
                <Ionicons name="checkmark-done-outline" size={20} color={COLORS.primary} />
              </View>
              <View style={styles.infoContent}>
                <Text style={styles.infoLabel}>Fecha de entrega</Text>
                <Text style={styles.infoValue}>
                  {distribucion.fecha_entrega
                    ? new Date(distribucion.fecha_entrega).toLocaleDateString('es-CO')
                    : 'N/A'}
                </Text>
              </View>
            </View>

          </View>

        </View>}


        {/* ================================================== */}
        {/* ESTADO ACTUAL */}
        {/* ================================================== */}

        <View style={styles.currentStatusCard}>

          <View
            style={[
              styles.currentStatusIcon,
              {
                backgroundColor:
                  distribucion.estado === 'PENDIENTE'
                    ? '#FFF4E5'
                    : distribucion.estado === 'EN_ENTREGA'
                      ? '#EEF4FF'
                      : distribucion.estado === 'ENTREGADO'
                        ? '#E8F5E9'
                        : '#FDECEC',
              },
            ]}
          >

            <Ionicons
              name={
                distribucion.estadoIcon as keyof typeof Ionicons.glyphMap
              }
              size={28}
              color={distribucion.estadoColor}
            />

          </View>


          <View style={styles.currentStatusInfo}>

            <Text style={styles.currentStatusLabel}>
              Estado de la entrega
            </Text>

            <Text
              style={[
                styles.currentStatusText,
                {
                  color:
                    distribucion.estadoColor,
                },
              ]}
            >
              {distribucion.estadoDisplay}
            </Text>

          </View>

        </View>

        <View style={styles.actionsContainer}>
          <TouchableOpacity style={styles.routeButton} onPress={abrirRuta}>
            <Ionicons name="map-outline" size={18} color="#FFFFFF" />
            <Text style={styles.actionButtonText}>Ver mapa</Text>
          </TouchableOpacity>

          {distribucion.estado === 'PENDIENTE' && (
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => Alert.alert('Iniciar entrega', '¿Deseas iniciar la entrega de este pedido?', [
                { text: 'Cancelar', style: 'cancel' },
                { text: 'Iniciar', onPress: iniciarEntrega },
              ])}
              disabled={actionLoading}
            >
              <Text style={styles.actionButtonTextPrimary}>Iniciar entrega</Text>
            </TouchableOpacity>
          )}

          {distribucion.estado === 'EN_ENTREGA' && (
            <TouchableOpacity style={styles.actionButton} onPress={confirmarEntrega} disabled={actionLoading}>
              <Text style={styles.actionButtonTextPrimary}>Marcar como entregado</Text>
            </TouchableOpacity>
          )}
        </View>

        <Modal
          visible={observacionModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setObservacionModalVisible(false)}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>¿Desea agregar una observación a la distribución?</Text>
              <TextInput
                style={styles.observacionInput}
                value={observacion}
                onChangeText={setObservacion}
                placeholder="Escribe una observación (opcional)"
                multiline
                maxLength={5000}
              />
              <View style={styles.modalActions}>
                <TouchableOpacity onPress={() => setObservacionModalVisible(false)} disabled={actionLoading}>
                  <Text style={styles.modalCancelText}>Cancelar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => marcarEntregado(observacion)} disabled={actionLoading}>
                  <Text style={styles.modalConfirmText}>{actionLoading ? 'Guardando...' : 'Continuar'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>


        <View style={styles.bottomSpace} />

      </ScrollView>

    </View>
  );
};


// ============================================================
// ESTILOS
// ============================================================

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },

  header: {
    height: 58,
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },

  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },

  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },

  headerRight: {
    width: 40,
  },

  scrollView: {
    flex: 1,
  },

  content: {
    padding: 16,
    paddingBottom: 35,
  },

  mainCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 5,
  },

  mainTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  deliveryIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#FDEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  mainInfo: {
    flex: 1,
    marginLeft: 12,
  },

  mainTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.text,
  },

  pedidoNumber: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 3,
  },

  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 20,
    marginTop: 14,
    gap: 5,
  },

  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },

  section: {
    marginBottom: 19,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.text,
    marginBottom: 9,
  },

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 15,
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingBottom: 14,
    marginBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },

  infoRowLast: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },

  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FDEEEE',
    justifyContent: 'center',
    alignItems: 'center',
  },

  infoContent: {
    flex: 1,
    marginLeft: 11,
    paddingTop: 1,
  },

  infoLabel: {
    fontSize: 11,
    color: COLORS.gray,
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 14,
    color: COLORS.text,
    fontWeight: '600',
    lineHeight: 20,
  },

  totalValue: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '800',
  },

  currentStatusCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 2,
    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },

  currentStatusIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
  },

  currentStatusInfo: {
    marginLeft: 12,
  },

  currentStatusLabel: {
    fontSize: 11,
    color: COLORS.gray,
    marginBottom: 3,
  },

  currentStatusText: {
    fontSize: 17,
    fontWeight: '800',
  },

  actionsContainer: {
    gap: 10,
    marginTop: 14,
  },

  routeButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 7,
  },

  actionButton: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },

  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  actionButtonTextPrimary: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: 24,
  },

  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 14,
  },

  observacionInput: {
    borderWidth: 1,
    borderColor: '#D6D6D6',
    borderRadius: 8,
    minHeight: 90,
    padding: 10,
    textAlignVertical: 'top',
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 22,
    marginTop: 18,
  },

  modalCancelText: {
    color: COLORS.gray,
    fontWeight: '700',
  },

  modalConfirmText: {
    color: COLORS.primary,
    fontWeight: '700',
  },

  bottomSpace: {
    height: 10,
  },

  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
  },

  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.gray,
  },

  errorContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },

  errorTitle: {
    marginTop: 12,
    fontSize: 19,
    fontWeight: '800',
    color: COLORS.text,
  },

  errorText: {
    marginTop: 7,
    fontSize: 14,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
  },

  errorButton: {
    marginTop: 20,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 28,
    paddingVertical: 11,
    borderRadius: 9,
  },

  errorButtonText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
  },

});

export default DetalleEntrega;