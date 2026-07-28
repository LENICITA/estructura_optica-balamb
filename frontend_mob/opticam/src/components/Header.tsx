// src/components/Header.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { COLORS } from '../constants/colors';
import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

interface HeaderProps {
  navigation: any;
}

export const Header = ({ navigation }: HeaderProps) => {
  const { user, logout, isAuthenticated } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [searchText, setSearchText] = useState('');

  const handleLogout = async () => {
    await logout();
    setSidebarOpen(false);
    navigation.navigate('Login');
  };

  const getMenuItems = () => {
    if (!isAuthenticated || !user) {
      return [
        { path: 'Principal', label: 'Inicio', icon: 'home' },
        { path: 'Catalogo', label: 'Productos', icon: 'glasses' },
      ];
    }

    const userRoles = user.roles || [];

    if (userRoles.includes('ADMIN')) {
      return [
        { path: 'AdminDashboard', label: 'Dashboard', icon: 'chart-bar' },
        { path: 'AdminInventario', label: 'Inventario', icon: 'box' },
        { path: 'AdminPedidos', label: 'Pedidos', icon: 'shopping-cart' },
        { path: 'AdminRepartidores', label: 'Repartidores', icon: 'motorcycle' },
        { path: 'AdminPerfil', label: 'Mi Perfil', icon: 'user' },
      ];
    }

    if (userRoles.includes('REPARTIDOR')) {
      return [
        { path: 'InicioRepartidor', label: 'Inicio', icon: 'home' },
        { path: 'HistorialRepartidor', label: 'Historial', icon: 'history' },
        { path: 'PerfilRepartidor', label: 'Mi Perfil', icon: 'user' },
      ];
    }

    return [
      { path: 'PrincipalCliente', label: 'Inicio', icon: 'home' },
      { path: 'Catalogo', label: 'Productos', icon: 'glasses' },
      { path: 'Carrito', label: 'Carrito', icon: 'shopping-cart' },
      { path: 'PerfilCliente', label: 'Mi Perfil', icon: 'user' },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <>
      <View style={styles.header}>
        <View style={styles.leftSection}>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => setSidebarOpen(true)}
          >
            <Ionicons name="menu" size={28} color="#fff" />
          </TouchableOpacity>

          <Image
            source={require('../../assets/img/logo2.jpeg')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        <View style={styles.rightSection}>
          <View style={[styles.searchContainer, searchActive && styles.searchActive]}>
            <TouchableOpacity onPress={() => setSearchActive(!searchActive)}>
              <Ionicons name="search" size={20} color={searchActive ? '#000' : '#fff'} />
            </TouchableOpacity>
            {searchActive && (
              <TextInput
                style={styles.searchInput}
                placeholder="Buscar..."
                placeholderTextColor="#999"
                value={searchText}
                onChangeText={setSearchText}
                autoFocus
              />
            )}
          </View>

          {isAuthenticated && user?.roles?.includes('CLIENTE') && (
            <TouchableOpacity style={styles.iconButton}>
              <Ionicons name="cart" size={22} color="#fff" />
            </TouchableOpacity>
          )}

          <TouchableOpacity style={styles.iconButton}>
            <Ionicons name="notifications" size={22} color="#fff" />
          </TouchableOpacity>

          {isAuthenticated ? (
            <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
              <Ionicons name="log-out" size={22} color="#fff" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => navigation.navigate('Login')}
            >
              <Ionicons name="person" size={22} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Sidebar */}
      <Modal
        transparent
        visible={sidebarOpen}
        animationType="slide"
        onRequestClose={() => setSidebarOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setSidebarOpen(false)}
        >
          <View style={styles.sidebar}>
            <View style={styles.sidebarHeader}>
              <Image
                source={require('../../assets/img/logo2.jpeg')}
                style={styles.sidebarLogo}
                resizeMode="contain"
              />
              <TouchableOpacity onPress={() => setSidebarOpen(false)}>
                <Ionicons name="close" size={28} color="#fff" />
              </TouchableOpacity>
            </View>

            <ScrollView>
              {menuItems.map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.sidebarItem}
                  onPress={() => {
                    setSidebarOpen(false);
                    navigation.navigate(item.path);
                  }}
                >
                  <FontAwesome5 name={item.icon} size={20} color={COLORS.primary} style={styles.sidebarIcon} />
                  <Text style={styles.sidebarLabel}>{item.label}</Text>
                </TouchableOpacity>
              ))}

              {isAuthenticated && (
                <TouchableOpacity
                  style={[styles.sidebarItem, styles.logoutItem]}
                  onPress={handleLogout}
                >
                  <Ionicons name="log-out" size={20} color={COLORS.primary} style={styles.sidebarIcon} />
                  <Text style={[styles.sidebarLabel, styles.logoutLabel]}>
                    Cerrar Sesión
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#000',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: 48,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuButton: {
    padding: 4,
  },
  logo: {
    width: 50,
    height: 40,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 6,
    minWidth: 40,
  },
  searchActive: {
    backgroundColor: '#f0f3ff',
    minWidth: 150,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 4,
    paddingHorizontal: 8,
    fontSize: 14,
    color: '#000',
  },
  iconButton: {
    padding: 6,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
  },
  sidebar: {
    width: '75%',
    maxWidth: 280,
    height: '100%',
    backgroundColor: '#000',
    paddingTop: 20,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  sidebarLogo: {
    width: 80,
    height: 40,
  },
  sidebarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#222',
  },
  sidebarIcon: {
    marginRight: 12,
  },
  sidebarLabel: {
    color: '#fff',
    fontSize: 15,
  },
  logoutItem: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    marginTop: 8,
  },
  logoutLabel: {
    color: COLORS.primary,
  },
});// src/components/Header.tsx
   import React, { useState } from 'react';
   import {
     View,
     Text,
     TouchableOpacity,
     StyleSheet,
     Image,
     TextInput,
     Modal,
     ScrollView,
   } from 'react-native';
   import { useAuth } from '../contexts/AuthContext';
   import { COLORS } from '../constants/colors';
   import { Ionicons, FontAwesome5 } from '@expo/vector-icons';

   interface HeaderProps {
     navigation: any;
   }

   export const Header = ({ navigation }: HeaderProps) => {
     const { user, logout, isAuthenticated } = useAuth();
     const [sidebarOpen, setSidebarOpen] = useState(false);
     const [searchActive, setSearchActive] = useState(false);
     const [searchText, setSearchText] = useState('');

     const handleLogout = async () => {
       await logout();
       setSidebarOpen(false);
       navigation.navigate('Login');
     };

     const getMenuItems = () => {
       if (!isAuthenticated || !user) {
         return [
           { path: 'Principal', label: 'Inicio', icon: 'home' },
           { path: 'Catalogo', label: 'Productos', icon: 'glasses' },
         ];
       }

       const userRoles = user.roles || [];

       if (userRoles.includes('ADMIN')) {
         return [
           { path: 'AdminDashboard', label: 'Dashboard', icon: 'chart-bar' },
           { path: 'AdminInventario', label: 'Inventario', icon: 'box' },
           { path: 'AdminPedidos', label: 'Pedidos', icon: 'shopping-cart' },
           { path: 'AdminRepartidores', label: 'Repartidores', icon: 'motorcycle' },
           { path: 'AdminPerfil', label: 'Mi Perfil', icon: 'user' },
         ];
       }

       if (userRoles.includes('REPARTIDOR')) {
         return [
           { path: 'InicioRepartidor', label: 'Inicio', icon: 'home' },
           { path: 'HistorialRepartidor', label: 'Historial', icon: 'history' },
           { path: 'PerfilRepartidor', label: 'Mi Perfil', icon: 'user' },
         ];
       }

       return [
         { path: 'PrincipalCliente', label: 'Inicio', icon: 'home' },
         { path: 'Catalogo', label: 'Productos', icon: 'glasses' },
         { path: 'Carrito', label: 'Carrito', icon: 'shopping-cart' },
         { path: 'PerfilCliente', label: 'Mi Perfil', icon: 'user' },
       ];
     };

     const menuItems = getMenuItems();

     return (
       <>
         <View style={styles.header}>
           <View style={styles.leftSection}>
             <TouchableOpacity
               style={styles.menuButton}
               onPress={() => setSidebarOpen(true)}
             >
               <Ionicons name="menu" size={28} color="#fff" />
             </TouchableOpacity>

             <Image
               source={require('../../assets/img/logo2.jpeg')}
               style={styles.logo}
               resizeMode="contain"
             />
           </View>

           <View style={styles.rightSection}>
             <View style={[styles.searchContainer, searchActive && styles.searchActive]}>
               <TouchableOpacity onPress={() => setSearchActive(!searchActive)}>
                 <Ionicons name="search" size={20} color={searchActive ? '#000' : '#fff'} />
               </TouchableOpacity>
               {searchActive && (
                 <TextInput
                   style={styles.searchInput}
                   placeholder="Buscar..."
                   placeholderTextColor="#999"
                   value={searchText}
                   onChangeText={setSearchText}
                   autoFocus
                 />
               )}
             </View>

             {isAuthenticated && user?.roles?.includes('CLIENTE') && (
               <TouchableOpacity style={styles.iconButton}>
                 <Ionicons name="cart" size={22} color="#fff" />
               </TouchableOpacity>
             )}

             <TouchableOpacity style={styles.iconButton}>
               <Ionicons name="notifications" size={22} color="#fff" />
             </TouchableOpacity>

             {isAuthenticated ? (
               <TouchableOpacity style={styles.iconButton} onPress={handleLogout}>
                 <Ionicons name="log-out" size={22} color="#fff" />
               </TouchableOpacity>
             ) : (
               <TouchableOpacity
                 style={styles.iconButton}
                 onPress={() => navigation.navigate('Login')}
               >
                 <Ionicons name="person" size={22} color="#fff" />
               </TouchableOpacity>
             )}
           </View>
         </View>

         {/* Sidebar */}
         <Modal
           transparent
           visible={sidebarOpen}
           animationType="slide"
           onRequestClose={() => setSidebarOpen(false)}
         >
           <TouchableOpacity
             style={styles.overlay}
             activeOpacity={1}
             onPress={() => setSidebarOpen(false)}
           >
             <View style={styles.sidebar}>
               <View style={styles.sidebarHeader}>
                 <Image
                   source={require('../../assets/img/logo2.jpeg')}
                   style={styles.sidebarLogo}
                   resizeMode="contain"
                 />
                 <TouchableOpacity onPress={() => setSidebarOpen(false)}>
                   <Ionicons name="close" size={28} color="#fff" />
                 </TouchableOpacity>
               </View>

               <ScrollView>
                 {menuItems.map((item, idx) => (
                   <TouchableOpacity
                     key={idx}
                     style={styles.sidebarItem}
                     onPress={() => {
                       setSidebarOpen(false);
                       navigation.navigate(item.path);
                     }}
                   >
                     <FontAwesome5 name={item.icon} size={20} color={COLORS.primary} style={styles.sidebarIcon} />
                     <Text style={styles.sidebarLabel}>{item.label}</Text>
                   </TouchableOpacity>
                 ))}

                 {isAuthenticated && (
                   <TouchableOpacity
                     style={[styles.sidebarItem, styles.logoutItem]}
                     onPress={handleLogout}
                   >
                     <Ionicons name="log-out" size={20} color={COLORS.primary} style={styles.sidebarIcon} />
                     <Text style={[styles.sidebarLabel, styles.logoutLabel]}>
                       Cerrar Sesión
                     </Text>
                   </TouchableOpacity>
                 )}
               </ScrollView>
             </View>
           </TouchableOpacity>
         </Modal>
       </>
     );
   };

   const styles = StyleSheet.create({
     header: {
       backgroundColor: '#000',
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
       paddingHorizontal: 16,
       paddingVertical: 12,
       paddingTop: 48,
     },
     leftSection: {
       flexDirection: 'row',
       alignItems: 'center',
       gap: 12,
     },
     menuButton: {
       padding: 4,
     },
     logo: {
       width: 50,
       height: 40,
     },
     rightSection: {
       flexDirection: 'row',
       alignItems: 'center',
       gap: 8,
     },
     searchContainer: {
       flexDirection: 'row',
       alignItems: 'center',
       backgroundColor: 'rgba(255,255,255,0.1)',
       borderRadius: 20,
       paddingHorizontal: 10,
       paddingVertical: 6,
       minWidth: 40,
     },
     searchActive: {
       backgroundColor: '#f0f3ff',
       minWidth: 150,
     },
     searchInput: {
       flex: 1,
       paddingVertical: 4,
       paddingHorizontal: 8,
       fontSize: 14,
       color: '#000',
     },
     iconButton: {
       padding: 6,
     },
     overlay: {
       flex: 1,
       backgroundColor: 'rgba(0,0,0,0.5)',
       justifyContent: 'flex-start',
     },
     sidebar: {
       width: '75%',
       maxWidth: 280,
       height: '100%',
       backgroundColor: '#000',
       paddingTop: 20,
     },
     sidebarHeader: {
       flexDirection: 'row',
       justifyContent: 'space-between',
       alignItems: 'center',
       paddingHorizontal: 16,
       paddingBottom: 16,
       borderBottomWidth: 1,
       borderBottomColor: '#333',
     },
     sidebarLogo: {
       width: 80,
       height: 40,
     },
     sidebarItem: {
       flexDirection: 'row',
       alignItems: 'center',
       paddingVertical: 14,
       paddingHorizontal: 16,
       borderBottomWidth: 1,
       borderBottomColor: '#222',
     },
     sidebarIcon: {
       marginRight: 12,
     },
     sidebarLabel: {
       color: '#fff',
       fontSize: 15,
     },
     logoutItem: {
       borderTopWidth: 1,
       borderTopColor: '#333',
       marginTop: 8,
     },
     logoutLabel: {
       color: COLORS.primary,
     },
   });