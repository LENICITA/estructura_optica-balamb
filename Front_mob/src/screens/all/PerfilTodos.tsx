// PerfilTodos.tsx
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../contexts/AuthContext';
import { apiClient } from '../../services/apiClient';
import { getToken, getUser, saveUser } from '../../utils/storage';
import { COLORS } from '../../constants/colors';

interface Props {
  navigation: any;
}

export const PerfilTodos = ({ navigation }: Props) => {
  const { user, loadUser } = useAuth();
  const [editando, setEditando] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    correo: '',
    telefono: ''
  });

  // ===== DETERMINAR SI PUEDE EDITAR =====
  const puedeEditar = () => {
    if (!user) return false;
    const roles = user.roles || [];
    return roles.some(r => r.toUpperCase() === 'CLIENTE' || r.toUpperCase() === 'ADMIN');
  };

  const esRepartidor = () => {
    if (!user) return false;
    const roles = user.roles || [];
    return roles.some(r => r.toUpperCase() === 'REPARTIDOR');
  };

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError(null);

      const token = await getToken();

      if (!token) {
        const storedUser = await getUser();
        if (storedUser) {
          setFormData({
            nombre: storedUser.nombre_completo || 'Cliente',
            direccion: storedUser.direccion || '',
            correo: storedUser.email || '',
            telefono: storedUser.telefono || ''
          });
        }
        setLoading(false);
        return;
      }

      try {
        const response = await apiClient.get('/usuarios/perfil');
        const userData = response.data.data || response.data;

        setFormData({
          nombre: userData.nombre_completo || 'Cliente',
          direccion: userData.direccion || '',
          correo: userData.email || '',
          telefono: userData.telefono || ''
        });

        await saveUser(userData);

      } catch (apiError: any) {
        console.error('Error en API:', apiError);

        if (apiError.response?.status === 401) {
          Alert.alert(
            'Sesión expirada',
            'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
            [{ text: 'Ir al Login', onPress: () => navigation.navigate('Iniciosesion') }]
          );
          setLoading(false);
          return;
        }

        if (user) {
          setFormData({
            nombre: user.nombre_completo || 'Cliente',
            direccion: user.direccion || '',
            correo: user.email || '',
            telefono: user.telefono || ''
          });
        }
      }

    } catch (err: any) {
      console.error('Error al cargar perfil:', err);
      setError('No se pudo cargar el perfil.');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
  };

  const activarEdicion = () => {
    if (!puedeEditar()) {
      Alert.alert('Acceso denegado', 'Los repartidores no pueden editar su perfil. Contacta al administrador.');
      return;
    }
    setEditando(true);
  };

  const guardar = async () => {
    if (!puedeEditar()) {
      Alert.alert('Acceso denegado', 'No tienes permisos para editar este perfil.');
      return;
    }

    try {
      setLoading(true);

      const token = await getToken();
      if (!token) {
        Alert.alert(
          'No autenticado',
          'Debes iniciar sesión para guardar cambios.',
          [{ text: 'Ir al Login', onPress: () => navigation.navigate('Iniciosesion') }]
        );
        setLoading(false);
        return;
      }

      await apiClient.put('/usuarios/perfil', {
        direccion: formData.direccion,
        email: formData.correo,
        telefono: formData.telefono
      });

      await loadUser();
      Alert.alert('Éxito', 'Datos guardados correctamente');
      setEditando(false);
      cargarPerfil();

    } catch (err: any) {
      console.error('Error al guardar perfil:', err);

      if (err.response?.status === 401) {
        Alert.alert(
          'Sesión expirada',
          'Tu sesión ha expirado. Por favor inicia sesión nuevamente.',
          [{ text: 'Ir al Login', onPress: () => navigation.navigate('Iniciosesion') }]
        );
      } else {
        Alert.alert('Error', err.response?.data?.message || 'No se pudieron guardar los cambios.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading && !editando) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
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

      {esRepartidor() && (
        <View style={styles.infoContainer}>
          <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
          <Text style={styles.infoText}>
            Los repartidores no pueden editar su perfil. Contacta al administrador.
          </Text>
        </View>
      )}

      <View style={styles.card}>
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
              puedeEditar() ? (
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={activarEdicion}
                  disabled={loading}
                >
                  <Text style={styles.buttonText}>EDITAR PERFIL</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.noEditContainer}>
                  <Text style={styles.noEditText}>No puedes editar tu perfil</Text>
                </View>
              )
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
            onPress={() => navigation.navigate('Formula')}
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
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  infoText: {
    flex: 1,
    color: '#0d47a1',
    fontSize: 13,
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
    backgroundColor: COLORS.primary,
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
  noEditContainer: {
    backgroundColor: '#f5f5f5',
    paddingVertical: 12,
    borderRadius: 25,
    alignItems: 'center',
  },
  noEditText: {
    color: '#999',
    fontWeight: '500',
    fontSize: 14,
  },
});