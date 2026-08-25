// src/features/formulas/screens/FormulaScreen.tsx

import React, { useEffect, useState } from 'react';

import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { FormulaController } from '../../../core/controllers/FormulaController';
import { FormulaModel, EstadoFormula } from '../../../core/models/FormulaModel';
import * as ImagePicker from 'expo-image-picker';
import { Header } from '../../../shared/components/navigation/Header';
import { Footer } from '../../../shared/components/navigation/Footer';
import { RoundedButton } from '../../../shared/components/buttons/RoundedButton';
import { useAuth } from '../../../features/auth/context/AuthContext';

// ============================================================
// COLORES
// ============================================================

const COLORS = {
  primary: '#B90F0F',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#666666',
  lightGray: '#F2F2F2',
  border: '#CBD5E1',
  background: '#F7F7F7',

  pendingBackground: '#FFF3CD',
  pendingText: '#856404',

  approvedBackground: '#D4EDDA',
  approvedText: '#155724',

  rejectedBackground: '#F8D7DA',
  rejectedText: '#721C24',
};

// ============================================================
// CONDICIONES
// ============================================================

const condiciones = [
  'ASTIGMATISMO',
  'MIOPIA',
  'DALTONISMO',
  'BAJA VISION',
];

// ============================================================
// PROPS
// ============================================================

interface Props {
  navigation?: any;
  route?: {
    params?: {
      id_usuario?: number;
    };
  };
}

// ============================================================
// COMPONENTE
// ============================================================

export default function FormulaScreen({
  navigation,
  route,
}: Props) {

  // ==========================================================
  // CONTROLLER
  // ==========================================================

  const formulaController = new FormulaController();

  // ==========================================================
  // AUTH CONTEXT - CORREGIDO
  // ==========================================================

  const auth = useAuth(); // ✅ Primero obtenemos el objeto auth
  const user = auth?.user; // ✅ Luego extraemos user

  // Log para depuración
  console.log('Auth object:', auth);
  console.log('User object:', user);
  console.log('User ID:', user?.id_usuario);

  // ==========================================================
  // ID DEL USUARIO
  // ==========================================================

  // ✅ Usamos user?.id_usuario con el operador optional chaining
  const idUsuario = route?.params?.id_usuario ?? user?.id_usuario;

  console.log('ID Usuario en FormulaScreen:', idUsuario);
  console.log('user?.id_usuario:', user?.id_usuario);
  console.log('route.params:', route?.params);

  // ==========================================================
  // DATOS DEL FORMULARIO
  // ==========================================================

  const hoy = new Date()
    .toISOString()
    .split('T')[0];

  const [fecha, setFecha] = useState(hoy);
  const [descripcion, setDescripcion] = useState('');
  const [condicion, setCondicion] = useState('');
  const [imagen, setImagen] = useState<string | null>(null);
  const [dropdown, setDropdown] = useState(false);

  // ==========================================================
  // DATOS DE LAS FÓRMULAS
  // ==========================================================

  const [formulas, setFormulas] = useState<FormulaModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [subiendo, setSubiendo] = useState(false);
  const [eliminando, setEliminando] = useState<number | null>(null);
  const [actualizando, setActualizando] = useState(false);

  // ==========================================================
  // MODAL DESCRIPCIÓN
  // ==========================================================

  const [mostrarDescripcion, setMostrarDescripcion] = useState(false);

  // ==========================================================
  // CARGAR FÓRMULAS AL ENTRAR
  // ==========================================================

  useEffect(() => {
    cargarFormulas();
  }, [idUsuario]);

  // ==========================================================
  // OBTENER FÓRMULAS DEL CLIENTE
  // ==========================================================

  const cargarFormulas = async () => {
    if (!idUsuario) {
      console.warn('No se recibió id_usuario.');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const resultado = await formulaController.getFormulasByUsuario(
        Number(idUsuario)
      );
      setFormulas(resultado);
    } catch (error) {
      console.error('Error cargando fórmulas:', error);
      Alert.alert('Error', 'No fue posible cargar tus fórmulas.');
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // ACTUALIZAR FÓRMULAS
  // ==========================================================

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

  // ==========================================================
  // SELECCIONAR IMAGEN
  // ==========================================================

  const seleccionarImagen = async () => {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          'Permiso requerido',
          'Debes permitir el acceso a la galería para seleccionar la fórmula.'
        );
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!resultado.canceled) {
        const uri = resultado.assets[0].uri;
        setImagen(uri);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No fue posible seleccionar la imagen.');
    }
  };

  // ==========================================================
  // SUBIR FÓRMULA
  // ==========================================================

  const subirFormula = async () => {
    // --------------------------------------------------------
    // VALIDAR USUARIO
    // --------------------------------------------------------

    if (!idUsuario) {
      Alert.alert('Error', 'No se pudo identificar al usuario.');
      return;
    }

    // --------------------------------------------------------
    // VALIDAR DESCRIPCIÓN
    // --------------------------------------------------------

    if (!descripcion.trim()) {
      Alert.alert('Campo requerido', 'Debes ingresar una descripción para la fórmula.');
      return;
    }

    // --------------------------------------------------------
    // VALIDAR CONDICIÓN
    // --------------------------------------------------------

    if (!condicion) {
      Alert.alert('Campo requerido', 'Debes seleccionar una condición.');
      return;
    }

    // --------------------------------------------------------
    // VALIDAR IMAGEN
    // --------------------------------------------------------

    if (!imagen) {
      Alert.alert('Campo requerido', 'Debes seleccionar la imagen de la fórmula.');
      return;
    }

    try {
      setSubiendo(true);

      // ------------------------------------------------------
      // ENVIAR AL CONTROLLER
      // ------------------------------------------------------

      const resultado = await formulaController.crearFormula({
        id_usuario: Number(idUsuario),
        condicion: condicion,
        imagen_formula: imagen,
        observaciones: descripcion.trim(),
        fecha_creacion: fecha,
      });

      // ------------------------------------------------------
      // ERROR
      // ------------------------------------------------------

      if (!resultado.success) {
        Alert.alert('Error', resultado.message);
        return;
      }

      // ------------------------------------------------------
      // LIMPIAR FORMULARIO
      // ------------------------------------------------------

      setDescripcion('');
      setCondicion('');
      setImagen(null);
      setFecha(new Date().toISOString().split('T')[0]);

      // ------------------------------------------------------
      // VOLVER A CONSULTAR BD
      // ------------------------------------------------------

      await cargarFormulas();

      Alert.alert(
        'Fórmula enviada',
        'La fórmula fue registrada correctamente y quedó pendiente de revisión.'
      );
    } catch (error: any) {
      console.error('Error subiendo fórmula:', error);
      Alert.alert(
        'Error',
        error?.response?.data?.message || 'No fue posible subir la fórmula.'
      );
    } finally {
      setSubiendo(false);
    }
  };

  // src/features/formulas/screens/FormulaScreen.tsx

// ==========================================================
// CONFIRMAR ELIMINACIÓN
// ==========================================================

const confirmarEliminarFormula = (formula: FormulaModel) => {
  // ✅ Log para verificar el ID
  console.log('🗑️ Confirmando eliminación de fórmula:', formula.id_formula);
  console.log('📋 Datos completos de la fórmula:', formula);

  Alert.alert(
    'Eliminar fórmula',
    '¿Estás seguro de que deseas eliminar esta fórmula? También será eliminada de la base de datos.',
    [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Eliminar',
        style: 'destructive',
        onPress: () => {
          // ✅ Verificar que el ID existe
          if (!formula.id_formula) {
            Alert.alert('Error', 'No se pudo identificar la fórmula a eliminar.');
            return;
          }
          eliminarFormula(formula.id_formula);
        },
      },
    ]
  );
};

// ==========================================================
// ELIMINAR FÓRMULA
// ==========================================================

const eliminarFormula = async (id_formula: number) => {
  try {
    console.log('🗑️ Iniciando eliminación de fórmula ID:', id_formula); // ✅ Log
    
    if (!id_formula) {
      Alert.alert('Error', 'ID de fórmula no válido.');
      return;
    }

    setEliminando(id_formula);

    const resultado = await formulaController.eliminarFormula(id_formula);

    console.log('📊 Resultado de eliminación:', resultado); // ✅ Log

    if (!resultado.success) {
      Alert.alert('Error', resultado.message);
      return;
    }

    // ✅ Recargar la lista de fórmulas
    await cargarFormulas();

    Alert.alert('Fórmula eliminada', 'La fórmula fue eliminada correctamente.');
  } catch (error: any) {
    console.error('Error eliminando fórmula:', error);
    Alert.alert(
      'Error',
      error?.response?.data?.message || 'No fue posible eliminar la fórmula.'
    );
  } finally {
    setEliminando(null);
  }
};
  // ==========================================================
  // COLOR ESTADO
  // ==========================================================

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

  // ==========================================================
  // FONDO ESTADO
  // ==========================================================

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

  // ==========================================================
  // TEXTO ESTADO
  // ==========================================================

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

  // ==========================================================
  // LOADING INICIAL
  // ==========================================================

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando tus fórmulas...</Text>
      </View>
    );
  }

  // ==========================================================
  // RENDER
  // ==========================================================

  return (
    <View style={styles.container}>
      <Header />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          {/* TÍTULO */}
          <Text style={styles.title}>Gestión de Fórmula</Text>
          <Text style={styles.subtitle}>Sube tu fórmula óptica fácilmente</Text>

          {/* FORMULARIO */}
          <View style={styles.card}>
            {/* FECHA */}
            <Text style={styles.label}>Fecha de creación</Text>
            <View style={styles.fakeInput}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.gray} />
              <Text style={styles.fakeText}>{fecha}</Text>
            </View>

            {/* DESCRIPCIÓN */}
            <Text style={styles.label}>Descripción</Text>
            <TouchableOpacity
              style={styles.fakeInput}
              onPress={() => setMostrarDescripcion(true)}
            >
              <Ionicons name="document-text-outline" size={18} color={COLORS.gray} />
              <Text
                style={[styles.fakeText, !descripcion && styles.placeholderText]}
                numberOfLines={1}
              >
                {descripcion || 'Ej: Fórmula reciente'}
              </Text>
            </TouchableOpacity>

            {/* CONDICIÓN */}
            <Text style={styles.label}>¿Cuál es tu condición?</Text>
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownHeader}
                onPress={() => setDropdown(!dropdown)}
              >
                <Text style={[styles.dropdownText, !condicion && styles.placeholderText]}>
                  {condicion || 'Seleccionar condición'}
                </Text>
                <Ionicons
                  name={dropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.black}
                />
              </TouchableOpacity>

              {dropdown && (
                <View>
                  {condiciones.map((item) => (
                    <TouchableOpacity
                      key={item}
                      style={styles.option}
                      onPress={() => {
                        setCondicion(item);
                        setDropdown(false);
                      }}
                    >
                      <Text style={styles.optionText}>{item}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* IMAGEN */}
            <Text style={styles.label}>Imagen de la fórmula</Text>

            <TouchableOpacity style={styles.imageButton} onPress={seleccionarImagen}>
              <Ionicons name="cloud-upload-outline" size={28} color={COLORS.primary} />
              <Text style={styles.imageButtonText}>Seleccionar imagen</Text>
            </TouchableOpacity>

            {/* PREVISUALIZACIÓN */}
            {imagen && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imagen }} style={styles.preview} resizeMode="cover" />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => setImagen(null)}>
                  <Ionicons name="close-circle" size={28} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}

            {/* BOTÓN */}
            <View style={styles.uploadButtonContainer}>
              {subiendo ? (
                <View style={styles.loadingButton}>
                  <ActivityIndicator color={COLORS.white} />
                  <Text style={styles.loadingButtonText}>Enviando...</Text>
                </View>
              ) : (
                <RoundedButton text="SUBIR FÓRMULA" onPress={subirFormula} />
              )}
            </View>
          </View>

          {/* MIS FÓRMULAS */}
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mis Fórmulas</Text>
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
            </TouchableOpacity>
          </View>

          {/* SIN FÓRMULAS */}
          {formulas.length === 0 ? (
            <View style={styles.empty}>
              <Ionicons name="document-outline" size={70} color="#CCCCCC" />
              <Text style={styles.emptyText}>Aún no has subido fórmulas.</Text>
            </View>
          ) : (
            formulas.map((item) => (
              <View key={item.id_formula} style={styles.formulaCard}>
                {/* IMAGEN */}
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

                {/* INFORMACIÓN */}
                <View style={styles.cardBody}>
                  {/* FECHA */}
                  <View style={styles.row}>
                    <Ionicons name="calendar-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.small}>{item.fecha_creacion}</Text>
                  </View>

                  {/* DESCRIPCIÓN */}
                  <Text style={styles.cardTitle}>
                    {item.observaciones || 'Fórmula óptica'}
                  </Text>

                  {/* CONDICIÓN */}
                  <View style={styles.row}>
                    <Ionicons name="eye-outline" size={16} color={COLORS.primary} />
                    <Text style={styles.small}>{item.condicion}</Text>
                  </View>

                  {/* ESTADO */}
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

                  {/* COSTO */}
                  <Text style={styles.price}>
                    {String(item.estado).toUpperCase() === 'APROBADO'
                      ? item.costoFormateado
                      : 'En revisión'}
                  </Text>

                  {/* PENDIENTE */}
                  {String(item.estado).toUpperCase() === 'PENDIENTE' && (
                    <Text style={styles.statusMessage}>
                      Tu fórmula está siendo revisada por el administrador.
                    </Text>
                  )}

                  {/* APROBADO */}
                  {String(item.estado).toUpperCase() === 'APROBADO' && (
                    <Text style={styles.statusMessage}>Tu fórmula fue aprobada.</Text>
                  )}

                  {/* RECHAZADO */}
                  {String(item.estado).toUpperCase() === 'RECHAZADO' && (
                    <Text style={styles.rejectedMessage}>
                      Tu fórmula fue rechazada. Revisa las observaciones.
                    </Text>
                  )}

                  {/* ELIMINAR */}
                  <TouchableOpacity
                    style={styles.delete}
                    onPress={() => confirmarEliminarFormula(item)}
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
        </View>

        <Footer />
      </ScrollView>

      {/* MODAL DESCRIPCIÓN */}
      <Modal
        visible={mostrarDescripcion}
        transparent
        animationType="fade"
        onRequestClose={() => setMostrarDescripcion(false)}
      >
        <View style={styles.descriptionOverlay}>
          <View style={styles.descriptionModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Descripción</Text>
              <TouchableOpacity onPress={() => setMostrarDescripcion(false)}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.descriptionInput}
              placeholder="Ej: Fórmula reciente"
              placeholderTextColor="#999"
              value={descripcion}
              onChangeText={setDescripcion}
              multiline
              maxLength={500}
              textAlignVertical="top"
              autoFocus
            />

            <TouchableOpacity
              style={styles.saveDescriptionButton}
              onPress={() => setMostrarDescripcion(false)}
            >
              <Text style={styles.saveDescriptionText}>Guardar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

// ============================================================
// ESTILOS
// ============================================================

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

  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 22,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },

  label: {
    marginTop: 15,
    marginBottom: 8,
    fontWeight: '600',
    color: COLORS.black,
  },

  fakeInput: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: COLORS.white,
  },

  fakeText: {
    color: '#444',
    flex: 1,
  },

  placeholderText: {
    color: '#999',
  },

  dropdown: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },

  dropdownHeader: {
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  dropdownText: {
    color: COLORS.black,
  },

  option: {
    padding: 14,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },

  optionText: {
    color: COLORS.black,
  },

  imageButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 25,
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },

  imageButtonText: {
    marginTop: 8,
    color: COLORS.gray,
  },

  previewContainer: {
    position: 'relative',
    marginVertical: 15,
  },

  preview: {
    width: '100%',
    height: 200,
    borderRadius: 10,
  },

  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.white,
    borderRadius: 20,
  },

  uploadButtonContainer: {
    marginTop: 5,
  },

  loadingButton: {
    height: 48,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },

  loadingButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
  },

  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 25,
    position: 'relative',
  },

  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    color: COLORS.black,
  },

  refreshButton: {
    position: 'absolute',
    right: 0,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
    elevation: 2,
  },

  empty: {
    alignItems: 'center',
    paddingVertical: 40,
  },

  emptyText: {
    marginTop: 12,
    color: '#999',
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

  descriptionOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },

  descriptionModal: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 20,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.black,
  },

  descriptionInput: {
    minHeight: 130,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 10,
    padding: 14,
    fontSize: 15,
    color: COLORS.black,
    backgroundColor: COLORS.white,
  },

  saveDescriptionButton: {
    marginTop: 15,
    height: 45,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },

  saveDescriptionText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 15,
  },
});