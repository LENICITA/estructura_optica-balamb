// src/features/admin/screens/DetalleFormula.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  Image,
  Modal,
  Dimensions,
  PanResponder,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { COLORS } from '../../../shared/constants/colors';
import { FormulaController } from '../../../core/controllers/FormulaController';
import { FormulaModel, EstadoFormula } from '../../../core/models/FormulaModel';

const { width, height } = Dimensions.get('window');

export const DetalleFormula = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { id_formula } = route.params as { id_formula: number };

  const [formula, setFormula] = useState<FormulaModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [precio, setPrecio] = useState('');
  const [enviandoPrecio, setEnviandoPrecio] = useState(false);
  const [cambiandoEstado, setCambiandoEstado] = useState(false);
  const [mostrarSelectorEstado, setMostrarSelectorEstado] = useState(false);
  const [estadoActual, setEstadoActual] = useState<EstadoFormula>('PENDIENTE');

const [imagenModalVisible, setImagenModalVisible] = useState(false);
  const scale = useRef(new Animated.Value(1)).current;
  const lastScale = useRef(1);

  const formulaController = new FormulaController();

  useEffect(() => {
    cargarFormula();
  }, [id_formula]);

  const cargarFormula = async () => {
    try {
      setLoading(true);
      const result = await formulaController.getFormulaById(Number(id_formula));
      if (result) {
        setFormula(result);
        setEstadoActual(result.estado || 'PENDIENTE');
        if (result.costo && result.costo > 0) {
          setPrecio(result.costo.toString());
        }
      }
    } catch (error) {
      console.error('Error cargando formula:', error);
      Alert.alert('Error', 'No se pudo cargar la formula');
    } finally {
      setLoading(false);
    }
  };

  const handleAsignarPrecio = async () => {
    if (!precio.trim()) {
      Alert.alert('Error', 'Ingresa un precio valido');
      return;
    }

    const precioNum = parseFloat(precio);
    if (isNaN(precioNum) || precioNum < 0) {
      Alert.alert('Error', 'El precio no puede ser negativo');
      return;
    }

    if (precioNum === 0) {
      Alert.alert('Error', 'El precio debe ser mayor a 0');
      return;
    }

    setEnviandoPrecio(true);

    try {
      const result = await formulaController.actualizarCostoFormula(
        Number(id_formula),
        precioNum
      );

      if (result.success) {
        Alert.alert('Exito', 'Precio asignado correctamente');
        cargarFormula();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error al asignar el precio');
    } finally {
      setEnviandoPrecio(false);
    }
  };

 const handleRechazarFormula = async () => {
     setCambiandoEstado(true);
     setMostrarSelectorEstado(false);

  try {
    
    const estadoParaBackend = 'Rechazado';

    console.log('Enviando estado al backend:', estadoParaBackend);

    const result = await formulaController.actualizarEstadoFormula(
      Number(id_formula),
      estadoParaBackend as any
    );

    if (result.success) {
      await cargarFormula();
      Alert.alert('Exito', 'Fórmula rechazada correctamente');
    } else {
      Alert.alert('Error', result.message || 'Error al rechazar la fórmula');
    }
  } catch (error: any) {
    Alert.alert('Error', error.message || 'Error al cambiar el estado');
  } finally {
    setCambiandoEstado(false);
  }
};
  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'APROBADO': return '#16A34A';
      case 'RECHAZADO': return '#DC2626';
      default: return '#D97706';
    }
  };

  const getEstadoBackground = (estado: string) => {
    switch (estado) {
      case 'APROBADO': return '#DCFCE7';
      case 'RECHAZADO': return '#FEE2E2';
      default: return '#FEF3C7';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'APROBADO': return 'checkmark-circle-outline';
      case 'RECHAZADO': return 'close-circle-outline';
      default: return 'time-outline';
    }
  };

const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderMove: (evt, gestureState) => {
      const { dx, dy } = gestureState;
      const newScale = lastScale.current + (dy * 0.01);
      if (newScale >= 0.5 && newScale <= 3) {
        scale.setValue(newScale);
      }
    },
    onPanResponderRelease: () => {
      lastScale.current = scale._value;
    },
  });

  const abrirImagen = () => {
    setImagenModalVisible(true);
    scale.setValue(1);
    lastScale.current = 1;
  };

  const cerrarImagen = () => {
    setImagenModalVisible(false);
    scale.setValue(1);
    lastScale.current = 1;
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando formula...</Text>
      </View>
    );
  }

  if (!formula) {
    return (
      <View style={styles.centerContainer}>
        <Ionicons name="alert-circle-outline" size={50} color="#EF4444" />
        <Text style={styles.errorText}>Formula no encontrada</Text>
        <TouchableOpacity style={styles.retryButton} onPress={cargarFormula}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const puedeRechazar = estadoActual === 'PENDIENTE';

  const estadoTexto = {
    'PENDIENTE': 'Pendiente',
    'APROBADO': 'Aprobado',
    'RECHAZADO': 'Rechazado'
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
        <Ionicons name="arrow-back-outline" size={22} color={COLORS.primary} />
        <Text style={styles.backText}>Volver</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.headerLeft}>
            <Ionicons name="document-text-outline" size={24} color={COLORS.primary} />
            <Text style={styles.headerTitle}>Formula # {formula.id_formula}</Text>
          </View>
          <View style={[styles.estadoBadge, { backgroundColor: getEstadoBackground(estadoActual) }]}>
            <Ionicons name={getEstadoIcon(estadoActual)} size={16} color={getEstadoColor(estadoActual)} />
            <Text style={[styles.estadoText, { color: getEstadoColor(estadoActual) }]}>
              {estadoTexto[estadoActual] || estadoActual}
            </Text>
          </View>
        </View>

        <View style={styles.divider} />

        {puedeRechazar && (
        <View style={styles.estadoSection}>
                    <View style={styles.estadoHeader}>
                      <Ionicons name="close-circle-outline" size={20} color="#DC2626" />
                      <Text style={[styles.estadoSectionTitle, { color: '#DC2626' }]}>Rechazar Fórmula</Text>
                    </View>

          <TouchableOpacity
                        style={styles.rechazarButton}
                        onPress={() => {
                          Alert.alert(
                            'Rechazar Fórmula',
                            '¿Estás seguro de que quieres rechazar esta fórmula?',
                            [
                              { text: 'Cancelar', style: 'cancel' },
                              { text: 'Rechazar', onPress: handleRechazarFormula, style: 'destructive' }
                            ]
                          );
                        }}
                        disabled={cambiandoEstado}
                      >
                        {cambiandoEstado ? (
                          <ActivityIndicator size="small" color="#FFFFFF" />
                        ) : (
                          <>
                            <Ionicons name="close-circle-outline" size={20} color="#FFFFFF" />
                            <Text style={styles.rechazarButtonText}>Rechazar Fórmula</Text>
                          </>
                        )}
                      </TouchableOpacity>
                    </View>
                  )}

        <View style={styles.divider} />

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Detalles</Text>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Condicion:</Text>
            <Text style={styles.value}>{formula.condicion || 'No especificada'}</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.label}>Fecha:</Text>
            <Text style={styles.value}>
              {formula.fecha_creacion
                ? new Date(formula.fecha_creacion).toLocaleDateString('es-CO')
                : 'No disponible'}
            </Text>
          </View>
          {formula.observaciones && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Observaciones:</Text>
              <Text style={styles.value}>{formula.observaciones}</Text>
            </View>
          )}
        </View>

        <View style={styles.divider} />

        <View style={styles.infoSection}>
          <Text style={styles.infoTitle}>Asignar Precio</Text>
          {formula.costo && formula.costo > 0 && (
            <View style={styles.infoRow}>
              <Text style={styles.label}>Costo actual:</Text>
              <Text style={[styles.value, styles.costoText]}>${formula.costo.toFixed(2)}</Text>
            </View>
          )}
          <View style={styles.precioContainer}>
            <Text style={styles.moneda}>$</Text>
            <TextInput
              style={styles.precioInput}
              value={precio}
              onChangeText={setPrecio}
              placeholder="Ingresa el precio"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
              editable={estadoActual !== 'APROBADO' && !enviandoPrecio}
            />
          </View>
          {estadoActual === 'APROBADO' ? (
            <View style={styles.precioYaAsignado}>
              <Ionicons name="checkmark-circle" size={18} color="#16A34A" />
              <Text style={styles.precioYaAsignadoText}>Precio ya asignado</Text>
            </View>
          ) : (
            <TouchableOpacity
              style={[styles.asignarButton, enviandoPrecio && styles.buttonDisabled]}
              onPress={handleAsignarPrecio}
              disabled={enviandoPrecio}
            >
              {enviandoPrecio ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.asignarButtonText}>Asignar Precio</Text>
              )}
            </TouchableOpacity>
          )}
        </View>

                {formula.imagen_formula && (
                  <TouchableOpacity
                    style={styles.imagenContainer}
                    onPress={abrirImagen}
                    activeOpacity={0.9}
                  >
                    <Image source={{ uri: formula.imagen_formula }} style={styles.imagen} resizeMode="contain" />
                    <View style={styles.zoomHint}>
                      <Ionicons name="expand-outline" size={20} color="#FFFFFF" />
                      <Text style={styles.zoomHintText}>Toca para ampliar</Text>
                    </View>
                  </TouchableOpacity>
                )}
              </View>

              <Modal
                visible={imagenModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={cerrarImagen}
              >
                <View style={styles.modalContainer}>
                  <TouchableOpacity style={styles.modalCloseButton} onPress={cerrarImagen}>
                    <Ionicons name="close-circle" size={40} color="#FFFFFF" />
                  </TouchableOpacity>

                  <Animated.View
                    style={[styles.modalImageContainer, { transform: [{ scale }] }]}
                    {...panResponder.panHandlers}
                  >
                    <Image
                      source={{ uri: formula.imagen_formula }}
                      style={styles.modalImage}
                      resizeMode="contain"
                    />
                  </Animated.View>

                  <View style={styles.modalHint}>
                    <Ionicons name="hand-left-outline" size={20} color="rgba(255,255,255,0.7)" />
                    <Text style={styles.modalHintText}>Desliza para acercar/alejar</Text>
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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    padding: 20,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#6B7280',
  },
  errorText: {
    marginTop: 10,
    fontSize: 16,
    color: '#EF4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#FFFFFF',
    fontWeight: '600',
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
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1F2937',
  },
  estadoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  estadoText: {
    fontSize: 12,
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  estadoSection: {
    padding: 16,
  },
  estadoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  estadoSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  rechazarButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
    gap: 8,
  },
  rechazarButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  cambiarEstadoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
  },
  cambiarEstadoText: {
    fontSize: 14,
    color: '#374151',
  },
  estadoSelector: {
    gap: 8,
  },
  estadoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  estadoOptionActive: {
    borderColor: '#B90F0F',
    borderWidth: 2,
  },
  estadoOptionText: {
    fontSize: 14,
    fontWeight: '500',
  },
  estadoOptionTextActive: {
    fontWeight: '700',
  },
  estadoCancelButton: {
    padding: 10,
    alignItems: 'center',
  },
  estadoCancelText: {
    color: '#6B7280',
    fontSize: 14,
  },
  loadingContainerSmall: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  loadingSmallText: {
    color: '#6B7280',
    fontSize: 14,
  },
  infoSection: {
    padding: 16,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    gap: 8,
  },
  infoText: {
    fontSize: 14,
    color: '#4B5563',
    flex: 1,
  },
  label: {
    fontSize: 14,
    color: '#6B7280',
    width: 100,
  },
  value: {
    fontSize: 14,
    color: '#1F2937',
    flex: 1,
  },
  costoText: {
    color: COLORS.primary,
    fontWeight: '700',
    fontSize: 16,
  },
  precioContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
    borderRadius: 8,
    paddingHorizontal: 12,
    marginTop: 4,
  },
  moneda: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1F2937',
    marginRight: 8,
  },
  precioInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 16,
    color: '#1F2937',
  },
  asignarButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  asignarButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  precioYaAsignado: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    backgroundColor: '#DCFCE7',
    borderRadius: 8,
    marginTop: 8,
  },
  precioYaAsignadoText: {
    color: '#16A34A',
    fontWeight: '600',
    fontSize: 14,
  },
  imagenContainer: {
    padding: 16,
    position: 'relative',
  },
  imagen: {
    width: '100%',
    height: 200,
    borderRadius: 8,
  },
  zoomHint: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    backgroundColor: 'rgba(0,0,0,0.6)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  zoomHintText: {
    color: '#FFFFFF',
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCloseButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  modalImageContainer: {
    width: width * 0.9,
    height: height * 0.7,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
  modalHint: {
    position: 'absolute',
    bottom: 40,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  modalHintText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 14,
  },
});