// src/features/client/screens/CarritoCliente.tsx
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../shared/';

interface CarritoItem {
  id: number;
  nombre: string;
  precio: number;
  cantidad: number;
  imagen: string;
  color?: string;
  material?: string;
  seleccionado: boolean;
}

export const CarritoCliente = () => {
  const navigation = useNavigation();
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seleccionarTodos, setSeleccionarTodos] = useState(false);
  const [procesandoPago, setProcesandoPago] = useState(false);

  const CARRITO_KEY = '@carrito';

  const cargarCarrito = async () => {
    try {
      setLoading(true);
      const carritoGuardado = await AsyncStorage.getItem(CARRITO_KEY);
      const datos = carritoGuardado ? JSON.parse(carritoGuardado) : [];
      
      const carritoConSeleccion = datos.map((item: CarritoItem) => ({
        ...item,
        seleccionado: item.seleccionado !== undefined ? item.seleccionado : true,
      }));
      
      setCarrito(carritoConSeleccion);
      
      if (carritoConSeleccion.length > 0) {
        setSeleccionarTodos(carritoConSeleccion.every((item: CarritoItem) => item.seleccionado));
      }
      
      setError(null);
    } catch (err) {
      console.error('Error al cargar carrito:', err);
      setError('Error al cargar el carrito');
    } finally {
      setLoading(false);
    }
  };

  const guardarCarrito = async (nuevoCarrito: CarritoItem[]) => {
    try {
      await AsyncStorage.setItem(CARRITO_KEY, JSON.stringify(nuevoCarrito));
      setCarrito(nuevoCarrito);
      
      if (nuevoCarrito.length > 0) {
        setSeleccionarTodos(nuevoCarrito.every((item) => item.seleccionado));
      } else {
        setSeleccionarTodos(false);
      }
    } catch (error) {
      console.error('Error al guardar carrito:', error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      cargarCarrito();
    }, [])
  );

  const toggleSeleccionarTodos = () => {
    const nuevoEstado = !seleccionarTodos;
    setSeleccionarTodos(nuevoEstado);
    const nuevoCarrito = carrito.map((item) => ({ ...item, seleccionado: nuevoEstado }));
    guardarCarrito(nuevoCarrito);
  };

  const toggleSeleccionItem = (id: number) => {
    const nuevoCarrito = carrito.map((item) =>
      item.id === id ? { ...item, seleccionado: !item.seleccionado } : item
    );
    guardarCarrito(nuevoCarrito);
  };

  const cambiarCantidad = (id: number, delta: number) => {
    const nuevoCarrito = carrito.map((item) =>
      item.id === id ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item
    );
    guardarCarrito(nuevoCarrito);
  };

  const eliminarItem = (id: number) => {
    const producto = carrito.find((item) => item.id === id);
    Alert.alert(
      'Eliminar producto',
      `Eliminar "${producto?.nombre}" del carrito?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const nuevoCarrito = carrito.filter((item) => item.id !== id);
            guardarCarrito(nuevoCarrito);
          },
        },
      ]
    );
  };

  const eliminarSeleccionados = () => {
    const seleccionados = carrito.filter((item) => item.seleccionado);
    if (seleccionados.length === 0) {
      Alert.alert('Info', 'No hay productos seleccionados');
      return;
    }
    Alert.alert(
      'Eliminar seleccionados',
      `Eliminar ${seleccionados.length} producto(s) seleccionado(s)?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            const nuevoCarrito = carrito.filter((item) => !item.seleccionado);
            guardarCarrito(nuevoCarrito);
          },
        },
      ]
    );
  };

  const vaciarCarrito = () => {
    if (carrito.length === 0) {
      Alert.alert('Info', 'El carrito ya esta vacio');
      return;
    }
    Alert.alert(
      'Vaciar carrito',
      'Eliminar todos los productos del carrito?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Vaciar',
          style: 'destructive',
          onPress: () => {
            guardarCarrito([]);
          },
        },
      ]
    );
  };

  const irAlCatalogo = () => {
    navigation.navigate('CatalogoCliente' as never);
  };

  const procesarPago = async () => {
    const productosSeleccionados = carrito.filter((item) => item.seleccionado);
    
    if (productosSeleccionados.length === 0) {
      Alert.alert('Error', 'Selecciona al menos un producto para continuar');
      return;
    }

    setProcesandoPago(true);

    try {
      await AsyncStorage.setItem('carrito_compra', JSON.stringify(productosSeleccionados));
      const total = productosSeleccionados.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
      await AsyncStorage.setItem('total_compra', JSON.stringify(total));

      navigation.navigate('Checkout' as never);
    } catch (err) {
      console.error('Error al procesar pago:', err);
      Alert.alert('Error', 'Error al procesar el pago. Intenta nuevamente.');
    } finally {
      setProcesandoPago(false);
    }
  };

  const productosSeleccionados = carrito.filter((item) => item.seleccionado);
  const total = productosSeleccionados.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando carrito...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={cargarCarrito}>
          <Text style={styles.retryText}>Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (carrito.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="#CCCCCC" />
        <Text style={styles.emptyTitle}>Tu carrito esta vacio</Text>
        <Text style={styles.emptyText}>Agrega productos desde la tienda</Text>
        <TouchableOpacity style={styles.emptyButton} onPress={irAlCatalogo}>
          <Text style={styles.emptyButtonText}>Seguir comprando</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        <Text style={styles.headerSubtitle}>
          {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
        </Text>
      </View>

      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.selectAllButton} onPress={toggleSeleccionarTodos}>
          <View style={[styles.checkbox, seleccionarTodos && styles.checkboxActive]}>
            {seleccionarTodos && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <Text style={styles.selectAllText}>Seleccionar todos</Text>
        </TouchableOpacity>

        <View style={styles.toolbarActions}>
          <TouchableOpacity style={styles.toolbarButton} onPress={eliminarSeleccionados}>
            <Ionicons name="trash-outline" size={18} color={COLORS.error} />
            <Text style={[styles.toolbarButtonText, { color: COLORS.error }]}>
              Eliminar seleccionados
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={vaciarCarrito}>
            <Ionicons name="broom-outline" size={18} color="#666" />
            <Text style={[styles.toolbarButtonText, { color: '#666' }]}>Vaciar</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={carrito}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.itemCard, item.seleccionado && styles.itemCardSelected]}>
            <TouchableOpacity onPress={() => toggleSeleccionItem(item.id)} style={styles.itemCheckbox}>
              <View style={[styles.checkbox, item.seleccionado && styles.checkboxActive]}>
                {item.seleccionado && <Ionicons name="checkmark" size={14} color="#fff" />}
              </View>
            </TouchableOpacity>

            <Image
              source={{ uri: item.imagen || 'https://via.placeholder.com/80' }}
              style={styles.itemImage}
              resizeMode="contain"
            />

            <View style={styles.itemInfo}>
              <Text style={styles.itemName}>{item.nombre}</Text>
              <View style={styles.itemTags}>
                <Text style={styles.itemTag}>{item.color || 'Sin color'}</Text>
                <Text style={styles.itemTag}>{item.material || 'Sin material'}</Text>
              </View>
              <Text style={styles.itemPrice}>${item.precio.toLocaleString()} c/u</Text>
            </View>

            <View style={styles.itemQuantity}>
              <TouchableOpacity
                style={[styles.qtyButton, item.cantidad <= 1 && styles.qtyButtonDisabled]}
                onPress={() => cambiarCantidad(item.id, -1)}
                disabled={item.cantidad <= 1}
              >
                <Ionicons name="remove-outline" size={16} color={item.cantidad <= 1 ? '#ccc' : '#333'} />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{item.cantidad}</Text>
              <TouchableOpacity
                style={styles.qtyButton}
                onPress={() => cambiarCantidad(item.id, 1)}
              >
                <Ionicons name="add-outline" size={16} color="#333" />
              </TouchableOpacity>
            </View>

            <Text style={styles.itemSubtotal}>
              ${(item.precio * item.cantidad).toLocaleString()}
            </Text>

            <TouchableOpacity onPress={() => eliminarItem(item.id)} style={styles.deleteButton}>
              <Ionicons name="trash-outline" size={20} color="#999" />
            </TouchableOpacity>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.footer}>
        <View>
          <Text style={styles.footerSelected}>
            {productosSeleccionados.length} de {totalItems} productos seleccionados
          </Text>
          <TouchableOpacity onPress={irAlCatalogo}>
            <Text style={styles.footerContinue}>Seguir comprando</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerTotal}>
          <Text style={styles.totalLabel}>Total a pagar</Text>
          <Text style={styles.totalAmount}>${total.toLocaleString()}</Text>
          <TouchableOpacity
            style={[styles.payButton, (procesandoPago || productosSeleccionados.length === 0) && styles.payButtonDisabled]}
            onPress={procesarPago}
            disabled={procesandoPago || productosSeleccionados.length === 0}
          >
            {procesandoPago ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <Text style={styles.payButtonText}>Proceder al pago</Text>
            )}
          </TouchableOpacity>
          {productosSeleccionados.length === 0 && (
            <Text style={styles.payHint}>Selecciona al menos un producto</Text>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F7F7',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F7F7',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 10,
    borderRadius: 8,
  },
  retryText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
    marginTop: 16,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    marginTop: 8,
  },
  emptyButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 20,
  },
  emptyButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  header: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#333',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  toolbar: {
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllText: {
    fontSize: 14,
    color: '#666',
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: '#ccc',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toolbarActions: {
    flexDirection: 'row',
    gap: 16,
  },
  toolbarButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  toolbarButtonText: {
    fontSize: 12,
  },
  listContent: {
    padding: 12,
    paddingBottom: 120,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },
  itemCardSelected: {
    backgroundColor: '#F0FFF4',
    borderColor: '#B90F0F',
  },
  itemCheckbox: {
    marginRight: 10,
  },
  itemImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  itemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  itemTags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  itemTag: {
    fontSize: 10,
    color: '#999',
    backgroundColor: '#F0F0F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  itemPrice: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  itemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginHorizontal: 10,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyButtonDisabled: {
    opacity: 0.5,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 24,
    textAlign: 'center',
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#333',
    minWidth: 70,
    textAlign: 'right',
  },
  deleteButton: {
    padding: 6,
    marginLeft: 6,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FAFAFA',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerSelected: {
    fontSize: 12,
    color: '#999',
  },
  footerContinue: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 4,
  },
  footerTotal: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#999',
  },
  totalAmount: {
    fontSize: 22,
    fontWeight: '700',
    color: COLORS.primary,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginTop: 6,
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  payHint: {
    fontSize: 10,
    color: COLORS.error,
    marginTop: 4,
    textAlign: 'center',
  },
});