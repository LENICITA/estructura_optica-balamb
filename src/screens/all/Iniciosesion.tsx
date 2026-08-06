// Iniciosesion.tsx
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
import { useAuth } from '../../contexts/AuthContext';

interface Props {
  navigation: any;
}

// Recibir navigation desde props (NO usar useNavigation)
 export const Iniciosesion = ({ navigation }: Props) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { login, user } = useAuth();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  //  Ahora navigation viene de las props
  const handleRedirectByRole = () => {
    try {
      if (!user) {
        console.log(' No hay usuario, redirigiendo a Principal');
        navigation.navigate('Principal');
        return;
      }

      console.log(' Usuario logeado:', user);

      let rolesArray: string[] = [];

      if (Array.isArray(user.roles)) {
        rolesArray = user.roles;
      } else if (typeof user.roles === 'string') {
        rolesArray = [user.roles];
      } else if (user.rol) {
        rolesArray = [user.rol];
      } else {
        console.log('️ Usuario sin roles, redirigiendo a Principal');
        navigation.navigate('Principal');
        return;
      }

      console.log(' Roles del usuario:', rolesArray);

      const firstRole = rolesArray.length > 0 ? rolesArray[0].toUpperCase() : '';
      console.log(' Primer rol:', firstRole);

      if (firstRole === 'ADMIN' || firstRole === 'ADMINISTRADOR') {
        console.log(' Redirigiendo a AdminInicio');
        navigation.navigate('PrincipalAdmin');
      } else if (firstRole === 'REPARTIDOR') {
        console.log(' Redirigiendo a RepartidorInicio');
        navigation.navigate('PrincipalRepartidor');
      } else if (firstRole === 'CLIENTE') {
        console.log(' Redirigiendo a ClienteInicio');
        navigation.navigate('PrincipalCliente');
      } else {
        console.log('⚠ Rol no reconocido, redirigiendo a Principal');
        navigation.navigate('Principal');
      }
    } catch (error) {
      console.error(' Error al redirigir:', error);
      navigation.navigate('Principal');
    }
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }

    setError('');
    setLoading(true);

    try {
      const result = await login(email, password);
      console.log(' Resultado del login:', result);

      if (!result.success) {
        setError(result.message || 'Credenciales incorrectas');
        Alert.alert('Error de inicio de sesión', result.message || 'Credenciales incorrectas');
        setLoading(false);
      } else {
        console.log(' Inicio sesion exitoso, redirigiendo...');
        setLoading(false);
        setTimeout(() => {
          handleRedirectByRole();
        }, 500);
      }
    } catch (err) {
      console.error(' Error en login:', err);
      setError('Error al iniciar sesión');
      Alert.alert('Error', 'Error al iniciar sesión');
      setLoading(false);
    }
  };

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
                name={showPassword ? "eye-off-outline" : "eye-outline"}
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