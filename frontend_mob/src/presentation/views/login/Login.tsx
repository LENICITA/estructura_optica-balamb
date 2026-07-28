<<<<<<< HEAD
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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login, user } = useAuth();
  const navigation = useNavigation();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  // ✅ Función de redirección mejorada
  const handleRedirectByRole = () => {
    if (!user) return;

    let rolesArray: string[] = [];

    if (Array.isArray(user.roles)) {
      rolesArray = user.roles;
    } else if (typeof user.roles === 'string') {
      rolesArray = [user.roles];
    } else if (user.rol) {
      rolesArray = [user.rol];
    }

    rolesArray = rolesArray.map((r) => r.toUpperCase());

    if (rolesArray.includes('ADMINISTRADOR')) {
      // @ts-ignore
      navigation.replace('AdminDashboard');
    } else if (rolesArray.includes('REPARTIDOR')) {
      // @ts-ignore
      navigation.replace('RepartidorInicio');
    } else if (rolesArray.includes('CLIENTE')) {
      // @ts-ignore
      navigation.replace('PrincipalCliente');
    } else {
      // @ts-ignore
      navigation.replace('Home');
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
      const result: any = await login(email, password);

      if (!result.success) {
        setError(result.message || 'Credenciales incorrectas');
        Alert.alert('Error de inicio de sesión', result.message || 'Credenciales incorrectas');
        setLoading(false);
      } else {
        setTimeout(() => {
          handleRedirectByRole();
        }, 1000);
      }
    } catch (err) {
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
            // @ts-ignore
            onPress={() => navigation.navigate('Home')}
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

          {/* ✅ TEXTO ACTUALIZADO Y REDIRECCIÓN AL REGISTRO */}
          <Text style={styles.registerText}>
            ¿No tienes una cuenta?{' '}
            <Text 
              style={styles.registerLink}
              // @ts-ignore
              onPress={() => navigation.navigate('RegisterScreen')}
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

=======
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
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  
  const { login } = useAuth();
  const navigation = useNavigation();

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async () => {
    if (!email.trim() || !password.trim()) {
      Alert.alert('Error', 'Por favor ingresa email y contraseña');
      return;
    }

    setError('');
    setLoading(true);
    
    try {
      const result: any = await login(email, password);

      if (!result.success) {
        setError(result.message || 'Credenciales incorrectas');
        Alert.alert('Error de inicio de sesión', result.message || 'Credenciales incorrectas');
        setLoading(false);
      } else {
        // ✅ LOGIN EXITOSO: Redirige al Home sin errores de TypeScript
        // @ts-ignore
        navigation.navigate('Home');
      }
    } catch (err) {
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
            // @ts-ignore
            onPress={() => navigation.navigate('Home')}
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
            Si no tiene cuenta{' '}
            <Text 
              style={styles.registerLink}
              // @ts-ignore
              onPress={() => navigation.navigate('Home')}
            >
              regrese al inicio
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

>>>>>>> 14704220dfc7dc9865698d802e6a76148c36c471
export default Login;