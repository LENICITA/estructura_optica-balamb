// src/navigation/AppNavigator.tsx
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaView, StyleSheet, StatusBar, View } from 'react-native';
import { AuthProvider, useAuth } from '../features/auth/context/AuthContext';
import { COLORS } from '../shared/constants/colors';

// ===== COMPONENTES COMPARTIDOS =====
import { Header } from '../shared/components/navigation/Header';
import { Footer } from '../shared/components/navigation/Footer';
import { BottomNavigation } from '../shared/components/navigation/BottomNavigation';
import { ChatBot } from '../shared/components/chatbot/ChatBot';

// ===== SCREENS =====
import { Principal } from '../features/home/screens/Principal';
import { Iniciosesion } from '../features/auth/screens/Iniciosesion';
import { AutoRegistro } from '../features/auth/screens/AutoRegistro';
import { RecuperarContraseña } from '../features/auth/screens/RecuperarContraseña';
import { RestablecerContraseña } from '../features/auth/screens/RestablecerContraseña';
import { PrincipalCliente } from '../features/client/screens/PrincipalCliente';
import { PerfilCliente } from '../features/client/screens/PerfilCliente';
import { CatalogoCliente } from '../features/client/screens/CatalogoCliente';
import { DetalleProductoCliente } from '../features/client/screens/DetalleProductoCliente';
import { PrincipalAdmin } from '../features/admin/screens/PrincipalAdmin';
import { PerfilAdmin } from '../features/admin/screens/PerfilAdmin';
import DashboardRepartidores from '../features/admin/screens/DashboardRepartidores';
import { DetalleRepartidor } from '../features/admin/screens/DetalleRepartidor';
import { RegistrarRepartidor } from '../features/admin/screens/RegistrarRepartidor';
import EditarRepartidor from '../features/admin/screens/EditarRepartidor';
import { CatalogoAdmin } from '../features/admin/screens/CatalogoAdmin';
import { DetalleProductoAdmin } from '../features/admin/screens/DetalleProductoAdmin';
import { PrincipalRepartidor } from '../features/delivery/screens/PrincipalRepartidor';
import { PerfilRepartidor } from '../features/delivery/screens/PerfilRepartidor';

const Stack = createNativeStackNavigator();

// ===== LAYOUTS =====
const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.layoutContainer}>
      <Header />
      <View style={styles.contentContainer}>{children}</View>
      <Footer />
    </View>
  );
};

const UserLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.layoutContainer}>
      <Header />
      <View style={styles.contentContainer}>{children}</View>
      <BottomNavigation />
      <Footer />
    </View>
  );
};

const ClientLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <View style={styles.layoutContainer}>
      <Header />
      <View style={styles.contentContainer}>{children}</View>
      <BottomNavigation />
      <Footer />
      <ChatBot />
    </View>
  );
};

// ===== NAVEGADOR =====
export default function AppNavigator() {
  return (
    <AuthProvider>
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor="#000" />
        <NavigationContainer>
          <Stack.Navigator
            initialRouteName="Principal"
            screenOptions={{ headerShown: false }}
          >
            <Stack.Screen name="Principal">
              {() => (
                <Layout>
                  <Principal />
                </Layout>
              )}
            </Stack.Screen>

            <Stack.Screen name="PrincipalAdmin">
              {({ navigation }) => (
                <UserLayout>
                  <PrincipalAdmin navigation={navigation} />
                </UserLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="DashboardRepartidores">
              {() => (
                <UserLayout>
                  <DashboardRepartidores />
                </UserLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="DetalleRepartidor">
              {() => (
                <UserLayout>
                  <DetalleRepartidor />
                </UserLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="EditarRepartidor">
              {({ navigation, route }) => (
                <UserLayout>
                  <EditarRepartidor navigation={navigation} route={route} />
                </UserLayout>
              )}
            </Stack.Screen>

            
            <Stack.Screen name="RegistrarRepartidor">
              {({ navigation }) => (
                <UserLayout>
                  <RegistrarRepartidor navigation={navigation} />
                </UserLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="PerfilAdmin">
              {({ navigation }) => (
                <UserLayout>
                  <PerfilAdmin navigation={navigation} />
                </UserLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="CatalogoAdmin">
               {({ navigation }) => (
                   <UserLayout>
                     <CatalogoAdmin navigation={navigation} />
                   </UserLayout>
               )}
              </Stack.Screen>

            <Stack.Screen name="DetalleProductoAdmin">
               {({ navigation, route }) => (
                   <UserLayout>
                     <DetalleProductoAdmin navigation={navigation} route={route} />
                   </UserLayout>
               )}
              </Stack.Screen>

            <Stack.Screen name="PrincipalCliente">
              {({ navigation }) => (
                <ClientLayout>
                  <PrincipalCliente navigation={navigation} />
                </ClientLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="PerfilCliente">
              {({ navigation }) => (
                <ClientLayout>
                  <PerfilCliente navigation={navigation} />
                </ClientLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="CatalogoCliente">
               {({ navigation }) => (
                   <ClientLayout>
                     <CatalogoCliente navigation={navigation} />
                   </ClientLayout>
               )}
           </Stack.Screen>

           <Stack.Screen name="DetalleProductoCliente">
                {({ navigation, route }) => (
                    <ClientLayout>
                      <DetalleProductoCliente navigation={navigation} route={route} />
                    </ClientLayout>
                )}
            </Stack.Screen>

            <Stack.Screen name="PrincipalRepartidor">
              {({ navigation }) => (
                <UserLayout>
                  <PrincipalRepartidor navigation={navigation} />
                </UserLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="PerfilRepartidor">
              {({ navigation }) => (
                <UserLayout>
                  <PerfilRepartidor navigation={navigation} />
                </UserLayout>
              )}
            </Stack.Screen>

            <Stack.Screen name="Iniciosesion">
              {({ navigation }) => <Iniciosesion navigation={navigation} />}
            </Stack.Screen>

            <Stack.Screen name="AutoRegistro">
              {({ navigation }) => <AutoRegistro navigation={navigation} />}
            </Stack.Screen>

            <Stack.Screen name="RecuperarContraseña">
              {({ navigation }) => <RecuperarContraseña navigation={navigation} />}
            </Stack.Screen>

            <Stack.Screen name="RestablecerContraseña">
              {({ navigation, route }) => (
                <RestablecerContraseña navigation={navigation} route={route} />
              )}
            </Stack.Screen>

          </Stack.Navigator>
        </NavigationContainer>
      </SafeAreaView>
    </AuthProvider>
  );
}

// ===== ESTILOS =====
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  layoutContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  contentContainer: {
    flex: 1,
  },
});
