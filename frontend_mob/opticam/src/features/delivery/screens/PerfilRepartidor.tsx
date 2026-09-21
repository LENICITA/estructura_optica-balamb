// src/features/delivery/screens/PerfilRepartidor.tsx
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { UserController } from '../../../core/controllers/UserController';
import { COLORS } from '../../../shared/constants/colors';

interface Props {
  navigation: any;
}

export const PerfilRepartidor = ({ navigation }: Props) => {
  const [loading, setLoading] = useState(true);

  const userController = new UserController();

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

  const [vehiculo, setVehiculo] = useState({
    tipo: '',
    modelo: '',
    placa: '',
    color: '',
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

          //  EL VEHÍCULO
          const vehiculoData = user.vehiculo || {};
            setVehiculo({
                tipo: vehiculoData.tipo || '',
                modelo: vehiculoData.modelo || '',
                placa: vehiculoData.placa || '',
                color: vehiculoData.color || '',
            });
        } else {
          Alert.alert('Error', 'No fue posible cargar el perfil.');
        }


    } catch (error: any) {
      console.error('Error al cargar perfil del repartidor:', error);

      if (error.response?.status === 401) {
        Alert.alert(
          'Sesión expirada',
          'Tu sesión ha expirado. Inicia sesión nuevamente.',
          [
            {
              text: 'Aceptar',
              onPress: () => navigation.navigate('Iniciosesion'),
            },
          ]
        );
      } else {
        Alert.alert(
          'Error',
          error.response?.data?.message || 'No fue posible cargar tu perfil.'
        );
      }
    } finally {
      setLoading(false);
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

  const InfoField = ({
    icon,
    label,
    value,
  }: {
    icon: any;
    label: string;
    value: string;
  }) => {
    return (
      <View style={styles.field}>
        <Text style={styles.label}>{label}</Text>
        <View style={styles.inputContainer}>
          <Ionicons name={icon} size={18} color={COLORS.primary} />
          <Text style={styles.value}>{value || 'No registrado'}</Text>
        </View>
      </View>
    );
  };

  // ========== UI QUEDA EXACTAMENTE IGUAL ==========
  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* TÍTULO */}
      <View style={styles.headerPerfil}>
        <View style={styles.iconHeader}>
          <Ionicons name="person-circle-outline" size={42} color={COLORS.primary} />
        </View>

        <View style={styles.titleContainer}>
          <Text style={styles.title}>MI PERFIL</Text>
          <Text style={styles.subtitle}>Consulta tu información personal</Text>
        </View>
      </View>

      {/* INFORMACIÓN PERSONAL */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Información personal</Text>

        <InfoField icon="person-outline" label="Nombre completo" value={formData.nombre_completo} />
        <InfoField icon="mail-outline" label="Correo electrónico" value={formData.email} />
        <InfoField icon="call-outline" label="Teléfono" value={formData.telefono} />
        <InfoField icon="card-outline" label="Documento" value={formData.documento} />
        <InfoField icon="location-outline" label="Dirección" value={formData.direccion} />
        <InfoField icon="business-outline" label="Ciudad" value={formData.ciudad} />
        <InfoField icon="calendar-outline" label="Fecha de nacimiento" value={formData.fecha_nacimiento} />
      </View>

      {/* INFORMACIÓN DE CUENTA */}
      <View style={styles.card}>
        <Text style={styles.sectionTitle}>Información de cuenta</Text>

        <InfoField icon="shield-checkmark-outline" label="Estado" value={formData.estado} />
        <InfoField icon="people-outline" label="Rol" value={formData.roles} />
      </View>

      {/* VEHÍCULO */}
      <View style={styles.card}>
        <View style={styles.vehicleHeader}>
          <Ionicons
            name={vehiculo.tipo === 'MOTO' ? 'bicycle-outline' : 'car-outline'}
            size={25}
            color={COLORS.primary}
          />
          <Text style={styles.sectionTitle}>Mi vehículo</Text>
        </View>

        <InfoField
          icon={vehiculo.tipo === 'MOTO' ? 'bicycle-outline' : 'car-outline'}
          label="Tipo de vehículo"
          value={
            vehiculo.tipo === 'MOTO'
              ? 'Moto'
              : vehiculo.tipo === 'CARRO'
              ? 'Carro'
              : vehiculo.tipo
          }
        />

        <InfoField icon="construct-outline" label="Modelo" value={vehiculo.modelo} />
        <InfoField icon="document-text-outline" label="Placa" value={vehiculo.placa} />
        <InfoField icon="color-palette-outline" label="Color" value={vehiculo.color} />
      </View>

      {/* MENSAJE INFORMATIVO */}
      <View style={styles.infoContainer}>
        <Ionicons name="information-circle-outline" size={20} color={COLORS.primary} />
        <Text style={styles.infoText}>
          Esta información es administrada por el administrador del sistema. Si necesitas
          actualizar algún dato, comunícate con el administrador.
        </Text>
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
    marginBottom: 18,
  },
  iconHeader: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  titleContainer: {
    flex: 1,
  },
  title: {
    fontSize: 21,
    fontWeight: 'bold',
    color: COLORS.black,
  },
  subtitle: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 3,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: 'bold',
    color: COLORS.black,
    marginBottom: 12,
  },
  vehicleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  field: {
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
  value: {
    flex: 1,
    fontSize: 13,
    color: COLORS.text,
    marginLeft: 8,
    paddingVertical: 8,
  },
  infoContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#FFF4F4',
    borderWidth: 1,
    borderColor: '#F1CCCC',
    borderRadius: 10,
    padding: 12,
    marginBottom: 20,
  },
  infoText: {
    flex: 1,
    marginLeft: 8,
    fontSize: 11,
    lineHeight: 16,
    color: COLORS.gray,
  },
});