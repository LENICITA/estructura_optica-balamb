// src/features/client/screens/DetalleProductoCliente.tsx

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

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { ProductController } from '../../../core/controllers/ProductController';
import { ProductModel } from '../../../core/models/ProductModel';
import { COLORS } from '../../../shared/constants/colors';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
  route: any;
}

export const DetalleProductoCliente = ({ navigation, route }: Props) => {
  const { id_producto } = route.params || {};
  const productController = new ProductController();

  const [producto, setProducto] = useState<ProductModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [cantidad, setCantidad] = useState(1);
  const [activeImageIndex, setActiveImageIndex] = useState(0);

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

  const incrementarCantidad = () => setCantidad((prev) => prev + 1);
  const decrementarCantidad = () => {
    if (cantidad > 1) setCantidad((prev) => prev - 1);
  };

  const agregarAlCarrito = async () => {
    if (!producto) return;

    try {
      const carritoGuardado = await AsyncStorage.getItem('@carrito');
      const carrito = carritoGuardado ? JSON.parse(carritoGuardado) : [];

      const indexExistente = carrito.findIndex(
        (item: any) => item.id_producto === producto.id_producto
      );

      if (indexExistente !== -1) {
        carrito[indexExistente].cantidad += cantidad;
      } else {
        carrito.push({
          id: Date.now(),
          id_producto: producto.id_producto,
          nombre: producto.nombre,
          precio: producto.precio,
          cantidad: cantidad,
          imagen: producto.imagen_url || producto.imagen || '',
          color: producto.color,
          material: producto.material,
          seleccionado: true,
        });
      }

      await AsyncStorage.setItem('@carrito', JSON.stringify(carrito));
      Alert.alert(' Éxito', `${producto.nombre} agregado al carrito`);

    } catch (error) {
      console.error('Error al agregar al carrito:', error);
      Alert.alert(' Error', 'No se pudo agregar el producto al carrito');
    }
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

      {/* BARRA INFERIOR */}
      <View style={styles.bottomBar}>
        <View style={styles.quantitySelector}>
          <TouchableOpacity style={styles.quantityBtn} onPress={decrementarCantidad}>
            <Ionicons name="remove" size={18} color={COLORS.black} />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{cantidad}</Text>
          <TouchableOpacity style={styles.quantityBtn} onPress={incrementarCantidad}>
            <Ionicons name="add" size={18} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.addToCartBtn} onPress={agregarAlCarrito} activeOpacity={0.8}>
          <Ionicons name="cart-outline" size={20} color={COLORS.white} />
          <Text style={styles.addToCartText}>Agregar al carrito</Text>
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
  },
  iconButton: {
    padding: 6,
  },
  badgeRole: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeRoleText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
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
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D7D7D7',
    borderRadius: 10,
    height: 46,
    paddingHorizontal: 6,
  },
  quantityBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quantityText: {
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.black,
  },
  addToCartBtn: {
    flex: 1,
      height: 50,
      backgroundColor: COLORS.primary,
      borderRadius: 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      shadowColor: COLORS.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
  },
  addToCartText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '700',
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