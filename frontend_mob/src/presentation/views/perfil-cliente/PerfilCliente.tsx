import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import api from '../../../utils/api'; // Asegúrate de tener esto configurado

const PerfilCliente = () => {
  const navigation = useNavigation();
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Estado con TODOS los campos de tu tabla USUARIOS
  const [formData, setFormData] = useState({
    nombre_completo: '',
    telefono: '',
    fecha_nacimiento: '',
    documento: '',
    ciudad: '',
    direccion: '',
    email: '',
    // La contraseña no se trae del backend por seguridad
  });
  
  const [fotoUri, setFotoUri] = useState<string | null>(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError(null);

      // 🔥 LLAMADA REAL A TU API (cuando el backend esté listo)
      // Suponemos que el endpoint es /api/usuarios/perfil o /api/usuarios/{id}
      const response = await api.get('/usuarios/perfil'); 

      // Procesamos la respuesta (puede venir en response.data o response.data.usuario)
      const userData = response.data?.usuario || response.data;

      setFormData({
        nombre_completo: userData.nombre_completo || '',
        telefono: userData.telefono || '',
        fecha_nacimiento: userData.fecha_nacimiento || '',
        documento: userData.documento ? String(userData.documento) : '',
        ciudad: userData.ciudad || '',
        direccion: userData.direccion || '',
        email: userData.email || '',
      });

      // Guardamos el nombre en AsyncStorage para usarlo en el Header
      if (userData.nombre_completo) {
        await AsyncStorage.setItem('nombre', userData.nombre_completo);
      }

    } catch (err: any) {
      console.error('Error al cargar perfil:', err);
      setError('Error al cargar el perfil. Usando datos de respaldo.');
      
      // Datos de respaldo si el backend no está listo
      const nombreLocal = await AsyncStorage.getItem('nombre') || 'Cliente Demo';
      setFormData({
        nombre_completo: nombreLocal,
        telefono: '3001234567',
        fecha_nacimiento: '1990-01-01',
        documento: '123456789',
        ciudad: 'Bogotá',
        direccion: 'Calle Principal #123',
        email: 'cliente@opticam.com',
      });
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
      
      // 🔥 LLAMADA REAL PARA ACTUALIZAR TU PERFIL
      await api.put('/usuarios/perfil', {
        nombre_completo: formData.nombre_completo,
        telefono: formData.telefono,
        fecha_nacimiento: formData.fecha_nacimiento,
        documento: formData.documento,
        ciudad: formData.ciudad,
        direccion: formData.direccion,
        email: formData.email,
      });

      Alert.alert('Éxito', 'Datos guardados correctamente');
      setEditando(false);
      cargarPerfil();

    } catch (err: any) {
      console.error('Error al guardar perfil:', err);
      Alert.alert('Error', 'Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  const subirFoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Se necesita permiso para acceder a la galería.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      setFotoUri(result.assets[0].uri);
      // Aquí deberías subir la foto a tu API también
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
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Text style={styles.title}>MI PERFIL</Text>

        <View style={styles.card}>
          {/* Foto de perfil */}
          <View style={styles.photoContainer}>
            <Image 
              source={fotoUri ? { uri: fotoUri } : require('../../../assets/user.jpg')} 
              style={styles.profileImage}
              defaultSource={require('../../../assets/user.jpg')}
            />
            <TouchableOpacity style={styles.cameraButton} onPress={subirFoto} disabled={loading}>
              <Ionicons name="camera" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          {/* Formulario */}
          <View style={styles.form}>
            
            {/* NOMBRE COMPLETO */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nombre Completo</Text>
              <TextInput 
                style={styles.inputDisabled}
                value={formData.nombre_completo} 
                editable={false}
              />
            </View>

            {/* TELÉFONO */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Teléfono</Text>
              <TextInput 
                style={[styles.input, !editando && styles.inputDisabled]}
                value={formData.telefono} 
                onChangeText={(text) => handleChange('telefono', text)}
                editable={editando && !loading}
                keyboardType="phone-pad"
              />
            </View>

            {/* FECHA DE NACIMIENTO */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Fecha de Nacimiento (YYYY-MM-DD)</Text>
              <TextInput 
                style={[styles.input, !editando && styles.inputDisabled]}
                value={formData.fecha_nacimiento} 
                onChangeText={(text) => handleChange('fecha_nacimiento', text)}
                editable={editando && !loading}
              />
            </View>

            {/* DOCUMENTO */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Documento</Text>
              <TextInput 
                style={[styles.input, !editando && styles.inputDisabled]}
                value={formData.documento} 
                onChangeText={(text) => handleChange('documento', text)}
                editable={editando && !loading}
                keyboardType="numeric"
              />
            </View>

            {/* CIUDAD */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ciudad</Text>
              <TextInput 
                style={[styles.input, !editando && styles.inputDisabled]}
                value={formData.ciudad} 
                onChangeText={(text) => handleChange('ciudad', text)}
                editable={editando && !loading}
              />
            </View>

            {/* DIRECCIÓN */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Dirección</Text>
              <TextInput 
                style={[styles.input, !editando && styles.inputDisabled]}
                value={formData.direccion} 
                onChangeText={(text) => handleChange('direccion', text)}
                editable={editando && !loading}
              />
            </View>

            {/* EMAIL */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Correo Electrónico</Text>
              <TextInput 
                style={[styles.input, !editando && styles.inputDisabled]}
                value={formData.email} 
                onChangeText={(text) => handleChange('email', text)}
                editable={editando && !loading}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            {/* BOTONES */}
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
                  {loading ? (
                    <ActivityIndicator size="small" color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>GUARDAR CAMBIOS</Text>
                  )}
                </TouchableOpacity>
              )}
            </View>

          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContent: {
    flexGrow: 1,
    paddingVertical: 40,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    marginBottom: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#fff',
    width: '100%',
    maxWidth: 500,
    padding: 20,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  photoContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: '#B90F0F',
  },
  cameraButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#B90F0F',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    marginTop: 10,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontWeight: 'bold',
    fontSize: 14,
    marginBottom: 4,
    color: '#000',
  },
  input: {
    backgroundColor: '#f9f9f9',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 16,
  },
  inputDisabled: {
    backgroundColor: '#eee',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    fontSize: 16,
    color: '#666',
  },
  buttonContainer: {
    marginTop: 20,
  },
  editButton: {
    backgroundColor: '#000',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
  },
  saveButton: {
    backgroundColor: '#B90F0F',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default PerfilCliente;