// src/presentation/components/layout/Header.tsx
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  TextInput,
  StyleSheet,
  Modal,
  ScrollView,
  Dimensions,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../context/AuthContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width, height } = Dimensions.get('window');

interface HeaderProps {
  onMenuPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({ onMenuPress }) => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigation = useNavigation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [mensajesOpen, setMensajesOpen] = useState(false);
  const [nombreUsuario, setNombreUsuario] = useState('');
  const [searchText, setSearchText] = useState('');
  const inputRef = useRef<TextInput>(null);

  useEffect(() => {
    if (user) {
      const nombre = user.nombre_completo || user.email || '';
      setNombreUsuario(nombre);
    } else {
      AsyncStorage.getItem('nombre').then((nombre) => {
        if (nombre) setNombreUsuario(nombre);
      });
    }
  }, [user]);

  const handleLogout = () => {
    logout();
    navigation.navigate('Login' as never);
    setSidebarOpen(false);
  };

  const getMenuItems = () => {
    if (!isAuthenticated || !user) {
      return [
        { path: 'Principal', label: 'Inicio', icon: 'home-outline' },
        { path: 'Catalogo', label: 'Productos', icon: 'eye-outline' },
        { path: 'Contacto', label: 'Acerca de', icon: 'information-circle-outline' },
      ];
    }

    const userRoles = user.roles || [];

    if (userRoles.includes('ADMIN')) {
      return [
        { path: 'AdminDashboard', label: 'Dashboard', icon: 'stats-chart-outline' },
        { path: 'AdminInventario', label: 'Inventario', icon: 'cube-outline' },
        { path: 'AdminPedidos', label: 'Pedidos', icon: 'cart-outline' },
        { path: 'AdminRepartidores', label: 'Repartidores', icon: 'bicycle-outline' },
        { path: 'AdminReportes', label: 'Reportes', icon: 'pie-chart-outline' },
        { path: 'AdminFormulas', label: 'Fórmulas', icon: 'eye-outline' },
        { path: 'Perfil', label: 'Mi Perfil', icon: 'person-outline' },
      ];
    }

    if (userRoles.includes('REPARTIDOR')) {
      return [
        { path: 'RepartidorInicio', label: 'Inicio', icon: 'home-outline' },
        { path: 'RepartidorHistorial', label: 'Historial', icon: 'time-outline' },
        { path: 'PerfilRepartidor', label: 'Mi Perfil', icon: 'person-outline' },
      ];
    }

    return [
      { path: 'PrincipalCliente', label: 'Inicio', icon: 'home-outline' },
      { path: 'Catalogo', label: 'Productos', icon: 'eye-outline' },
      { path: 'Carrito', label: 'Carrito', icon: 'cart-outline' },
      { path: 'ControlPedido', label: 'Pedidos', icon: 'cube-outline' },
      { path: 'Formula', label: 'Fórmulas', icon: 'document-text-outline' },
      { path: 'Contacto', label: 'Acerca de', icon: 'information-circle-outline' },
      { path: 'PerfilCliente', label: 'Mi Perfil', icon: 'person-outline' },
    ];
  };

  const menuItems = getMenuItems();

  // Sidebar component
  const Sidebar = () => (
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
            {menuItems.map((item, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.sidebarItem}
                onPress={() => {
                  setSidebarOpen(false);
                  navigation.navigate(item.path as never);
                }}
              >
                <Ionicons name={item.icon as any} size={20} color="#B90F0F" style={styles.sidebarIcon} />
                <Text style={styles.sidebarItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
            
            {isAuthenticated && (
              <>
                <View style={styles.sidebarDivider} />
                <TouchableOpacity
                  style={styles.sidebarItem}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out-outline" size={20} color="#B90F0F" style={styles.sidebarIcon} />
                  <Text style={styles.sidebarItemText}>Cerrar Sesión</Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );

  // Notificaciones Modal
  const NotificacionesModal = () => (
    <Modal
      visible={mensajesOpen}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setMensajesOpen(false)}
    >
      <TouchableOpacity
        style={styles.notificacionesBackdrop}
        activeOpacity={1}
        onPress={() => setMensajesOpen(false)}
      />
      <View style={styles.notificacionesContainer}>
        <View style={styles.notificacionesHeader}>
          <Ionicons name="notifications-outline" size={20} color="#fff" />
          <Text style={styles.notificacionesTitle}>Notificaciones</Text>
          <TouchableOpacity onPress={() => setMensajesOpen(false)}>
            <Ionicons name="close-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.notificacionesList}>
          <View style={styles.notificacionItem}>
            <Ionicons name="cube-outline" size={20} color="#B90F0F" />
            <View style={styles.notificacionContent}>
              <Text style={styles.notificacionTitulo}>Nuevo pedido</Text>
              <Text style={styles.notificacionDescripcion}>Pedido #1234 espera confirmación</Text>
              <Text style={styles.notificacionTiempo}>Hace 5 min</Text>
            </View>
          </View>
          <View style={styles.notificacionItem}>
            <Ionicons name="bicycle-outline" size={20} color="#B90F0F" />
            <View style={styles.notificacionContent}>
              <Text style={styles.notificacionTitulo}>Pedido en camino</Text>
              <Text style={styles.notificacionDescripcion}>Tu pedido #1230 está en ruta</Text>
              <Text style={styles.notificacionTiempo}>Hace 30 min</Text>
            </View>
          </View>
          <View style={styles.notificacionItem}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#B90F0F" />
            <View style={styles.notificacionContent}>
              <Text style={styles.notificacionTitulo}>Pedido entregado</Text>
              <Text style={styles.notificacionDescripcion}>Pedido #1228 fue entregado</Text>
              <Text style={styles.notificacionTiempo}>Hace 2 horas</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );

  return (
    <>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <View style={styles.headerContainer}>
        {/* Logo y menú */}
        <View style={styles.headerLeft}>
          <TouchableOpacity
            onPress={() => setSidebarOpen(true)}
            style={styles.menuButton}
          >
            <Ionicons name="menu-outline" size={24} color="#fff" />
          </TouchableOpacity>
          
          <TouchableOpacity 
            onPress={() => navigation.navigate('Principal' as never)}
            style={styles.logoContainer}
          >
            <Image 
              source={require('../../../assets/logo2.jpeg')} 
              style={styles.logo}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>

        {/* Barra de búsqueda */}
        <View style={[styles.searchContainer, searchActive && styles.searchContainerActive]}>
          <TouchableOpacity 
            onPress={() => {
              setSearchActive(!searchActive);
              if (!searchActive) {
                setTimeout(() => inputRef.current?.focus(), 100);
              }
            }}
            style={styles.searchButton}
          >
            <Ionicons name="search-outline" size={20} color="#fff" />
          </TouchableOpacity>
          <TextInput
            placeholder="Buscar..."
            placeholderTextColor="#999"
            style={[styles.searchInput, searchActive ? styles.searchInputActive : styles.searchInputInactive]}
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>

        {/* Acciones derecha */}
        <View style={styles.headerRight}>
          {isAuthenticated && nombreUsuario && (
            <Text style={styles.userName} numberOfLines={1}>
              {nombreUsuario}
            </Text>
          )}
          
          {isAuthenticated && user?.roles?.includes('CLIENTE') && (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Carrito' as never)}
              style={styles.iconButton}
            >
              <Ionicons name="cart-outline" size={24} color="#fff" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity 
            onPress={() => setMensajesOpen(true)}
            style={styles.iconButton}
          >
            <Ionicons name="mail-outline" size={24} color="#fff" />
          </TouchableOpacity>
          
          {isAuthenticated ? (
            <TouchableOpacity 
              onPress={handleLogout}
              style={styles.iconButton}
            >
              <Ionicons name="log-out-outline" size={24} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity 
              onPress={() => navigation.navigate('Login' as never)}
              style={styles.iconButton}
            >
              <Ionicons name="person-circle-outline" size={28} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Sidebar />
      <NotificacionesModal />
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
    paddingVertical: 8,
    minHeight: 70,
    zIndex: 50,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuButton: {
    padding: 4,
  },
  logoContainer: {
    marginLeft: 4,
  },
  logo: {
    width: 50,
    height: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 30,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flex: 1,
    maxWidth: 150,
    marginHorizontal: 10,
  },
  searchContainerActive: {
    maxWidth: 250,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  searchButton: {
    padding: 4,
  },
  searchInput: {
    color: '#fff',
    paddingVertical: 4,
    paddingHorizontal: 6,
    fontSize: 14,
  },
  searchInputActive: {
    flex: 1,
    minWidth: 100,
  },
  searchInputInactive: {
    width: 0,
    padding: 0,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  userName: {
    color: '#fff',
    fontSize: 12,
    maxWidth: 80,
    marginRight: 4,
  },
  iconButton: {
    padding: 4,
  },
  // Sidebar styles
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
  sidebarIcon: {
    marginRight: 12,
    width: 24,
  },
  sidebarItemText: {
    color: '#fff',
    fontSize: 15,
  },
  sidebarDivider: {
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginVertical: 5,
  },
  // Notificaciones styles
  notificacionesBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  notificacionesContainer: {
    position: 'absolute',
    top: 80,
    right: 15,
    width: width * 0.9,
    maxWidth: 350,
    maxHeight: 400,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  notificacionesHeader: {
    backgroundColor: '#B90F0F',
    padding: 12,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificacionesTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8,
  },
  notificacionesList: {
    maxHeight: 340,
    padding: 8,
  },
  notificacionItem: {
    flexDirection: 'row',
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
    gap: 12,
  },
  notificacionContent: {
    flex: 1,
  },
  notificacionTitulo: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
  },
  notificacionDescripcion: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  notificacionTiempo: {
    fontSize: 10,
    color: '#999',
    marginTop: 4,
  },
});

export default Header;