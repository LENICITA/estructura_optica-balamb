// src/features/auth/screens/RestablecerContraseña.tsx
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
  route: any;
}

export const RestablecerContraseña = ({ navigation, route }: Props) => {
  const token = route.params?.token || '';
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const authController = new AuthController();

  const handleSubmit = async () => {
    if (!token) {
      Alert.alert('Error', 'Token de recuperación no válido');
      return;
    }

    if (newPassword.length < 8) {
      Alert.alert('Error', 'La contraseña debe tener al menos 8 caracteres');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
    try {
      const result = await authController.resetearPassword(token, newPassword);

      if (result.success) {
        Alert.alert(
          'Éxito',
          'Contraseña actualizada exitosamente',
          [{ text: 'OK', onPress: () => navigation.navigate('Iniciosesion') }]
        );
      } else {
        Alert.alert('Error', result.message || 'Error al actualizar la contraseña');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Error al procesar la solicitud');
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
          <Ionicons name="key" size={48} color="#fff" />
          <Text style={styles.headerTitle}>Nueva contraseña</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Nueva contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              placeholder="Mínimo 8 caracteres"
              placeholderTextColor="#999"
              value={newPassword}
              onChangeText={setNewPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <Text style={styles.label}>Confirmar contraseña</Text>
          <TextInput
            style={styles.input}
            placeholder="Repite tu nueva contraseña"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showPassword}
          />

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>Actualizar contraseña</Text>
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
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#000',
  },
  eyeButton: {
    paddingHorizontal: 12,
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