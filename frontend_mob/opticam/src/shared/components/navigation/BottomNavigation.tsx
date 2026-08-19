// src/shared/components/navigation/BottomNavigation.tsx
import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { COLORS } from '../../constants/colors';

export const BottomNavigation = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { user } = useAuth();

  // Obtener el rol del usuario
  const getRole = (): string => {
    if (!user) return '';

    if (Array.isArray(user.roles) && user.roles.length > 0) {
      return String(user.roles[0]).toUpperCase();
    }

    if (typeof user.roles === 'string') {
      return user.roles.toUpperCase();
    }

    if (user.rol) {
      return String(user.rol).toUpperCase();
    }

    return '';
  };

  const role = getRole();
  const getMenuItems = () => {

    // CLIENTE
    if (role === 'CLIENTE') {
      return [
        {
          label: 'Inicio',
          icon: 'home-outline',
          activeIcon: 'home',
          route: 'PrincipalCliente',
        },
        {
          label: 'Catálogo',
          icon: 'grid-outline',
          activeIcon: 'grid',
          route: 'CatalogoCliente',
        },
        {
          label: 'Carrito',
          icon: 'cart-outline',
          activeIcon: 'cart',
          route: 'Carrito',
        },
        {
          label: 'Pedidos',
          icon: 'cube-outline',
          activeIcon: 'cube',
          route: 'ControlPedido',
        },
        {
          label: 'Perfil',
          icon: 'person-outline',
          activeIcon: 'person',
          route: 'PerfilCliente',
        },
      ];
    }

    // ADMINISTRADOR
    if (role === 'ADMIN' || role === 'ADMINISTRADOR') {
      return [
        {
          label: 'Inicio',
          icon: 'home-outline',
          activeIcon: 'home',
          route: 'PrincipalAdmin',
        },
        {
          label: 'Inventario',
          icon: 'cube-outline',
          activeIcon: 'cube',
          route: 'AdminInventario',
        },
        {
          label: 'Pedidos',
          icon: 'cart-outline',
          activeIcon: 'cart',
          route: 'AdminPedidos',
        },
        {
          label: 'Repartidores',
          icon: 'bicycle-outline',
          activeIcon: 'bicycle',
          route: 'DashboardRepartidores',
        },
        {
          label: 'Reportes',
          icon: 'bar-chart-outline',
          activeIcon: 'bar-chart',
          route: 'AdminReportes',
        },
        {
          label: 'Perfil',
          icon: 'person-outline',
          activeIcon: 'person',
          route: 'PerfilAdmin',
        },
      ];
    }

    // REPARTIDOR

    if (role === 'REPARTIDOR') {
      return [
        {
          label: 'Inicio',
          icon: 'home-outline',
          activeIcon: 'home',
          route: 'PrincipalRepartidor',
        },
        {
          label: 'Historial',
          icon: 'time-outline',
          activeIcon: 'time',
          route: 'HistorialRepartidor',
        },
        {
          label: 'Perfil',
          icon: 'person-outline',
          activeIcon: 'person',
          route: 'PerfilRepartidor',
        },
      ];
    }

    return [];
  };

  const menuItems = getMenuItems();

  return (
    <View style={styles.container}>
      {menuItems.map((item) => {
        const activo = route.name === item.route;

        return (
          <TouchableOpacity
            key={item.route}
            style={styles.item}
            onPress={() => navigation.navigate(item.route as never)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={
                (activo
                  ? item.activeIcon
                  : item.icon) as any
              }
              size={24}
              color={
                activo
                  ? COLORS.primary
                  : COLORS.gray
              }
            />

            <Text
              style={[
                styles.text,
                activo && styles.textActivo,
              ]}
            >
              {item.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 68,
    backgroundColor: COLORS.white,

    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',

    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',

    elevation: 8,

    shadowColor: COLORS.black,
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 4,
  },

  item: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },

  text: {
    marginTop: 3,
    fontSize: 11,
    color: COLORS.gray,
  },

  textActivo: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});