import React, { useState, useEffect } from 'react';

// This screen uses JSX and must be compiled with the React JSX transform.
/** @jsxImportSource react */

import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';

import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';

import { UserController } from '../../../core/controllers/UserController';

function EditarRepartidor({
  navigation,
  route,
}: {
  navigation: any;
  route?: any;
}) {
  // =========================================================
  // ID DEL REPARTIDOR
  // =========================================================

  const repartidor = route?.params?.repartidorData;
  const repartidorId = route?.params?.repartidorId ?? repartidor?.id_usuario;

  // =========================================================
  // CONTROLLER
  // =========================================================

  const [userController] = useState(() => new UserController());

  // =========================================================
  // ESTADOS
  // =========================================================

  const [formData, setFormData] = useState({
    datosPersonales: {
      nombre_completo: '',
      telefono: '',
      email: '',
      documento: '',
      ciudad: '',
      direccion: '',
      fecha_nacimiento: '',
      estado: 'ACTIVO',
    },

    datosVehiculo: {
      tipo: '',
      modelo: '',
      placa: '',
      color: '',
    },
  });

  const [errores, setErrores] = useState<
    Record<string, string | null>
  >({});

  const [formModificado, setFormModificado] = useState(false);
  const [loading, setLoading] = useState(false);

  // =========================================================
  // CALENDARIO
  // =========================================================

  const [mostrarCalendario, setMostrarCalendario] = useState(false);

  const [fechaSeleccionada, setFechaSeleccionada] =
    useState<Date>(new Date());

  // =========================================================
  // CARGAR REPARTIDOR
  // =========================================================

  useEffect(() => {
    const cargarRepartidor = async () => {
      if (!repartidorId) {
        Alert.alert(
          'Error',
          'No se encontró el ID del repartidor.'
        );
        return;
      }

      try {
        setLoading(true);

        console.log(
          'Cargando repartidor:',
          repartidorId
        );

        // =====================================================
        // AHORA SE USA EL CONTROLLER
        // =====================================================

        const response =
          await userController.getRepartidorById(
            Number(repartidorId)
          );

        console.log(
          'REPARTIDOR OBTENIDO:',
          response
        );

        if (!response) {
          Alert.alert(
            'Error',
            'No se encontró el repartidor.'
          );
          return;
        }

        const r = response;

        setFormData({
          datosPersonales: {
            nombre_completo:
              r.nombre_completo || '',

            telefono:
              r.telefono || '',

            email:
              r.email || '',

            documento:
              r.documento
                ? String(r.documento)
                : '',

            ciudad:
              r.ciudad || '',

            direccion:
              r.direccion || '',

            fecha_nacimiento:
              r.fecha_nacimiento || '',

            estado:
              r.estado || 'ACTIVO',
          },

          datosVehiculo: {
            tipo:
              r.vehiculo?.tipo || '',

            modelo:
              r.vehiculo?.modelo || '',

            placa:
              r.vehiculo?.placa || '',

            color:
              r.vehiculo?.color || '',
          },
        });

        // =====================================================
        // CARGAR FECHA PARA EL CALENDARIO
        // =====================================================

        if (r.fecha_nacimiento) {
          const fecha = new Date(
            `${r.fecha_nacimiento}T00:00:00`
          );

          if (!isNaN(fecha.getTime())) {
            setFechaSeleccionada(fecha);
          }
        }

        setFormModificado(false);
      } catch (error: any) {
        console.error(
          'Error al cargar repartidor:',
          error
        );

        Alert.alert(
          'Error',
          'No se pudieron cargar los datos del repartidor.'
        );
      } finally {
        setLoading(false);
      }
    };

    cargarRepartidor();
  }, [repartidorId]);

  // =========================================================
  // DATOS ESTÁTICOS
  // =========================================================

  const ESTADOS_REPARTIDOR = [
    {
      label: 'Activo',
      value: 'ACTIVO',
    },
    {
      label: 'Inactivo',
      value: 'INACTIVO',
    },
    {
      label: 'Suspendido',
      value: 'SUSPENDIDO',
    },
  ];

  const TIPOS_VEHICULO = [
    {
      label: 'Selecciona un tipo',
      value: '',
    },
    {
      label: 'Carro',
      value: 'CARRO',
    },
    {
      label: 'Moto',
      value: 'MOTO',
    },
    {
      label: 'Camioneta',
      value: 'CAMIONETA',
    },
    {
      label: 'Bicicleta',
      value: 'BICICLETA',
    },
    {
      label: 'Furgón',
      value: 'FURGON',
    },
  ];

  // =========================================================
  // CAMBIO DE CAMPOS
  // =========================================================

  const handleInputChange = (
    seccion: string,
    campo: string,
    valor: string
  ) => {
    setFormData(prev => ({
      ...prev,

      [seccion]: {
        ...prev[seccion as keyof typeof prev],
        [campo]: valor,
      },
    }));

    setFormModificado(true);

    if (errores[campo]) {
      setErrores(prev => ({
        ...prev,
        [campo]: null,
      }));
    }
  };

  // =========================================================
  // CALENDARIO
  // =========================================================

  const abrirCalendario = () => {
    setMostrarCalendario(true);
  };

  const handleFechaChange = (
    event: any,
    selectedDate?: Date
  ) => {
    if (Platform.OS === 'android') {
      setMostrarCalendario(false);
    }

    if (!selectedDate) {
      return;
    }

    setFechaSeleccionada(selectedDate);

    const año = selectedDate.getFullYear();

    const mes = String(
      selectedDate.getMonth() + 1
    ).padStart(2, '0');

    const dia = String(
      selectedDate.getDate()
    ).padStart(2, '0');

    const fechaFormateada =
      `${año}-${mes}-${dia}`;

    handleInputChange(
      'datosPersonales',
      'fecha_nacimiento',
      fechaFormateada
    );

    if (Platform.OS === 'ios') {
      setMostrarCalendario(true);
    }
  };

  // =========================================================
  // VALIDAR
  // =========================================================

  const validarFormulario = () => {
    const nuevosErrores: Record<string, string> = {};

    const {
      datosPersonales,
      datosVehiculo,
    } = formData;

    if (!datosPersonales.nombre_completo.trim()) {
      nuevosErrores.nombre_completo =
        'El nombre es obligatorio';
    }

    if (!datosPersonales.email.trim()) {
      nuevosErrores.email =
        'El email es obligatorio';
    } else {
      const emailRegex =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

      if (
        !emailRegex.test(
          datosPersonales.email
        )
      ) {
        nuevosErrores.email =
          'El email no es válido';
      }
    }

    if (!datosPersonales.documento.trim()) {
      nuevosErrores.documento =
        'El documento es obligatorio';
    }

    if (!datosPersonales.ciudad.trim()) {
      nuevosErrores.ciudad =
        'La ciudad es obligatoria';
    }

    if (!datosVehiculo.placa.trim()) {
      nuevosErrores.placa =
        'La placa es obligatoria';
    }

    if (!datosVehiculo.tipo) {
      nuevosErrores.tipo =
        'El tipo de vehículo es obligatorio';
    }

    if (!datosVehiculo.modelo.trim()) {
      nuevosErrores.modelo =
        'El modelo es obligatorio';
    }

    if (!datosVehiculo.color.trim()) {
      nuevosErrores.color =
        'El color es obligatorio';
    }

    setErrores(nuevosErrores);

    return (
      Object.keys(nuevosErrores).length === 0
    );
  };

  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = () => {
    if (!validarFormulario()) {
      Alert.alert(
        'Validación',
        'Por favor, completa todos los campos obligatorios'
      );
      return;
    }

    Alert.alert(
      'Confirmar actualización',

      `¿Estás seguro de actualizar los datos de "${formData.datosPersonales.nombre_completo}"?`,

      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },

        {
          text: 'Actualizar',
          onPress: actualizarRepartidor,
        },
      ]
    );
  };

  // =========================================================
  // CANCELAR
  // =========================================================

  const handleCancel = () => {
    if (formModificado) {
      Alert.alert(
        'Cambios sin guardar',

        '¿Seguro que quieres descartar los cambios?',

        [
          {
            text: 'Cancelar',
            style: 'cancel',
          },

          {
            text: 'Descartar',
            onPress: () =>
              navigation?.goBack(),
          },
        ]
      );
    } else {
      navigation?.goBack();
    }
  };

  // =========================================================
  // ACTUALIZAR REPARTIDOR
  // =========================================================

  const actualizarRepartidor = async () => {
    if (!repartidorId) {
      Alert.alert(
        'Error',
        'No se encontró el ID del repartidor.'
      );
      return;
    }

    try {
      setLoading(true);

      // =====================================================
      // DATOS QUE SE ENVÍAN AL CONTROLLER
      // =====================================================

      const datos = {
        nombre_completo:
          formData.datosPersonales.nombre_completo,

        telefono:
          formData.datosPersonales.telefono,

        email:
          formData.datosPersonales.email,

        documento:
          formData.datosPersonales.documento,

        ciudad:
          formData.datosPersonales.ciudad,

        direccion:
          formData.datosPersonales.direccion,

        fecha_nacimiento:
          formData.datosPersonales.fecha_nacimiento,

        estado:
          formData.datosPersonales.estado,

        vehiculo: {
          tipo:
            formData.datosVehiculo.tipo,

          modelo:
            formData.datosVehiculo.modelo,

          placa:
            formData.datosVehiculo.placa,

          color:
            formData.datosVehiculo.color,
        },
      };

      console.log(
        'ENVIANDO ACTUALIZACIÓN:',
        JSON.stringify(datos, null, 2)
      );

      // =====================================================
      // CONTROLLER → SERVICE → APICLIENT
      // =====================================================

      const response =
        await userController.actualizarRepartidor(
          Number(repartidorId),
          datos
        );

      console.log(
        'RESPUESTA ACTUALIZACIÓN:',
        response
      );

      if (!response.success) {
        Alert.alert(
          'Error',
          response.message ||
            'No se pudo actualizar el repartidor.'
        );
        return;
      }

      setFormModificado(false);

      Alert.alert(
        'Éxito',

        response.message ||
          'Los datos del repartidor se actualizaron correctamente.',

        [
          {
            text: 'OK',
            onPress: () =>
              navigation?.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error(
        'Error al actualizar repartidor:',
        error
      );

      Alert.alert(
        'Error',
        'No se pudo actualizar el repartidor.'
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === 'ios'
          ? 'padding'
          : 'height'
      }
      keyboardVerticalOffset={
        Platform.OS === 'ios'
          ? 64
          : 0
      }
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={
          styles.scrollContent
        }
      >
        {/* =====================================
            BADGE
        ===================================== */}

        <View style={styles.statusBadge}>
          <Ionicons
            name="person-circle"
            size={20}
            color="#B90F0F"
          />

          <Text
            style={styles.statusBadgeText}
          >
            Editando:{' '}
            {formData.datosPersonales.nombre_completo ||
              'Repartidor'}
          </Text>
        </View>

        <View style={styles.formContainer}>
          {/* =====================================
              DATOS PERSONALES
          ===================================== */}

          <View style={styles.sectionHeader}>
            <View
              style={
                styles.sectionIconContainer
              }
            >
              <Ionicons
                name="person"
                size={20}
                color="#B90F0F"
              />
            </View>

            <Text
              style={styles.sectionTitle}
            >
              Datos Personales
            </Text>

            <View style={styles.sectionBadge}>
              <Text
                style={
                  styles.sectionBadgeText
                }
              >
                *
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            {/* NOMBRE */}

            <View style={styles.inputGroup}>
              <View
                style={styles.labelContainer}
              >
                <Text style={styles.label}>
                  Nombre completo
                </Text>

                <Text
                  style={styles.requiredStar}
                >
                  *
                </Text>
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  errores.nombre_completo &&
                    styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="person-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  value={
                    formData.datosPersonales
                      .nombre_completo
                  }
                  onChangeText={text =>
                    handleInputChange(
                      'datosPersonales',
                      'nombre_completo',
                      text
                    )
                  }
                  placeholder="Ej: Saida Rozo"
                  placeholderTextColor="#999"
                />
              </View>

              {errores.nombre_completo && (
                <View
                  style={styles.errorContainer}
                >
                  <Ionicons
                    name="alert-circle"
                    size={14}
                    color="#B90F0F"
                  />

                  <Text
                    style={styles.errorText}
                  >
                    {errores.nombre_completo}
                  </Text>
                </View>
              )}
            </View>

            {/* TELÉFONO */}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Teléfono
              </Text>

              <View
                style={styles.inputWrapper}
              >
                <Ionicons
                  name="call-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  value={
                    formData.datosPersonales
                      .telefono
                  }
                  onChangeText={text =>
                    handleInputChange(
                      'datosPersonales',
                      'telefono',
                      text
                    )
                  }
                  placeholder="Ej: 3123456789"
                  keyboardType="phone-pad"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* EMAIL */}

            <View style={styles.inputGroup}>
              <View
                style={styles.labelContainer}
              >
                <Text style={styles.label}>
                  Email
                </Text>

                <Text
                  style={styles.requiredStar}
                >
                  *
                </Text>
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  errores.email &&
                    styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="mail-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  value={
                    formData.datosPersonales
                      .email
                  }
                  onChangeText={text =>
                    handleInputChange(
                      'datosPersonales',
                      'email',
                      text
                    )
                  }
                  placeholder="Ej: juan@email.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  placeholderTextColor="#999"
                />
              </View>

              {errores.email && (
                <View
                  style={styles.errorContainer}
                >
                  <Ionicons
                    name="alert-circle"
                    size={14}
                    color="#B90F0F"
                  />

                  <Text
                    style={styles.errorText}
                  >
                    {errores.email}
                  </Text>
                </View>
              )}
            </View>

            {/* DOCUMENTO */}

            <View style={styles.inputGroup}>
              <View
                style={styles.labelContainer}
              >
                <Text style={styles.label}>
                  Documento
                </Text>

                <Text
                  style={styles.requiredStar}
                >
                  *
                </Text>
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  errores.documento &&
                    styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="id-card-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  value={
                    formData.datosPersonales
                      .documento
                  }
                  onChangeText={text =>
                    handleInputChange(
                      'datosPersonales',
                      'documento',
                      text
                    )
                  }
                  placeholder="Ej: 1234567890"
                  keyboardType="numeric"
                  placeholderTextColor="#999"
                />
              </View>

              {errores.documento && (
                <View
                  style={styles.errorContainer}
                >
                  <Ionicons
                    name="alert-circle"
                    size={14}
                    color="#B90F0F"
                  />

                  <Text
                    style={styles.errorText}
                  >
                    {errores.documento}
                  </Text>
                </View>
              )}
            </View>

            {/* CIUDAD */}

            <View style={styles.inputGroup}>
              <View
                style={styles.labelContainer}
              >
                <Text style={styles.label}>
                  Ciudad
                </Text>

                <Text
                  style={styles.requiredStar}
                >
                  *
                </Text>
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  errores.ciudad &&
                    styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="location-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  value={
                    formData.datosPersonales
                      .ciudad
                  }
                  onChangeText={text =>
                    handleInputChange(
                      'datosPersonales',
                      'ciudad',
                      text
                    )
                  }
                  placeholder="Ej: Bogotá"
                  placeholderTextColor="#999"
                />
              </View>

              {errores.ciudad && (
                <View
                  style={styles.errorContainer}
                >
                  <Ionicons
                    name="alert-circle"
                    size={14}
                    color="#B90F0F"
                  />

                  <Text
                    style={styles.errorText}
                  >
                    {errores.ciudad}
                  </Text>
                </View>
              )}
            </View>

            {/* DIRECCIÓN */}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Dirección
              </Text>

              <View
                style={[
                  styles.inputWrapper,
                  styles.textAreaWrapper,
                ]}
              >
                <Ionicons
                  name="home-outline"
                  size={20}
                  color="#999"
                  style={[
                    styles.inputIcon,
                    styles.textAreaIcon,
                  ]}
                />

                <TextInput
                  style={[
                    styles.input,
                    styles.textArea,
                  ]}
                  value={
                    formData.datosPersonales
                      .direccion
                  }
                  onChangeText={text =>
                    handleInputChange(
                      'datosPersonales',
                      'direccion',
                      text
                    )
                  }
                  placeholder="Ej: Calle 123 # 45-67"
                  multiline
                  numberOfLines={2}
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            {/* FECHA DE NACIMIENTO */}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Fecha de Nacimiento
              </Text>

              <TouchableOpacity
                style={styles.inputWrapper}
                onPress={abrirCalendario}
                activeOpacity={0.7}
              >
                <Ionicons
                  name="calendar-outline"
                  size={20}
                  color="#B90F0F"
                  style={styles.inputIcon}
                />

                <Text
                  style={[
                    styles.fechaTexto,
                    !formData.datosPersonales
                      .fecha_nacimiento &&
                      styles.fechaPlaceholder,
                  ]}
                >
                  {formData.datosPersonales
                    .fecha_nacimiento
                    ? formData.datosPersonales
                        .fecha_nacimiento
                    : 'Selecciona una fecha'}
                </Text>

                <Ionicons
                  name="chevron-down-outline"
                  size={20}
                  color="#777"
                />
              </TouchableOpacity>

              {mostrarCalendario && (
                <View
                  style={
                    styles.calendarContainer
                  }
                >
                  <DateTimePicker
                    value={
                      fechaSeleccionada
                    }
                    mode="date"
                    display={
                      Platform.OS === 'ios'
                        ? 'spinner'
                        : 'calendar'
                    }
                    onChange={
                      handleFechaChange
                    }
                    maximumDate={
                      new Date()
                    }
                    locale="es-CO"
                    themeVariant="light"
                  />

                  {Platform.OS === 'ios' && (
                    <TouchableOpacity
                      style={
                        styles.calendarDoneButton
                      }
                      onPress={() =>
                        setMostrarCalendario(
                          false
                        )
                      }
                    >
                      <Text
                        style={
                          styles.calendarDoneText
                        }
                      >
                        Listo
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>

            {/* ESTADO */}

            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                Estado
              </Text>

              <View
                style={styles.pickerWrapper}
              >
                <Ionicons
                  name="radio-button-on-outline"
                  size={20}
                  color="#B90F0F"
                  style={styles.inputIcon}
                />

                <Picker
                  selectedValue={
                    formData.datosPersonales
                      .estado
                  }
                  onValueChange={value =>
                    handleInputChange(
                      'datosPersonales',
                      'estado',
                      value
                    )
                  }
                  style={styles.picker}
                  dropdownIconColor="#666"
                >
                  {ESTADOS_REPARTIDOR.map(
                    estado => (
                      <Picker.Item
                        key={estado.value}
                        label={
                          estado.label
                        }
                        value={
                          estado.value
                        }
                      />
                    )
                  )}
                </Picker>
              </View>
            </View>
          </View>

          {/* =====================================
              VEHÍCULO
          ===================================== */}

          <View style={styles.sectionHeader}>
            <View
              style={
                styles.sectionIconContainer
              }
            >
              <Ionicons
                name="car"
                size={20}
                color="#B90F0F"
              />
            </View>

            <Text
              style={styles.sectionTitle}
            >
              Datos del Vehículo
            </Text>

            <View style={styles.sectionBadge}>
              <Text
                style={
                  styles.sectionBadgeText
                }
              >
                *
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            {/* TIPO */}

            <View style={styles.inputGroup}>
              <View
                style={styles.labelContainer}
              >
                <Text style={styles.label}>
                  Tipo de vehículo
                </Text>

                <Text
                  style={styles.requiredStar}
                >
                  *
                </Text>
              </View>

              <View
                style={[
                  styles.pickerWrapper,
                  errores.tipo &&
                    styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="car-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />

                <Picker
                  selectedValue={
                    formData.datosVehiculo
                      .tipo
                  }
                  onValueChange={value =>
                    handleInputChange(
                      'datosVehiculo',
                      'tipo',
                      value
                    )
                  }
                  style={styles.picker}
                  dropdownIconColor="#666"
                >
                  {TIPOS_VEHICULO.map(
                    tipo => (
                      <Picker.Item
                        key={tipo.value}
                        label={
                          tipo.label
                        }
                        value={
                          tipo.value
                        }
                      />
                    )
                  )}
                </Picker>
              </View>

              {errores.tipo && (
                <View
                  style={styles.errorContainer}
                >
                  <Ionicons
                    name="alert-circle"
                    size={14}
                    color="#B90F0F"
                  />

                  <Text
                    style={styles.errorText}
                  >
                    {errores.tipo}
                  </Text>
                </View>
              )}
            </View>

            {/* MODELO */}

            <View style={styles.inputGroup}>
              <View
                style={styles.labelContainer}
              >
                <Text style={styles.label}>
                  Modelo
                </Text>

                <Text
                  style={styles.requiredStar}
                >
                  *
                </Text>
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  errores.modelo &&
                    styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="build-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  value={
                    formData.datosVehiculo
                      .modelo
                  }
                  onChangeText={text =>
                    handleInputChange(
                      'datosVehiculo',
                      'modelo',
                      text
                    )
                  }
                  placeholder="Ej: Yamaha XTZ 150"
                  placeholderTextColor="#999"
                />
              </View>

              {errores.modelo && (
                <View
                  style={styles.errorContainer}
                >
                  <Ionicons
                    name="alert-circle"
                    size={14}
                    color="#B90F0F"
                  />

                  <Text
                    style={styles.errorText}
                  >
                    {errores.modelo}
                  </Text>
                </View>
              )}
            </View>

            {/* PLACA */}

            <View style={styles.inputGroup}>
              <View
                style={styles.labelContainer}
              >
                <Text style={styles.label}>
                  Placa
                </Text>

                <Text
                  style={styles.requiredStar}
                >
                  *
                </Text>
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  errores.placa &&
                    styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="key-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={[
                    styles.input,
                    styles.placaInput,
                  ]}
                  value={
                    formData.datosVehiculo
                      .placa
                  }
                  onChangeText={text =>
                    handleInputChange(
                      'datosVehiculo',
                      'placa',
                      text.toUpperCase()
                    )
                  }
                  placeholder="Ej: ABC-123"
                  autoCapitalize="characters"
                  placeholderTextColor="#999"
                  maxLength={8}
                />

                {formData.datosVehiculo
                  .placa && (
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color="#4CAF50"
                  />
                )}
              </View>

              {errores.placa && (
                <View
                  style={styles.errorContainer}
                >
                  <Ionicons
                    name="alert-circle"
                    size={14}
                    color="#B90F0F"
                  />

                  <Text
                    style={styles.errorText}
                  >
                    {errores.placa}
                  </Text>
                </View>
              )}

              <Text style={styles.hintText}>
                <Ionicons
                  name="information-circle-outline"
                  size={14}
                  color="#666"
                />
                {' '}
                La placa debe ser única en el
                sistema
              </Text>
            </View>

            {/* COLOR */}

            <View style={styles.inputGroup}>
              <View
                style={styles.labelContainer}
              >
                <Text style={styles.label}>
                  Color
                </Text>

                <Text
                  style={styles.requiredStar}
                >
                  *
                </Text>
              </View>

              <View
                style={[
                  styles.inputWrapper,
                  errores.color &&
                    styles.inputWrapperError,
                ]}
              >
                <Ionicons
                  name="color-palette-outline"
                  size={20}
                  color="#999"
                  style={styles.inputIcon}
                />

                <TextInput
                  style={styles.input}
                  value={
                    formData.datosVehiculo
                      .color
                  }
                  onChangeText={text =>
                    handleInputChange(
                      'datosVehiculo',
                      'color',
                      text
                    )
                  }
                  placeholder="Ej: Rojo"
                  placeholderTextColor="#999"
                />
              </View>

              {errores.color && (
                <View
                  style={styles.errorContainer}
                >
                  <Ionicons
                    name="alert-circle"
                    size={14}
                    color="#B90F0F"
                  />

                  <Text
                    style={styles.errorText}
                  >
                    {errores.color}
                  </Text>
                </View>
              )}
            </View>
          </View>

          {/* =====================================
              BOTONES
          ===================================== */}

          <View
            style={styles.buttonContainer}
          >
            <TouchableOpacity
              style={[
                styles.button,
                styles.cancelButton,
              ]}
              onPress={handleCancel}
              activeOpacity={0.7}
              disabled={loading}
            >
              <Ionicons
                name="close"
                size={20}
                color="#666"
              />

              <Text
                style={
                  styles.cancelButtonText
                }
              >
                Cancelar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.button,
                styles.saveButton,
              ]}
              onPress={handleSubmit}
              disabled={loading}
              activeOpacity={0.8}
            >
              {loading ? (
                <View
                  style={
                    styles.loadingContainer
                  }
                >
                  <Ionicons
                    name="reload"
                    size={20}
                    color="#fff"
                  />

                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    Guardando...
                  </Text>
                </View>
              ) : (
                <>
                  <Ionicons
                    name="save"
                    size={20}
                    color="#fff"
                  />

                  <Text
                    style={
                      styles.saveButtonText
                    }
                  >
                    Guardar Cambios
                  </Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          {/* CAMBIOS */}

          {formModificado && (
            <View
              style={styles.modifiedBadge}
            >
              <Ionicons
                name="pencil"
                size={16}
                color="#B90F0F"
              />

              <Text
                style={styles.modifiedText}
              >
                Tienes cambios sin guardar
              </Text>
            </View>
          )}

          {/* INFO */}

          <View
            style={styles.infoContainer}
          >
            <View style={styles.infoRow}>
              <Ionicons
                name="information-circle"
                size={16}
                color="#666"
              />

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

// =========================================================
// ESTILOS
// =========================================================

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },

  statusBadge: {
    marginTop: 58,
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

  formContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },

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

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.06,
    shadowRadius: 3,
    elevation: 2,
  },

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

  fechaTexto: {
    flex: 1,
    fontSize: 15,
    color: '#333',
  },

  fechaPlaceholder: {
    color: '#999',
  },

  calendarContainer: {
    marginTop: 8,
    backgroundColor: '#fff',
    borderRadius: 10,
    alignItems: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#e5e5e5',
  },

  calendarDoneButton: {
    width: '100%',
    backgroundColor: '#B90F0F',
    paddingVertical: 12,
    alignItems: 'center',
  },

  calendarDoneText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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

export default EditarRepartidor;
