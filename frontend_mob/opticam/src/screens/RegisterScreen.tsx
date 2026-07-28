// src/screens/RegisterScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';
import DateTimePicker from '@react-native-community/datetimepicker';

export const RegisterScreen = ({ navigation }: any) => {
  const { register } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    documento: '',
    fecha_nacimiento: '',
    ciudad: '',
    direccion: '',
    telefono: '',
    contrasena: '',
    confirmar_contrasena: '',
  });

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const validateEmail = (email: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };

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

  const handleRegister = async () => {
    if (!formData.nombre_completo.trim()) {
      Alert.alert('Error', 'El nombre completo es obligatorio');
      return;
    }
    if (!formData.email.trim()) {
      Alert.alert('Error', 'El email es obligatorio');
      return;
    }
    if (!validateEmail(formData.email)) {
      Alert.alert('Error', 'Ingresa un email válido');
      return;
    }
    if (!formData.contrasena) {
      Alert.alert('Error', 'La contraseña es obligatoria');
      return;
    }
    if (formData.contrasena.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (formData.contrasena !== formData.confirmar_contrasena) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const userData = {
        nombre_completo: formData.nombre_completo.trim(),
        email: formData.email.trim().toLowerCase(),
        documento: formData.documento.trim() || '',
        fecha_nacimiento: formData.fecha_nacimiento || '',
        ciudad: formData.ciudad.trim() || '',
        direccion: formData.direccion.trim() || '',
        telefono: formData.telefono.trim() || '',
        contrasena: formData.contrasena,
        rol: 'CLIENTE',
      };

      const result = await register(userData);

      if (result.success) {
        Alert.alert('Éxito', 'Registro exitoso. Redirigiendo...');
        setTimeout(() => navigation.navigate('PrincipalCliente'), 1500);
      } else {
        Alert.alert('Error', result.message || 'Error al registrar usuario');
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Registro</Text>
        <Text style={styles.subtitle}>Regístrate gratis y seguro!</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Nombres y Apellidos *</Text>
          <TextInput
            style={styles.input}
            placeholder="Juan Perez"
            placeholderTextColor={COLORS.gray}
            value={formData.nombre_completo}
            onChangeText={(text) => handleChange('nombre_completo', text)}
          />

          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            placeholder="ana@email.com"
            placeholderTextColor={COLORS.gray}
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Documento</Text>
          <TextInput
            style={styles.input}
            placeholder="123456789"
            placeholderTextColor={COLORS.gray}
            value={formData.documento}
            onChangeText={(text) => handleChange('documento', text)}
            keyboardType="numeric"
          />

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

          <Text style={styles.label}>Ciudad</Text>
          <TextInput
            style={styles.input}
            placeholder="Bogota"
            placeholderTextColor={COLORS.gray}
            value={formData.ciudad}
            onChangeText={(text) => handleChange('ciudad', text)}
          />

          <Text style={styles.label}>Dirección</Text>
          <TextInput
            style={styles.input}
            placeholder="Calle 123 #45-67"
            placeholderTextColor={COLORS.gray}
            value={formData.direccion}
            onChangeText={(text) => handleChange('direccion', text)}
          />

          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            placeholder="3001234567"
            placeholderTextColor={COLORS.gray}
            value={formData.telefono}
            onChangeText={(text) => handleChange('telefono', text)}
            keyboardType="phone-pad"
          />

          <Text style={styles.label}>Contraseña *</Text>
          <TextInput
            style={styles.input}
            placeholder="Mínimo 8 caracteres"
            placeholderTextColor={COLORS.gray}
            value={formData.contrasena}
            onChangeText={(text) => handleChange('contrasena', text)}
            secureTextEntry
          />
          <Text style={styles.helperText}>
            Debe tener al menos 8 caracteres, una mayúscula, una minúscula y un número
          </Text>

          <Text style={styles.label}>Confirmar Contraseña *</Text>
          <TextInput
            style={styles.input}
            placeholder="Repite la contraseña"
            placeholderTextColor={COLORS.gray}
            value={formData.confirmar_contrasena}
            onChangeText={(text) => handleChange('confirmar_contrasena', text)}
            secureTextEntry
          />

          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialButtonText}>Continuar con Google</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.socialButton}>
            <Text style={styles.socialButtonText}>Continuar con Facebook</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.registerButton, loading && styles.registerButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.registerButtonText}>Crear cuenta</Text>
            )}
          </TouchableOpacity>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>¿Ya tienes cuenta? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
              <Text style={styles.loginLink}>Inicia sesión aquí</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 30,
    paddingHorizontal: 20,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: COLORS.black,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '500',
    color: COLORS.black,
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  label: {
    fontSize: 14,
    color: COLORS.black,
    marginTop: 12,
    marginBottom: 4,
    fontWeight: '500',
  },
  input: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.black,
  },
  dateInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    color: COLORS.black,
  },
  datePlaceholder: {
    fontSize: 16,
    color: COLORS.gray,
  },
  helperText: {
    fontSize: 11,
    color: COLORS.gray,
    marginTop: 4,
  },
  socialButton: {
    backgroundColor: '#f0f0f0',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 10,
  },
  socialButtonText: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '500',
  },
  registerButton: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    alignItems: 'center',
  },
  registerButtonDisabled: {
    opacity: 0.6,
  },
  registerButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '600',
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    flexWrap: 'wrap',
  },
  loginText: {
    fontSize: 14,
    color: COLORS.text,
  },
  loginLink: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});