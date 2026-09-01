// src/features/client/screens/CarritoCliente.tsx

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../auth/context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { COLORS } from '../../../shared/constants/colors';

interface CarritoItem {
  id: number;
  id_producto: number;
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
  const { user } = useAuth();
  const [carrito, setCarrito] = useState<CarritoItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [seleccionarTodos, setSeleccionarTodos] = useState(false);

  const CARRITO_KEY = '@carrito';
  const USUARIO_KEY = '@ultimo_usuario_id';

  // ===== CARGAR CARRITO =====
  const cargarCarrito = async () => {
    try {
      setLoading(true);
      if (user?.id_usuario) {
        const storedUserId = await AsyncStorage.getItem(USUARIO_KEY);
        const userId = String(user.id_usuario);

        if (storedUserId && storedUserId !== userId) {
          console.log(' Usuario diferente, limpiando carrito');
          await AsyncStorage.removeItem(CARRITO_KEY);
          await AsyncStorage.removeItem('carrito_seleccionado');
        }

        await AsyncStorage.setItem(USUARIO_KEY, userId);
      }

      const carritoGuardado = await AsyncStorage.getItem(CARRITO_KEY);
      const datos = carritoGuardado ? JSON.parse(carritoGuardado) : [];

      console.log(' Productos del carrito:', datos);

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

  // ===== GUARDAR CARRITO =====
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

  // ===== RECARGAR AL VOLVER A LA PANTALLA =====
  useFocusEffect(
    useCallback(() => {
      cargarCarrito();
    }, [])
  );

  // ===== SELECCIONAR TODOS =====
  const toggleSeleccionarTodos = () => {
    const nuevoEstado = !seleccionarTodos;
    setSeleccionarTodos(nuevoEstado);
    const nuevoCarrito = carrito.map((item) => ({ ...item, seleccionado: nuevoEstado }));
    guardarCarrito(nuevoCarrito);
  };

  // ===== SELECCIONAR UN PRODUCTO =====
  const toggleSeleccionItem = (id: number) => {
    const nuevoCarrito = carrito.map((item) =>
      item.id === id ? { ...item, seleccionado: !item.seleccionado } : item
    );
    guardarCarrito(nuevoCarrito);
  };

  // ===== CAMBIAR CANTIDAD =====
  const cambiarCantidad = (id: number, delta: number) => {
    const nuevoCarrito = carrito.map((item) =>
      item.id === id ? { ...item, cantidad: Math.max(1, item.cantidad + delta) } : item
    );
    guardarCarrito(nuevoCarrito);
  };

  // ===== ELIMINAR PRODUCTO =====
  const eliminarItem = (id: number) => {
    const producto = carrito.find((item) => item.id === id);
    Alert.alert(
      'Eliminar producto',
      `¿Eliminar "${producto?.nombre}" del carrito?`,
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

  // ===== ELIMINAR SELECCIONADOS =====
  const eliminarSeleccionados = () => {
    const seleccionados = carrito.filter((item) => item.seleccionado);
    if (seleccionados.length === 0) {
      Alert.alert('Info', 'No hay productos seleccionados');
      return;
    }
    Alert.alert(
      'Eliminar seleccionados',
      `¿Eliminar ${seleccionados.length} producto(s) seleccionado(s)?`,
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

  // ===== VACIAR CARRITO =====
  const vaciarCarrito = () => {
    if (carrito.length === 0) {
      Alert.alert('Info', 'El carrito ya está vacío');
      return;
    }
    Alert.alert(
      'Vaciar carrito',
      '¿Eliminar todos los productos del carrito?',
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

  // ===== IR AL CATÁLOGO =====
  const irAlCatalogo = () => {
    navigation.navigate('CatalogoCliente' as never);
  };

  // ===== IR A CREAR PEDIDO =====
  const irACrearPedido = () => {
    const productosSeleccionados = carrito.filter((item) => item.seleccionado);

    if (productosSeleccionados.length === 0) {
      Alert.alert('Error', 'Selecciona al menos un producto para continuar');
      return;
    }

    AsyncStorage.setItem('carrito_seleccionado', JSON.stringify(productosSeleccionados));
    navigation.navigate('CrearPedidoCliente' as never);
  };

  // ===== CALCULAR TOTAL =====
  const productosSeleccionados = carrito.filter((item) => item.seleccionado);
  const total = productosSeleccionados.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
  const totalItems = carrito.reduce((sum, item) => sum + (item.cantidad || 1), 0);

  // ===== LOADING =====
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Cargando carrito...</Text>
      </View>
    );
  }

  // ===== ERROR =====
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

  // ===== CARRITO VACÍO =====
  if (carrito.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="cart-outline" size={80} color="#CCCCCC" />
        <Text style={styles.emptyTitle}>Tu carrito está vacío</Text>
        <Text style={styles.emptyText}>Agrega productos desde la tienda</Text>
        <TouchableOpacity style={styles.emptyButton} onPress={irAlCatalogo}>
          <Text style={styles.emptyButtonText}>Seguir comprando</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // ===== PANTALLA DEL CARRITO =====
  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Mi Carrito</Text>
        <Text style={styles.headerSubtitle}>
          {totalItems} {totalItems === 1 ? 'producto' : 'productos'}
        </Text>
      </View>

      {/* TOOLBAR */}
      <View style={styles.toolbar}>
        <TouchableOpacity style={styles.selectAllButton} onPress={toggleSeleccionarTodos}>
          <View style={[styles.checkbox, seleccionarTodos && styles.checkboxActive]}>
            {seleccionarTodos && <Ionicons name="checkmark" size={14} color="#fff" />}
          </View>
          <Text style={styles.selectAllText}>Seleccionar todos</Text>
        </TouchableOpacity>

        <View style={styles.toolbarActions}>
          <TouchableOpacity style={styles.toolbarButton} onPress={eliminarSeleccionados}>
            <Ionicons name="trash-outline" size={16} color={COLORS.error} />
            <Text style={[styles.toolbarButtonText, { color: COLORS.error }]}>Eliminar</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.toolbarButton} onPress={vaciarCarrito}>
            <Ionicons name="trash-bin-outline" size={16} color="#666" />
            <Text style={[styles.toolbarButtonText, { color: '#666' }]}>Vaciar</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* LISTA DE PRODUCTOS */}
      <FlatList
        data={carrito}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={[styles.itemCard, item.seleccionado && styles.itemCardSelected]}>
            <TouchableOpacity onPress={() => toggleSeleccionItem(item.id)} style={styles.itemCheckbox}>
              <View style={[styles.checkbox, item.seleccionado && styles.checkboxActive]}>
                {item.seleccionado && <Ionicons name="checkmark" size={12} color="#fff" />}
              </View>
            </TouchableOpacity>

            <Image
              source={{ uri: item.imagen || 'https://via.placeholder.com/80' }}
              style={styles.itemImage}
              resizeMode="contain"
            />

            <View style={styles.itemInfo}>
              <Text style={styles.itemName} numberOfLines={1}>{item.nombre}</Text>
              <View style={styles.itemTags}>
                <Text style={styles.itemTag}>{item.color || 'Sin color'}</Text>
                <Text style={styles.itemTag}>{item.material || 'Sin material'}</Text>
              </View>
              <Text style={styles.itemPrice}>${item.precio.toLocaleString()} c/u</Text>
            </View>

            <View style={styles.itemRight}>
              <View style={styles.itemQuantity}>
                <TouchableOpacity
                  style={[styles.qtyButton, item.cantidad <= 1 && styles.qtyButtonDisabled]}
                  onPress={() => cambiarCantidad(item.id, -1)}
                  disabled={item.cantidad <= 1}
                >
                  <Ionicons name="remove" size={16} color={item.cantidad <= 1 ? '#ccc' : '#333'} />
                </TouchableOpacity>
                <Text style={styles.qtyText}>{item.cantidad}</Text>
                <TouchableOpacity
                  style={styles.qtyButton}
                  onPress={() => cambiarCantidad(item.id, 1)}
                >
                  <Ionicons name="add" size={16} color="#333" />
                </TouchableOpacity>
              </View>

              <Text style={styles.itemSubtotal}>
                ${(item.precio * item.cantidad).toLocaleString()}
              </Text>

              <TouchableOpacity onPress={() => eliminarItem(item.id)} style={styles.deleteButton}>
                <Ionicons name="close" size={18} color="#999" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      {/* FOOTER */}
      <View style={styles.footer}>
        <View style={styles.footerLeft}>
          <Text style={styles.footerSelected}>
            {productosSeleccionados.length} de {totalItems} seleccionados
          </Text>
          <TouchableOpacity onPress={irAlCatalogo}>
            <Text style={styles.footerContinue}>Seguir comprando</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.footerRight}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalAmount}>${total.toLocaleString()}</Text>
          <TouchableOpacity
            style={[styles.payButton, productosSeleccionados.length === 0 && styles.payButtonDisabled]}
            onPress={irACrearPedido}
            disabled={productosSeleccionados.length === 0}
          >
            <Text style={styles.payButtonText}>Crear pedido</Text>
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
    backgroundColor: '#F5F5F5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: '#999',
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
    backgroundColor: '#F5F5F5',
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
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#999',
  },
  toolbar: {
    backgroundColor: '#FAFAFA',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  selectAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  selectAllText: {
    fontSize: 13,
    color: '#666',
  },
  checkbox: {
    width: 18,
    height: 18,
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
    gap: 14,
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
    paddingBottom: 130,
  },
  itemCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  itemCardSelected: {
    borderColor: COLORS.primary,
    backgroundColor: '#FFF5F5',
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
    marginRight: 8,
  },
  itemName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  itemTags: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 2,
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
    fontWeight: '500',
    marginTop: 2,
  },
  itemRight: {
    alignItems: 'flex-end',
    gap: 4,
  },
  itemQuantity: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  qtyButton: {
    width: 26,
    height: 26,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  qtyButtonDisabled: {
    opacity: 0.4,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '600',
    minWidth: 22,
    textAlign: 'center',
    color: '#1A1A1A',
  },
  itemSubtotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  deleteButton: {
    padding: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 4,
  },
  footerLeft: {
    flex: 1,
  },
  footerSelected: {
    fontSize: 12,
    color: '#999',
  },
  footerContinue: {
    fontSize: 13,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  footerRight: {
    alignItems: 'flex-end',
  },
  totalLabel: {
    fontSize: 12,
    color: '#999',
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
  },
  payButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    marginTop: 4,
  },
  payButtonDisabled: {
    opacity: 0.5,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 13,
  },
  payHint: {
    fontSize: 10,
    color: COLORS.error,
    marginTop: 2,
    textAlign: 'center',
  },
});