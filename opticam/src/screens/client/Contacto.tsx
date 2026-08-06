// src/presentation/views/contacto/Contacto.tsx
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
  Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiClient } from '../../services/apiClient'; // ✅ Importación correcta

const Contacto = () => {
  const navigation = useNavigation();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });
  const [enviado, setEnviado] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    if (error) setError(null);
    if (enviado) setEnviado(false);
  };

  const handleSubmit = async () => {
    // Validaciones
    if (!formData.nombre.trim()) {
      setError('Ingresa tu nombre completo');
      return;
    }
    if (!formData.email.trim()) {
      setError('Ingresa tu email');
      return;
    }
    if (!formData.mensaje.trim()) {
      setError('Escribe tu mensaje');
      return;
    }
    if (formData.mensaje.trim().length < 10) {
      setError('El mensaje debe tener al menos 10 caracteres');
      return;
    }

    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Ingresa un email válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('token');
      
      // Configurar headers (si hay token, se usa autenticación)
      const config: any = {};
      if (token) {
        config.headers = {
          'Authorization': `Bearer ${token}`
        };
      }

      // ✅ CORREGIDO: usar apiClient en lugar de api
      const response = await apiClient.post('/contacto', {
        nombre: formData.nombre.trim(),
        email: formData.email.trim().toLowerCase(),
        telefono: formData.telefono.trim() || '',
        mensaje: formData.mensaje.trim()
      }, config);

      if (response.data.success) {
        setEnviado(true);
        setFormData({ nombre: '', email: '', telefono: '', mensaje: '' });
        Alert.alert('Éxito', '¡Mensaje enviado! Te contactaremos pronto.');
        setTimeout(() => setEnviado(false), 5000);
      } else {
        throw new Error(response.data.message || 'Error al enviar el mensaje');
      }

    } catch (err: any) {
      console.error('Error al enviar mensaje:', err);
      
      let mensajeError = 'Error al enviar el mensaje. ';
      if (err.response?.status === 401) {
        mensajeError += 'Sesión expirada. Por favor, inicia sesión nuevamente.';
      } else if (err.response?.status === 400) {
        mensajeError += err.response.data?.message || 'Datos inválidos';
      } else if (err.response?.status === 500) {
        mensajeError += 'Error interno del servidor. Intenta nuevamente.';
      } else {
        mensajeError += err.response?.data?.message || err.message;
      }
      
      setError(mensajeError);
      Alert.alert('Error', mensajeError);
    } finally {
      setLoading(false);
    }
  };

  const openLink = (url: string) => {
    Linking.openURL(url).catch(err => console.error('Error al abrir link:', err));
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.title}>Contáctenos</Text>
        <Text style={styles.subtitle}>
          Por favor contáctenos a través del formulario para temas relacionados con PQRS.
        </Text>
      </View>

      {/* Información de contacto */}
      <View style={styles.infoCard}>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={24} color="#B90F0F" />
          <Text style={styles.infoText}>Opticavirtualbalamb@gmail.com</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="chatbubble-outline" size={24} color="#B90F0F" />
          <Text style={styles.infoText}>301 2092941</Text>
        </View>
        <View style={[styles.infoRow, styles.infoRowLast]}>
          <Ionicons name="call-outline" size={24} color="#B90F0F" />
          <Text style={styles.infoText}>(57) 301 2092941</Text>
        </View>
      </View>

      {/* Formulario */}
      <View style={styles.formCard}>
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {enviado && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>¡Mensaje enviado! Te contactaremos pronto.</Text>
          </View>
        )}

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Nombre completo *</Text>
          <TextInput
            style={styles.input}
            value={formData.nombre}
            onChangeText={(text) => handleChange('nombre', text)}
            placeholder="Tu nombre completo"
            placeholderTextColor="#999"
            editable={!loading}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Email *</Text>
          <TextInput
            style={styles.input}
            value={formData.email}
            onChangeText={(text) => handleChange('email', text)}
            placeholder="tucorreo@ejemplo.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
            editable={!loading}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Teléfono</Text>
          <TextInput
            style={styles.input}
            value={formData.telefono}
            onChangeText={(text) => handleChange('telefono', text)}
            placeholder="Teléfono de contacto"
            placeholderTextColor="#999"
            keyboardType="phone-pad"
            editable={!loading}
          />
        </View>

        <View style={styles.fieldContainer}>
          <Text style={styles.label}>Mensaje *</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={formData.mensaje}
            onChangeText={(text) => handleChange('mensaje', text)}
            placeholder="Escribe aquí tu PQRS..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            editable={!loading}
          />
          <Text style={styles.hint}>Mínimo 10 caracteres</Text>
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Enviar formulario</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#740b0b',
    textAlign: 'center',
    paddingHorizontal: 10,
  },
  infoCard: {
    backgroundColor: '#B90F0F',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.2)',
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoText: {
    color: '#fff',
    fontSize: 14,
    marginLeft: 12,
    flex: 1,
  },
  formCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontWeight: '600',
    fontSize: 14,
    color: '#000',
    marginBottom: 6,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: '#fff',
    color: '#000',
  },
  textArea: {
    minHeight: 100,
    paddingTop: 10,
  },
  hint: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  errorContainer: {
    backgroundColor: '#fde8e8',
    borderWidth: 1,
    borderColor: '#f5c6cb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: '#721c24',
    fontSize: 14,
  },
  successContainer: {
    backgroundColor: '#d4edda',
    borderWidth: 1,
    borderColor: '#c3e6cb',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  successText: {
    color: '#155724',
    fontSize: 14,
  },
  submitButton: {
    backgroundColor: '#B90F0F',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Contacto;