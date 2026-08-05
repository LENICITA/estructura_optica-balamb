import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  navigation: any;
}

export const AutoRegistro = ({ navigation }: Props) => {
  const { register } = useAuth();

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    documento: '',
    fecha_nacimiento: '',
    ciudad: '',
    direccion: '',
    telefono: '',
    contrasena: '',
    confirmar_contrasena: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Función para manejar cambios en los inputs
  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (error) setError('');
  };

// ===== MANEJAR FECHA =====
  const handleDateChange = (event: any, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) {
      const year = selectedDate.getFullYear();
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
      const day = String(selectedDate.getDate()).padStart(2, '0');
      const formattedDate = `${year}-${month}-${day}`;
      handleChange('fecha_nacimiento', formattedDate);
    }
  };

  // Validación de email
  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

  // Función principal de registro
  const handleRegister = async () => {
    setError('');

    // 1. Validaciones
    if (!formData.nombre_completo.trim()) {
      setError('El nombre completo es obligatorio');
      return;
    }
    if (!formData.email.trim()) {
      setError('El email es obligatorio');
      return;
    }
    if (!validateEmail(formData.email)) {
      setError('Ingresa un email válido');
      return;
    }
    if (!formData.contrasena) {
      setError('La contraseña es obligatoria');
      return;
    }
    if (formData.contrasena !== formData.confirmar_contrasena) {
      setError('Las contraseñas no coinciden');
      return;
    }
    if (formData.contrasena.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres');
      return;
    }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(formData.contrasena)) {
      setError('La contraseña debe tener: mayúscula, minúscula y número');
      return;
    }

    setLoading(true);

    try {
      // 2. Preparar datos (igual que en la web)
      const userData = {
        nombre_completo: formData.nombre_completo.trim(),
        email: formData.email.trim().toLowerCase(),
        documento: formData.documento.trim() || '',
        fecha_nacimiento: formData.fecha_nacimiento || '',
        ciudad: formData.ciudad.trim() || '',
        direccion: formData.direccion.trim() || '',
        telefono: formData.telefono.trim() || '',
        contrasena: formData.contrasena,
        rol: 'CLIENTE' // Forzamos rol Cliente
      };

      // 3. Llamar al backend
      const result: any = await register(userData);

      if (result.success) {
        Alert.alert('¡Éxito!', 'Cuenta creada correctamente. Por favor inicia sesión.');
        navigation.navigate('Iniciosesion');
      } else {
        // Mostrar error específico del backend
        if (result.message?.includes('email')) {
          setError('Este email ya está registrado.');
        } else if (result.message?.includes('documento')) {
          setError('Este documento ya está registrado.');
        } else {
          setError(result.message || 'Error al registrar usuario.');
        }
      }
    } catch (error: any) {
      console.error('Error en registro:', error);
      setError('Error de conexión. Verifica tu internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>

          <Text style={styles.title}>Registro</Text>
          <Text style={styles.subtitle}>Regístrate gratis y seguro!</Text>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <View style={styles.formContainer}>

            {/* Nombres */}
            <Text style={styles.label}>Nombres y Apellidos <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={formData.nombre_completo}
              onChangeText={(text) => handleChange('nombre_completo', text)}
              placeholder="Juan Perez"
              placeholderTextColor="#999"
            />

            {/* Email */}
            <Text style={styles.label}>Email <Text style={styles.required}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              placeholder="juan@email.com"
              placeholderTextColor="#999"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Documento */}
            <Text style={styles.label}>Documento</Text>
            <TextInput
              style={styles.input}
              value={formData.documento}
              onChangeText={(text) => handleChange('documento', text)}
              placeholder="123456789"
              placeholderTextColor="#999"
              keyboardType="numeric"
            />

            {/* Fecha de nacimiento */}
            <Text style={styles.label}>Fecha de nacimiento</Text>
                        <TouchableOpacity
                          style={styles.dateInput}
                          onPress={() => setShowDatePicker(true)}
                        >
                          <Text style={formData.fecha_nacimiento ? styles.dateText : styles.datePlaceholder}>
                            {formData.fecha_nacimiento || 'Seleccionar fecha'}
                          </Text>
                        </TouchableOpacity>

                        {showDatePicker && (
                          <DateTimePicker
                            value={new Date()}
                            mode="date"
                            display="default"
                            onChange={handleDateChange}
                          />
                        )}


            {/* Ciudad */}
            <Text style={styles.label}>Ciudad</Text>
            <TextInput
              style={styles.input}
              value={formData.ciudad}
              onChangeText={(text) => handleChange('ciudad', text)}
              placeholder="Bogotá"
              placeholderTextColor="#999"
            />

            {/* Dirección */}
            <Text style={styles.label}>Dirección</Text>
            <TextInput
              style={styles.input}
              value={formData.direccion}
              onChangeText={(text) => handleChange('direccion', text)}
              placeholder="Calle 123 #45-67"
              placeholderTextColor="#999"
            />

            {/* Teléfono */}
            <Text style={styles.label}>Teléfono</Text>
            <TextInput
              style={styles.input}
              value={formData.telefono}
              onChangeText={(text) => handleChange('telefono', text)}
              placeholder="3001234567"
              placeholderTextColor="#999"
              keyboardType="phone-pad"
            />

            {/* Contraseña */}
            <Text style={styles.label}>Contraseña <Text style={styles.required}>*</Text></Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.contrasena}
                onChangeText={(text) => handleChange('contrasena', text)}
                placeholder="Mínimo 8 caracteres"
                placeholderTextColor="#999"
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeButton}>
                <Ionicons name={showPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <Text style={styles.helperText}>Debe tener: mayúscula, minúscula y número</Text>

            {/* Confirmar contraseña */}
            <Text style={styles.label}>Confirmar Contraseña <Text style={styles.required}>*</Text></Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                value={formData.confirmar_contrasena}
                onChangeText={(text) => handleChange('confirmar_contrasena', text)}
                placeholder="Repite la contraseña"
                placeholderTextColor="#999"
                secureTextEntry={!showConfirmPassword}
              />
              <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} style={styles.eyeButton}>
                <Ionicons name={showConfirmPassword ? "eye-off-outline" : "eye-outline"} size={24} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Botón de registro */}
            <TouchableOpacity
              style={[styles.registerButton, loading && styles.buttonDisabled]}
              onPress={handleRegister}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.registerButtonText}>Crear cuenta</Text>
              )}
            </TouchableOpacity>

            {/* Enlace a Login */}
            <Text style={styles.loginText}>
              ¿Ya tienes cuenta?{' '}
              <Text
                style={styles.loginLink}
                onPress={() => navigation.navigate('Iniciosesion' as never)}
              >
                Inicia sesión aquí
              </Text>
            </Text>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  errorContainer: {
    width: '100%',
    maxWidth: 370,
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
  },
  formContainer: {
    width: '100%',
    maxWidth: 370,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  label: {
    color: '#000',
    marginTop: 12,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  required: {
    color: '#d32f2f',
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
  },
  passwordInput: {
    width: '100%',
    padding: 12,
    paddingRight: 48,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    backgroundColor: '#fff',
  },
  eyeButton: {
    position: 'absolute',
    right: 12,
    top: 12,
  },
  helperText: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  registerButton: {
    width: '100%',
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: '#B90F0F',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    color: '#333',
  },
  loginLink: {
    color: '#B90F0F',
    fontWeight: '500',
  },
});