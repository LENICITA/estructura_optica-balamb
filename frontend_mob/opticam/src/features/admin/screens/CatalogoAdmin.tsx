// src/features/admin/screens/CatalogoAdmin.tsx

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Image,
  ActivityIndicator,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { ProductController } from '../../../core/controllers/ProductController';
import { ProductModel } from '../../../core/models/ProductModel';
import { COLORS } from '../../../shared/constants/colors';

interface Props {
  navigation: any;
}

export const CatalogoAdmin = ({ navigation }: Props) => {

  const productController = new ProductController();

  const [productos, setProductos] = useState<ProductModel[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<ProductModel[]>([]);

  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);

  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<string>('Todos');

  const [orden, setOrden] = useState('Nuevo');

  // CARGAR PRODUCTOS
  useEffect(() => {
    cargarProductos();
    cargarCategorias();
  }, []);

  const cargarProductos = async () => {
    try {
      setLoading(true);
      const data = await productController.getProductos();
      setProductos(data);
      setProductosFiltrados(data);
    } catch (error) {
      console.error('Error cargando productos:', error);
    } finally {
      setLoading(false);
    }
  };

  const cargarCategorias = async () => {
    try {
      const data = await productController.getCategorias();
      setCategorias(data);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  // BÚSQUEDA
  const limpiarBusqueda = () => {
    setBusqueda('');
  };

  const filtrarPorCategoria = (categoria: string) => {
    setCategoriaSeleccionada(categoria);
    setMostrarCategorias(false);

    if (categoria === 'Todos') {
      setProductosFiltrados(productos);
    } else {
      const filtrados = productos.filter(p => p.tipo_categoria === categoria);
      setProductosFiltrados(filtrados);
    }
  };

  // NAVEGACIÓN
  const verDetalle = (producto: ProductModel) => {
    navigation.navigate(
      'DetalleProductoAdmin' as never,
      {
        id_producto: Number(producto.id_producto),
      } as never
    );
  };

  // crear producto
  const irACrearProducto = () => {
    navigation.navigate('CrearProductoAdmin' as never);
  };

  // editar producto
  const irAEditarProducto = (producto: ProductModel) => {
    navigation.navigate('EditarProductoAdmin' as never, {
      id_producto: Number(producto.id_producto),
    } as never);
  };

  //  Eliminar producto (con confirmación)
  const eliminarProducto = (producto: ProductModel) => {
    Alert.alert(
      'Eliminar producto',
      `¿Estás seguro de eliminar "${producto.nombre}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: async () => {
            try {
              setLoading(true);
              const response = await productController.eliminarProducto(
                producto.id_producto
              );
              if (response.success) {
                Alert.alert('Éxito', 'Producto eliminado correctamente');
                cargarProductos();
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

  // RENDER PRODUCTO - Con botones de Admin
  const renderProducto = ({ item }: { item: ProductModel }) => {
    const imagenProducto =
      item.imagen_url || item.imagen_thumbnail || item.imagen;

    return (
      <View style={styles.productCard}>

        {/* IMAGEN */}
        <TouchableOpacity
          style={styles.imageContainer}
          activeOpacity={0.9}
          onPress={() => verDetalle(item)}
        >
          {imagenProducto ? (
            <Image
              source={{ uri: imagenProducto }}
              style={styles.productImage}
              resizeMode="contain"
            />
          ) : (
            <View style={styles.noImage}>
              <Ionicons name="image-outline" size={30} color={COLORS.gray} />
            </View>
          )}
        </TouchableOpacity>

        {/* INFORMACIÓN */}
        <View style={styles.productInfo}>

          <Text style={styles.productName} numberOfLines={1}>
            {item.nombre}
          </Text>

          <Text style={styles.productBrand}>{item.marca}</Text>
          <Text style={styles.productCategory}>
            {item.tipo_categoria || 'Producto'}
          </Text>
          <Text style={styles.productPrice}>{item.precioFormateado}</Text>

        </View>

          {/* ACCIONES ADMIN */}
          <View style={styles.adminActions}>


            {/* EDITAR */}
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => irAEditarProducto(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="create-outline" size={18} color={COLORS.primary} />
            </TouchableOpacity>

            {/* ELIMINAR */}
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => eliminarProducto(item)}
              activeOpacity={0.8}
            >
              <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            </TouchableOpacity>

          </View>

        </View>

    );
  };

  // LOADING
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando productos...</Text>
      </View>
    );
  }

  // PANTALLA
  return (
    <View style={styles.container}>

      {/* CABECERA */}
      <View style={styles.topSection}>

        {/* BUSCADOR */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={19} color={COLORS.gray} />
          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor={COLORS.gray}
            value={busqueda}
            onChangeText={setBusqueda}
            maxLength={100}
          />
          {busqueda.length > 0 && (
            <TouchableOpacity onPress={limpiarBusqueda}>
              <Ionicons name="close-circle" size={18} color={COLORS.gray} />
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={styles.filterIconButton}
            onPress={() => setMostrarFiltros(true)}
          >
            <Ionicons name="options-outline" size={19} color={COLORS.black} />
          </TouchableOpacity>
        </View>

        {/* BOTONES */}
        <View style={styles.toolsRow}>

          {/* CATEGORÍAS */}
          <View style={styles.topRow}>
          <TouchableOpacity
            style={styles.categoriesButton}
            onPress={() => setMostrarCategorias(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="grid-outline" size={17} color={COLORS.primary} />
            <Text style={styles.categoriesButtonText}>Categorías</Text>
          </TouchableOpacity>

          {/* BOTÓN AGREGAR PRODUCTO */}
          <TouchableOpacity
            style={styles.addButton}
            onPress={irACrearProducto}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle-outline" size={17} color={COLORS.white} />
            <Text style={styles.addButtonText}>Crear Producto</Text>
          </TouchableOpacity>
          </View>

          {/* ORDENAR */}
          <TouchableOpacity style={styles.orderButton} onPress={() => {}} activeOpacity={0.8}>
            <Ionicons name="swap-vertical-outline" size={16} color={COLORS.black} />
            <Text style={styles.orderText}>{orden}</Text>
            <Ionicons name="chevron-down" size={15} color={COLORS.black} />
          </TouchableOpacity>

        </View>

      </View>

      {/* RESULTADOS */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsText}>
          Mostrando{' '}
          <Text style={styles.resultsNumber}>
            {productosFiltrados.length}
          </Text>{' '}
          de {productos.length} productos
        </Text>
      </View>

      {/* PRODUCTOS */}
      {productosFiltrados.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="search-outline" size={50} color={COLORS.gray} />
          <Text style={styles.emptyTitle}>No encontramos productos</Text>
          <Text style={styles.emptyText}>Intenta con otro término de búsqueda.</Text>
        </View>
      ) : (
        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) => item.id_producto.toString()}
          renderItem={renderProducto}
          numColumns={1}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* MODAL CATEGORÍAS */}
      <Modal
        visible={mostrarCategorias}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarCategorias(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Categorías</Text>
              <TouchableOpacity onPress={() => setMostrarCategorias(false)}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                style={[
                  styles.categoriaItem,
                  categoriaSeleccionada === 'Todos' && styles.categoriaItemActive,
                ]}
                onPress={() => filtrarPorCategoria('Todos')}
              >
                <Text
                  style={[
                    styles.categoriaItemText,
                    categoriaSeleccionada === 'Todos' && styles.categoriaItemTextActive,
                  ]}
                >
                  Todos
                </Text>
                {categoriaSeleccionada === 'Todos' && (
                  <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                )}
              </TouchableOpacity>

              {categorias.map((categoria) => (
                <TouchableOpacity
                  key={categoria}
                  style={[
                    styles.categoriaItem,
                    categoriaSeleccionada === categoria && styles.categoriaItemActive,
                  ]}
                  onPress={() => filtrarPorCategoria(categoria)}
                >
                  <Text
                    style={[
                      styles.categoriaItemText,
                      categoriaSeleccionada === categoria && styles.categoriaItemTextActive,
                    ]}
                  >
                    {categoria}
                  </Text>
                  {categoriaSeleccionada === categoria && (
                    <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* MODAL FILTROS */}
      <Modal
        visible={mostrarFiltros}
        transparent
        animationType="slide"
        onRequestClose={() => setMostrarFiltros(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filtrar productos</Text>
              <TouchableOpacity onPress={() => setMostrarFiltros(false)}>
                <Ionicons name="close" size={24} color={COLORS.black} />
              </TouchableOpacity>
            </View>

            {/* PRECIO */}
            <Text style={styles.filterTitle}>Precio</Text>
            <View style={styles.priceInputs}>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceLabel}>Mínimo</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="$0"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.priceInputContainer}>
                <Text style={styles.priceLabel}>Máximo</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="$500.000"
                  placeholderTextColor={COLORS.gray}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {/* MARCA */}
            <Text style={styles.filterTitle}>Marca</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectText}>Seleccionar marca</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.gray} />
            </TouchableOpacity>

            {/* MATERIAL */}
            <Text style={styles.filterTitle}>Material</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectText}>Seleccionar material</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.gray} />
            </TouchableOpacity>

            {/* COLOR */}
            <Text style={styles.filterTitle}>Color</Text>
            <TouchableOpacity style={styles.selectButton}>
              <Text style={styles.selectText}>Seleccionar color</Text>
              <Ionicons name="chevron-down" size={18} color={COLORS.gray} />
            </TouchableOpacity>

            {/* BOTONES */}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.clearFiltersButton}>
                <Text style={styles.clearFiltersText}>Limpiar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.applyFiltersButton}
                onPress={() => setMostrarFiltros(false)}
              >
                <Text style={styles.applyFiltersText}>Aplicar filtros</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

    </View>
  );
};

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },

  topSection: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },

  searchContainer: {
    height: 44,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 11,
    backgroundColor: COLORS.white,
  },

  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.black,
    marginLeft: 8,
    paddingVertical: 0,
  },

  filterIconButton: {
    marginLeft: 7,
    paddingLeft: 9,
    borderLeftWidth: 1,
    borderLeftColor: '#E2E2E2',
  },

  toolsRow: {
    flexDirection: 'column',
    marginTop: 10,
    gap: 8,
  },

topRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 10,
},

  categoriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },

  categoriesButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },

  //  BOTÓN AGREGAR
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    flex: 1,
    justifyContent: 'center',
  },

  addButtonText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },

  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D7D7D7',
    borderRadius: 9,
    paddingHorizontal: 14,
    paddingVertical: 8,
    gap: 6,
    width: '100%',
  },

  orderText: {
    fontSize: 12,
    color: COLORS.black,
  },

  resultsHeader: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },

  resultsText: {
    fontSize: 12,
    color: '#666666',
  },

  resultsNumber: {
    color: COLORS.black,
    fontWeight: '700',
  },

  productList: {
    paddingHorizontal: 10,
    paddingBottom: 20,
  },

  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },

  productCard: {
    flexDirection: 'row',
      backgroundColor: COLORS.white,
      borderRadius: 12,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: '#E5E5E5',
      marginBottom: 10,
      alignItems: 'center',
      padding: 10,
  },

  imageContainer: {
    width: 100,
      height: 100,
      backgroundColor: '#FAFAFA',
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: 8,
      marginRight: 12,
  },

  productImage: {
    width: '90%',
    height: '90%',
  },

  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  productInfo: {
    flex: 1,
      paddingVertical: 4,
  },

  productName: {
    fontSize: 14,
    color: COLORS.black,
    fontWeight: '700',
    lineHeight: 18,
  },

  productBrand: {
    fontSize: 11,
    color: COLORS.text,
    marginTop: 2,
  },

  productCategory: {
    fontSize: 12,
    color: COLORS.gray,
    marginTop: 1,
  },

  productPrice: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 3,
  },

  // ACCIONES ADMIN
  adminActions: {
    flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      marginLeft: 8,
  },

  editButton: {
     width: 36,
      height: 36,
      borderWidth: 1,
      borderColor: COLORS.primary,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.white,
  },

  deleteButton: {
    width: 36,
      height: 36,
      borderWidth: 1,
      borderColor: COLORS.error,
      borderRadius: 8,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: COLORS.white,
  },

  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.white,
  },

  loadingText: {
    marginTop: 10,
    fontSize: 13,
    color: COLORS.gray,
  },

  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },

  emptyTitle: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.black,
  },

  emptyText: {
    marginTop: 5,
    fontSize: 12,
    color: COLORS.gray,
    textAlign: 'center',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },

  filterModal: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    padding: 18,
    paddingBottom: 25,
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.black,
  },

  filterTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.black,
    marginTop: 12,
    marginBottom: 7,
  },

  priceInputs: {
    flexDirection: 'row',
    gap: 10,
  },

  priceInputContainer: {
    flex: 1,
  },

  priceLabel: {
    fontSize: 10,
    color: COLORS.gray,
    marginBottom: 4,
  },

  priceInput: {
    height: 40,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    borderRadius: 8,
    paddingHorizontal: 10,
    fontSize: 12,
    color: COLORS.black,
  },

  selectButton: {
    height: 42,
    borderWidth: 1,
    borderColor: '#D7D7D7',
    borderRadius: 8,
    paddingHorizontal: 11,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  selectText: {
    fontSize: 12,
    color: COLORS.gray,
  },

  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },

  clearFiltersButton: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  clearFiltersText: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '700',
  },

  applyFiltersButton: {
    flex: 1.5,
    height: 44,
    backgroundColor: COLORS.primary,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },

  applyFiltersText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '700',
  },

  categoriaItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },

  categoriaItemActive: {
    backgroundColor: '#F0F8FF',
    borderRadius: 8,
  },

  categoriaItemText: {
    fontSize: 15,
    color: COLORS.black,
  },

  categoriaItemTextActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },

});
