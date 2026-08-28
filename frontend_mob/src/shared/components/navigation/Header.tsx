// src/shared/components/navigation/Header.tsx
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
import { useAuth } from '../../../features/auth/context/AuthContext';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  admin?: boolean;
}

export const Header = () => {
  const navigation = useNavigation();
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const getRoles = (): string[] => {
    if (!user) return [];

    let rolesArray: string[] = [];
    if (Array.isArray(user.roles)) {
      rolesArray = user.roles.map((role: any) => {
        if (typeof role === 'string') return role;
        return role?.nombre || role?.rol || role?.name || '';
      });
    } else if (typeof user.roles === 'string') {
      rolesArray = [user.roles];
    } else if ((user as any).rol) {
      rolesArray = [(user as any).rol];
    }
    return rolesArray.filter(Boolean).map((role) => role.toUpperCase());
  };

  const getMainRole = (): string => {
    const roles = getRoles();
    if (roles.includes('ADMIN') || roles.includes('ADMINISTRADOR')) return 'ADMIN';
    if (roles.includes('REPARTIDOR')) return 'REPARTIDOR';
    if (roles.includes('CLIENTE')) return 'CLIENTE';
    return '';
  };

  const goToHome = () => {
    setSidebarOpen(false);
    const role = getMainRole();

    if (!isAuthenticated || !user) {
      navigation.navigate('Principal' as never);
      return;
    }

    if (role === 'ADMIN') {
      navigation.navigate('PrincipalAdmin' as never);
      return;
    }

    if (role === 'REPARTIDOR') {
      navigation.navigate('PrincipalRepartidor' as never);
      return;
    }

    if (role === 'CLIENTE') {
      navigation.navigate('PrincipalCliente' as never);
      return;
    }

    navigation.navigate('Principal' as never);
  };

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            try {
              await logout();
              setSidebarOpen(false);
              navigation.navigate('Iniciosesion' as never);
            } catch (error) {
              console.error('Error al cerrar sesión:', error);
            }
          },
        },
      ]
    );
  };

 const getMenuItems = (): MenuItem[] => {
  const items: MenuItem[] = [];

  // INICIO - SIEMPRE VISIBLE
  items.push({
    id: 'home',
    label: 'Inicio',
    icon: 'home-outline',
    route: 'Principal',
  });

  // CONTACTO - Solo para NO autenticados y CLIENTES
  const role = getMainRole();
  const esCliente = role === 'CLIENTE';

  if (!isAuthenticated || esCliente) {
    items.push({
      id: 'contacto',
      label: 'Enviar mensaje de contacto',
      icon: 'chatbubble-outline',
      route: 'Contacto',
    });
  }

  // SI ESTA AUTENTICADO
  if (isAuthenticated && user) {
    const role = getMainRole();

    // ADMINISTRADOR
    if (role === 'ADMIN') {
      items.push({
        id: 'admin-dashboard',
        label: 'Dashboard',
        icon: 'stats-chart-outline',
        route: 'PrincipalAdmin',
        admin: true,
      });
      items.push({
        id: 'admin-inventario',
        label: 'Inventario',
        icon: 'cube-outline',
        route: 'CatalogoAdmin',
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
        route: 'DashboardRepartidores',
        admin: true,
      });
      items.push({
        id: 'admin-reportes',
        label: 'Reportes',
        icon: 'pie-chart-outline',
        route: 'AdminReportes',
        admin: true,
      });
    }

    // REPARTIDOR
    else if (role === 'REPARTIDOR') {
      items.push({
        id: 'repartidor-historial',
        label: 'Historial',
        icon: 'time-outline',
        route: 'PrincipalRepartidor',
      });
    }

    // CLIENTE
    else if (role === 'CLIENTE') {
      items.push({
        id: 'catalogo',
        label: 'Productos',
        icon: 'eye-outline',
        route: 'CatalogoCliente',
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

    // PERFIL (para todos los autenticados)
    items.push({
      id: 'perfil',
      label: 'Mi Perfil',
      icon: 'person-outline',
      route: 'PerfilCliente',
    });
  }

  return items;
};


  const menuItems = getMenuItems();

  const handleMenuNavigation = (route: string) => {
    setSidebarOpen(false);
    if (route === 'Principal') {
      goToHome();
      return;
    }
    navigation.navigate(route as never);
  };

  return (
    <>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          onPress={() => setSidebarOpen(true)}
          style={styles.headerButton}
          activeOpacity={0.7}
        >
          <Ionicons name="menu-outline" size={28} color={COLORS.white} />
        </TouchableOpacity>

        <TouchableOpacity
          onPress={goToHome}
          activeOpacity={0.8}
          style={styles.logoContainer}
        >
          <Image
            source={require('../../../../assets/img/logo2.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <View style={styles.headerRight}>
          {isAuthenticated ? (
            <TouchableOpacity
              onPress={handleLogout}
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={25} color={COLORS.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              onPress={() => navigation.navigate('Iniciosesion' as never)}
              style={styles.headerButton}
              activeOpacity={0.7}
            >
              <Ionicons name="person-circle-outline" size={28} color={COLORS.white} />
            </TouchableOpacity>
          )}
        </View>
      </View>

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
            <ScrollView showsVerticalScrollIndicator={false}>
              <View style={styles.sidebarHeader}>
                <Image
                  source={require('../../../../assets/img/logo2.jpeg')}
                  style={styles.sidebarLogo}
                  resizeMode="contain"
                />
                {isAuthenticated && user && (
                  <View style={styles.userInfo}>
                    <Text style={styles.userName} numberOfLines={1}>
                      {user.nombre_completo}
                    </Text>
                    <Text style={styles.userRole}>
                      {getMainRole() === 'ADMIN'
                        ? 'Administrador'
                        : getMainRole() === 'REPARTIDOR'
                        ? 'Repartidor'
                        : 'Cliente'}
                    </Text>
                  </View>
                )}
              </View>

              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.sidebarItem}
                  onPress={() => handleMenuNavigation(item.route)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={item.icon as any} size={21} color={COLORS.primary} />
                  <Text style={styles.sidebarItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}

              {isAuthenticated && (
                <>
                  <View style={styles.sidebarDivider} />
                  <TouchableOpacity
                    style={[styles.sidebarItem, styles.sidebarItemLogout]}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="log-out-outline" size={21} color={COLORS.primary} />
                    <Text style={styles.sidebarItemText}>Cerrar sesión</Text>
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
    backgroundColor: COLORS.black,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 15,
    paddingVertical: 10,
    minHeight: 60,
  },
  headerButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 50,
    height: 50,
  },
  headerRight: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    backgroundColor: COLORS.black,
    paddingVertical: 10,
  },
  sidebarHeader: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sidebarLogo: {
    width: 65,
    height: 65,
    marginBottom: 8,
  },
  userInfo: {
    marginTop: 2,
  },
  userName: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
  },
  userRole: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '600',
    marginTop: 3,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sidebarItemText: {
    color: COLORS.white,
    fontSize: 15,
    marginLeft: 12,
  },
  sidebarDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#444',
    marginVertical: 10,
  },
  sidebarItemLogout: {
    borderBottomWidth: 0,
    marginTop: 5,
  },
});