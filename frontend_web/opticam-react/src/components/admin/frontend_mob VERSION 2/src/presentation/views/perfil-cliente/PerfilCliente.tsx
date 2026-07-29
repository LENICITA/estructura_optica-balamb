// src/presentation/views/perfil-cliente/PerfilCliente.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PerfilCliente = () => {
  const navigation = useNavigation();
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fotoPerfil, setFotoPerfil] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    correo: '',
    telefono: ''
  });

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError(null);

      // ✅ Verificar token
      const token = await AsyncStorage.getItem('token');
      
      if (!token) {
        // ❌ Si no hay token, usar datos de ejemplo
        console.log('⚠️ No hay token, usando datos de ejemplo');
        
        const nombreLocal = await AsyncStorage.getItem('nombre') || 'Invitado';
        const emailLocal = await AsyncStorage.getItem('email') || 'invitado@email.com';
        
        setFormData({
          nombre: nombreLocal,
          direccion: 'Calle Principal #123',
          correo: emailLocal,
          telefono: '3001234567'
        });
        
        setLoading(false);
        return;
      }

      // ✅ Si hay token, hacer la llamada a la API
      try {
        // 🔴 DESCOMENTA CUANDO TENGAS LA API REAL
        // const response = await api.get('/usuarios/perfil', {
        //   headers: { Authorization: `Bearer ${token}` }
        // });
        // const userData = response.data.data || response.data.usuario || response.data;
        
        // 📌 SIMULACIÓN de respuesta (cuando tengas API real, reemplaza esto)
        const userData = {
          nombre_completo: 'Cliente Prueba',
          direccion: 'Calle Principal #123',
          email: 'cliente@email.com',
          telefono: '3001234567'
        };

        // Guardar nombre en AsyncStorage
        if (userData.nombre_completo) {
          await AsyncStorage.setItem('nombre', userData.nombre_completo);
        }
        if (userData.email) {
          await AsyncStorage.setItem('email', userData.email);
        }

        setFormData({
          nombre: userData.nombre_completo || 'Cliente',
          direccion: userData.direccion || '',
          correo: userData.email || '',
          telefono: userData.telefono || ''
        });

      } catch (apiError: any) {
        console.error('Error en API:', apiError);
        
        // Si el token expiró o es inválido
        if (apiError.response?.status === 401) {
          await AsyncStorage.removeItem('token');
          await AsyncStorage.removeItem('user');
          Alert.alert(
            'Sesión expirada',
            'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
            [
              { 
                text: 'Ir al Login', 
                onPress: () => navigation.navigate('Login' as never) 
              }
            ]
          );
          setLoading(false);
          return;
        }

        // Si hay otro error, usar datos de ejemplo
        const nombreLocal = await AsyncStorage.getItem('nombre') || 'Cliente';
        setFormData({
          nombre: nombreLocal,
          direccion: 'Calle Principal #123',
          correo: 'cliente@email.com',
          telefono: '3001234567'
        });
      }

    } catch (err: any) {
      console.error('Error al cargar perfil:', err);
      
      // En caso de error, usar datos de ejemplo
      const nombreLocal = await AsyncStorage.getItem('nombre') || 'Cliente';
      setFormData({
        nombre: nombreLocal,
        direccion: 'Calle Principal #123',
        correo: 'cliente@email.com',
        telefono: '3001234567'
      });
      setError('No se pudo cargar el perfil. Mostrando datos de ejemplo.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const activarEdicion = () => {
    setEditando(true);
  };

  const guardar = async () => {
    try {
      setLoading(true);
      
      // ✅ Verificar token
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        Alert.alert(
          'No autenticado',
          'Debes iniciar sesión para guardar cambios',
          [
            { 
              text: 'Ir al Login', 
              onPress: () => navigation.navigate('Login' as never) 
            },
            { text: 'Cancelar', style: 'cancel' }
          ]
        );
        setLoading(false);
        return;
      }

      // 🔴 DESCOMENTA CUANDO TENGAS LA API REAL
      // await api.put('/usuarios/perfil', {
      //   direccion: formData.direccion,
      //   email: formData.correo,
      //   telefono: formData.telefono
      // }, {
      //   headers: { Authorization: `Bearer ${token}` }
      // });

      // 📌 SIMULACIÓN de guardado
      await new Promise(resolve => setTimeout(resolve, 1000));

      Alert.alert('Éxito', 'Datos guardados correctamente');
      setEditando(false);
      cargarPerfil();

    } catch (err: any) {
      console.error('Error al guardar perfil:', err);
      
      if (err.response?.status === 401) {
        Alert.alert(
          'Sesión expirada',
          'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          [
            { 
              text: 'Ir al Login', 
              onPress: () => navigation.navigate('Login' as never) 
            }
          ]
        );
      } else {
        Alert.alert('Error', 'No se pudieron guardar los cambios');
      }
    } finally {
      setLoading(false);
    }
  };

  const seleccionarFoto = async () => {
    try {
      const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (!permissionResult.granted) {
        Alert.alert('Permiso requerido', 'Necesitamos acceso a tu galería para seleccionar una foto');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        setFotoPerfil(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error al seleccionar foto:', error);
      Alert.alert('Error', 'No se pudo seleccionar la imagen');
    }
  };

  if (loading && !editando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#B90F0F" />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.title}>GESTIÓN DE PERFIL</Text>

      {error && (
        <View style={styles.warningContainer}>
          <Text style={styles.warningText}>{error}</Text>
        </View>
      )}

      <View style={styles.card}>
        {/* Foto de perfil */}
        <View style={styles.fotoContainer}>
          <View style={styles.fotoWrapper}>
            <Image 
              source={fotoPerfil ? { uri: fotoPerfil } : require('../../../../assets/user.jpg')}
              style={styles.fotoPerfil}
            />
            <TouchableOpacity 
              style={styles.fotoButton}
              onPress={seleccionarFoto}
              disabled={loading}
            >
              <Ionicons name="camera-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Formulario */}
        <View style={styles.form}>
          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Nombre</Text>
            <TextInput 
              style={[styles.input, styles.inputDisabled]}
              value={formData.nombre} 
              editable={false}
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Dirección</Text>
            <TextInput 
              style={[styles.input, !editando && styles.inputDisabled]}
              value={formData.direccion} 
              onChangeText={(text) => handleChange('direccion', text)}
              editable={editando && !loading}
              placeholder="Ingresa tu dirección"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Contraseña</Text>
            <TextInput 
              style={[styles.input, styles.inputDisabled]}
              value="********" 
              editable={false}
            />
            <Text style={styles.passwordHint}>La contraseña no se muestra por seguridad</Text>
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Correo</Text>
            <TextInput 
              style={[styles.input, !editando && styles.inputDisabled]}
              value={formData.correo} 
              onChangeText={(text) => handleChange('correo', text)}
              editable={editando && !loading}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="correo@ejemplo.com"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.fieldContainer}>
            <Text style={styles.label}>Teléfono</Text>
            <TextInput 
              style={[styles.input, !editando && styles.inputDisabled]}
              value={formData.telefono} 
              onChangeText={(text) => handleChange('telefono', text)}
              editable={editando && !loading}
              keyboardType="phone-pad"
              placeholder="3001234567"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.buttonContainer}>
            {!editando ? (
              <TouchableOpacity 
                style={styles.editButton}
                onPress={activarEdicion}
                disabled={loading}
              >
                <Text style={styles.buttonText}>EDITAR PERFIL</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity 
                style={styles.saveButton}
                onPress={guardar}
                disabled={loading}
              >
                <Text style={styles.buttonText}>
                  {loading ? 'Guardando...' : 'GUARDAR'}
                </Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={styles.formulaButton}
            onPress={() => navigation.navigate('Formula' as never)}
          >
            <Text style={styles.formulaButtonText}>FÓRMULA</Text>
          </TouchableOpacity>
        </View>
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
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000',
    textAlign: 'center',
    marginBottom: 20,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  warningContainer: {
    backgroundColor: '#fff3cd',
    borderWidth: 1,
    borderColor: '#ffc107',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
  fotoContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  fotoWrapper: {
    position: 'relative',
  },
  fotoPerfil: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#B90F0F',
  },
  fotoButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#B90F0F',
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    marginTop: 10,
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    color: '#000',
    marginBottom: 4,
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
  inputDisabled: {
    backgroundColor: '#f5f5f5',
    color: '#666',
  },
  passwordHint: {
    fontSize: 11,
    color: '#999',
    marginTop: 4,
  },
  buttonContainer: {
    marginTop: 8,
  },
  editButton: {
    backgroundColor: '#000',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#B90F0F',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  formulaButton: {
    marginTop: 12,
    backgroundColor: '#666',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  formulaButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});

export default PerfilCliente;