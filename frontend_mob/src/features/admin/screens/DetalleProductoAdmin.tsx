// src/features/admin/screens/DetalleProductoAdmin.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Dimensions,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { ProductController } from '../../../core/controllers/ProductController';
import { ProductModel } from '../../../core/models/ProductModel';
import { COLORS } from '../../../shared/constants/colors';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
  route: any;
}

export const DetalleProductoAdmin = ({ navigation, route }: Props) => {
  const { id_producto } = route.params || {};
  const productController = new ProductController();

  const [producto, setProducto] = useState<ProductModel | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id_producto) {
      cargarDetalleProducto();
    } else {
      console.error('No se recibió id_producto');
      setLoading(false);
    }
  }, [id_producto]);

  const cargarDetalleProducto = async () => {
    try {
      setLoading(true);
      console.log('ID del producto:', id_producto);
      console.log('Tipo de ID:', typeof id_producto);
      const data = await productController.getProductoById(id_producto);
      console.log('Datos recibidos:', data);
      setProducto(data);
    } catch (error) {
      console.error('Error cargando detalle del producto:', error);
    } finally {
      setLoading(false);
    }
  };

  // editar producto
  const irAEditarProducto = () => {
    navigation.navigate('EditarProductoAdmin' as never, {
      id_producto: Number(id_producto),
    } as never);
  };

  // Eliminar producto (con confirmación)
  const eliminarProducto = () => {
    Alert.alert(
      'Eliminar producto',
      `¿Estás seguro de eliminar "${producto?.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await productController.eliminarProducto(
                Number(id_producto)
              );
              if (response.success) {
                Alert.alert('Éxito', 'Producto eliminado correctamente');
                navigation.goBack(); // Volver al catálogo
              } else {
                Alert.alert('Error', response.message || 'Error al eliminar');
              }
            } catch (error) {
              Alert.alert('Error', 'No se pudo eliminar el producto');
              console.error(error);
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando detalle...</Text>
      </View>
    );
  }

  if (!producto) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={60} color={COLORS.gray} />
        <Text style={styles.errorText}>No se encontró la información del producto.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Text style={styles.backBtnText}>Volver al catálogo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const listaImagenes: string[] = [
    producto.imagen_url || producto.imagen || ''
  ];

  const specs = [
    { icon: 'pricetag-outline', label: 'Marca', value: producto.marca },
    { icon: 'cube-outline', label: 'Material', value: producto.material },
    { icon: 'color-palette-outline', label: 'Color', value: producto.color },
  ];

  return (
    <View style={styles.container}>
      {/* CABECERA CON BOTÓN VOLVER */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.iconButton} onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={26} color={COLORS.black} />
        </TouchableOpacity>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* IMAGEN */}
        <View style={styles.imageContainer}>
          {listaImagenes[0] !== '' ? (
            <Image
              source={{ uri: listaImagenes[0] }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noImageContainer}>
              <Ionicons name="image-outline" size={60} color={COLORS.gray} />
            </View>
          )}
        </View>

        {/* DETALLES DEL PRODUCTO */}
        <View style={styles.detailsContainer}>

          {/* CATEGORÍA BADGE */}
          <View style={styles.categoriaBadge}>
            <Text style={styles.categoriaBadgeText}>
              {producto.tipo_categoria || 'Producto'}
            </Text>
          </View>

          <Text style={styles.productName}>{producto.nombre}</Text>
          <Text style={styles.productPrice}>{producto.precioFormateado}</Text>

          {/* DIVIDER */}
          <View style={styles.divider} />

          {/* ESPECIFICACIONES */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Especificaciones</Text>
            <View style={styles.specGrid}>
              {specs.map((spec, index) => (
                <View key={index} style={styles.specItem}>
                  <Ionicons name={spec.icon as any} size={16} color={COLORS.primary} />
                  <Text style={styles.specLabel}>{spec.label}:</Text>
                  <Text style={styles.specValue}>{spec.value || 'N/A'}</Text>
                </View>
              ))}
            </View>
          </View>

          {/* DESCRIPCIÓN */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descripción</Text>
            <Text style={styles.descriptionText}>
              {producto.descripcion || 'Sin descripción disponible para este producto.'}
            </Text>
          </View>

        </View>
      </ScrollView>

      {/* Botones Editar y Eliminar */}
      <View style={styles.bottomBar}>

        {/* EDITAR */}
        <TouchableOpacity
          style={styles.editButton}
          onPress={irAEditarProducto}
          activeOpacity={0.8}
        >
          <Ionicons name="create-outline" size={20} color={COLORS.primary} />
          <Text style={styles.editButtonText}>Editar producto</Text>
        </TouchableOpacity>

        {/* ELIMINAR */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={eliminarProducto}
          activeOpacity={0.8}
        >
          <Ionicons name="trash-outline" size={20} color={COLORS.white} />
          <Text style={styles.deleteButtonText}>Eliminar producto</Text>
        </TouchableOpacity>

      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 8,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  iconButton: {
    padding: 6,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  imageContainer: {
    width: width,
    height: 280,
    backgroundColor: '#FAFAFA',
    justifyContent: 'center',
    alignItems: 'center',
  },
  productImage: {
    width: width * 0.9,
    height: 260,
  },
  noImageContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailsContainer: {
    padding: 20,
  },

  categoriaBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 15,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  categoriaBadgeText: {
    fontSize: 12,
    color: COLORS.white,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.black,
    lineHeight: 28,
  },
  productPrice: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
    marginTop: 8,
  },

  divider: {
    height: 1,
    backgroundColor: '#E5E5E5',
    marginVertical: 12,
  },

  section: {
    marginTop: 22,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
    marginBottom: 8,
  },
  specGrid: {
    backgroundColor: '#F0F8FF',
    borderRadius: 12,
    padding: 14,
    gap: 10,
  },
  specItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  specLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.black,
    marginLeft: 6,
  },
  specValue: {
    fontSize: 13,
    color: '#555555',
  },
  descriptionText: {
    fontSize: 13,
    color: '#555555',
    lineHeight: 20,
  },

  // Botones ADMIN
  bottomBar: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    gap: 12,
  },

  editButton: {
    flex: 1,
    height: 50,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.white,
  },

  editButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.primary,
  },

  deleteButton: {
    flex: 1,
    height: 50,
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    shadowColor: COLORS.error,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },

  deleteButtonText: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.white,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.gray,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 14,
    color: COLORS.gray,
    marginTop: 10,
    textAlign: 'center',
  },
  backBtn: {
    marginTop: 15,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: COLORS.primary,
    borderRadius: 8,
  },
  backBtnText: {
    color: COLORS.white,
    fontWeight: '600',
  },
});