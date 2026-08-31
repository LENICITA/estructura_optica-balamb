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
} from 'react-native';

import { Ionicons } from '@expo/vector-icons';
import { ProductController } from '../../../core/controllers/ProductController';
import { ProductModel } from '../../../core/models/ProductModel';
import { COLORS } from '../../../shared/constants/colors';

interface Props {
  navigation: any;
}

export const CatalogoCliente = ({ navigation }: Props) => {

  const productController = new ProductController();

  const [productos, setProductos] = useState<ProductModel[]>([]);
  const [productosFiltrados, setProductosFiltrados] = useState<ProductModel[]>([]);

  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [buscando, setBuscando] = useState(false);

  const [mostrarFiltros, setMostrarFiltros] = useState(false);
  const [mostrarCategorias, setMostrarCategorias] = useState(false);

  // FILTROS
  const [precioMin, setPrecioMin] = useState('');
  const [precioMax, setPrecioMax] = useState('');
  const [marcaSeleccionada, setMarcaSeleccionada] = useState('');
  const [materialSeleccionado, setMaterialSeleccionado] = useState('');
  const [colorSeleccionado, setColorSeleccionado] = useState('');

  // Filtros que ya fueron aplicados
  const [filtrosAplicados, setFiltrosAplicados] = useState<{
    precio_min?: number;
    precio_max?: number;
    marca?: string;
    material?: string;
    color?: string;
  }>({});

  const [mostrarOpcionesFiltro, setMostrarOpcionesFiltro] = useState(false);
  const [tipoFiltroOpciones, setTipoFiltroOpciones] = useState<
    'marca' | 'material' | 'color' | null
  >(null);

  const [categorias, setCategorias] = useState<string[]>([]);
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<string>('Todos');

  const [mostrarOrden, setMostrarOrden] = useState(false);
    const [ordenSeleccionado, setOrdenSeleccionado] = useState('Nuevo');

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
      const ordenados = [...data].sort((a, b) => b.id_producto - a.id_producto);
            setProductosFiltrados(ordenados);
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

  // Opciones de filtros tomadas de los productos ya cargados.
  const marcasDisponibles = Array.from(
    new Set(productos.map(p => p.marca).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const materialesDisponibles = Array.from(
    new Set(productos.map(p => p.material).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const coloresDisponibles = Array.from(
    new Set(productos.map(p => p.color).filter(Boolean))
  ).sort((a, b) => a.localeCompare(b));

  const aplicarOrden = (lista: ProductModel[]) => {
    return [...lista].sort((a, b) => {
      switch (ordenSeleccionado) {
        case 'Nuevo':
          return b.id_producto - a.id_producto;
        case 'Precio: menor a mayor':
          return a.precio - b.precio;
        case 'Precio: mayor a menor':
          return b.precio - a.precio;
        case 'Nombre A-Z':
          return a.nombre.localeCompare(b.nombre);
        default:
          return 0;
      }
    });
  };

  const aplicarFiltrosLocales = (lista: ProductModel[]) => {
    return lista.filter(producto => {
      const precio = Number(producto.precio) || 0;
      const minimo =
        filtrosAplicados.precio_min !== undefined
          ? filtrosAplicados.precio_min
          : undefined;
      const maximo =
        filtrosAplicados.precio_max !== undefined
          ? filtrosAplicados.precio_max
          : undefined;

      const cumplePrecioMin = minimo === undefined || precio >= minimo;
      const cumplePrecioMax = maximo === undefined || precio <= maximo;
      const cumpleMarca =
        !filtrosAplicados.marca ||
        producto.marca?.toLowerCase() === filtrosAplicados.marca.toLowerCase();
      const cumpleMaterial =
        !filtrosAplicados.material ||
        producto.material?.toLowerCase() === filtrosAplicados.material.toLowerCase();
      const cumpleColor =
        !filtrosAplicados.color ||
        producto.color?.toLowerCase() === filtrosAplicados.color.toLowerCase();

      return (
        cumplePrecioMin &&
        cumplePrecioMax &&
        cumpleMarca &&
        cumpleMaterial &&
        cumpleColor
      );
    });
  };

  const obtenerNombreFiltro = () => {
    switch (tipoFiltroOpciones) {
      case 'marca':
        return 'Seleccionar marca';
      case 'material':
        return 'Seleccionar material';
      case 'color':
        return 'Seleccionar color';
      default:
        return 'Seleccionar';
    }
  };

  const opcionesFiltroActual =
    tipoFiltroOpciones === 'marca'
      ? marcasDisponibles
      : tipoFiltroOpciones === 'material'
        ? materialesDisponibles
        : tipoFiltroOpciones === 'color'
          ? coloresDisponibles
          : [];

  const abrirOpcionesFiltro = (
    tipo: 'marca' | 'material' | 'color'
  ) => {
    setTipoFiltroOpciones(tipo);
    setMostrarOpcionesFiltro(true);
  };

  const seleccionarOpcionFiltro = (valor: string) => {
    if (tipoFiltroOpciones === 'marca') {
      setMarcaSeleccionada(valor);
    } else if (tipoFiltroOpciones === 'material') {
      setMaterialSeleccionado(valor);
    } else if (tipoFiltroOpciones === 'color') {
      setColorSeleccionado(valor);
    }

    setMostrarOpcionesFiltro(false);
    setTipoFiltroOpciones(null);
  };

  const aplicarFiltros = async () => {
    try {
      const minimoTexto = precioMin.replace(/[^0-9]/g, '');
      const maximoTexto = precioMax.replace(/[^0-9]/g, '');

      const minimo = minimoTexto ? Number(minimoTexto) : undefined;
      const maximo = maximoTexto ? Number(maximoTexto) : undefined;

      if (
        minimo !== undefined &&
        maximo !== undefined &&
        minimo > maximo
      ) {
        console.warn('El precio mínimo no puede ser mayor que el máximo');
        return;
      }

      const nuevosFiltros = {
        ...(minimo !== undefined ? { precio_min: minimo } : {}),
        ...(maximo !== undefined ? { precio_max: maximo } : {}),
        ...(marcaSeleccionada ? { marca: marcaSeleccionada } : {}),
        ...(materialSeleccionado ? { material: materialSeleccionado } : {}),
        ...(colorSeleccionado ? { color: colorSeleccionado } : {}),
      };

      setFiltrosAplicados(nuevosFiltros);

      setMostrarFiltros(false);
    } catch (error) {
      console.error('Error aplicando filtros:', error);
    }
  };

  const limpiarFiltros = () => {
    setPrecioMin('');
    setPrecioMax('');
    setMarcaSeleccionada('');
    setMaterialSeleccionado('');
    setColorSeleccionado('');
    setFiltrosAplicados({});
    setMostrarFiltros(false);
  };

  // BÚSQUEDA VISUAL

  const limpiarBusqueda = () => {
    setBusqueda('');
  };

useEffect(() => {
    const texto = busqueda.trim();

    const cargarResultados = async () => {
      try {
        setBuscando(true);

        let resultados: ProductModel[];

        if (texto === '') {
          // Sin búsqueda: pedir al backend los productos con los filtros aplicados.
          const tieneFiltros = Object.keys(filtrosAplicados).length > 0;

          resultados = tieneFiltros
            ? await productController.filtrarProductos(filtrosAplicados)
            : [...productos];
        } else {
          console.log('Buscando producto en backend:', texto);
          resultados = await productController.buscarProductos(texto);
        }

        // Mantener los filtros activos también cuando hay una búsqueda.
        resultados = aplicarFiltrosLocales(resultados);

        // Mantener la categoría seleccionada.
        if (categoriaSeleccionada !== 'Todos') {
          resultados = resultados.filter(
            producto => producto.tipo_categoria === categoriaSeleccionada
          );
        }

        setProductosFiltrados(aplicarOrden(resultados));
      } catch (error) {
        console.error('Error obteniendo productos:', error);
        setProductosFiltrados([]);
      } finally {
        setBuscando(false);
      }
    };

    // Evita hacer una petición inmediatamente mientras se escribe.
    const timeout = setTimeout(cargarResultados, texto === '' ? 0 : 400);

    return () => clearTimeout(timeout);
  }, [
    busqueda,
    productos,
    categoriaSeleccionada,
    ordenSeleccionado,
    filtrosAplicados,
  ]);

  const filtrarPorCategoria = (categoria: string) => {
    setCategoriaSeleccionada(categoria);
    setMostrarCategorias(false);
  };

  const ordenarProductos = (tipo: string) => {
    setOrdenSeleccionado(tipo);
    setMostrarOrden(false);
  };

  // NAVEGACIÓN

  const verDetalle = (producto: ProductModel) => {
      console.log('Enviando ID:', producto.id_producto);
    navigation.navigate(
      'DetalleProductoCliente' as never,
      {
        id_producto: Number(producto.id_producto),
      } as never
    );
  };

  const abrirCarrito = () => {
    navigation.navigate('Carrito' as never);
  };

  // RENDER PRODUCTO

  const renderProducto = ({
    item,
  }: {
    item: ProductModel;
  }) => {
    const imagenProducto =
      item.imagen_url ||
      item.imagen_thumbnail ||
      item.imagen;

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
              <Ionicons
                name="image-outline"
                size={40}
                color={COLORS.gray}
              />
            </View>
          )}

          {/* ETIQUETA NUEVO */}

          <View style={styles.newBadge}>
            <Text style={styles.newBadgeText}>
              Nuevo
            </Text>
          </View>
        </TouchableOpacity>

        {/* INFORMACIÓN */}

        <View style={styles.productInfo}>

          <Text
            style={styles.productName}
            numberOfLines={2}
          >
            {item.nombre}
          </Text>

          <Text style={styles.productBrand}>
            {item.marca}
          </Text>

          <Text style={styles.productCategory}>
            {item.tipo_categoria || 'Producto'}
          </Text>

          <Text style={styles.productPrice}>
            {item.precioFormateado}
          </Text>

          {/* ACCIONES */}

          <View style={styles.actions}>

            {/* VER DETALLE */}

            <TouchableOpacity
              style={styles.detailButton}
              onPress={() => verDetalle(item)}
              activeOpacity={0.8}
            >
              <Ionicons
                name="eye-outline"
                size={16}
                color={COLORS.black}
              />

              <Text style={styles.detailButtonText}>
                Ver detalle
              </Text>
            </TouchableOpacity>

            {/* CARRITO */}

            <TouchableOpacity
              style={styles.cartButton}
              onPress={abrirCarrito}
              activeOpacity={0.8}
            >
              <Ionicons
                name="cart-outline"
                size={20}
                color={COLORS.white}
              />
            </TouchableOpacity>

          </View>

        </View>

      </View>
    );
  };

  // LOADING

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator
          size="large"
          color={COLORS.primary}
        />

        <Text style={styles.loadingText}>
          Cargando productos...
        </Text>
      </View>
    );
  }

  // PANTALLA

  return (
    <View style={styles.container}>

      {/* CABECERA DEL CATÁLOGO */}

      <View style={styles.topSection}>

        {/* BUSCADOR */}

        <View style={styles.searchContainer}>

          <Ionicons
            name="search-outline"
            size={19}
            color={COLORS.gray}
          />

          <TextInput
            style={styles.searchInput}
            placeholder="Buscar productos..."
            placeholderTextColor={COLORS.gray}
            value={busqueda}
            onChangeText={setBusqueda}
            maxLength={100}
          />

          {busqueda.length > 0 && (
            <TouchableOpacity
              onPress={limpiarBusqueda}
            >
              <Ionicons
                name="close-circle"
                size={18}
                color={COLORS.gray}
              />
            </TouchableOpacity>
          )}

          {/* BOTÓN FILTROS */}

          <TouchableOpacity
            style={styles.filterIconButton}
            onPress={() => setMostrarFiltros(true)}
          >
            <Ionicons
              name="options-outline"
              size={19}
              color={COLORS.black}
            />
          </TouchableOpacity>

        </View>

        {/* BOTONES */}

        <View style={styles.toolsRow}>

          {/* CATEGORÍAS */}

          <TouchableOpacity
            style={styles.categoriesButton}
            onPress={() => setMostrarCategorias(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="grid-outline" size={17} color={COLORS.primary} />
            <Text style={styles.categoriesButtonText}>Categorías</Text>
          </TouchableOpacity>

          {/* ORDENAR */}

          <TouchableOpacity
                      style={styles.orderButton}
                      onPress={() => setMostrarOrden(true)}
                      activeOpacity={0.8}
                    >
                      <Ionicons
                        name="swap-vertical-outline"
                        size={16}
                        color={COLORS.black}
                      />

                      <Text style={styles.orderText}>
                        {ordenSeleccionado}
                      </Text>

                      <Ionicons
                        name="chevron-down"
                        size={15}
                        color={COLORS.black}
                      />
                    </TouchableOpacity>

                  </View>

                </View>

      {/* RESULTADOS */}

      <View style={styles.resultsHeader}>
              <Text style={styles.resultsText}>
                {buscando ? (
                  'Buscando...'
                ) : (
                  <>
                    Mostrando{' '}
                    <Text style={styles.resultsNumber}>
                      {productosFiltrados.length}
                    </Text>{' '}
                    de {productos.length} productos
                  </>
                )}
              </Text>
            </View>

      {/* PRODUCTOS */}

      {productosFiltrados.length === 0 ? (

        <View style={styles.emptyContainer}>

          <Ionicons
            name="search-outline"
            size={50}
            color={COLORS.gray}
          />

          <Text style={styles.emptyTitle}>
            No encontramos productos
          </Text>

          <Text style={styles.emptyText}>
            Intenta con otro término de búsqueda.
          </Text>

        </View>

      ) : (

        <FlatList
          data={productosFiltrados}
          keyExtractor={(item) =>
            item.id_producto.toString()
          }
          renderItem={renderProducto}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.productList}
          showsVerticalScrollIndicator={false}
        />

      )}

{/* ============================================
          MODAL CATEGORÍAS
      ============================================ */}
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
              {/* Opción "Todos" */}
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

              {/* Categorías desde el backend */}
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

      {/* ============================================
          MODAL FILTROS
      ============================================ */}

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

              <TouchableOpacity
                onPress={() => setMostrarFiltros(false)}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={COLORS.black}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
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
                    value={precioMin}
                    onChangeText={setPrecioMin}
                  />
                </View>

                <View style={styles.priceInputContainer}>
                  <Text style={styles.priceLabel}>Máximo</Text>

                  <TextInput
                    style={styles.priceInput}
                    placeholder="$500.000"
                    placeholderTextColor={COLORS.gray}
                    keyboardType="numeric"
                    value={precioMax}
                    onChangeText={setPrecioMax}
                  />
                </View>
              </View>

              {/* MARCA */}
              <Text style={styles.filterTitle}>Marca</Text>

              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => abrirOpcionesFiltro('marca')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.selectText,
                    marcaSeleccionada && styles.selectTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {marcaSeleccionada || 'Seleccionar marca'}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={COLORS.gray}
                />
              </TouchableOpacity>

              {/* MATERIAL */}
              <Text style={styles.filterTitle}>Material</Text>

              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => abrirOpcionesFiltro('material')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.selectText,
                    materialSeleccionado && styles.selectTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {materialSeleccionado || 'Seleccionar material'}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={COLORS.gray}
                />
              </TouchableOpacity>

              {/* COLOR */}
              <Text style={styles.filterTitle}>Color</Text>

              <TouchableOpacity
                style={styles.selectButton}
                onPress={() => abrirOpcionesFiltro('color')}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.selectText,
                    colorSeleccionado && styles.selectTextActive,
                  ]}
                  numberOfLines={1}
                >
                  {colorSeleccionado || 'Seleccionar color'}
                </Text>

                <Ionicons
                  name="chevron-down"
                  size={18}
                  color={COLORS.gray}
                />
              </TouchableOpacity>

              {/* BOTONES */}
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.clearFiltersButton}
                  onPress={limpiarFiltros}
                  activeOpacity={0.8}
                >
                  <Text style={styles.clearFiltersText}>
                    Limpiar
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.applyFiltersButton}
                  onPress={aplicarFiltros}
                  activeOpacity={0.8}
                >
                  <Text style={styles.applyFiltersText}>
                    Aplicar filtros
                  </Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================
          MODAL OPCIONES DE FILTRO
      ============================================ */}

      <Modal
        visible={mostrarOpcionesFiltro}
        transparent
        animationType="slide"
        onRequestClose={() => {
          setMostrarOpcionesFiltro(false);
          setTipoFiltroOpciones(null);
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.filterModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {obtenerNombreFiltro()}
              </Text>

              <TouchableOpacity
                onPress={() => {
                  setMostrarOpcionesFiltro(false);
                  setTipoFiltroOpciones(null);
                }}
              >
                <Ionicons
                  name="close"
                  size={24}
                  color={COLORS.black}
                />
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.optionsScroll}
            >
              {/* Sin filtro */}
              <TouchableOpacity
                style={styles.categoriaItem}
                onPress={() => seleccionarOpcionFiltro('')}
                activeOpacity={0.8}
              >
                <Text style={styles.categoriaItemText}>
                  Todos
                </Text>

                {((tipoFiltroOpciones === 'marca' &&
                  marcaSeleccionada === '') ||
                  (tipoFiltroOpciones === 'material' &&
                    materialSeleccionado === '') ||
                  (tipoFiltroOpciones === 'color' &&
                    colorSeleccionado === '')) && (
                  <Ionicons
                    name="checkmark"
                    size={20}
                    color={COLORS.primary}
                  />
                )}
              </TouchableOpacity>

              {opcionesFiltroActual.map((opcion) => {
                const seleccionada =
                  (tipoFiltroOpciones === 'marca' &&
                    marcaSeleccionada === opcion) ||
                  (tipoFiltroOpciones === 'material' &&
                    materialSeleccionado === opcion) ||
                  (tipoFiltroOpciones === 'color' &&
                    colorSeleccionado === opcion);

                return (
                  <TouchableOpacity
                    key={opcion}
                    style={[
                      styles.categoriaItem,
                      seleccionada && styles.categoriaItemActive,
                    ]}
                    onPress={() => seleccionarOpcionFiltro(opcion)}
                    activeOpacity={0.8}
                  >
                    <Text
                      style={[
                        styles.categoriaItemText,
                        seleccionada &&
                          styles.categoriaItemTextActive,
                      ]}
                    >
                      {opcion}
                    </Text>

                    {seleccionada && (
                      <Ionicons
                        name="checkmark"
                        size={20}
                        color={COLORS.primary}
                      />
                    )}
                  </TouchableOpacity>
                );
              })}

              {opcionesFiltroActual.length === 0 && (
                <Text style={styles.noOptionsText}>
                  No hay opciones disponibles.
                </Text>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ============================================
                MODAL ORDENAMIENTO
            ============================================ */}

            <Modal
              visible={mostrarOrden}
              transparent
              animationType="slide"
              onRequestClose={() => setMostrarOrden(false)}
            >
              <View style={styles.modalOverlay}>
                <View style={styles.filterModal}>
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Ordenar por</Text>
                    <TouchableOpacity onPress={() => setMostrarOrden(false)}>
                      <Ionicons name="close" size={24} color={COLORS.black} />
                    </TouchableOpacity>
                  </View>

                  {[
                    { label: 'Nuevo', value: 'Nuevo' },
                    { label: 'Precio: menor a mayor', value: 'Precio: menor a mayor' },
                    { label: 'Precio: mayor a menor', value: 'Precio: mayor a menor' },
                    { label: 'Nombre A-Z', value: 'Nombre A-Z' },
                  ].map((opcion) => (
                    <TouchableOpacity
                      key={opcion.value}
                      style={[
                        styles.categoriaItem,
                        ordenSeleccionado === opcion.value && styles.categoriaItemActive,
                      ]}
                      onPress={() => ordenarProductos(opcion.value)}
                    >
                      <Text
                        style={[
                          styles.categoriaItemText,
                          ordenSeleccionado === opcion.value && styles.categoriaItemTextActive,
                        ]}
                      >
                        {opcion.label}
                      </Text>
                      {ordenSeleccionado === opcion.value && (
                        <Ionicons name="checkmark" size={20} color={COLORS.primary} />
                      )}
                    </TouchableOpacity>
                  ))}
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },

  categoriesButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.primary,
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 5,
  },

  categoriesButtonText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
  },

  orderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D7D7D7',
    borderRadius: 9,
    paddingHorizontal: 10,
    paddingVertical: 7,
    gap: 4,
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
    width: '48.5%',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  imageContainer: {
    height: 135,
    backgroundColor: '#FAFAFA',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },

  productImage: {
    width: '92%',
    height: '92%',
  },

  noImage: {
    alignItems: 'center',
    justifyContent: 'center',
  },

  newBadge: {
    position: 'absolute',
    top: 7,
    left: 7,
    backgroundColor: COLORS.primary,
    borderRadius: 7,
    paddingHorizontal: 7,
    paddingVertical: 3,
  },

  newBadgeText: {
    color: COLORS.white,
    fontSize: 9,
    fontWeight: '700',
  },

  productInfo: {
    padding: 9,
  },

  productName: {
    fontSize: 13,
    color: COLORS.black,
    fontWeight: '700',
    lineHeight: 17,
  },

  productBrand: {
    fontSize: 11,
    color: COLORS.text,
    marginTop: 3,
  },

  productCategory: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 2,
  },

  productPrice: {
    color: COLORS.primary,
    fontSize: 15,
    fontWeight: '800',
    marginTop: 5,
  },

  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 6,
  },

  detailButton: {
    flex: 1,
    height: 34,
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },

  detailButtonText: {
    fontSize: 10,
    color: COLORS.black,
    fontWeight: '600',
  },

  cartButton: {
    width: 35,
    height: 34,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
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

  selectTextActive: {
    color: COLORS.black,
    fontWeight: '600',
  },

  optionsScroll: {
    maxHeight: 360,
  },

  noOptionsText: {
    textAlign: 'center',
    color: COLORS.gray,
    fontSize: 13,
    paddingVertical: 25,
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