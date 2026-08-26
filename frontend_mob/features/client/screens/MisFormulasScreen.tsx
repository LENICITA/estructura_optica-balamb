// src/features/formulas/screens/MisFormulasScreen.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { FormulaController } from '../../../core/controllers/FormulaController';
import { RoundedButton } from '../../../shared/components/buttons/RoundedButton';
import { useAuth } from '../../auth/context/AuthContext';
import { FormulaModel, EstadoFormula } from '../../../core/models/FormulaModel';


const COLORS = {
  primary: '#B90F0F',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#666666',
  border: '#CBD5E1',
  background: '#F7F7F7',
  pendingBackground: '#FFF3CD',
  pendingText: '#856404',
  approvedBackground: '#D4EDDA',
  approvedText: '#155724',
  rejectedBackground: '#F8D7DA',
  rejectedText: '#721C24',
};

interface Props {
  navigation: any;
}

export const MisFormulasScreen = ({ navigation }: Props) => {
  const { user } = useAuth();
  const formulaController = new FormulaController();

  const [formulas, setFormulas] = useState<FormulaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    cargarFormulas();
  }, []);

  const cargarFormulas = async () => {
    if (!user?.id_usuario) {
      console.warn('No hay usuario autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('Cargando fórmulas para usuario:', user.id_usuario);
      const resultado = await formulaController.getFormulasByUsuario(user.id_usuario);
      console.log('Fórmulas cargadas:', resultado.length);
      setFormulas(resultado);
    } catch (error) {
      console.error('Error cargando fórmulas:', error);
      Alert.alert('Error', 'No fue posible cargar tus fórmulas.');
    } finally {
      setLoading(false);
    }
  };

  const actualizarFormulas = async () => {
    try {
      setActualizando(true);
      await cargarFormulas();
    } catch (error) {
      console.error('Error actualizando fórmulas:', error);
    } finally {
      setActualizando(false);
    }
  };

  const estadoFondo = (estado: EstadoFormula | string) => {
    switch (String(estado).toUpperCase()) {
      case 'APROBADO':
        return COLORS.approvedBackground;
      case 'RECHAZADO':
        return COLORS.rejectedBackground;
      default:
        return COLORS.pendingBackground;
    }
  };

  const obtenerEstadoTexto = (estado: EstadoFormula | string) => {
    switch (String(estado).toUpperCase()) {
      case 'APROBADO':
        return 'Aprobado';
      case 'RECHAZADO':
        return 'Rechazado';
      default:
        return 'Pendiente';
    }
  };

  const obtenerIconoEstado = (estado: EstadoFormula | string) => {
    switch (String(estado).toUpperCase()) {
      case 'APROBADO':
        return 'checkmark-circle';
      case 'RECHAZADO':
        return 'close-circle';
      default:
        return 'time-outline';
    }
  };

  const obtenerColorIcono = (estado: EstadoFormula | string) => {
    switch (String(estado).toUpperCase()) {
      case 'APROBADO':
        return '#28a745';
      case 'RECHAZADO':
        return '#dc3545';
      default:
        return '#ffc107';
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando tus fórmulas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <Text style={styles.title}>Mis Fórmulas</Text>
          <Text style={styles.subtitle}>
            Aquí puedes ver todas tus fórmulas ópticas
          </Text>

          <View style={styles.headerRow}>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={actualizarFormulas}
              disabled={actualizando}
            >
              {actualizando ? (
                <ActivityIndicator size="small" color={COLORS.primary} />
              ) : (
                <Ionicons name="refresh-outline" size={22} color={COLORS.primary} />
              )}
              <Text style={styles.refreshText}>Actualizar</Text>
            </TouchableOpacity>
          </View>


           {formulas.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="document-outline" size={70} color="#CCCCCC" />
              <Text style={styles.emptyText}>Aún no has subido fórmulas.</Text>
              <Text style={styles.emptySubtext}>
                Presiona el botón "Crear Fórmula" para agregar una.
              </Text>
            </View>
          ) : (
             formulas.map((item) => (
              <TouchableOpacity
                key={item.id_formula}
                style={styles.formulaCard}
                activeOpacity={0.7}
                onPress={() => {
                  console.log('📱 Abriendo detalle de fórmula:', item.id_formula);
                  navigation.navigate('DetalleFormulaCliente', {
                    formula_id: item.id_formula,
                  });
                }}
              >
                

                <View style={[styles.statusContainer, { backgroundColor: estadoFondo(item.estado) }]}>
                  <Ionicons 
                    name={obtenerIconoEstado(item.estado)} 
                    size={28} 
                    color={obtenerColorIcono(item.estado)} 
                  />
                  <Text style={[styles.statusText, { color: obtenerColorIcono(item.estado) }]}>
                    {obtenerEstadoTexto(item.estado)}
                  </Text>
                </View>


                <View style={styles.tapIndicator}>
                  <Ionicons name="chevron-forward-circle-outline" size={18} color="#CCCCCC" />
                  <Text style={styles.tapText}>Ver detalles</Text>
                </View>
              </TouchableOpacity>
            ))
          )}



          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              console.log(' Navegando a CrearFormula con usuario:', user?.id_usuario);
              navigation.navigate('CrearFormulaScreen', { 
                id_usuario: user?.id_usuario 
              });
            }}
          >
            <Ionicons name="add-circle-outline" size={24} color={COLORS.white} />
            <Text style={styles.createButtonText}>Crear Fórmula</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: COLORS.gray,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 15,
    color: COLORS.black,
  },
  subtitle: {
    textAlign: 'center',
    color: COLORS.gray,
    marginTop: 8,
    marginBottom: 20,
    fontSize: 14,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 15,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    paddingHorizontal: 15,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  refreshText: {
    color: COLORS.primary,
    fontWeight: '600',
  },
  empty: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#BBBBBB',
    textAlign: 'center',
  },
  formulaCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    marginBottom: 12,
    padding: 20,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: '60%',
    justifyContent: 'center',
  },
  statusText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  tapIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  tapText: {
    fontSize: 12,
    color: '#CCCCCC',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 10,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  createButtonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: 'bold',
  },
});