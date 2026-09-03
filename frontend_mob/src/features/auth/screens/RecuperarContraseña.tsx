// src/features/auth/screens/RecuperarContraseña.tsx
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AuthController } from '../../../core/controllers/AuthController';
import { COLORS } from '../../../shared/constants/colors';

interface Props {
  navigation: any;
}

export const RecuperarContraseña = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  const authController = new AuthController();

  const handleSubmit = async () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Ingresa tu correo electrónico');
      return;
    }

    setLoading(true);
    try {
      const result = await authController.solicitarRecuperacion(email);

      if (result.success) {
        Alert.alert(
          'Éxito',
          `Se ha enviado un enlace de recuperación a ${email}. Revisa tu correo.`,
          [
            {
              text: 'OK',
              onPress: () => {
                  navigation.navigate('RestablecerContraseña');
                }
              },
          ]
        );
        setEmail('');
      } else {
        Alert.alert('Error', result.message || 'Error al enviar el correo');
      }
    } catch (error: any) {
      let msg = 'Error al procesar la solicitud';
      if (error.response?.status === 404) {
        msg = 'No existe una cuenta con este email';
      } else if (error.response?.status === 400) {
        msg = error.response?.data?.message || 'Datos inválidos';
      }
      Alert.alert('Error', msg);
    } finally {
      setLoading(false);
    }
  };

  // ========== UI QUEDA EXACTAMENTE IGUAL ==========
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerCard}>
          <Ionicons name="lock-closed" size={48} color="#fff" />
          <Text style={styles.headerTitle}>Restablecer contraseña</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.description}>
            Ingresa tu correo electrónico y te enviaremos las instrucciones para restablecer tu contraseña.
          </Text>

          <Text style={styles.label}>Correo electrónico</Text>
          <TextInput
            style={styles.input}
            placeholder="tucorreo@email.com"
            placeholderTextColor="#999"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Enviar enlace de recuperación</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigation.navigate('Iniciosesion')}>
            <Text style={styles.backLink}>← Volver al inicio de sesión</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ========== TODOS LOS ESTILOS QUEDAN IGUAL ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 40,
  },
  headerCard: {
    backgroundColor: COLORS.primary,
    paddingVertical: 24,
    paddingHorizontal: 40,
    borderRadius: 16,
    alignItems: 'center',
    width: '100%',
    maxWidth: 400,
    marginBottom: 20,
  },
  headerTitle: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
    marginTop: 8,
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 400,
    padding: 24,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  description: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    color: '#000',
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
    marginBottom: 16,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  backLink: {
    color: COLORS.primary,
    fontSize: 14,
    textAlign: 'center',
    marginTop: 16,
    textDecorationLine: 'underline',
  },
});