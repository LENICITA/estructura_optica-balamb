// src/features/client/screens/PagosCliente.tsx

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Linking,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../../shared/constants/colors';
import { useAuth } from '../../auth/context/AuthContext';
import { PagoController } from '../../../core/controllers/PagoController';
import { PedidoController } from '../../../core/controllers/PedidoController';
import { PagoModel } from '../../../core/models/PagoModel';

interface Props {
  navigation: any;
  route: any;
}

export const PagosCliente = ({ navigation, route }: Props) => {
  const { user } = useAuth();
  const { id_pedido } = route.params ?? {};

  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [pagos, setPagos] = useState<PagoModel[]>([]);
  const [saldo, setSaldo] = useState<any>(null);
  const [pedido, setPedido] = useState<any>(null);
  const [totalPedido, setTotalPedido] = useState(0);
  const [mostrarModal, setMostrarModal] = useState(false);
  const [linkPago, setLinkPago] = useState('');

  const pagoController = new PagoController();
  const pedidoController = new PedidoController();

  useEffect(() => {
    if (!id_pedido) {
      Alert.alert('Error', 'No se encontró el ID del pedido');
      navigation.goBack();
      return;
    }
    cargarDatos();
  }, [id_pedido]);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar pedido
      const pedidoData = await pedidoController.getPedidoById(Number(id_pedido));
      console.log(' pedidoData COMPLETO:', JSON.stringify(pedidoData, null, 2));
      if (pedidoData) {
          const total = pedidoData.total || 0;
        setPedido(pedidoData);
        setTotalPedido(total);
              console.log(' Total del pedido guardado:', total);
      }

      // Cargar saldo
      const saldoData = await pagoController.verificarSaldo(Number(id_pedido));
      setSaldo(saldoData);

      // Cargar pagos
      const pagosData = await pagoController.obtenerPagosPorPedido(Number(id_pedido));
      setPagos(pagosData);

    } catch (error) {
      console.error('Error cargando datos:', error);
      Alert.alert('Error', 'Error al cargar los datos del pago');
    } finally {
      setLoading(false);
    }
  };

  const handlePagar = async (eleccion: '50%' | '100%') => {
    try {
      if (!id_pedido) {
        Alert.alert('Error', 'No se encontró el ID del pedido');
        return;
      }
          const total = totalPedido;
          const saldoPendiente = saldo?.saldo_pendiente || total;

          console.log(' Total del pedido:', total);

          if (total <= 0) {
            Alert.alert('Error', 'El total del pedido no es válido');
            return;
          }

          let monto = 0;

      if (eleccion === '50%') {
        // Si ya tiene abono, no permitir otro 50%
        if (saldo?.tiene_abono_50) {
          Alert.alert(
            'Ya tienes un abono del 50%',
            'Puedes pagar el saldo restante con la opción "Pagar 100%"'
          );
          return;
        }
        monto = Math.round(total / 2);
            } else {
              monto = saldoPendiente;
            }

      if (monto <= 0) {
        Alert.alert('Error', `El monto a pagar debe ser mayor a 0. Total: $${total}`);
        return;
      }

      setProcesando(true);

      const result = await pagoController.crearPago({
        id_pedido: Number(id_pedido),
        eleccion_pago: eleccion,
        monto: monto,
      });

      if (result.success && result.data?.bold_link) {
        setLinkPago(result.data.bold_link);
        setMostrarModal(true);
      } else {
        Alert.alert('Error', result.message || 'Error al crear el pago');
      }
    } catch (error: any) {
      console.error('Error al pagar:', error);
      Alert.alert('Error', error.message || 'Error al procesar el pago');
    } finally {
      setProcesando(false);
    }
  };

  const handleAbrirLink = async () => {
    if (linkPago) {
      await Linking.openURL(linkPago);
      setMostrarModal(false);
      // Recargar datos después de abrir el link
      setTimeout(() => {
        cargarDatos();
      }, 5000);
    }
  };

  //  Determinar si el pedido está pendiente
  const esPedidoPendiente = pedido?.estado === 'Pendiente' || !saldo?.tiene_abono_50 && !saldo?.tiene_pago_completo;

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando información del pago...</Text>
      </View>
    );
  }

  const estaPagado = saldo?.estado_pago === 'PAGADO_COMPLETO';
  const tieneAbono = saldo?.tiene_abono_50;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Header */}
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-outline" size={22} color={COLORS.primary} />
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>

      <Text style={styles.title}>Pagos del pedido #{id_pedido}</Text>

      {/*  Badge de estado */}
      <View style={styles.statusBadge}>
        <Ionicons
          name={esPedidoPendiente ? 'hourglass-outline' : estaPagado ? 'checkmark-circle' : 'time-outline'}
          size={20}
          color={esPedidoPendiente ? '#D97706' : estaPagado ? '#059669' : '#2563EB'}
        />
        <Text style={styles.statusBadgeText}>
          {esPedidoPendiente
            ? 'Pedido pendiente de pago'
            : estaPagado
              ? 'Pedido pagado completamente'
              : 'Pedido con abono del 50%'}
        </Text>
      </View>

      {/* Resumen del pedido */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>Resumen del pedido</Text>
        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Total del pedido</Text>
          <Text style={styles.resumenValue}>${pedido?.total?.toLocaleString() || 0}</Text>
        </View>
        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Pagado</Text>
          <Text style={[styles.resumenValue, styles.pagadoText]}>
            ${saldo?.total_pagado?.toLocaleString() || 0}
          </Text>
        </View>
        <View style={styles.resumenRow}>
          <Text style={styles.resumenLabel}>Saldo pendiente</Text>
          <Text style={[styles.resumenValue, styles.pendienteText]}>
            ${saldo?.saldo_pendiente?.toLocaleString() || 0}
          </Text>
        </View>

        <View style={styles.estadoContainer}>
          <Text style={styles.estadoLabel}>Estado:</Text>
          <View style={[styles.estadoBadge, estaPagado ? styles.estadoPagado : esPedidoPendiente ? styles.estadoPendiente : styles.estadoAbonado]}>
            <Text style={styles.estadoBadgeText}>
              {estaPagado
                ? ' Pagado completo'
                : tieneAbono
                  ? ' Abonado 50%'
                  : ' Sin pagos'}
            </Text>
          </View>
        </View>
      </View>

      {/* Botones de pago - solo si no está pagado */}
      {!estaPagado && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            {esPedidoPendiente ? 'Elige tu opción de pago' : 'Completa tu pago'}
          </Text>

          {/*  Explicación si es pendiente */}
          {esPedidoPendiente && (
            <View style={styles.explicacionContainer}>
              <Ionicons name="information-circle-outline" size={18} color="#2563EB" />
              <Text style={styles.explicacionText}>
                Puedes abonar el 50% ahora y pagar el resto cuando el pedido esté listo,
                o pagar el 100% de una vez.
              </Text>
            </View>
          )}

          {/* Botón 50% */}
          <TouchableOpacity
            style={[
              styles.botonPago,
              styles.boton50,
              (tieneAbono || procesando) && styles.botonDeshabilitado
            ]}
            onPress={() => handlePagar('50%')}
            disabled={tieneAbono || procesando}
          >
            <Ionicons name="hourglass-outline" size={24} color="#FFF" />
            <View style={styles.botonPagoTextContainer}>
              <Text style={styles.botonPagoTitle}>
                {tieneAbono ? 'Abono del 50% realizado' : 'Pagar 50%'}
              </Text>
              <Text style={styles.botonPagoSub}>
                {tieneAbono
                  ? 'Ya realizaste el abono del 50%'
                  : `Abona el 50% del total ($${Math.round((pedido?.total || 0) / 2).toLocaleString()})`}
              </Text>
            </View>
            {!tieneAbono && (
              <Ionicons name="chevron-forward" size={24} color="#FFF" />
            )}
            {tieneAbono && (
              <Ionicons name="checkmark-circle" size={24} color="#FFF" />
            )}
          </TouchableOpacity>

          {/* Botón 100% */}
          <TouchableOpacity
            style={[
              styles.botonPago,
              styles.boton100,
              procesando && styles.botonDeshabilitado
            ]}
            onPress={() => handlePagar('100%')}
            disabled={procesando}
          >
            <Ionicons name="cash-outline" size={24} color="#FFF" />
            <View style={styles.botonPagoTextContainer}>
              <Text style={styles.botonPagoTitle}>
                {tieneAbono ? 'Pagar saldo restante' : 'Pagar 100%'}
              </Text>
              <Text style={styles.botonPagoSub}>
                {tieneAbono
                  ? `Paga el saldo restante ($${saldo?.saldo_pendiente?.toLocaleString()})`
                  : `Paga el total ($${pedido?.total?.toLocaleString()})`}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#FFF" />
          </TouchableOpacity>

          {procesando && (
            <View style={styles.procesandoContainer}>
              <ActivityIndicator size="small" color={COLORS.primary} />
              <Text style={styles.procesandoText}>Generando link de pago...</Text>
            </View>
          )}
        </View>
      )}

      {/* Historial de pagos */}
      {pagos.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Historial de pagos</Text>

          {pagos.map((pago) => (
            <View key={pago.id_pago} style={styles.pagoItem}>
              <View style={styles.pagoIconContainer}>
                <Ionicons
                  name={pago.estado === 'Confirmado' ? 'checkmark-circle' : pago.estado === 'Rechazado' ? 'close-circle' : 'time-outline'}
                  size={24}
                  color={pago.estadoColor}
                />
              </View>
              <View style={styles.pagoInfo}>
                <Text style={styles.pagoMonto}>{pago.montoFormateado}</Text>
                <Text style={styles.pagoDetalle}>
                  {pago.eleccionDisplay} • {pago.fechaFormateada}
                </Text>
              </View>
              <View style={[styles.pagoEstado, { backgroundColor: pago.estadoColor + '20' }]}>
                <Text style={[styles.pagoEstadoText, { color: pago.estadoColor }]}>
                  {pago.estadoDisplay}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      {/* Información adicional */}
      <View style={styles.infoContainer}>
        <Ionicons name="shield-checkmark-outline" size={20} color="#666" />
        <Text style={styles.infoText}>
          Serás redirigido a la plataforma de Bold para completar el pago de forma segura.
        </Text>
      </View>

      {/* 🟢 MODAL de redirección a Bold */}
      <Modal
        visible={mostrarModal}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setMostrarModal(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Ionicons name="lock-open" size={48} color={COLORS.primary} />
            <Text style={styles.modalTitle}>¡Casi listo!</Text>
            <Text style={styles.modalText}>
              Serás redirigido a la plataforma de Bold para completar tu pago de forma segura.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setMostrarModal(false)}
              >
                <Text style={styles.modalButtonCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={handleAbrirLink}
              >
                <Text style={styles.modalButtonConfirmText}>Ir a Bold</Text>
                <Ionicons name="open-outline" size={18} color="#FFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F3F4F6',
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backText: {
    color: COLORS.primary,
    fontSize: 16,
    marginLeft: 6,
    fontWeight: '600',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 16,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    gap: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#000',
    marginBottom: 12,
  },
  resumenRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  resumenLabel: {
    fontSize: 14,
    color: '#666',
  },
  resumenValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
  pagadoText: {
    color: '#059669',
  },
  pendienteText: {
    color: '#B90F0F',
  },
  estadoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  estadoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
    marginRight: 8,
  },
  estadoBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estadoPagado: {
    backgroundColor: '#D1FAE5',
  },
  estadoPendiente: {
    backgroundColor: '#FEF3C7',
  },
  estadoAbonado: {
    backgroundColor: '#DBEAFE',
  },
  estadoBadgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
  explicacionContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#EFF6FF',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    gap: 8,
  },
  explicacionText: {
    flex: 1,
    fontSize: 13,
    color: '#1E40AF',
    lineHeight: 18,
  },
  botonPago: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  boton50: {
    backgroundColor: '#2563EB',
  },
  boton100: {
    backgroundColor: '#059669',
  },
  botonDeshabilitado: {
    opacity: 0.6,
  },
  botonPagoTextContainer: {
    flex: 1,
    marginLeft: 12,
  },
  botonPagoTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  botonPagoSub: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
  },
  procesandoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 10,
  },
  procesandoText: {
    fontSize: 14,
    color: '#666',
  },
  pagoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pagoIconContainer: {
    marginRight: 12,
  },
  pagoInfo: {
    flex: 1,
  },
  pagoMonto: {
    fontSize: 15,
    fontWeight: '600',
    color: '#000',
  },
  pagoDetalle: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  pagoEstado: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  pagoEstadoText: {
    fontSize: 11,
    fontWeight: '600',
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    padding: 12,
    borderRadius: 8,
    gap: 8,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: '#666',
    lineHeight: 18,
  },
  // 🟢 Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#000',
    marginTop: 12,
  },
  modalText: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  modalButtons: {
    flexDirection: 'row',
    marginTop: 20,
    gap: 12,
    width: '100%',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  modalButtonCancel: {
    backgroundColor: '#F3F4F6',
  },
  modalButtonCancelText: {
    color: '#666',
    fontSize: 15,
    fontWeight: '600',
  },
  modalButtonConfirm: {
    backgroundColor: COLORS.primary,
  },
  modalButtonConfirmText: {
    color: '#FFF',
    fontSize: 15,
    fontWeight: '600',
  },
});
