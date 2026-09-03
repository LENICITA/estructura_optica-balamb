// src/features/client/screens/PerfilCliente.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useAuth } from '../../auth/context/AuthContext';
import { UserController } from '../../../core/controllers/UserController';
import { COLORS } from '../../../shared/constants/colors';

interface Props {
  navigation: any;
}

export const PerfilCliente = ({ navigation }: Props) => {
  const { updateUser } = useAuth();
  const userController = new UserController();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [editando, setEditando] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const [formData, setFormData] = useState({
    nombre_completo: '',
    email: '',
    telefono: '',
    direccion: '',
    ciudad: '',
    documento: '',
    fecha_nacimiento: '',
    estado: '',
    roles: '',
  });

  // ===== CARGAR PERFIL =====
  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const user = await userController.getProfile();

      if (user) {
        setFormData({
          nombre_completo: user.nombre_completo || '',
          email: user.email || '',
          telefono: user.telefono || '',
          direccion: user.direccion || '',
          ciudad: user.ciudad || '',
          documento: user.documento ? String(user.documento) : '',
          fecha_nacimiento: user.fecha_nacimiento || '',
          estado: user.estado || '',
          roles: user.getRoles().join(', ') || '',
        });
      } else {
        Alert.alert('Error', 'No fue posible cargar el perfil.');
      }
    } catch (error: any) {
      console.error('Error al cargar perfil:', error);
      Alert.alert('Error', 'No fue posible cargar tu perfil.');
    } finally {
      setLoading(false);
    }
  };

  // ===== CAMBIAR VALOR =====
  const handleChange = (campo: keyof typeof formData, valor: string) => {
    setFormData((prev) => ({
      ...prev,
      [campo]: valor,
    }));
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

  // ===== EDITAR =====
  const activarEdicion = () => {
    setEditando(true);
  };

  // ===== CANCELAR =====
  const cancelarEdicion = () => {
    setEditando(false);
    cargarPerfil();
  };

  // ===== GUARDAR =====
  const guardarCambios = async () => {
    if (!formData.nombre_completo.trim()) {
      Alert.alert('Campo requerido', 'El nombre es obligatorio.');
      return;
    }

    if (!formData.email.trim()) {
      Alert.alert('Campo requerido', 'El correo electrónico es obligatorio.');
      return;
    }

      if (formData.documento && isNaN(Number(formData.documento))) {
        Alert.alert('Campo inválido', 'El documento debe ser un número válido.');
        return;
      }

      if (formData.fecha_nacimiento) {
        const fecha = new Date(formData.fecha_nacimiento);
        if (isNaN(fecha.getTime())) {
          Alert.alert('Campo inválido', 'La fecha de nacimiento no es válida.');
          return;
        }
      }

    try {
      setGuardando(true);

      const result = await userController.updateProfile({
        nombre_completo: formData.nombre_completo.trim(),
        email: formData.email.trim(),
        telefono: formData.telefono.trim(),
        direccion: formData.direccion.trim(),
        ciudad: formData.ciudad.trim(),
        fecha_nacimiento: formData.fecha_nacimiento.trim(),
        documento: formData.documento ? Number(formData.documento) : undefined,
      });

      if (result.success) {
        await updateUser();
        setEditando(false);
        Alert.alert('Perfil actualizado', result.message);
        await cargarPerfil();
      } else {
        Alert.alert('Error', result.message);
      }
    } catch (error: any) {
      console.error('Error al actualizar perfil:', error);
      Alert.alert('Error', 'No fue posible actualizar el perfil.');
    } finally {
      setGuardando(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando perfil...</Text>
      </View>
    );
  }

  // ========== INTERFAZ ==========
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >

      {/* TÍTULO */}
      <View style={styles.headerPerfil}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <Ionicons name="arrow-back" size={24} color={COLORS.black} />
        </TouchableOpacity>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>GESTIÓN DE PERFIL</Text>
          <Text style={styles.subtitle}>
            Consulta y actualiza tu información personal
          </Text>
        </View>
      </View>

      {/* INFORMACIÓN PERSONAL */}
      <View style={styles.card}>

        {/* NOMBRE */}
        <View style={styles.field}>
          <Text style={styles.label}>Nombre</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="person-outline" size={18} color={COLORS.primary} />
            <TextInput
              value={formData.nombre_completo}
              onChangeText={(text) => handleChange('nombre_completo', text)}
              editable={editando}
              style={styles.input}
            />
          </View>
        </View>

        {/* CORREO */}
        <View style={styles.field}>
          <Text style={styles.label}>Correo electrónico</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="mail-outline" size={18} color={COLORS.primary} />
            <TextInput
              value={formData.email}
              onChangeText={(text) => handleChange('email', text)}
              editable={editando}
              keyboardType="email-address"
              autoCapitalize="none"
              style={styles.input}
            />
          </View>
        </View>

        {/* TELÉFONO */}
        <View style={styles.fieldHalf}>
          <Text style={styles.label}>Teléfono</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="call-outline" size={18} color={COLORS.primary} />
            <TextInput
              value={formData.telefono}
              onChangeText={(text) => handleChange('telefono', text)}
              editable={editando}
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>
        </View>

        {/* DOCUMENTO */}
        <View style={styles.fieldHalf}>
          <Text style={styles.label}>Documento</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="card-outline" size={18} color={COLORS.primary} />
            <TextInput
              value={formData.documento}
              onChangeText={(text) => handleChange('documento', text)}
              editable={editando}
              keyboardType="numeric"
              style={styles.input}
            />
          </View>
        </View>

        {/* DIRECCIÓN */}
        <View style={styles.fieldHalf}>
          <Text style={styles.label}>Dirección</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="location-outline" size={18} color={COLORS.primary} />
            <TextInput
              value={formData.direccion}
              onChangeText={(text) => handleChange('direccion', text)}
              editable={editando}
              style={styles.input}
            />
          </View>
        </View>

        {/* CIUDAD */}
        <View style={styles.fieldHalf}>
          <Text style={styles.label}>Ciudad</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="business-outline" size={18} color={COLORS.primary} />
            <TextInput
              value={formData.ciudad}
              onChangeText={(text) => handleChange('ciudad', text)}
              editable={editando}
              style={styles.input}
            />
          </View>
        </View>

        {/* FECHA NACIMIENTO */}
        <View style={styles.fieldHalf}>
          <Text style={styles.label}>Fecha de nacimiento</Text>
          <TouchableOpacity
              style={styles.inputContainer}
              onPress={() => editando && setShowDatePicker(true)}
              activeOpacity={editando ? 0.7 : 1}
              disabled={!editando}
            >
              <Ionicons name="calendar-outline" size={18} color={COLORS.primary} />
              <Text
                style={[
                  styles.input,
                  !formData.fecha_nacimiento && styles.placeholderText,
                ]}
              >
                {formData.fecha_nacimiento || 'Selecciona una fecha'}
              </Text>
              <Ionicons
                name="chevron-down-outline"
                size={18}
                color={editando ? COLORS.primary : COLORS.gray}
              />
            </TouchableOpacity>
            {editando && (
              <Text style={styles.helperText}>
                Toca para seleccionar fecha con el calendario
              </Text>
            )}
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={
                formData.fecha_nacimiento
                  ? new Date(`${formData.fecha_nacimiento}T00:00:00`)
                  : new Date(2000, 0, 1)
              }
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              maximumDate={new Date()}
              onChange={handleDateChange}
            />
          )}

        {/* ESTADO */}
        <View style={styles.fieldHalf}>
          <Text style={styles.label}>Estado</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.primary} />
            <TextInput
              value={formData.estado}
              editable={false}
              style={styles.input}
            />
          </View>
        </View>

        {/* ROLES */}
        <View style={styles.field}>
          <Text style={styles.label}>Roles</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="people-outline" size={18} color={COLORS.primary} />
            <TextInput
              value={formData.roles}
              editable={false}
              style={styles.input}
            />
          </View>
        </View>

        {/* CONTRASEÑA */}
        <View style={styles.field}>
          <Text style={styles.label}>Contraseña</Text>
          <View style={styles.inputContainer}>
            <Ionicons name="lock-closed-outline" size={18} color={COLORS.primary} />
            <TextInput
              value="••••••••"
              secureTextEntry
              editable={false}
              style={styles.input}
            />
            <Ionicons name="eye-off-outline" size={18} color={COLORS.gray} />
          </View>
          <Text style={styles.securityText}>
            La contraseña no se muestra por seguridad
          </Text>
        </View>

        {/* BOTONES */}
        {!editando ? (
          <>
            <TouchableOpacity
              style={styles.btnEditar}
              onPress={activarEdicion}
            >
              <Ionicons name="create-outline" size={18} color={COLORS.white} />
              <Text style={styles.btnEditarText}>Editar perfil</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnFormula}
              onPress={() => navigation.navigate('MisFormulasScreen')}
            >
              <Ionicons name="document-text-outline" size={18} color={COLORS.primary} />
              <Text style={styles.btnFormulaText}>Mis fórmulas</Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.buttonsRow}>
            <TouchableOpacity
              style={styles.btnCancelar}
              onPress={cancelarEdicion}
              disabled={guardando}
            >
              <Text style={styles.btnCancelarText}>Cancelar</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.btnGuardar}
              onPress={guardarCambios}
              disabled={guardando}
            >
              {guardando ? (
                <ActivityIndicator size="small" color={COLORS.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-outline" size={18} color={COLORS.white} />
                  <Text style={styles.btnGuardarText}>Guardar</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        )}

      </View>
    </ScrollView>
  );
};

// ========== TODOS LOS ESTILOS QUEDAN IGUAL ==========
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 120,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: COLORS.gray,
  },
  headerPerfil: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  backButton: {
    marginRight: 10,
    padding: 5,
  },
  titleContainer: {
    flex: 1,
    alignItems: 'center',
    marginRight: 35,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 3,
    textAlign: 'center',
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  field: {
    marginBottom: 12,
  },
  fieldHalf: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.black,
    marginBottom: 5,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F3',
    borderRadius: 8,
    paddingHorizontal: 10,
    minHeight: 42,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    marginLeft: 8,
    paddingVertical: 8,
  },
  securityText: {
    fontSize: 9,
    color: COLORS.gray,
    marginTop: 4,
  },
  btnEditar: {
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 5,
  },
  btnEditarText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  btnFormula: {
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 8,
    minHeight: 44,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 8,
  },
  btnFormulaText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 5,
  },
  btnCancelar: {
    flex: 1,
    borderWidth: 1,
    borderColor: COLORS.gray,
    borderRadius: 8,
    minHeight: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnCancelarText: {
    color: COLORS.text,
    fontWeight: '600',
  },
  btnGuardar: {
    flex: 1,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
    minHeight: 44,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 8,
  },
  btnGuardarText: {
    color: COLORS.white,
    fontWeight: '600',
  },

  placeholderText: {
    color: '#999',
  },

  helperText: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 2,
    marginLeft: 4,
  },
});