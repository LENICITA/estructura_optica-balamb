// src/features/admin/screens/RegistrarRepartidor.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { UserController } from '../../../core/controllers/UserController';
import { COLORS } from '../../../shared/constants/colors';

interface Props {
  navigation: any;
}

export const RegistrarRepartidor = ({ navigation }: Props) => {
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [documento, setDocumento] = useState('');
  const [fechaNacimiento, setFechaNacimiento] = useState('');
  const [ciudad, setCiudad] = useState('');
  const [direccion, setDireccion] = useState('');
  const [telefono, setTelefono] = useState('');
  const [password, setPassword] = useState('');

  const [vehiculo, setVehiculo] = useState('');
  const [modelo, setModelo] = useState('');
  const [placa, setPlaca] = useState('');
  const [color, setColor] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const tiposVehiculo = ['CARRO', 'MOTO'];

  const userController = new UserController();

  const handleDateChange = (
    event: any,
    selectedDate?: Date
  ) => {
    setShowDatePicker(Platform.OS === 'ios');

    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');

      setFechaNacimiento(`${year}-${month}-${day}`);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setSuccess('');

    // Validaciones
    if (!nombre.trim() || !email.trim() || !password.trim()) {
      setError('Completa los campos obligatorios.');
      return;
    }

    if (password.length < 8) {
      setError('La contraseña debe tener mínimo 8 caracteres.');
      return;
    }

    if (!vehiculo || !modelo.trim() || !placa.trim()) {
      setError('Completa los datos del vehículo.');
      return;
    }

    try {
      setLoading(true);

      //  Usamos el controlador en lugar de apiClient
      const result = await userController.registrarRepartidor({
        nombre_completo: nombre.trim(),
        telefono: telefono.trim(),
        fecha_nacimiento: fechaNacimiento,
        documento: documento.trim(),
        ciudad: ciudad.trim(),
        direccion: direccion.trim(),
        email: email.trim(),
        contrasena: password,
        vehiculo: {
          tipo: vehiculo,
          modelo: modelo.trim(),
          placa: placa.trim().toUpperCase(),
          color: color.trim(),
        },
      });

      if (result.success) {
        setSuccess('Repartidor registrado exitosamente.');

        Alert.alert(
          'Registro exitoso',
          'El repartidor ha sido registrado correctamente.',
          [
            {
              text: 'Aceptar',
              onPress: () => {
                navigation.navigate('DashboardRepartidores');
              },
            },
          ]
        );
      } else {
        setError(result.message || 'No se pudo registrar el repartidor.');
      }

    } catch (error: any) {
      console.error('Error al registrar repartidor:', error);

      if (error.response?.status === 400) {
        setError(
          error.response?.data?.message ||
          'Datos inválidos. Verifica la información ingresada.'
        );
      } else if (error.response?.status === 401) {
        setError(
          'Tu sesión ha expirado. Inicia sesión nuevamente.'
        );
      } else if (error.response?.status === 403) {
        setError(
          'No tienes permisos para registrar repartidores.'
        );
      } else if (error.response?.status === 409) {
        setError(
          error.response?.data?.message ||
          'El correo, documento o placa ya está registrado.'
        );
      } else {
        setError(
          error.response?.data?.message ||
          'Error al registrar repartidor. Intenta nuevamente.'
        );
      }

    } finally {
      setLoading(false);
    }
  };

  // ========== EL RESTO DEL CÓDIGO (UI) QUEDA EXACTAMENTE IGUAL ==========
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >

        {/* ENCABEZADO */}
        <View style={styles.header}>
          <Text style={styles.title}>Registro</Text>
          <Text style={styles.subtitle}>
            Registra a tus Repartidores
          </Text>
        </View>

        {/* FORMULARIO */}
        <View style={styles.formContainer}>

          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons
                name="alert-circle-outline"
                size={20}
                color="#c62828"
              />
              <Text style={styles.errorText}>
                {error}
              </Text>
            </View>
          ) : null}

          {success ? (
            <View style={styles.successContainer}>
              <Ionicons
                name="checkmark-circle-outline"
                size={20}
                color="#2e7d32"
              />
              <Text style={styles.successText}>
                {success}
              </Text>
            </View>
          ) : null}

          {/* DATOS PERSONALES */}
          <Text style={styles.sectionTitle}>
            Datos personales
          </Text>

          <Text style={styles.label}>
            Nombres y Apellidos *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ej. Juan Pérez"
            placeholderTextColor="#999"
            value={nombre}
            onChangeText={setNombre}
          />

          <Text style={styles.label}>
            Email *
          </Text>

          <TextInput
            style={styles.input}
            placeholder="correo@ejemplo.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>
            Documento
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Número de documento"
            placeholderTextColor="#999"
            value={documento}
            onChangeText={setDocumento}
            keyboardType="numeric"
          />

          <Text style={styles.label}>
            Fecha de nacimiento
          </Text>

          <TouchableOpacity
            style={styles.dateInput}
            onPress={() => setShowDatePicker(true)}
          >
            <Text
              style={
                fechaNacimiento
                  ? styles.dateText
                  : styles.placeholderText
              }
            >
              {fechaNacimiento || 'Selecciona una fecha'}
            </Text>

            <Ionicons
              name="calendar-outline"
              size={22}
              color={COLORS.primary}
            />
          </TouchableOpacity>

          {showDatePicker && (
            <DateTimePicker
              value={
                fechaNacimiento
                  ? new Date(`${fechaNacimiento}T00:00:00`)
                  : new Date(2000, 0, 1)
              }
              mode="date"
              display={
                Platform.OS === 'ios'
                  ? 'spinner'
                  : 'default'
              }
              maximumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

          <Text style={styles.label}>
            Ciudad
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ej. Bogotá"
            placeholderTextColor="#999"
            value={ciudad}
            onChangeText={setCiudad}
          />

          <Text style={styles.label}>
            Dirección
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Dirección de residencia"
            placeholderTextColor="#999"
            value={direccion}
            onChangeText={setDireccion}
          />

          <Text style={styles.label}>
            Teléfono
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Número de teléfono"
            placeholderTextColor="#999"
            value={telefono}
            onChangeText={setTelefono}
            keyboardType="phone-pad"
          />

          {/* CONTRASEÑA */}
          <Text style={styles.label}>
            Contraseña *
          </Text>

          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor="#999"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />

            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() =>
                setShowPassword(!showPassword)
              }
            >
              <Ionicons
                name={
                  showPassword
                    ? 'eye-off-outline'
                    : 'eye-outline'
                }
                size={23}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          {/* VEHÍCULO */}
          <Text style={styles.sectionTitle}>
            Datos del vehículo
          </Text>

          <Text style={styles.label}>
            Tipo de vehículo
          </Text>

          <View style={styles.vehicleContainer}>
            {tiposVehiculo.map((tipo) => (
              <TouchableOpacity
                key={tipo}
                style={[
                  styles.vehicleButton,
                  vehiculo === tipo &&
                    styles.vehicleButtonSelected,
                ]}
                onPress={() => setVehiculo(tipo)}
              >
                <Ionicons
                  name={
                    tipo === 'MOTO'
                      ? 'bicycle-outline'
                      : 'car-outline'
                  }
                  size={22}
                  color={
                    vehiculo === tipo
                      ? '#fff'
                      : COLORS.primary
                  }
                />

                <Text
                  style={[
                    styles.vehicleText,
                    vehiculo === tipo &&
                      styles.vehicleTextSelected,
                  ]}
                >
                  {tipo === 'MOTO'
                    ? 'Moto'
                    : 'Carro'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.label}>
            Modelo del vehículo
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ej. 2024"
            placeholderTextColor="#999"
            value={modelo}
            onChangeText={setModelo}
          />

          <Text style={styles.label}>
            Placa
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ej. ABC123"
            placeholderTextColor="#999"
            value={placa}
            onChangeText={(text) =>
              setPlaca(text.toUpperCase())
            }
            autoCapitalize="characters"
          />

          <Text style={styles.label}>
            Color del vehículo
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Ej. Negro"
            placeholderTextColor="#999"
            value={color}
            onChangeText={setColor}
          />

          {/* BOTÓN */}
          <TouchableOpacity
            style={[
              styles.registerButton,
              loading &&
                styles.registerButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator
                size="small"
                color="#fff"
              />
            ) : (
              <>
                <Ionicons
                  name="person-add-outline"
                  size={20}
                  color="#fff"
                />

                <Text style={styles.registerButtonText}>
                  Crear cuenta
                </Text>
              </>
            )}
          </TouchableOpacity>

        </View>
      </ScrollView>
    </View>
  );
};

// ========== TODOS LOS ESTILOS QUEDAN IGUAL ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },

  scrollContent: {
    paddingVertical: 25,
    paddingHorizontal: 16,
    paddingBottom: 40,
  },

  header: {
    alignItems: 'center',
    marginBottom: 20,
  },

  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#000',
  },

  subtitle: {
    fontSize: 22,
    fontWeight: '500',
    color: '#000',
    marginTop: 2,
  },

  formContainer: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000',
    marginTop: 8,
    marginBottom: 8,
  },

  label: {
    color: '#000',
    fontSize: 14,
    fontWeight: '500',
    marginTop: 12,
    marginBottom: 5,
  },

  input: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    color: '#000',
    backgroundColor: '#fff',
  },

  dateInput: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },

  dateText: {
    fontSize: 16,
    color: '#000',
  },

  placeholderText: {
    fontSize: 16,
    color: '#999',
  },

  passwordContainer: {
    position: 'relative',
    width: '100%',
  },

  passwordInput: {
    width: '100%',
    padding: 12,
    paddingRight: 50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    color: '#000',
  },

  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
  },

  vehicleContainer: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4,
  },

  vehicleButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 7,
  },

  vehicleButtonSelected: {
    backgroundColor: COLORS.primary,
  },

  vehicleText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },

  vehicleTextSelected: {
    color: '#fff',
  },

  errorContainer: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  errorText: {
    color: '#c62828',
    fontSize: 14,
    flex: 1,
  },

  successContainer: {
    backgroundColor: '#e8f5e9',
    borderWidth: 1,
    borderColor: '#c8e6c9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },

  successText: {
    color: '#2e7d32',
    fontSize: 14,
    flex: 1,
  },

  registerButton: {
    width: '100%',
    marginTop: 24,
    paddingVertical: 14,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 8,
  },

  registerButtonDisabled: {
    opacity: 0.6,
  },

  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});