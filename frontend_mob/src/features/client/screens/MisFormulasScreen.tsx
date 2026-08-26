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
import { useAuth } from '../../auth/context/AuthContext';
import { FormulaController } from '../../../core/controllers/FormulaController';
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
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [actualizando, setActualizando] = useState(false);

  useEffect(() => {
    cargarFormulas();
  }, []);

  const cargarFormulas = async () => {
    if (!user?.id_usuario) {
      console.warn('⚠️ No hay usuario autenticado');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      console.log('📋 Cargando fórmulas para usuario:', user.id_usuario);
      const resultado = await formulaController.getFormulasByUsuario(user.id_usuario);
      console.log('📋 Fórmulas cargadas:', resultado.length);
      setFormulas(resultado);
    } catch (error) {
      console.error('❌ Error cargando fórmulas:', error);
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

  const confirmarEliminarFormula = (formula: FormulaModel) => {
    console.log('🔍 Fórmula a eliminar:', formula);
    console.log('🔍 ID de fórmula:', formula?.id_formula);

    const idFormula = formula?.id_formula;
    
    if (!idFormula) {
      console.error('❌ No se pudo extraer el ID:', formula);
      Alert.alert('Error', 'No se pudo identificar la fórmula a eliminar.');
      return;
    }

    Alert.alert(
      'Eliminar fórmula',
      '¿Estás seguro de que deseas eliminar esta fórmula?\n\nSolo puedes eliminar fórmulas en estado Pendiente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => eliminarFormula(Number(idFormula)),
        },
      ]
    );
  };

  const eliminarFormula = async (id_formula: number) => {
    console.log('🗑️ Eliminando fórmula ID:', id_formula);
    
    if (!id_formula || isNaN(id_formula) || id_formula <= 0) {
      Alert.alert('Error', 'ID de fórmula no válido.');
      return;
    }

    try {
      setEliminando(id_formula);
      const resultado = await formulaController.eliminarFormula(id_formula);
      
      console.log('📊 Resultado eliminación:', resultado);

      if (!resultado.success) {
        Alert.alert('Error', resultado.message);
        return;
      }

      await cargarFormulas();
      Alert.alert('Éxito', resultado.message || 'La fórmula fue eliminada correctamente.');
    } catch (error: any) {
      console.error('❌ Error eliminando fórmula:', error);
      Alert.alert('Error', error?.message || 'No fue posible eliminar la fórmula.');
    } finally {
      setEliminando(null);
    }
  };

  const estadoColor = (estado: EstadoFormula | string) => {
    switch (String(estado).toUpperCase()) {
      case 'APROBADO':
        return COLORS.approvedText;
      case 'RECHAZADO':
        return COLORS.rejectedText;
      default:
        return COLORS.pendingText;
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
              <View key={item.id_formula} style={styles.formulaCard}>
                {item.imagen_formula ? (
                  <Image
                    source={{ uri: item.imagen_formula }}
                    style={styles.cardImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.noCardImage}>
                    <Ionicons name="document-outline" size={50} color="#CCCCCC" />
                  </View>
                )}

                <View style={styles.cardBody}>
                  <View style={styles.row}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.small}>{item.fecha_creacion}</Text>
                  </View>

                  <Text style={styles.cardTitle}>
                    {item.observaciones || 'Fórmula óptica'}
                  </Text>

                  <View style={styles.row}>
                    <Ionicons name="eye-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.small}>{item.condicion}</Text>
                  </View>

                  <View
                    style={[
                      styles.badge,
                      { backgroundColor: estadoFondo(item.estado) },
                    ]}
                  >
                    <Text style={[styles.badgeText, { color: estadoColor(item.estado) }]}>
                      {obtenerEstadoTexto(item.estado)}
                    </Text>
                  </View>

                  <Text style={styles.price}>
                    {String(item.estado).toUpperCase() === 'APROBADO'
                      ? item.costoFormateado
                      : 'En revisión'}
                  </Text>

                  {String(item.estado).toUpperCase() === 'PENDIENTE' && (
                    <Text style={styles.statusMessage}>
                      Tu fórmula está siendo revisada por el administrador.
                    </Text>
                  )}

                  {String(item.estado).toUpperCase() === 'APROBADO' && (
                    <Text style={styles.statusMessage}>Tu fórmula fue aprobada.</Text>
                  )}

                  {String(item.estado).toUpperCase() === 'RECHAZADO' && (
                    <Text style={styles.rejectedMessage}>
                      Tu fórmula fue rechazada. Revisa las observaciones.
                    </Text>
                  )}

                  <TouchableOpacity
                    style={styles.delete}
                    onPress={() => {
                      console.log('🖱️ Click eliminar - ID:', item.id_formula);
                      confirmarEliminarFormula(item);
                    }}
                    disabled={eliminando === item.id_formula}
                  >
                    {eliminando === item.id_formula ? (
                      <ActivityIndicator size="small" color="#666" />
                    ) : (
                      <Ionicons name="trash-outline" size={18} color="#666" />
                    )}
                    <Text style={styles.deleteText}>
                      {eliminando === item.id_formula ? 'Eliminando...' : 'Eliminar'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}

          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              console.log('➕ Navegando a CrearFormula con usuario:', user?.id_usuario);
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
    padding: 20,
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
    fontSize: 32,
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
    fontSize: 16,
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
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  noCardImage: {
    width: '100%',
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F5F5',
  },
  cardBody: {
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  small: {
    color: COLORS.gray,
    fontSize: 14,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.black,
  },
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginVertical: 8,
  },
  badgeText: {
    fontWeight: '600',
  },
  price: {
    color: COLORS.primary,
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 8,
  },
  statusMessage: {
    color: COLORS.gray,
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  rejectedMessage: {
    color: COLORS.rejectedText,
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  delete: {
    marginTop: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    padding: 12,
    backgroundColor: '#F2F2F2',
    borderRadius: 10,
  },
  deleteText: {
    color: '#666',
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
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
    fontSize: 18,
    fontWeight: 'bold',
  },
});