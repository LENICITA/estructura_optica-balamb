// src/features/formulas/screens/CrearFormulaScreen.tsx

import React, { useState } from 'react';
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
import * as ImagePicker from 'expo-image-picker';
import { FormulaController } from '../../../core/controllers/FormulaController';
import { RoundedButton } from '../../../shared/components/buttons/RoundedButton';
import { useAuth } from '../../auth/context/AuthContext'; // ✅ Importar useAuth

const COLORS = {
  primary: '#B90F0F',
  black: '#000000',
  white: '#FFFFFF',
  gray: '#666666',
  border: '#CBD5E1',
  background: '#F7F7F7',
};

const condiciones = ['ASTIGMATISMO', 'MIOPIA', 'DALTONISMO', 'BAJA VISION'];

interface Props {
  navigation: any;
  route?: {
    params?: {
      id_usuario?: number;
    };
  };
}

export const CrearFormulaScreen = ({ navigation, route }: Props) => {
  const formulaController = new FormulaController();
  const { user } = useAuth(); // ✅ Obtener usuario del contexto

  // ✅ Obtener ID de los parámetros o del contexto
  const idUsuario = route?.params?.id_usuario ?? user?.id_usuario;

  console.log('📝 CrearFormulaScreen - ID Usuario:', idUsuario);
  console.log('📝 CrearFormulaScreen - Route params:', route?.params);
  console.log('📝 CrearFormulaScreen - User ID:', user?.id_usuario);

  const hoy = new Date().toISOString().split('T')[0];

  const [fecha, setFecha] = useState(hoy);
  const [descripcion, setDescripcion] = useState('');
  const [condicion, setCondicion] = useState('');
  const [imagen, setImagen] = useState<string | null>(null);
  const [dropdown, setDropdown] = useState(false);
  const [subiendo, setSubiendo] = useState(false);
  const [mostrarDescripcion, setMostrarDescripcion] = useState(false);

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
        setImagen(resultado.assets[0].uri);
      }
    } catch (error) {
      console.error('Error seleccionando imagen:', error);
      Alert.alert('Error', 'No fue posible seleccionar la imagen.');
    }
  };

  const subirFormula = async () => {
    // ✅ Validar usuario
    if (!idUsuario) {
      Alert.alert('Error', 'No se pudo identificar al usuario.');
      return;
    }

    if (!descripcion.trim()) {
      Alert.alert('Campo requerido', 'Debes ingresar una descripción para la fórmula.');
      return;
    }

    if (!condicion) {
      Alert.alert('Campo requerido', 'Debes seleccionar una condición.');
      return;
    }

    if (!imagen) {
      Alert.alert('Campo requerido', 'Debes seleccionar la imagen de la fórmula.');
      return;
    }

    try {
      setSubiendo(true);

      console.log('📤 Enviando fórmula con usuario ID:', idUsuario);

      const resultado = await formulaController.crearFormula({
        id_usuario: Number(idUsuario),
        condicion: condicion,
        imagen_formula: imagen,
        observaciones: descripcion.trim(),
        fecha_creacion: fecha,
      });

      console.log('📊 Resultado creación:', resultado);

      if (!resultado.success) {
        Alert.alert('Error', resultado.message);
        return;
      }

      Alert.alert(
        '¡Fórmula creada!',
        'La fórmula fue registrada correctamente y está en revisión.',
        [
          {
            text: 'Ver mis fórmulas',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('❌ Error subiendo fórmula:', error);
      Alert.alert('Error', error?.message || 'No fue posible subir la fórmula.');
    } finally {
      setSubiendo(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.content}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color={COLORS.primary} />
            <Text style={styles.backText}>Volver</Text>
          </TouchableOpacity>

          <Text style={styles.title}>Crear Fórmula</Text>
          <Text style={styles.subtitle}>Sube tu fórmula óptica fácilmente</Text>

          <View style={styles.card}>
            <Text style={styles.label}>Fecha de creación</Text>
            <View style={styles.fakeInput}>
              <Ionicons name="calendar-outline" size={18} color={COLORS.gray} />
              <Text style={styles.fakeText}>{fecha}</Text>
            </View>

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

            <Text style={styles.label}>Imagen de la fórmula</Text>

            <TouchableOpacity style={styles.imageButton} onPress={seleccionarImagen}>
              <Ionicons name="cloud-upload-outline" size={28} color={COLORS.primary} />
              <Text style={styles.imageButtonText}>Seleccionar imagen</Text>
            </TouchableOpacity>

            {imagen && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imagen }} style={styles.preview} resizeMode="cover" />
                <TouchableOpacity style={styles.removeImageButton} onPress={() => setImagen(null)}>
                  <Ionicons name="close-circle" size={28} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}

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
        </View>
      </ScrollView>

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
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 15,
    paddingVertical: 8,
  },
  backText: {
    fontSize: 16,
    color: COLORS.primary,
    fontWeight: '500',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
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