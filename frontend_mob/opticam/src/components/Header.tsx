// src/components/Header.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';

const { width } = Dimensions.get('window');

export const Header = () => {
  const navigation = useNavigation();
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar Sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar Sesión',
          style: 'destructive',
          onPress: () => {
            logout();
            navigation.navigate('Login' as never);
            setSidebarOpen(false);
          }
        }
      ]
    );
  };

  // ✅ Función para obtener los items del menú según el rol
  const getMenuItems = () => {
    const items = [];

    // Items públicos (siempre visibles)
    items.push({
      id: 'home',
      label: 'Inicio',
      icon: 'home-outline',
      route: 'Home',
    });

    // Si está autenticado, mostrar más opciones
    if (isAuthenticated && user) {
      // Obtener roles de forma segura
      let rolesArray: string[] = [];
      if (Array.isArray(user.roles)) {
        rolesArray = user.roles;
      } else if (typeof user.roles === 'string') {
        rolesArray = [user.roles];
      } else if (user.rol) {
        rolesArray = [user.rol];
      }
      rolesArray = rolesArray.map((r) => r.toUpperCase());

      // Opciones según rol
      if (rolesArray.includes('ADMIN') || rolesArray.includes('ADMINISTRADOR')) {
        items.push({
          id: 'admin-dashboard',
          label: 'Dashboard',
          icon: 'stats-chart-outline',
          route: 'AdminDashboard',
          admin: true,
        });
        items.push({
          id: 'admin-inventario',
          label: 'Inventario',
          icon: 'cube-outline',
          route: 'AdminInventario',
          admin: true,
        });
        items.push({
          id: 'admin-pedidos',
          label: 'Pedidos',
          icon: 'cart-outline',
          route: 'AdminPedidos',
          admin: true,
        });
        items.push({
          id: 'admin-repartidores',
          label: 'Repartidores',
          icon: 'bicycle-outline',
          route: 'AdminRepartidores',
          admin: true,
        });
        items.push({
          id: 'admin-reportes',
          label: 'Reportes',
          icon: 'pie-chart-outline',
          route: 'AdminReportes',
          admin: true,
        });
      } else if (rolesArray.includes('REPARTIDOR')) {
        items.push({
          id: 'repartidor-historial',
          label: 'Historial',
          icon: 'time-outline',
          route: 'RepartidorHistorial',
        });
      } else if (rolesArray.includes('CLIENTE')) {
        items.push({
          id: 'catalogo',
          label: 'Productos',
          icon: 'eye-outline',
          route: 'Catalogo',
        });
        items.push({
          id: 'carrito',
          label: 'Carrito',
          icon: 'cart-outline',
          route: 'Carrito',
        });
        items.push({
          id: 'control-pedido',
          label: 'Mis Pedidos',
          icon: 'cube-outline',
          route: 'ControlPedido',
        });
      }

      // ✅ Opción "Mi Perfil" para TODOS los usuarios autenticados
      items.push({
        id: 'perfil',
        label: 'Mi Perfil',
        icon: 'person-outline',
        route: 'PerfilCliente',
      });

      // ✅ Opción "Cerrar Sesión" (se maneja aparte)
    }

    return items;
  };

  const menuItems = getMenuItems();

  return (
    <>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => setSidebarOpen(true)}>
          <Ionicons name="menu-outline" size={28} color="#fff" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => navigation.navigate('Home' as never)}>
          <Image
            source={require('../../assets/img/logo2.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          {isAuthenticated ? (
            <TouchableOpacity onPress={handleLogout}>
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={() => navigation.navigate('Login' as never)}>
              <Ionicons name="person-circle-outline" size={28} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sidebar */}
      <Modal
        visible={sidebarOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setSidebarOpen(false)}
      >
        <SafeAreaView style={styles.sidebarOverlay}>
          <TouchableOpacity
            style={styles.sidebarBackdrop}
            activeOpacity={1}
            onPress={() => setSidebarOpen(false)}
          />
          <View style={styles.sidebarContainer}>
            <ScrollView>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.sidebarItem}
                  onPress={() => {
                    setSidebarOpen(false);
                    navigation.navigate(item.route as never);
                  }}
                >
                  <Ionicons name={item.icon as any} size={20} color="#B90F0F" />
                  <Text style={styles.sidebarItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}

              {/* Separador y Cerrar Sesión */}
              {isAuthenticated && (
                <>
                  <View style={styles.sidebarDivider} />
                  <TouchableOpacity
                    style={[styles.sidebarItem, styles.sidebarItemLogout]}
                    onPress={handleLogout}
                  >
                    <Ionicons name="log-out-outline" size={20} color="#B90F0F" />
                    <Text style={styles.sidebarItemText}>Cerrar Sesión</Text>
                  </TouchableOpacity>
                </>
              )}
            </ScrollView>
          </View>
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  headerContainer: {
    backgroundColor: '#000',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    minHeight: 60,
  },
  logo: {
    width: 50,
    height: 50,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  sidebarOverlay: {
    flex: 1,
    flexDirection: 'row',
  },
  sidebarBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  sidebarContainer: {
    width: 280,
    backgroundColor: '#000',
    paddingVertical: 10,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sidebarItemLogout: {
    borderBottomWidth: 0,
    marginTop: 5,
  },
  sidebarItemText: {
    color: '#fff',
    fontSize: 15,
    marginLeft: 12,
  },
  sidebarDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    marginVertical: 10,
  },
});
