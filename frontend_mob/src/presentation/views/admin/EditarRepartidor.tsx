import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Switch,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Icon from 'react-native-vector-icons/Ionicons';

/**
 * =============================================
 * 🎨 COMPONENTE: FormularioEditarRepartidor
 * 
 * VERSIÓN: SOLO CONTENIDO - SIN HEADER/FOOTER
 * 
 * USO: Este componente va dentro de tu vista
 * principal que ya tiene header y footer
 * =============================================
 */

function FormularioEditarRepartidor({ navigation, route }: { navigation: any; route?: any }) {
  // =============================================
  // 📌 DATOS DE PRUEBA (MOCK)
  // =============================================
  const [formData, setFormData] = useState({
    datosPersonales: {
      nombre_completo: 'Saida Rozo',
      telefono: '3123456789',
      email: 'saidarozo@email.com',
      documento: '1234567890',
      ciudad: 'Bogotá',
      direccion: 'Calle 123 # 45-67',
      fecha_nacimiento: '1990-01-15',
      estado: 'ACTIVO',
    },
    datosVehiculo: {
      tipo: 'MOTO',
      modelo: 'Yamaha XTZ 150',
      placa: 'ABC-123',
      color: 'Rojo',
    }
  });

  // =============================================
  // 📌 ESTADOS DE UI
  // =============================================
  const [errores, setErrores] = useState<Record<string, string | null>>({});
  const [formModificado, setFormModificado] = useState(false);
  const [loading, setLoading] = useState(false);

  // =============================================
  // 📌 DATOS ESTÁTICOS (UI)
  // =============================================
  const ESTADOS_REPARTIDOR = [
    { label: 'Activo', value: 'ACTIVO' },
    { label: 'Inactivo', value: 'INACTIVO' },
    { label: 'Suspendido', value: 'SUSPENDIDO' },
  ];

  const TIPOS_VEHICULO = [
    { label: 'Selecciona un tipo', value: '' },
    { label: '🚗 Carro', value: 'CARRO' },
    { label: '🏍️ Moto', value: 'MOTO' },
    { label: '🚐 Camioneta', value: 'CAMIONETA' },
    { label: '🚲 Bicicleta', value: 'BICICLETA' },
    { label: '🚚 Furgón', value: 'FURGON' },
  ];

  // =============================================
  // 📌 FUNCIONES
  // =============================================
  const handleInputChange = (seccion: string, campo: string, valor: string) => {
    setFormData(prev => ({
      ...prev,
      [seccion]: {
        ...prev[seccion as keyof typeof prev],
        [campo]: valor
      }
    }));
    setFormModificado(true);

    if (errores[campo]) {
      setErrores(prev => ({
        ...prev,
        [campo]: null
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};
    const { datosPersonales, datosVehiculo } = formData;

    if (!datosPersonales.nombre_completo.trim()) {
      nuevosErrores.nombre_completo = 'El nombre es obligatorio';
    }
    if (!datosPersonales.email.trim()) {
      nuevosErrores.email = 'El email es obligatorio';
    } else {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(datosPersonales.email)) {
        nuevosErrores.email = 'El email no es válido';
      }
    }
    if (!datosPersonales.documento.trim()) {
      nuevosErrores.documento = 'El documento es obligatorio';
    }
    if (!datosPersonales.ciudad.trim()) {
      nuevosErrores.ciudad = 'La ciudad es obligatoria';
    }
    if (!datosVehiculo.placa.trim()) {
      nuevosErrores.placa = 'La placa es obligatoria';
    }
    if (!datosVehiculo.tipo) {
      nuevosErrores.tipo = 'El tipo de vehículo es obligatorio';
    }
    if (!datosVehiculo.modelo.trim()) {
      nuevosErrores.modelo = 'El modelo es obligatorio';
    }
    if (!datosVehiculo.color.trim()) {
      nuevosErrores.color = 'El color es obligatorio';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleSubmit = () => {
    if (!validarFormulario()) {
      Alert.alert('Validación', 'Por favor, completa todos los campos obligatorios');
      return;
    }

    Alert.alert(
      'Confirmar actualización',
      `¿Estás seguro de actualizar los datos de "${formData.datosPersonales.nombre_completo}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Actualizar',
          onPress: () => {
            setLoading(true);
            // Simular guardado
            setTimeout(() => {
              setLoading(false);
              Alert.alert(
                '¡Éxito! 🎉',
                'Los datos se actualizaron correctamente',
                [{ text: 'OK', onPress: () => navigation?.goBack() }]
              );
              setFormModificado(false);
            }, 1500);
          }
        }
      ]
    );
  };

  const handleCancel = () => {
    if (formModificado) {
      Alert.alert(
        'Cambios sin guardar',
        '¿Seguro que quieres descartar los cambios?',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Descartar', onPress: () => navigation?.goBack() }
        ]
      );
    } else {
      navigation?.goBack();
    }
  };

  // =============================================
  // 📌 RENDER
  // =============================================
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* ============================================= */}
        {/* BADGE DE ESTADO */}
        {/* ============================================= */}
        <View style={styles.statusBadge}>
          <Icon name="person-circle" size={20} color="#B90F0F" />
          <Text style={styles.statusBadgeText}>
            Editando: {formData.datosPersonales.nombre_completo}
          </Text>

        </View>

        <View style={styles.formContainer}>
          {/* ============================================= */}
          {/* SECCIÓN: DATOS PERSONALES */}
          {/* ============================================= */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Icon name="person" size={20} color="#B90F0F" />
            </View>
            <Text style={styles.sectionTitle}>Datos Personales</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>*</Text>
            </View>
          </View>

          <View style={styles.card}>
            {/* Nombre Completo */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Nombre completo</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <View style={[styles.inputWrapper, errores.nombre_completo && styles.inputWrapperError]}>
                <Icon name="person-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.datosPersonales.nombre_completo}
                  onChangeText={(text) => handleInputChange('datosPersonales', 'nombre_completo', text)}
                  placeholder="Ej: Saida Rozo"
                  placeholderTextColor="#999" />
              </View>
              {errores.nombre_completo && (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={14} color="#B90F0F" />
                  <Text style={styles.errorText}>{errores.nombre_completo}</Text>
                </View>
              )}
            </View>

            {/* Teléfono */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <View style={styles.inputWrapper}>
                <Icon name="call-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.datosPersonales.telefono}
                  onChangeText={(text) => handleInputChange('datosPersonales', 'telefono', text)}
                  placeholder="Ej: 3123456789"
                  keyboardType="phone-pad"
                  placeholderTextColor="#999" />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Email</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <View style={[styles.inputWrapper, errores.email && styles.inputWrapperError]}>
                <Icon name="mail-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.datosPersonales.email}
                  onChangeText={(text) => handleInputChange('datosPersonales', 'email', text)}
                  placeholder="Ej: juan@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999" />
              </View>
              {errores.email && (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={14} color="#B90F0F" />
                  <Text style={styles.errorText}>{errores.email}</Text>
                </View>
              )}
            </View>

            {/* Documento */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Documento</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <View style={[styles.inputWrapper, errores.documento && styles.inputWrapperError]}>
                <Icon name="id-card-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.datosPersonales.documento}
                  onChangeText={(text) => handleInputChange('datosPersonales', 'documento', text)}
                  placeholder="Ej: 1234567890"
                  keyboardType="numeric"
                  placeholderTextColor="#999" />
              </View>
              {errores.documento && (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={14} color="#B90F0F" />
                  <Text style={styles.errorText}>{errores.documento}</Text>
                </View>
              )}
            </View>

            {/* Ciudad */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Ciudad</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <View style={[styles.inputWrapper, errores.ciudad && styles.inputWrapperError]}>
                <Icon name="location-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.datosPersonales.ciudad}
                  onChangeText={(text) => handleInputChange('datosPersonales', 'ciudad', text)}
                  placeholder="Ej: Bogotá"
                  placeholderTextColor="#999" />
              </View>
              {errores.ciudad && (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={14} color="#B90F0F" />
                  <Text style={styles.errorText}>{errores.ciudad}</Text>
                </View>
              )}
            </View>

            {/* Dirección */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dirección</Text>
              <View style={[styles.inputWrapper, styles.textAreaWrapper]}>
                <Icon name="home-outline" size={20} color="#999" style={[styles.inputIcon, styles.textAreaIcon]} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  value={formData.datosPersonales.direccion}
                  onChangeText={(text) => handleInputChange('datosPersonales', 'direccion', text)}
                  placeholder="Ej: Calle 123 # 45-67"
                  multiline
                  numberOfLines={2}
                  placeholderTextColor="#999" />
              </View>
            </View>

            {/* Fecha de Nacimiento */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha de Nacimiento</Text>
              <View style={styles.inputWrapper}>
                <Icon name="calendar-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.datosPersonales.fecha_nacimiento}
                  onChangeText={(text) => handleInputChange('datosPersonales', 'fecha_nacimiento', text)}
                  placeholder="Ej: 1990-01-15"
                  placeholderTextColor="#999" />
              </View>
            </View>

            {/* Estado */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Estado</Text>
              <View style={styles.pickerWrapper}>
                <Icon name="radio-button-on-outline" size={20} color="#B90F0F" style={styles.inputIcon} />
                <Picker
                  selectedValue={formData.datosPersonales.estado}
                  onValueChange={(value) => handleInputChange('datosPersonales', 'estado', value)}
                  style={styles.picker}
                  dropdownIconColor="#666"
                >
                  {ESTADOS_REPARTIDOR.map((estado) => (
                    <Picker.Item
                      key={estado.value}
                      label={estado.label}
                      value={estado.value} />
                  ))}
                </Picker>
              </View>
            </View>
          </View>

          {/* ============================================= */}
          {/* SECCIÓN: DATOS DEL VEHÍCULO */}
          {/* ============================================= */}
          <View style={styles.sectionHeader}>
            <View style={styles.sectionIconContainer}>
              <Icon name="car" size={20} color="#B90F0F" />
            </View>
            <Text style={styles.sectionTitle}>Datos del Vehículo</Text>
            <View style={styles.sectionBadge}>
              <Text style={styles.sectionBadgeText}>*</Text>
            </View>
          </View>

          <View style={styles.card}>
            {/* Tipo de vehículo */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Tipo de vehículo</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <View style={[styles.pickerWrapper, errores.tipo && styles.inputWrapperError]}>
                <Icon name="car-outline" size={20} color="#999" style={styles.inputIcon} />
                <Picker
                  selectedValue={formData.datosVehiculo.tipo}
                  onValueChange={(value) => handleInputChange('datosVehiculo', 'tipo', value)}
                  style={styles.picker}
                  dropdownIconColor="#666"
                >
                  {TIPOS_VEHICULO.map((tipo) => (
                    <Picker.Item
                      key={tipo.value}
                      label={tipo.label}
                      value={tipo.value} />
                  ))}
                </Picker>
              </View>
              {errores.tipo && (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={14} color="#B90F0F" />
                  <Text style={styles.errorText}>{errores.tipo}</Text>
                </View>
              )}
            </View>

            {/* Modelo */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Modelo</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <View style={[styles.inputWrapper, errores.modelo && styles.inputWrapperError]}>
                <Icon name="build-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.datosVehiculo.modelo}
                  onChangeText={(text) => handleInputChange('datosVehiculo', 'modelo', text)}
                  placeholder="Ej: Yamaha XTZ 150"
                  placeholderTextColor="#999" />
              </View>
              {errores.modelo && (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={14} color="#B90F0F" />
                  <Text style={styles.errorText}>{errores.modelo}</Text>
                </View>
              )}
            </View>

            {/* Placa */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Placa</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <View style={[styles.inputWrapper, errores.placa && styles.inputWrapperError]}>
                <Icon name="key-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, styles.placaInput]}
                  value={formData.datosVehiculo.placa}
                  onChangeText={(text) => handleInputChange('datosVehiculo', 'placa', text.toUpperCase())}
                  placeholder="Ej: ABC-123"
                  autoCapitalize="characters"
                  placeholderTextColor="#999"
                  maxLength={8} />
                {formData.datosVehiculo.placa && (
                  <Icon name="checkmark-circle" size={18} color="#4CAF50" />
                )}
              </View>
              {errores.placa && (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={14} color="#B90F0F" />
                  <Text style={styles.errorText}>{errores.placa}</Text>
                </View>
              )}
              <Text style={styles.hintText}>
                <Icon name="information-circle-outline" size={14} color="#666" />
                {' '}La placa debe ser única en el sistema
              </Text>
            </View>

            {/* Color */}
            <View style={styles.inputGroup}>
              <View style={styles.labelContainer}>
                <Text style={styles.label}>Color</Text>
                <Text style={styles.requiredStar}>*</Text>
              </View>
              <View style={[styles.inputWrapper, errores.color && styles.inputWrapperError]}>
                <Icon name="color-palette-outline" size={20} color="#999" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={formData.datosVehiculo.color}
                  onChangeText={(text) => handleInputChange('datosVehiculo', 'color', text)}
                  placeholder="Ej: Rojo"
                  placeholderTextColor="#999" />
              </View>
              {errores.color && (
                <View style={styles.errorContainer}>
                  <Icon name="alert-circle" size={14} color="#B90F0F" />
                  <Text style={styles.errorText}>{errores.color}</Text>
                </View>
              )}
            </View>
          </View>

          {/* ============================================= */}
          {/* BOTONES DE ACCIÓN */}
          {/* ============================================= */}
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.cancelButton]}
              onPress={handleCancel}
              activeOpacity={0.7}
            >
              <Icon name="close" size={20} color="#666" />
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.saveButton]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <Icon name="reload" size={20} color="#fff" style={styles.spinning} />
                  <Text style={styles.saveButtonText}>Guardando...</Text>
                </View>
              ) : (
                <>
                  <Icon name="save" size={20} color="#fff" />
                  <Text style={styles.saveButtonText}>Guardar Cambios</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* ============================================= */}
          {/* INDICADOR DE CAMBIOS */}
          {/* ============================================= */}
          {formModificado && (
            <View style={styles.modifiedBadge}>
              <Icon name="pencil" size={16} color="#B90F0F" />
              <Text style={styles.modifiedText}>
                Tienes cambios sin guardar
              </Text>
            </View>
          )}

          {/* ============================================= */}
          {/* INFO ADICIONAL */}
          {/* ============================================= */}
          <View style={styles.infoContainer}>
            <View style={styles.infoRow}>
              <Icon name="information-circle" size={16} color="#666" />
              <Text style={styles.infoText}>
                Los campos con * son obligatorios
              </Text>
            </View>
            
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

// =============================================
// 🎨 ESTILOS
// =============================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  // =============================================
  // STATUS BADGE
  // =============================================
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    marginBottom: 4,
  },
  statusBadgeText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    fontWeight: '500',
    flex: 1,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4CAF50',
  },

  // =============================================
  // FORM CONTAINER
  // =============================================
  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  // =============================================
  // SECTION HEADER
  // =============================================
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    marginTop: 8,
  },
  sectionIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFE5E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  sectionBadge: {
    backgroundColor: '#B90F0F',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    minWidth: 20,
    alignItems: 'center',
  },
  sectionBadgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },

  // =============================================
  // CARD
  // =============================================
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

  // =============================================
  // INPUT GROUP
  // =============================================
  inputGroup: {
    marginBottom: 14,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  requiredStar: {
    color: '#B90F0F',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    minHeight: 46,
  },
  inputWrapperError: {
    borderColor: '#B90F0F',
    borderWidth: 2,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: '#333',
    paddingVertical: 10,
    backgroundColor: 'transparent',
  },
  textAreaWrapper: {
    alignItems: 'flex-start',
    minHeight: 45,
  },
  textAreaIcon: {
    marginTop: 10,
  },
  textArea: {
    minHeight: 20,
    textAlignVertical: 'top',
    paddingTop: 10,
  },
  placaInput: {
    textTransform: 'uppercase',
    letterSpacing: 1,
    fontWeight: '600',
  },

  // =============================================
  // PICKER
  // =============================================
  pickerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 6,
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 12,
    height: 46,
  },
  picker: {
    flex: 1,
    color: '#333',
    height: 53,
    marginLeft: -4,
    marginTop: -4,
  },

  // =============================================
  // COLOR PREVIEW
  // =============================================
  colorPreview: {
    width: 28,
    height: 28,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#ddd',
    marginLeft: 8,
  },

  // =============================================
  // ERRORS
  // =============================================
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  errorText: {
    color: '#B90F0F',
    fontSize: 12,
    marginLeft: 4,
  },
  hintText: {
    color: '#666',
    fontSize: 12,
    marginTop: 4,
  },

  // =============================================
  // BUTTONS
  // =============================================
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginBottom: 12,
    gap: 12,
  },
  button: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#B90F0F',
    shadowColor: '#B90F0F',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '500',
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  spinning: {
  },

  // =============================================
  // MODIFIED BADGE
  // =============================================
  modifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    marginBottom: 12,
  },
  modifiedText: {
    color: '#B90F0F',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
  },

  // =============================================
  // INFO
  // =============================================
  infoContainer: {
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    marginLeft: 6,
  },
});

export default FormularioEditarRepartidor;