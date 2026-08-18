// App.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, StatusBar, View } from 'react-native';
import { AuthProvider } from './src/contexts/AuthContext';

// Importa tus pantallas
import DetalleRepartidor from './src/screens/admin/detalleRepartidor';
import Repartidores from './src/screens/admin/dashboardRepartidores';
import Home from './src/screens/home/Home';
import { RegisterScreen } from './src/screens/register/Register';
import PrincipalAdmin from './src/screens/admin/principalAdmin';

// Importa Header y Footer
import Header from './src/components/header';
import Footer from './src/components/footer';

// ====== DEFINICIÓN DE TIPOS DE RUTAS ======
export type RootStackParamList = {
  // Pantallas con Header y Footer
  Home: undefined;
  Repartidores: undefined;
  detalleRepartidor: {
    id: number;
    nombre: string;
    estado: string;
    telefono?: string;
    correo?: string;
    ciudad?: string;
    pedidos?: number;
    fecha_registro: string;
  };
  Carrito: undefined;
  Catalogo: undefined;
  PrincipalAdmin: undefined;
  
  
  // Pantallas sin Header y Footer
  RegisterScreen: undefined;
  Login: undefined;
};

// ====== CONFIGURACIÓN DEL STACK ======
const Stack = createNativeStackNavigator<RootStackParamList>();

// ====== COMPONENTE LAYOUT ======
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.layoutContainer}>
      <Header />
      <View style={styles.contentContainer}>
        {children}
      </View>
      <Footer />
    </View>
  );
};

// ====== APP PRINCIPAL ======
export default function App() {
  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor="#000" barStyle="light-content" />
      <AuthProvider>
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Repartidores"
            screenOptions={{
              headerShown: false,
              animation: 'slide_from_right',
            }}
          >
            {/* ========== PANTALLAS CON HEADER Y FOOTER ========== */}
            
            <Stack.Screen name="Home">
              {() => (
                <Layout>
                  <Home />
                </Layout>
              )}
            </Stack.Screen>
            <Stack.Screen name='PrincipalAdmin'>
              {() => (
                <Layout>
                  <PrincipalAdmin />
                </Layout>
              )}
            </Stack.Screen>

            <Stack.Screen name="Repartidores">
              {() => (
                <Layout>
                  <Repartidores />
                </Layout>
              )}
            </Stack.Screen>

            <Stack.Screen name="detalleRepartidor">
              {() => (
                <Layout>
                  <DetalleRepartidor />
                </Layout>
              )}
            </Stack.Screen>

            <Stack.Screen name="Carrito">
              {() => (
                <Layout>
                  <Home /> {/* Temporal - Reemplazar con Carrito */}
                </Layout>
              )}
            </Stack.Screen>

            <Stack.Screen name="Catalogo">
              {() => (
                <Layout>
                  <Home /> {/* Temporal - Reemplazar con Catalogo */}
                </Layout>
              )}
            </Stack.Screen>

            {/* ========== PANTALLAS SIN HEADER Y FOOTER ========== */}
            
            <Stack.Screen 
              name="RegisterScreen" 
              component={RegisterScreen} 
            />

            <Stack.Screen 
              name="Login" 
              component={RegisterScreen} // Temporal - Reemplazar con Login
            />

          </Stack.Navigator>
        </NavigationContainer>
      </AuthProvider>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  layoutContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  contentContainer: {
    flex: 1,
  },
});