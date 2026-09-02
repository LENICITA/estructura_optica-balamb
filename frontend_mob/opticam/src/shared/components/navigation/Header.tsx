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
  StatusBar,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

// TIPOS
interface MenuItem {
  id: string;
  label: string;
  icon: string;
  route: string;
  admin?: boolean;
}

// HEADER
export const Header = () => {

  const navigation = useNavigation();

  const {
    user,
    logout,
    isAuthenticated,
  } = useAuth();

  const [sidebarOpen, setSidebarOpen] = useState(false);

  // OBTENER ROL DEL USUARIO

  const getRoles = (): string[] => {

    if (!user) {
      return [];
    }

    let rolesArray: string[] = [];
    if (Array.isArray(user.roles)) {
      rolesArray = user.roles.map((role: any) => {
        if (typeof role === 'string') {
          return role;
        }
        return (
          role?.nombre ||
          role?.rol ||
          role?.name ||
          ''
        );
      });

    }
    else if (typeof user.roles === 'string') {
      rolesArray = [user.roles];
    }
    else if ((user as any).rol) {
      rolesArray = [(user as any).rol];
    }
    return rolesArray
      .filter(Boolean)
      .map((role) => role.toUpperCase());
  };
  // OBTENER ROL PRINCIPAL

  const getMainRole = (): string => {

    const roles = getRoles();

    if (
      roles.includes('ADMIN') ||
      roles.includes('ADMINISTRADOR')
    ) {
      return 'ADMIN';
    }

    if (roles.includes('REPARTIDOR')) {
      return 'REPARTIDOR';
    }

    if (roles.includes('CLIENTE')) {
      return 'CLIENTE';
    }

    return '';
  };
  // IR AL INICIO SEGÚN ROL

  const goToHome = () => {

    setSidebarOpen(false);

    const role = getMainRole();

    // Usuario no autenticado
    if (!isAuthenticated || !user) {

      navigation.navigate(
        'Principal' as never
      );

      return;
    }

    // Administrador
    if (role === 'ADMIN') {

      navigation.navigate(
        'PrincipalAdmin' as never
      );

      return;
    }

    // Repartidor
    if (role === 'REPARTIDOR') {

      navigation.navigate(
        'PrincipalRepartidor' as never
      );

      return;
    }

    // Cliente
    if (role === 'CLIENTE') {

      navigation.navigate(
        'PrincipalCliente' as never
      );

      return;
    }

    // no tiene rol
    navigation.navigate(
      'Principal' as never
    );
  };

  // CERRAR SESIÓN

  const handleLogout = () => {

    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',

      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },

        {
          text: 'Cerrar sesión',
          style: 'destructive',

          onPress: async () => {

            try {

              await logout();

              setSidebarOpen(false);

              navigation.navigate(
                'Iniciosesion' as never
              );

            } catch (error) {

              console.error(
                'Error al cerrar sesión:',
                error
              );

            }

          },
        },
      ]
    );
  };

  // MENÚ

  const getMenuItems = (): MenuItem[] => {

    const items: MenuItem[] = [];

    // INICIO

    items.push({
      id: 'home',
      label: 'Inicio',
      icon: 'home-outline',
      route: 'Principal',
    });

const role = getMainRole();
  const esCliente = role === 'CLIENTE';

  if (!isAuthenticated || esCliente) {
    items.push({
      id: 'contacto',
      label: 'Enviar mensaje de contacto',
      icon: 'chatbubble-outline',
      route: 'ContactoScreen',
    });
  }

    // SI ESTÁ AUTENTICADO

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
          route: 'CarritoCliente',
        });


        items.push({
          id: 'control-pedido',
          label: 'Mis Pedidos',
          icon: 'cube-outline',
          route: 'MisPedidosCliente',
        });

      }

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


    navigation.navigate(
      route as never
    );
  };

  return (
    <>

    {/* ===============================================
            STATUS BAR
        =============================================== */}
        <StatusBar
          backgroundColor={COLORS.black}
          barStyle="light-content"
          translucent={false}
        />

      {/* ===============================================
          HEADER
      =============================================== */}

      <View style={styles.headerContainer}>

        {/* MENÚ */}

        <TouchableOpacity
          onPress={() => setSidebarOpen(true)}
          style={styles.headerButton}
          activeOpacity={0.7}
        >

          <Ionicons
            name="menu-outline"
            size={28}
            color={COLORS.white}
          />

        </TouchableOpacity>


        {/* LOGO */}

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


        {/* DERECHA */}

        <View style={styles.headerRight}>

          {isAuthenticated ? (

            <TouchableOpacity
              onPress={handleLogout}
              style={styles.headerButton}
              activeOpacity={0.7}
            >

              <Ionicons
                name="log-out-outline"
                size={25}
                color={COLORS.white}
              />

            </TouchableOpacity>

          ) : (

            <TouchableOpacity
              onPress={() =>
                navigation.navigate(
                  'Iniciosesion' as never
                )
              }
              style={styles.headerButton}
              activeOpacity={0.7}
            >

              <Ionicons
                name="person-circle-outline"
                size={28}
                color={COLORS.white}
              />

            </TouchableOpacity>

          )}

        </View>

      </View>


      {/* ===============================================
          SIDEBAR
      =============================================== */}

      <Modal
        visible={sidebarOpen}
        transparent={true}
        animationType="slide"
        onRequestClose={() =>
          setSidebarOpen(false)
        }
      >

        <SafeAreaView
          style={styles.sidebarOverlay}
        >

          {/* FONDO OSCURO */}

          <TouchableOpacity
            style={styles.sidebarBackdrop}
            activeOpacity={1}
            onPress={() =>
              setSidebarOpen(false)
            }
          />


          {/* MENÚ */}

          <View style={styles.sidebarContainer}>

            <ScrollView
              showsVerticalScrollIndicator={false}
            >

              {/* =====================================
                  ENCABEZADO DEL MENÚ
              ===================================== */}

              <View style={styles.sidebarHeader}>

                <Image
                  source={require('../../../../assets/img/logo2.jpeg')}
                  style={styles.sidebarLogo}
                  resizeMode="contain"
                />

                {isAuthenticated && user && (

                  <View style={styles.userInfo}>

                    <Text
                      style={styles.userName}
                      numberOfLines={1}
                    >
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


              {/* =====================================
                  OPCIONES
              ===================================== */}

              {menuItems.map((item) => (

                <TouchableOpacity
                  key={item.id}
                  style={styles.sidebarItem}
                  onPress={() =>
                    handleMenuNavigation(
                      item.route
                    )
                  }
                  activeOpacity={0.7}
                >

                  <Ionicons
                    name={item.icon as any}
                    size={21}
                    color={COLORS.primary}
                  />

                  <Text
                    style={styles.sidebarItemText}
                  >
                    {item.label}
                  </Text>

                </TouchableOpacity>

              ))}


              {/* =====================================
                  CERRAR SESIÓN
              ===================================== */}

              {isAuthenticated && (

                <>

                  <View
                    style={styles.sidebarDivider}
                  />

                  <TouchableOpacity
                    style={[
                      styles.sidebarItem,
                      styles.sidebarItemLogout,
                    ]}
                    onPress={handleLogout}
                    activeOpacity={0.7}
                  >

                    <Ionicons
                      name="log-out-outline"
                      size={21}
                      color={COLORS.primary}
                    />

                    <Text
                      style={styles.sidebarItemText}
                    >
                      Cerrar sesión
                    </Text>

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

    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 10 : 10,

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

  // LOGOUT
  sidebarItemLogout: {

    borderBottomWidth: 0,

    marginTop: 5,

  },

});