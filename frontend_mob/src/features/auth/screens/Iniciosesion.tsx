// src/features/auth/screens/Iniciosesion.tsx
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
import { useAuth } from '../context/AuthContext';
import { COLORS } from '../../../shared/constants/colors';

interface Props {
  navigation: any;
}

export const Iniciosesion = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, user } = useAuth();

  // ===== REDIRECCIÓN SEGÚN ROL =====
  const handleRedirectByRole = (usuario: any) => {
    try {
      if (!usuario) {
        console.log(' No hay usuario para redirigir');
        navigation.navigate('Principal');
        return;
      }

      console.log(' Usuario para redirección:', usuario);

      //  OBTENER ROLES
      let rolesArray: string[] = [];

      if (Array.isArray(usuario.roles)) {
        rolesArray = usuario.roles.map((r: any) =>
          typeof r === 'string' ? r : r.nombre || r.rol || r
        );
      } else if (typeof usuario.roles === 'string') {
        rolesArray = [usuario.roles];
      } else if (usuario.rol) {
        rolesArray = [usuario.rol];
      }

      rolesArray = rolesArray.map((role: string) => role.toUpperCase());
      console.log(' Roles:', rolesArray);

      //  ADMIN
      if (rolesArray.includes('ADMIN') || rolesArray.includes('ADMINISTRADOR')) {
        console.log('➡ Redirigiendo a Administrador');
        navigation.navigate('PrincipalAdmin');
        return;
      }

      //  REPARTIDOR
      if (rolesArray.includes('REPARTIDOR')) {
        console.log('➡ Redirigiendo a Repartidor');
        navigation.navigate('PrincipalRepartidor');
        return;
      }

      //  CLIENTE
      if (rolesArray.includes('CLIENTE')) {
        console.log('➡ Redirigiendo a Cliente');
        navigation.navigate('PrincipalCliente');
        return;
      }

      console.log('⚠ Rol no reconocido');
      navigation.navigate('Principal');

    } catch (error) {
      console.error(' Error al redirigir:', error);
      navigation.navigate('Principal');
    }
  };

  // ===== MOSTRAR / OCULTAR CONTRASEÑA =====
  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // ===== LOGIN =====
  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }

    setError('');
    setLoading(true);

    try {
      console.log(' Intentando iniciar sesión...');

      const result = await login(email.trim(), password);

      console.log(' Resultado del login:', result);

      if (!result.success) {
        setError(result.message || 'Credenciales incorrectas');
        Alert.alert('Error de inicio de sesión', result.message || 'Credenciales incorrectas');
        return;
      }

      console.log(' Inicio de sesión exitoso');
      console.log(' Usuario recibido:', result.user);

      handleRedirectByRole(result.user);

    } catch (err) {
      console.error(' Error en login:', err);
      setError('Error al iniciar sesión');
      Alert.alert('Error', 'Error al iniciar sesión');
    } finally {
      setLoading(false);
    }
  };

  // ========== UI ==========
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.headerContainer}>
          <Text style={styles.title}>Iniciar</Text>
          <Text style={styles.subtitle}>Sesión</Text>
        </View>

        <View style={styles.formContainer}>
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <Text style={styles.label}>Email</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="admin@opticam.com"
            placeholderTextColor="#999"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.passwordContainer}>
            <TextInput
              style={styles.passwordInput}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor="#999"
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              onPress={toggleShowPassword}
              style={styles.eyeButton}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={24}
                color="#666"
              />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => navigation.navigate('RecuperarContraseña')}
            style={styles.forgotPasswordButton}
          >
            <Text style={styles.forgotPasswordText}>Recuperar contraseña</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.loginButton, loading && styles.loginButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.loginButtonText}>Ingresar</Text>
            )}
          </TouchableOpacity>

          <Text style={styles.registerText}>
            ¿No tienes una cuenta?{' '}
            <Text
              style={styles.registerLink}
              onPress={() => navigation.navigate('AutoRegistro')}
            >
              Regístrate aquí
            </Text>
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// ========== ESTILOS ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  headerContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '500',
    color: '#000',
    textAlign: 'center',
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
  errorContainer: {
    backgroundColor: '#ffebee',
    borderWidth: 1,
    borderColor: '#ffcdd2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  errorText: {
    color: '#c62828',
    fontSize: 14,
    textAlign: 'center',
  },
  label: {
    color: '#000',
    marginTop: 12,
    marginBottom: 4,
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ccc',
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 4,
  },
  passwordContainer: {
    position: 'relative',
    width: '100%',
    marginBottom: 4,
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
  forgotPasswordButton: {
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  forgotPasswordText: {
    color: '#B90F0F',
    fontSize: 14,
  },
  loginButton: {
    width: '100%',
    marginTop: 20,
    paddingVertical: 14,
    backgroundColor: '#B90F0F',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  registerText: {
    textAlign: 'center',
    marginTop: 16,
    fontSize: 14,
    color: '#333',
  },
  registerLink: {
    color: '#B90F0F',
    fontWeight: '500',
  },
});