import React, { useState, useEffect } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { COLORS } from '@/shared/constants/colors';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ProductController } from '../../../core/controllers/ProductController';

export default function EditarProducto() {
  const navigation = useNavigation();
  const route = useRoute<any>();
  const productController = new ProductController();

  const productoId = route.params?.id_producto ?? route.params?.producto?.id_producto;

  const [imagen, setImagen] = useState<string | null>(null);
  const [imagenOriginal, setImagenOriginal] = useState<string | null>(null);
  const [subiendo, setSubiendo] = useState(false);
  const [dropdown, setDropdown] = useState(false);
  const [cargandoProducto, setCargandoProducto] = useState(true);
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<{ id_categoria: number; nombre: string } | null>(null);

  const categorias = [
    { id_categoria: 1, nombre: 'MONTURAS' },
    { id_categoria: 2, nombre: 'ACCESORIOS' },
    { id_categoria: 3, nombre: 'GAFAS DE SOL' }
  ];

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    marca: '',
    precio: '',
    material: '',
    color: '',
  });

  useEffect(() => {
    const cargarProducto = async () => {
      if (!productoId) {
        Alert.alert('Error', 'No se encontró el ID del producto.');
        navigation.goBack();
        return;
      }

      try {
        setCargandoProducto(true);
        const producto = await productController.getProductoById(productoId);

        if (!producto) {
          Alert.alert('Error', 'No se encontró el producto.');
          navigation.goBack();
          return;
        }

        setFormData({
          nombre: producto.nombre || '',
          descripcion: producto.descripcion || '',
          marca: producto.marca || '',
          precio: producto.precio ? String(producto.precio) : '',
          material: producto.material || '',
          color: producto.color || '',
        });

        if (producto.imagen_url) {
          setImagen(producto.imagen_url);
          setImagenOriginal(producto.imagen_url);
        }

        // Seleccionar la categoría actual
        if (producto.id_categoria) {
          const categoriaEncontrada = categorias.find(
            cat => cat.id_categoria === producto.id_categoria
          );
          if (categoriaEncontrada) {
            setCategoriaSeleccionada(categoriaEncontrada);
          }
        }

      } catch (error) {
        console.error('Error cargando producto:', error);
        Alert.alert('Error', 'No fue posible cargar los datos del producto.');
      } finally {
        setCargandoProducto(false);
      }
    };

    cargarProducto();
  }, [productoId]);

  const seleccionarImagen = async () => {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permiso.granted) {
        Alert.alert(
          'Permiso requerido',
          'Debes permitir el acceso a la galería para seleccionar la imagen.'
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

  const editarProducto = async () => {
    if (!categoriaSeleccionada) {
      Alert.alert('Campo requerido', 'Debes seleccionar una categoría.');
      return;
    }

    if (!formData.nombre.trim()) {
      Alert.alert('Campo requerido', 'Debes ingresar el nombre del producto.');
      return;
    }

    if (!formData.descripcion.trim()) {
      Alert.alert('Campo requerido', 'Debes ingresar una descripción del producto.');
      return;
    }

    if (!formData.marca.trim()) {
      Alert.alert('Campo requerido', 'Debes ingresar la marca del producto.');
      return;
    }

    if (!formData.precio || parseFloat(formData.precio) <= 0) {
      Alert.alert('Campo requerido', 'Debes ingresar un precio válido mayor a 0.');
      return;
    }

    if (!formData.material.trim()) {
      Alert.alert('Campo requerido', 'Debes ingresar el material del producto.');
      return;
    }

    if (!formData.color.trim()) {
      Alert.alert('Campo requerido', 'Debes ingresar el color del producto.');
      return;
    }

    const imagenFinal = imagen || imagenOriginal;

    if (!imagenFinal) {
      Alert.alert('Campo requerido', 'Debes seleccionar una imagen para el producto.');
      return;
    }

    try {
      setSubiendo(true);

      console.log('Editando producto ID:', productoId);
      console.log('Datos enviados:', {
        id_categoria: categoriaSeleccionada.id_categoria,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        marca: formData.marca.trim(),
        precio: parseFloat(formData.precio),
        imagen: imagenFinal,
        material: formData.material.trim(),
        color: formData.color.trim(),
      });

      const resultado = await productController.actualizarProducto(productoId, {
        id_categoria: categoriaSeleccionada.id_categoria,
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        marca: formData.marca.trim(),
        precio: parseFloat(formData.precio),
        imagen: imagenFinal,
        material: formData.material.trim(),
        color: formData.color.trim(),
      });

      console.log('Resultado edición:', resultado);

      if (!resultado.success) {
        Alert.alert('Error', resultado.message);
        return;
      }

      Alert.alert(
        '¡Producto editado!',
        'El producto fue actualizado correctamente.',
        [
          {
            text: 'Ver productos',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      console.error('Error editando producto:', error);
      Alert.alert('Error', error?.message || 'No fue posible editar el producto.');
    } finally {
      setSubiendo(false);
    }
  };

  if (cargandoProducto) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando producto...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity
        style={styles.botonVolver}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="arrow-back-outline" size={20} color={COLORS.primary} />
        <Text style={styles.textBoton}>Volver</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.headerCard}>
          <Ionicons name="create-outline" size={24} color={COLORS.primary} style={styles.iconCard} />
          <Text style={styles.titleCard}>Editar Producto</Text>
        </View>
        <View style={styles.contentCard}>
          <Text style={styles.subtitle}>Actualiza los datos del producto existente.</Text>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Categoría:</Text>
            <View style={styles.dropdown}>
              <TouchableOpacity
                style={styles.dropdownHeader}
                onPress={() => setDropdown(!dropdown)}
              >
                <Text style={[styles.dropdownText, !categoriaSeleccionada && styles.placeholderText]}>
                  {categoriaSeleccionada?.nombre || 'Seleccionar categoría'}
                </Text>
                <Ionicons
                  name={dropdown ? 'chevron-up' : 'chevron-down'}
                  size={20}
                  color={COLORS.black}
                />
              </TouchableOpacity>

              {dropdown && (
                <View style={styles.dropdownOptions}>
                  <ScrollView nestedScrollEnabled={true}>
                    {categorias.map((item) => (
                      <TouchableOpacity
                        key={item.id_categoria}
                        style={styles.option}
                        onPress={() => {
                          setCategoriaSeleccionada(item);
                          setDropdown(false);
                        }}
                      >
                        <Text style={styles.optionText}>{item.nombre}</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Nombre del producto:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el nombre del producto"
              value={formData.nombre}
              onChangeText={(text) => setFormData({ ...formData, nombre: text })}
            />
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Descripción:</Text>
            <TextInput
              style={styles.inputDescripcion}
              placeholder="Ingrese la descripción del producto"
              multiline={true}
              textAlignVertical="top"
              scrollEnabled={true}
              value={formData.descripcion}
              onChangeText={(text) => setFormData({ ...formData, descripcion: text })}
            />
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Marca:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese la marca del producto"
              value={formData.marca}
              onChangeText={(text) => setFormData({ ...formData, marca: text })}
            />
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Precio:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el precio del producto"
              keyboardType="numeric"
              value={formData.precio}
              onChangeText={(text) => setFormData({ ...formData, precio: text })}
            />
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Material:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el material del producto"
              value={formData.material}
              onChangeText={(text) => setFormData({ ...formData, material: text })}
            />
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Color:</Text>
            <TextInput
              style={styles.input}
              placeholder="Ingrese el color del producto"
              value={formData.color}
              onChangeText={(text) => setFormData({ ...formData, color: text })}
            />
          </View>

          <View style={{ marginTop: 16 }}>
            <Text style={styles.label}>Imagen:</Text>

            <TouchableOpacity style={styles.imageButton} onPress={seleccionarImagen}>
              <Ionicons name="cloud-upload-outline" size={28} color={COLORS.primary} />
              <Text style={styles.imageButtonText}>
                {imagenOriginal && !imagen ? 'Usando imagen actual' : 'Seleccionar imagen'}
              </Text>
            </TouchableOpacity>

            {imagen && (
              <View style={styles.previewContainer}>
                <Image source={{ uri: imagen }} style={styles.preview} resizeMode="cover" />
                <TouchableOpacity
                  style={styles.removeImageButton}
                  onPress={() => {
                    setImagen(null);
                    setImagenOriginal(null);
                  }}
                >
                  <Ionicons name="close-circle" size={28} color={COLORS.primary} />
                </TouchableOpacity>
              </View>
            )}
          </View>

          <View style={styles.uploadButtonContainer}>
            {subiendo ? (
              <View style={styles.loadingButton}>
                <ActivityIndicator color={COLORS.white} />
                <Text style={styles.loadingButtonText}>Editando producto...</Text>
              </View>
            ) : (
              <TouchableOpacity
                style={styles.crearButton}
                onPress={editarProducto}
                disabled={subiendo}
              >
                <Ionicons name="save-outline" size={20} color="#FFFFFF" />
                <Text style={styles.crearButtonText}>Editar Producto</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    padding: 16,
  },
  contentContainer: {
    paddingBottom: 40,
  },
  botonVolver: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  textBoton: {
    color: COLORS.primary,
    fontSize: 16,
    marginLeft: 6,
    fontWeight: "600",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    elevation: 3,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },
  iconCard: {
    padding: 5,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  contentCard: {
    marginTop: 12,
    paddingHorizontal: 8,
  },
  titleCard: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.black,
  },
  subtitle: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 4,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.black,
    paddingLeft: 6,
    paddingBottom: 4,
  },
  input: {
    marginTop: 5,
    marginBottom: 6,
    width: "98%",
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    alignSelf: "center",
  },
  inputDescripcion: {
    marginTop: 5,
    marginBottom: 6,
    width: "98%",
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 10,
    alignSelf: "center",
    textAlignVertical: "top",
  },
  imageButton: {
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#ccc',
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
  dropdown: {
    width: "98%",
    alignSelf: "center",
    position: 'relative',
    zIndex: 1000,
  },
  dropdownHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 50,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    paddingHorizontal: 15,
    backgroundColor: '#FFFFFF',
  },
  dropdownText: {
    fontSize: 16,
    color: COLORS.black,
  },
  placeholderText: {
    color: '#999',
  },
  dropdownOptions: {
    marginTop: 2,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    maxHeight: 200,
    position: 'absolute',
    top: 55,
    left: 0,
    right: 0,
    zIndex: 1001,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  option: {
    paddingVertical: 12,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  optionText: {
    fontSize: 16,
    color: COLORS.black,
  },
  uploadButtonContainer: {
    marginTop: 24,
  },
  loadingButton: {
    height: 50,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    opacity: 0.7,
  },
  loadingButtonText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 16,
  },
  crearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 10,
    gap: 8,
  },
  crearButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
  },
  loadingText: {
    marginTop: 16,
    color: COLORS.gray,
    fontSize: 16,
  },
});